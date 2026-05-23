// src/components/UploadZone.jsx
import { useDropzone } from 'react-dropzone'
import { useState } from 'react'
import { FileText, Upload } from 'lucide-react'

export default function UploadZone({ onFileSelect }) {
  const [file, setFile] = useState(null)
  const [error, setError] = useState('')

  const onDrop = (accepted, rejected) => {
    if (rejected.length > 0) {
      const err = rejected[0].errors[0]
      if (err.code === 'file-too-large') setError('File exceeds 5MB limit')
      if (err.code === 'file-invalid-type') setError('Only PDF files allowed')
      return
    }
    setError('')
    setFile(accepted[0])
    onFileSelect(accepted[0])
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxSize: 5 * 1024 * 1024,
    multiple: false
  })

  return (
    <div>
      <div
        {...getRootProps()}
        className="rounded-2xl p-12 text-center cursor-pointer transition-all duration-200"
        style={{
          border: isDragActive
            ? '2px dashed #3b82f6'
            : '2px dashed #2d3148',
          background: isDragActive ? '#1e2d4a' : '#252836'
        }}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-3">
          <div className="p-4 rounded-full"
            style={{ background: isDragActive ? '#1e3a5f' : '#1a1d27' }}>
            <Upload className={`w-8 h-8 ${isDragActive ? 'text-blue-400' : 'text-gray-500'}`} />
          </div>
          {isDragActive
            ? <p className="text-blue-400 font-semibold text-lg">Drop it here!</p>
            : <div>
                <p className="text-gray-300 font-medium">Drag & drop your resume</p>
                <p className="text-gray-500 text-sm mt-1">
                  or <span className="text-blue-400 underline">browse files</span>
                </p>
              </div>
          }
          <p className="text-xs text-gray-600">PDF only · Max 5MB</p>
        </div>
      </div>

      {file && (
        <div className="mt-3 flex items-center gap-3 px-4 py-3 rounded-xl"
          style={{ background: '#162a1e', border: '1px solid #1e4a2e' }}>
          <FileText className="w-5 h-5 text-green-400" />
          <div>
            <p className="text-sm font-medium text-green-300">{file.name}</p>
            <p className="text-xs text-green-600">{(file.size / 1024).toFixed(0)} KB</p>
          </div>
        </div>
      )}

      {error && (
        <p className="mt-2 text-sm text-red-400">⚠️ {error}</p>
      )}
    </div>
  )
}