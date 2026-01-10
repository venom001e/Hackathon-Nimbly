"use client"

import { useState, useCallback, useEffect } from 'react'
import { 
  UploadCloudIcon, 
  FileIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  Loader2Icon,
  TrashIcon,
  ArrowLeftIcon,
  FileSpreadsheetIcon,
  AlertTriangleIcon,
  RefreshCwIcon,
  EyeIcon
} from 'lucide-react'
import Link from 'next/link'

interface UploadedFile {
  id: string
  name: string
  size: number
  status: 'pending' | 'uploading' | 'processing' | 'completed' | 'failed'
  progress: number
  uploadId?: string
  totalRecords?: number
  validRecords?: number
  processedRecords?: number
  errors?: string[]
  startedAt?: string
  completedAt?: string
}

export default function UploadPage() {
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [recentUploads, setRecentUploads] = useState<any[]>([])
  const [showRecentUploads, setShowRecentUploads] = useState(false)

  useEffect(() => {
    loadRecentUploads()
  }, [])

  const loadRecentUploads = async () => {
    try {
      const res = await fetch('/api/data/upload')
      if (res.ok) {
        const data = await res.json()
        setRecentUploads(data.jobs || [])
      }
    } catch (error) {
      console.error('Error loading recent uploads:', error)
    }
  }

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
    const validFiles = newFiles.filter(f => f.name.endsWith('.csv'))

    if (validFiles.length !== newFiles.length) {
      alert('Only CSV files are supported')
    }

    const uploadFiles: UploadedFile[] = validFiles.map(f => ({
      id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: f.name,
      size: f.size,
      status: 'pending',
      progress: 0
    }))

    setFiles(prev => [...prev, ...uploadFiles])

    // Start upload for each file
    uploadFiles.forEach((file, index) => {
      setTimeout(() => uploadFile(file.id, validFiles[index]), index * 500)
    })
  }

  const uploadFile = async (fileId: string, file: File) => {
    try {
      // Update status to uploading
      setFiles(prev => prev.map(f => 
        f.id === fileId ? { ...f, status: 'uploading' } : f
      ))

      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/data/upload', {
        method: 'POST',
        body: formData
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Upload failed')
      }

      // Update with upload ID and start monitoring
      setFiles(prev => prev.map(f => 
        f.id === fileId ? { 
          ...f, 
          status: 'processing', 
          uploadId: result.upload_id,
          progress: 0
        } : f
      ))

      // Monitor progress
      monitorUploadProgress(fileId, result.upload_id)

    } catch (error) {
      console.error('Upload error:', error)
      setFiles(prev => prev.map(f => 
        f.id === fileId ? { 
          ...f, 
          status: 'failed', 
          errors: [error instanceof Error ? error.message : 'Upload failed']
        } : f
      ))
    }
  }

  const monitorUploadProgress = async (fileId: string, uploadId: string) => {
    const checkProgress = async () => {
      try {
        const res = await fetch(`/api/data/upload?upload_id=${uploadId}`)
        if (res.ok) {
          const data = await res.json()
          
          setFiles(prev => prev.map(f => 
            f.id === fileId ? {
              ...f,
              status: data.status,
              progress: data.progress,
              totalRecords: data.total_records,
              validRecords: data.valid_records,
              processedRecords: data.processed_records,
              errors: data.error_message ? [data.error_message] : undefined,
              startedAt: data.started_at,
              completedAt: data.completed_at
            } : f
          ))

          // Continue monitoring if still processing
          if (data.status === 'processing') {
            setTimeout(checkProgress, 1000)
          }
        }
      } catch (error) {
        console.error('Progress check error:', error)
      }
    }

    checkProgress()
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
  const totalValidRecords = files.reduce((sum, f) => sum + (f.validRecords || 0), 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50/30 to-gray-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-lg border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 md:px-8 py-4">
          <div className="flex items-center justify-between">
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
                  Upload Aadhaar enrolment data files for analysis
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowRecentUploads(!showRecentUploads)}
                className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <EyeIcon className="w-4 h-4" />
                Recent Uploads
              </button>
              <button
                onClick={loadRecentUploads}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <RefreshCwIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 md:px-8 py-8">
        {/* Recent Uploads */}
        {showRecentUploads && recentUploads.length > 0 && (
          <div className="mb-6 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Uploads</h3>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {recentUploads.map(upload => (
                <div key={upload.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-sm text-gray-900">{upload.filename}</p>
                    <p className="text-xs text-gray-500">
                      {upload.valid_records?.toLocaleString()} records • {upload.status}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">
                      {new Date(upload.started_at).toLocaleDateString()}
                    </p>
                    {getStatusIcon(upload.status)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

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
            accept=".csv"
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
              {isDragging ? 'Drop CSV files here' : 'Drag & drop CSV files here'}
            </p>
            <p className="text-sm text-gray-500 mb-4">
              or click to browse from your computer
            </p>
            
            <div className="flex items-center gap-4 text-xs text-gray-400">
              <span className="flex items-center gap-1">
                <FileSpreadsheetIcon className="w-4 h-4" />
                CSV files only
              </span>
              <span>Max 100MB per file</span>
            </div>
          </div>
        </div>

        {/* File Format Info */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-xl">
          <div className="flex items-start gap-3">
            <AlertTriangleIcon className="w-5 h-5 text-blue-500 mt-0.5" />
            <div>
              <p className="font-medium text-blue-900">Required CSV Format</p>
              <p className="text-sm text-blue-700 mt-1">
                Columns: <code className="bg-blue-100 px-1 rounded">date, state, district, pincode, age_0_5, age_5_17, age_18_greater</code>
              </p>
              <p className="text-xs text-blue-600 mt-2">
                Date format: DD-MM-YYYY • Age groups should be numeric values
              </p>
            </div>
          </div>
        </div>

        {/* Upload Stats */}
        {files.length > 0 && (
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-center">
              <p className="text-2xl font-bold text-gray-900">{files.length}</p>
              <p className="text-sm text-gray-500">Files Uploaded</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-center">
              <p className="text-2xl font-bold text-green-600">{completedCount}</p>
              <p className="text-sm text-gray-500">Completed</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-center">
              <p className="text-2xl font-bold text-orange-600">{totalValidRecords.toLocaleString()}</p>
              <p className="text-sm text-gray-500">Valid Records</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-center">
              <p className="text-2xl font-bold text-blue-600">
                {files.reduce((sum, f) => sum + (f.totalRecords || 0), 0).toLocaleString()}
              </p>
              <p className="text-sm text-gray-500">Total Processed</p>
            </div>
          </div>
        )}

        {/* File List */}
        {files.length > 0 && (
          <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
              <h3 className="font-medium text-gray-900">Upload Progress</h3>
            </div>
            <div className="divide-y divide-gray-100">
              {files.map(file => (
                <div key={file.id} className="px-4 py-4">
                  <div className="flex items-start gap-4">
                    {getStatusIcon(file.status)}
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium text-gray-900 truncate">{file.name}</p>
                        <span className="text-xs text-gray-500">{formatFileSize(file.size)}</span>
                      </div>
                      
                      {(file.status === 'uploading' || file.status === 'processing') && (
                        <div className="mb-2">
                          <div className="flex justify-between text-xs text-gray-500 mb-1">
                            <span>
                              {file.status === 'uploading' ? 'Uploading...' : 'Processing...'}
                            </span>
                            <span>{file.progress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${file.progress}%` }}
                            ></div>
                          </div>
                          {file.processedRecords && file.totalRecords && (
                            <p className="text-xs text-gray-500 mt-1">
                              {file.processedRecords.toLocaleString()} / {file.totalRecords.toLocaleString()} records
                            </p>
                          )}
                        </div>
                      )}
                      
                      {file.status === 'completed' && (
                        <div className="space-y-1">
                          <p className="text-sm text-green-600 font-medium">
                            ✓ Upload completed successfully
                          </p>
                          <div className="grid grid-cols-2 gap-4 text-xs text-gray-600">
                            <div>
                              <span className="text-gray-500">Total Records:</span>
                              <span className="ml-1 font-medium">{file.totalRecords?.toLocaleString()}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Valid Records:</span>
                              <span className="ml-1 font-medium text-green-600">{file.validRecords?.toLocaleString()}</span>
                            </div>
                          </div>
                          {file.errors && (
                            <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
                              <p className="text-yellow-800 font-medium">Validation Issues:</p>
                              <p className="text-yellow-700">{file.errors[0]}</p>
                            </div>
                          )}
                        </div>
                      )}
                      
                      {file.status === 'failed' && file.errors && (
                        <div className="p-2 bg-red-50 border border-red-200 rounded">
                          <p className="text-sm font-medium text-red-800">Upload Failed</p>
                          <p className="text-xs text-red-700 mt-1">{file.errors[0]}</p>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => removeFile(file.id)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {completedCount > 0 && (
          <div className="mt-6 flex justify-between items-center">
            <div className="text-sm text-gray-600">
              Successfully uploaded {totalValidRecords.toLocaleString()} records from {completedCount} file{completedCount !== 1 ? 's' : ''}
            </div>
            <div className="flex gap-3">
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
          </div>
        )}
      </div>
    </div>
  )
}
