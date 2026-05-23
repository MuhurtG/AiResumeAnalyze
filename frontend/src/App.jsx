// src/App.jsx
import { useState } from 'react'
import axios from 'axios'
import UploadZone from './components/UploadZone'
import ResultsPanel from './components/ResultsPanel'
import History from './components/History'
import { Loader2, FileSearch, Clock, Upload } from 'lucide-react'

export default function App() {
  const [file, setFile]       = useState(null)
  const [jobRole, setJobRole] = useState('')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState(null)
  const [error, setError]     = useState('')
  const [tab, setTab]         = useState('analyze')

  const handleAnalyze = async () => {
    if (!file) return
    setLoading(true)
    setError('')
    setResults(null)

    const formData = new FormData()
    formData.append('resume', file)
    formData.append('jobRole', jobRole || 'General')

    try {
      const { data } = await axios.post(
        'http://127.0.0.1:5000/analyze',
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      )
      setResults(data)
    } catch (err) {
      const msg = err.response?.data?.error || 'Something went wrong'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  const handleHistorySelect = (record) => {
    setResults({
      analysis: record.analysis,
      job_role: record.job_role,
      filename: record.filename
    })
    setTab('analyze')
  }

  return (
    <div className="min-h-screen" style={{ background: '#0f1117' }}>

      {/* Header */}
      <header style={{ background: '#1a1d27', borderBottom: '1px solid #2d3148' }}
        className="sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileSearch className="w-6 h-6 text-blue-400" />
            <span className="text-xl font-bold text-white">
              Resume<span className="text-blue-400">AI</span>
            </span>
          </div>

          {/* Tabs */}
          <div className="flex rounded-xl p-1 gap-1"
            style={{ background: '#252836' }}>
            <button
              onClick={() => setTab('analyze')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
                ${tab === 'analyze'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-gray-400 hover:text-gray-200'
                }`}
            >
              <Upload className="w-4 h-4" /> Analyze
            </button>
            <button
              onClick={() => setTab('history')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
                ${tab === 'history'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-gray-400 hover:text-gray-200'
                }`}
            >
              <Clock className="w-4 h-4" /> History
            </button>
          </div>

          <span className="text-xs font-semibold px-3 py-1 rounded-full"
            style={{ background: '#1e3a5f', color: '#60a5fa', border: '1px solid #2d5a8f' }}>
            Powered by Gemini
          </span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10 space-y-6">

        {tab === 'analyze' && (
          <>
            {/* Hero */}
            <div className="text-center space-y-2">
              <h1 className="text-4xl font-bold text-white">
                Analyze Your Resume with AI
              </h1>
              <p className="text-gray-400 text-lg">
                Get instant feedback, score and tips to land your dream job
              </p>
            </div>

            {/* Upload card */}
            <div className="rounded-2xl p-6 space-y-4"
              style={{ background: '#1a1d27', border: '1px solid #2d3148' }}>
              <UploadZone onFileSelect={setFile} />

              <input
                type="text"
                placeholder="Job role (e.g. Data Analyst, Software Engineer)..."
                value={jobRole}
                onChange={e => setJobRole(e.target.value)}
                className="w-full rounded-xl px-4 py-3 text-sm text-gray-200
                           focus:outline-none focus:ring-2 focus:ring-blue-500"
                style={{ background: '#252836', border: '1px solid #2d3148' }}
              />

              <button
                onClick={handleAnalyze}
                disabled={!file || loading}
                className="w-full py-3 rounded-xl font-semibold text-white
                           bg-blue-600 hover:bg-blue-500
                           disabled:opacity-40 disabled:cursor-not-allowed
                           transition-all duration-200 flex items-center justify-center gap-2"
              >
                {loading
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing...</>
                  : '✨ Analyze Resume'
                }
              </button>

              {error && (
                <div className="px-4 py-3 rounded-xl text-sm text-red-400"
                  style={{ background: '#2d1515', border: '1px solid #5c2626' }}>
                  ⚠️ {error}
                </div>
              )}
            </div>

            {/* Loading */}
            {loading && (
              <div className="text-center py-16 space-y-3">
                <Loader2 className="w-10 h-10 animate-spin text-blue-400 mx-auto" />
                <p className="text-gray-400 font-medium">Gemini is reading your resume...</p>
                <p className="text-gray-600 text-sm">This takes about 10-15 seconds</p>
              </div>
            )}

            {results && <ResultsPanel data={results} />}
          </>
        )}

        {tab === 'history' && (
          <>
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-bold text-white">Past Analyses</h1>
              <p className="text-gray-400">Click any record to view full analysis</p>
            </div>
            <div className="rounded-2xl p-6"
              style={{ background: '#1a1d27', border: '1px solid #2d3148' }}>
              <History onSelect={handleHistorySelect} />
            </div>
          </>
        )}

      </main>
    </div>
  )
}