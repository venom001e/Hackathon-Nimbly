"use client"

import { useState, useCallback } from 'react'
import { 
  UploadCloudIcon, 
  FileIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  Loader2Icon,
  TrashIcon,
  ArrowLeftIcon,
  FileSpreadsheetIcon,
  AlertTriangleIcon
} from 'lucide-react'
import Link from 'next/link'

interface UploadedFile {
  id: string
  name: string
  size: number
  status: 'pending' | 'uploading' | 'processing' | 'completed' | 'failed'
  progress: number
  records?: number
  errors?: string[]
}

export default function UploadPage() {
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [isDragging, setIsDragging] = useState(false)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    const droppedFiles = Array.from(e.dataTransfer.files)
    handleFiles(droppedFiles)
  }, [])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(Array.from(e.target.files))
    }
  }

  const handleFiles = (newFiles: File[]) => {
    const validFiles = newFiles.filter(f => 
      f.name.endsWith('.csv') || f.name.endsWith('.json')
    )

    const uploadFiles: UploadedFile[] = validFiles.map(f => ({
      id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: f.name,
      size: f.size,
      status: 'pending',
      progress: 0
    }))

    setFiles(prev => [...prev, ...uploadFiles])

    // Simulate upload for each file
    uploadFiles.forEach((file, index) => {
      setTimeout(() => simulateUpload(file.id), index * 500)
    })
  }

  const simulateUpload = async (fileId: string) => {
    // Start uploading
    setFiles(prev => prev.map(f => 
      f.id === fileId ? { ...f, status: 'uploading' } : f
    ))

    // Simulate progress
    for (let progress = 0; progress <= 100; progress += 10) {
      await new Promise(resolve => setTimeout(resolve, 200))
      setFiles(prev => prev.map(f => 
        f.id === fileId ? { ...f, progress } : f
      ))
    }

    // Processing
    setFiles(prev => prev.map(f => 
      f.id === fileId ? { ...f, status: 'processing', progress: 100 } : f
    ))

    await new Promise(resolve => setTimeout(resolve, 1500))

    // Complete with random records count
    const records = Math.floor(Math.random() * 50000) + 10000
    setFiles(prev => prev.map(f => 
      f.id === fileId ? { ...f, status: 'completed', records } : f
    ))
  }

  const removeFile = (fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId))
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircleIcon className="w-5 h-5 text-green-500" />
      case 'failed': return <XCircleIcon className="w-5 h-5 text-red-500" />
      case 'uploading':
      case 'processing': return <Loader2Icon className="w-5 h-5 text-orange-500 animate-spin" />
      default: return <FileIcon className="w-5 h-5 text-gray-400" />
    }
  }

  const completedCount = files.filter(f => f.status === 'completed').length
  const totalRecords = files.reduce((sum, f) => sum + (f.records || 0), 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50/30 to-gray-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-lg border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 md:px-8 py-4">
          <div className="flex items-center gap-4">
            <Link 
              href="/analytics" 
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5 text-gray-600" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <UploadCloudIcon className="w-7 h-7 text-orange-500" />
                Data Upload
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Upload Nimbly enrolment data files for analysis
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 md:px-8 py-8">
        {/* Upload Zone */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            relative border-2 border-dashed rounded-2xl p-12 text-center transition-all
            ${isDragging 
              ? 'border-orange-500 bg-orange-50' 
              : 'border-gray-300 bg-white hover:border-orange-400 hover:bg-orange-50/50'
            }
          `}
        >
          <input
            type="file"
            accept=".csv,.json"
            multiple
            onChange={handleFileSelect}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          
          <div className="flex flex-col items-center">
            <div className={`p-4 rounded-full mb-4 transition-colors ${
              isDragging ? 'bg-orange-100' : 'bg-gray-100'
            }`}>
              <UploadCloudIcon className={`w-12 h-12 ${
                isDragging ? 'text-orange-500' : 'text-gray-400'
              }`} />
            </div>
            
            <p className="text-lg font-medium text-gray-900 mb-2">
              {isDragging ? 'Drop files here' : 'Drag & drop files here'}
            </p>
            <p className="text-sm text-gray-500 mb-4">
              or click to browse from your computer
            </p>
            
            <div className="flex items-center gap-4 text-xs text-gray-400">
              <span className="flex items-center gap-1">
                <FileSpreadsheetIcon className="w-4 h-4" />
                CSV files
              </span>
              <span className="flex items-center gap-1">
                <FileIcon className="w-4 h-4" />
                JSON files
              </span>
            </div>
          </div>
        </div>

        {/* File Format Info */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-xl">
          <div className="flex items-start gap-3">
            <AlertTriangleIcon className="w-5 h-5 text-blue-500 mt-0.5" />
            <div>
              <p className="font-medium text-blue-900">Expected File Format</p>
              <p className="text-sm text-blue-700 mt-1">
                CSV files should contain columns: date, state, district, pincode, age_0_5, age_5_17, age_18_greater
              </p>
            </div>
          </div>
        </div>

        {/* Upload Stats */}
        {files.length > 0 && (
          <div className="mt-8 grid grid-cols-3 gap-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-center">
              <p className="text-2xl font-bold text-gray-900">{files.length}</p>
              <p className="text-sm text-gray-500">Files Uploaded</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-center">
              <p className="text-2xl font-bold text-green-600">{completedCount}</p>
              <p className="text-sm text-gray-500">Completed</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-center">
              <p className="text-2xl font-bold text-orange-600">{totalRecords.toLocaleString()}</p>
              <p className="text-sm text-gray-500">Records Processed</p>
            </div>
          </div>
        )}

        {/* File List */}
        {files.length > 0 && (
          <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
              <h3 className="font-medium text-gray-900">Uploaded Files</h3>
            </div>
            <div className="divide-y divide-gray-100">
              {files.map(file => (
                <div key={file.id} className="px-4 py-4 flex items-center gap-4">
                  {getStatusIcon(file.status)}
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-medium text-gray-900 truncate">{file.name}</p>
                      <span className="text-xs text-gray-500">{formatFileSize(file.size)}</span>
                    </div>
                    
                    {(file.status === 'uploading' || file.status === 'processing') && (
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div 
                          className="bg-orange-500 h-1.5 rounded-full transition-all duration-300"
                          style={{ width: `${file.progress}%` }}
                        ></div>
                      </div>
                    )}
                    
                    {file.status === 'completed' && (
                      <p className="text-xs text-green-600">
                        ✓ {file.records?.toLocaleString()} records processed
                      </p>
                    )}
                    
                    {file.status === 'failed' && file.errors && (
                      <p className="text-xs text-red-600">
                        {file.errors.join(', ')}
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => removeFile(file.id)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {completedCount > 0 && (
          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={() => setFiles([])}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Clear All
            </button>
            <Link
              href="/analytics"
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              View Analytics
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
