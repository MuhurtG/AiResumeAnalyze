# backend/database.py

from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import json

db = SQLAlchemy()

class Analysis(db.Model):
    id           = db.Column(db.Integer, primary_key=True)
    filename     = db.Column(db.String(255))
    job_role     = db.Column(db.String(100))
    score        = db.Column(db.Integer)
    ats_score    = db.Column(db.Integer)
    result_json  = db.Column(db.Text)      # full analysis stored as string
    created_at   = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id":         self.id,
            "filename":   self.filename,
            "job_role":   self.job_role,
            "score":      self.score,
            "ats_score":  self.ats_score,
            "analysis":   json.loads(self.result_json),
            "created_at": self.created_at.isoformat()
        }