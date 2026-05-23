# backend/app.py

from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from dotenv import load_dotenv
import PyPDF2
import io
import google.generativeai as genai
import json
# Add this line with your other imports at the top
from database import db, Analysis

load_dotenv()

app = Flask(__name__)
CORS(app)
app.config['MAX_CONTENT_LENGTH'] = 5 * 1024 * 1024
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'sqlite:///analyses.db')
db.init_app(app)
with app.app_context():
    db.create_all()

# ── Gemini setup ──────────────────────────────────────
genai.configure(api_key=os.getenv('GEMINI_API_KEY'))
model = genai.GenerativeModel('gemini-2.5-flash-lite')

# ── Helper functions ──────────────────────────────────
def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() == 'pdf'

def extract_text_from_pdf(file_bytes):
    try:
        pdf_reader = PyPDF2.PdfReader(io.BytesIO(file_bytes))
        text = ""
        for page in pdf_reader.pages:
            text += page.extract_text() + "\n"
        return text.strip()
    except Exception as e:
        raise ValueError(f"Could not read PDF: {str(e)}")

def analyze_with_gemini(resume_text, job_role):
    prompt = f"""You are an expert resume coach and hiring manager.

Analyze the resume below for a **{job_role}** role.
Respond ONLY with a valid JSON object. No markdown, no backticks, just raw JSON.

Resume:
\"\"\"
{resume_text}
\"\"\"

Return exactly this JSON structure:
{{
  "score": <integer 0-100>,
  "ats_score": <integer 0-100>,
  "summary": "<2-3 sentence overall assessment>",
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "weaknesses": ["<weakness 1>", "<weakness 2>", "<weakness 3>"],
  "suggestions": [
    "<specific actionable tip 1>",
    "<specific actionable tip 2>",
    "<specific actionable tip 3>",
    "<specific actionable tip 4>"
  ],
  "missing_keywords": ["<keyword 1>", "<keyword 2>", "<keyword 3>"],
  "experience_level": "junior or mid or senior"
}}"""

    response = model.generate_content(prompt)
    raw = response.text
    clean = raw.strip()
    if clean.startswith("```"):
        clean = clean.split("```")[1]
        if clean.startswith("json"):
            clean = clean[4:]
    clean = clean.strip().rstrip("```")
    return json.loads(clean)

# ── Routes ────────────────────────────────────────────
@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "running ✅"})

@app.route('/analyze', methods=['POST'])
def analyze_resume():
    if 'resume' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files['resume']
    job_role = request.form.get('jobRole', 'General')

    if not allowed_file(file.filename):
        return jsonify({"error": "Only PDF files are allowed"}), 400

    file_bytes = file.read()

    try:
        resume_text = extract_text_from_pdf(file_bytes)
    except ValueError as e:
        return jsonify({"error": str(e)}), 422

    if len(resume_text) < 100:
        return jsonify({"error": "PDF appears empty or unreadable"}), 422

    try:
        analysis = analyze_with_gemini(resume_text, job_role)
    except json.JSONDecodeError:
        return jsonify({"error": "AI returned bad response, try again"}), 500
    except Exception as e:
        return jsonify({"error": f"AI error: {str(e)}"}), 503
    
    # Save to database
    record = Analysis(
        filename    = file.filename,
        job_role    = job_role,
        score       = analysis['score'],
        ats_score   = analysis['ats_score'],
        result_json = json.dumps(analysis)
    )
    db.session.add(record)
    db.session.commit()

    # Return result  ← this was already here
    return jsonify({
        "success":  True,
        "job_role": job_role,
        "filename": file.filename,
        "analysis": analysis
    })
@app.route('/history', methods=['GET'])
def get_history():
    records = Analysis.query.order_by(
        Analysis.created_at.desc()
    ).limit(20).all()
    
    return jsonify([r.to_dict() for r in records])

# ── This MUST be last ─────────────────────────────────
if __name__ == '__main__':
    app.run(debug=True, port=5000)