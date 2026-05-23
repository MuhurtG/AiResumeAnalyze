// src/components/ResultsPanel.jsx

function ScoreRing({ score, label }) {
  const color = score >= 80 ? '#22c55e' : score >= 60 ? '#f59e0b' : '#ef4444'
  const r = 50
  const circumference = 2 * Math.PI * r
  const offset = circumference - (score / 100) * circumference

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-32 h-32">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r={r} fill="none" stroke="#1e2535" strokeWidth="10" />
          <circle
            cx="60" cy="60" r={r} fill="none"
            stroke={color} strokeWidth="10"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 1s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold" style={{ color }}>{score}</span>
          <span className="text-xs text-gray-500">/100</span>
        </div>
      </div>
      <span className="text-sm font-medium text-gray-400">{label}</span>
    </div>
  )
}

export default function ResultsPanel({ data }) {
  const { analysis, job_role } = data

  return (
    <div className="space-y-5">

      {/* Score header */}
      <div className="rounded-2xl p-6"
        style={{ background: '#1a1d27', border: '1px solid #2d3148' }}>
        <div className="flex items-center justify-between flex-wrap gap-6">
          <div className="flex gap-8">
            <ScoreRing score={analysis.score} label="Resume Score" />
            <ScoreRing score={analysis.ats_score} label="ATS Score" />
          </div>
          <div className="flex-1 min-w-[200px]">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Analyzed for
              </span>
              <span className="text-xs font-semibold px-3 py-1 rounded-full"
                style={{ background: '#1e3a5f', color: '#60a5fa' }}>
                {job_role}
              </span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">{analysis.summary}</p>
            <p className="text-xs text-gray-600 mt-3">
              Experience level:
              <span className="ml-1 font-semibold capitalize text-gray-400">
                {analysis.experience_level}
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Strengths + Weaknesses */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-2xl p-5"
          style={{ background: '#162a1e', border: '1px solid #1e4a2e' }}>
          <h3 className="font-bold text-green-400 mb-4">✅ Strengths</h3>
          <ul className="space-y-3">
            {analysis.strengths.map((s, i) => (
              <li key={i} className="flex gap-2 text-sm text-green-300">
                <span className="mt-0.5 text-green-600">•</span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl p-5"
          style={{ background: '#2d1515', border: '1px solid #4a1e1e' }}>
          <h3 className="font-bold text-red-400 mb-4">⚠️ Weaknesses</h3>
          <ul className="space-y-3">
            {analysis.weaknesses.map((w, i) => (
              <li key={i} className="flex gap-2 text-sm text-red-300">
                <span className="mt-0.5 text-red-600">•</span>
                <span>{w}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Suggestions */}
      <div className="rounded-2xl p-5"
        style={{ background: '#1a2035', border: '1px solid #2d3f6b' }}>
        <h3 className="font-bold text-blue-400 mb-4">💡 Action Items</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {analysis.suggestions.map((tip, i) => (
            <div key={i} className="rounded-xl p-3 text-sm text-blue-300 flex gap-2"
              style={{ background: '#1a1d27', border: '1px solid #2d3f6b' }}>
              <span className="font-bold text-blue-500">{i + 1}.</span>
              <span>{tip}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Missing Keywords */}
      <div className="rounded-2xl p-5"
        style={{ background: '#1a1d27', border: '1px solid #2d3148' }}>
        <h3 className="font-bold text-gray-200 mb-4">🔑 Missing Keywords</h3>
        <div className="flex flex-wrap gap-2">
          {analysis.missing_keywords.map((kw, i) => (
            <span key={i} className="text-xs font-medium px-3 py-1.5 rounded-full"
              style={{ background: '#2d2a10', color: '#fbbf24', border: '1px solid #4a4010' }}>
              {kw}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}