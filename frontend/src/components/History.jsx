// src/components/History.jsx
import { useState, useEffect } from 'react'
import axios from 'axios'
import { Clock, FileText } from 'lucide-react'

function ScoreBadge({ score }) {
  const style = score >= 80
    ? { background: '#162a1e', color: '#4ade80', border: '1px solid #1e4a2e' }
    : score >= 60
    ? { background: '#2d2510', color: '#fbbf24', border: '1px solid #4a3a10' }
    : { background: '#2d1515', color: '#f87171', border: '1px solid #4a1e1e' }

  return (
    <span className="text-xs font-bold px-2 py-1 rounded-full" style={style}>
      {score}/100
    </span>
  )
}

export default function History({ onSelect }) {
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchHistory() }, [])

  const fetchHistory = async () => {
    try {
      const { data } = await axios.get('http://127.0.0.1:5000/history')
      setRecords(data)
    } catch (err) {
      console.error('Failed to load history')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (iso) => new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })

  if (loading) return (
    <div className="text-center py-10 text-gray-500">Loading history...</div>
  )

  if (records.length === 0) return (
    <div className="text-center py-16 space-y-2">
      <Clock className="w-10 h-10 text-gray-700 mx-auto" />
      <p className="text-gray-500 font-medium">No analyses yet</p>
      <p className="text-gray-600 text-sm">Upload a resume to get started</p>
    </div>
  )

  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-500">{records.length} past analyses</p>

      {records.map((record) => (
        <div
          key={record.id}
          onClick={() => onSelect(record)}
          className="rounded-2xl p-4 cursor-pointer transition-all duration-200 flex items-center gap-4"
          style={{ background: '#252836', border: '1px solid #2d3148' }}
          onMouseEnter={e => e.currentTarget.style.border = '1px solid #3b82f6'}
          onMouseLeave={e => e.currentTarget.style.border = '1px solid #2d3148'}
        >
          <div className="p-3 rounded-xl" style={{ background: '#1e3a5f' }}>
            <FileText className="w-5 h-5 text-blue-400" />
          </div>

          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-200 truncate">{record.filename}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs px-2 py-0.5 rounded-full"
                style={{ background: '#252836', color: '#9ca3af', border: '1px solid #374151' }}>
                {record.job_role}
              </span>
              <span className="text-xs text-gray-600">{formatDate(record.created_at)}</span>
            </div>
          </div>

          <div className="flex flex-col items-end gap-1">
            <ScoreBadge score={record.score} />
            <span className="text-xs text-gray-600">ATS: {record.ats_score}</span>
          </div>
        </div>
      ))}
    </div>
  )
}