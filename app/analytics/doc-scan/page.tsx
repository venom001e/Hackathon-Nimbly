"use client"

import { useState, useRef } from 'react'
import { 
  CheckCircleIcon, XCircleIcon, AlertTriangleIcon,
  ChevronRightIcon, RefreshCwIcon, FileTextIcon, ZapIcon,
  ShieldCheckIcon, ShieldAlertIcon, ScanIcon, SparklesIcon, 
  BrainCircuitIcon, AlertOctagonIcon, CheckIcon,
  CreditCardIcon, FileIcon, CarIcon, GlobeIcon, BuildingIcon,
  UserIcon, CalendarIcon, HashIcon, MapPinIcon,
  Loader2Icon, CameraIcon, UploadCloudIcon
} from 'lucide-react'
import Link from 'next/link'

type DocumentType = 'PAN Card' | 'Voter ID' | 'Passport' | 'Driving License' | 'Ration Card' | 'Other'

interface SecurityCheck {
  name: string
  status: 'pass' | 'fail' | 'warning'
  confidence: number
  details: string
}

interface QualityIndicator {
  type: string
  severity: 'high' | 'medium' | 'low'
  description: string
}

interface ExtractedData {
  documentNumber: string
  holderName: string
  dateOfBirth: string
  fatherName: string
  address: string
  issueDate: string
  expiryDate: string
  issuingAuthority: string
}

interface AnalysisResult {
  isGoodQuality: boolean
  confidenceScore: number
  qualityScore: number
  verdict: 'GOOD_QUALITY' | 'POOR_QUALITY' | 'SUSPICIOUS'
  documentType: string
  extractedData: ExtractedData
  qualityChecks: SecurityCheck[]
  qualityIndicators: QualityIndicator[]
  recommendation: 'ACCEPT' | 'REJECT' | 'MANUAL_REVIEW'
  summary: string
  detailedAnalysis: string
}

const documentTypes: { key: DocumentType; label: string; icon: typeof CreditCardIcon; color: string }[] = [
  { key: 'PAN Card', label: 'PAN Card', icon: CreditCardIcon, color: 'bg-blue-100 text-blue-600 border-blue-200' },
  { key: 'Voter ID', label: 'Voter ID (EPIC)', icon: FileIcon, color: 'bg-purple-100 text-purple-600 border-purple-200' },
  { key: 'Passport', label: 'Passport', icon: GlobeIcon, color: 'bg-green-100 text-green-600 border-green-200' },
  { key: 'Driving License', label: 'Driving License', icon: CarIcon, color: 'bg-orange-100 text-orange-600 border-orange-200' },
  { key: 'Ration Card', label: 'Ration Card', icon: BuildingIcon, color: 'bg-red-100 text-red-600 border-red-200' },
  { key: 'Other', label: 'Other Document', icon: FileTextIcon, color: 'bg-gray-100 text-gray-600 border-gray-200' },
]

export default function DocScanPage() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [selectedDocType, setSelectedDocType] = useState<DocumentType>('PAN Card')
  const [analyzing, setAnalyzing] = useState(false)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true)
    else if (e.type === "dragleave") setDragActive(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0])
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) handleFile(e.target.files[0])
  }

  const handleFile = (file: File) => {
    if (file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string)
        setResult(null)
        setError(null)
      }
      reader.readAsDataURL(file)
    }
  }

  const analyzeDocument = async () => {
    if (!selectedImage) return
    
    setAnalyzing(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch('/api/doc-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: selectedImage,
          documentType: selectedDocType
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Analysis failed')
      }

      setResult(data.analysis)
      
      // Show mock response notification if applicable
      if (data.isMockResponse) {
        console.log('🔄 Mock response received - Add real Gemini API key for actual analysis')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze document')
    } finally {
      setAnalyzing(false)
    }
  }

  const resetAnalysis = () => {
    setSelectedImage(null)
    setResult(null)
    setError(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const getStatusColor = (status: string) => {
    if (status === 'pass') return 'bg-green-100 text-green-700 border-green-200'
    if (status === 'fail') return 'bg-red-100 text-red-700 border-red-200'
    return 'bg-yellow-100 text-yellow-700 border-yellow-200'
  }

  const getStatusIcon = (status: string) => {
    if (status === 'pass') return <CheckCircleIcon className="w-5 h-5 text-green-500" />
    if (status === 'fail') return <XCircleIcon className="w-5 h-5 text-red-500" />
    return <AlertTriangleIcon className="w-5 h-5 text-yellow-500" />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50/30 to-slate-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link href="/analytics" className="hover:text-orange-600 transition-colors">Dashboard</Link>
          <ChevronRightIcon className="w-4 h-4" />
          <span className="text-gray-900 font-medium">Document Verification</span>
        </div>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl shadow-lg shadow-orange-500/25">
              <ShieldAlertIcon className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                AI Document Quality Assessment
              </h1>
              <p className="text-gray-600">Powered by Google Gemini Vision AI</p>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-4">
            <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              AI Active
            </span>
            <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full">
              Quality Analysis
            </span>
            <span className="px-3 py-1 bg-purple-100 text-purple-700 text-sm font-medium rounded-full">
              Gemini Vision
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Left Panel - Upload */}
          <div className="lg:col-span-2 space-y-6">
            {/* Document Type Selection */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FileTextIcon className="w-5 h-5 text-orange-500" />
                Document Type
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {documentTypes.map(doc => (
                  <button
                    key={doc.key}
                    onClick={() => setSelectedDocType(doc.key)}
                    className={`p-4 rounded-xl border-2 transition-all text-left hover:shadow-md ${
                      selectedDocType === doc.key 
                        ? 'border-orange-500 bg-orange-50 shadow-md' 
                        : 'border-gray-200 hover:border-orange-300 bg-white'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl ${doc.color} flex items-center justify-center mb-2 border`}>
                      <doc.icon className="w-5 h-5" />
                    </div>
                    <p className="font-medium text-gray-900 text-sm">{doc.label}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Upload Area */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <UploadCloudIcon className="w-5 h-5 text-orange-500" />
                Upload Document
              </h3>

              {!selectedImage ? (
                <div
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all cursor-pointer ${
                    dragActive 
                      ? 'border-orange-500 bg-orange-50 scale-[1.02]' 
                      : 'border-gray-300 hover:border-orange-400 hover:bg-orange-50/50'
                  }`}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileInput} className="hidden" />
                  <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-orange-100 to-orange-200 rounded-2xl flex items-center justify-center">
                    <CameraIcon className="w-10 h-10 text-orange-500" />
                  </div>
                  <p className="text-gray-800 font-semibold mb-2">Drop document image here</p>
                  <p className="text-sm text-gray-500">or click to browse</p>
                  <p className="text-xs text-gray-400 mt-3">Supports: JPG, PNG, WEBP (Max 10MB)</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="relative rounded-2xl overflow-hidden border-2 border-gray-200 bg-gray-100">
                    <img 
                      src={selectedImage} 
                      alt="Document" 
                      className="w-full h-auto max-h-[350px] object-contain"
                    />
                    {analyzing && (
                      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center">
                        <div className="text-center text-white">
                          <div className="relative w-20 h-20 mx-auto mb-4">
                            <div className="absolute inset-0 border-4 border-white/30 rounded-full"></div>
                            <div className="absolute inset-0 border-4 border-transparent border-t-white rounded-full animate-spin"></div>
                            <BrainCircuitIcon className="absolute inset-0 m-auto w-8 h-8 text-white" />
                          </div>
                          <p className="font-semibold text-lg">Analyzing with Gemini AI...</p>
                          <p className="text-sm text-white/70 mt-1">Checking authenticity</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={analyzeDocument}
                      disabled={analyzing}
                      className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl hover:from-orange-600 hover:to-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40"
                    >
                      {analyzing ? (
                        <>
                          <Loader2Icon className="w-5 h-5 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <ZapIcon className="w-5 h-5" />
                          Verify Document
                        </>
                      )}
                    </button>
                    <button 
                      onClick={resetAnalysis} 
                      disabled={analyzing}
                      className="px-4 py-4 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50"
                    >
                      <RefreshCwIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* AI Info Card */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 text-white">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-white/10 rounded-xl">
                  <BrainCircuitIcon className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-semibold">Gemini Vision AI</p>
                  <p className="text-sm text-slate-400">Advanced Document Analysis</p>
                </div>
              </div>
              <div className="space-y-2 text-sm text-slate-300">
                <div className="flex items-center gap-2">
                  <CheckIcon className="w-4 h-4 text-green-400" />
                  <span>AI-assisted quality assessment</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckIcon className="w-4 h-4 text-green-400" />
                  <span>OCR text extraction</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckIcon className="w-4 h-4 text-green-400" />
                  <span>Security feature analysis</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckIcon className="w-4 h-4 text-green-400" />
                  <span>Photo tampering detection</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Results */}
          <div className="lg:col-span-3 space-y-6">
            {!result && !error && !analyzing && (
              <div className="bg-white rounded-2xl p-12 border border-gray-100 shadow-sm text-center">
                <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-orange-100 to-orange-200 rounded-3xl flex items-center justify-center">
                  <ScanIcon className="w-12 h-12 text-orange-500" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Ready to Verify</h3>
                <p className="text-gray-500 max-w-md mx-auto">
                  Upload a document image and click "Assess Document" to start AI-assisted quality analysis
                </p>
                <div className="flex items-center justify-center gap-6 mt-8 text-sm text-gray-400">
                  <div className="flex items-center gap-2">
                    <ShieldCheckIcon className="w-5 h-5" />
                    <span>Quality Assessment</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <SparklesIcon className="w-5 h-5" />
                    <span>AI Analysis</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FileTextIcon className="w-5 h-5" />
                    <span>OCR Extraction</span>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-red-100 rounded-xl">
                    <AlertOctagonIcon className="w-6 h-6 text-red-600" />
                  </div>
                  <h3 className="font-semibold text-red-800">Analysis Failed</h3>
                </div>
                <p className="text-red-700">{error}</p>
                <button 
                  onClick={resetAnalysis}
                  className="mt-4 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium"
                >
                  Try Again
                </button>
              </div>
            )}

            {result && (
              <div className="space-y-6">
                {/* Main Verdict Card */}
                <div className={`rounded-2xl p-6 border-2 ${
                  result.verdict === 'GOOD_QUALITY' 
                    ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-300' 
                    : result.verdict === 'POOR_QUALITY' 
                    ? 'bg-gradient-to-br from-red-50 to-rose-50 border-red-300'
                    : 'bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-300'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`p-4 rounded-2xl ${
                        result.verdict === 'GOOD_QUALITY' 
                          ? 'bg-green-100' 
                          : result.verdict === 'POOR_QUALITY' 
                          ? 'bg-red-100'
                          : 'bg-yellow-100'
                      }`}>
                        {result.verdict === 'GOOD_QUALITY' ? (
                          <ShieldCheckIcon className={`w-10 h-10 text-green-600`} />
                        ) : result.verdict === 'POOR_QUALITY' ? (
                          <ShieldAlertIcon className={`w-10 h-10 text-red-600`} />
                        ) : (
                          <AlertTriangleIcon className={`w-10 h-10 text-yellow-600`} />
                        )}
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 font-medium">Quality Assessment Result</p>
                        <h2 className={`text-3xl font-bold ${
                          result.verdict === 'GOOD_QUALITY' 
                            ? 'text-green-700' 
                            : result.verdict === 'POOR_QUALITY' 
                            ? 'text-red-700'
                            : 'text-yellow-700'
                        }`}>
                          {result.verdict.replace('_', ' ')}
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">{result.documentType}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Confidence</p>
                      <p className={`text-4xl font-bold ${
                        result.confidenceScore >= 80 ? 'text-green-600' : 
                        result.confidenceScore >= 50 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {result.confidenceScore}%
                      </p>
                    </div>
                  </div>
                </div>

                {/* Fraud Score Meter */}
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <AlertTriangleIcon className="w-5 h-5 text-orange-500" />
                    Quality Risk Score
                  </h3>
                  <div className="relative h-6 bg-gradient-to-r from-green-200 via-yellow-200 to-red-200 rounded-full overflow-hidden">
                    <div 
                      className="absolute top-0 left-0 h-full bg-black/20 transition-all duration-500"
                      style={{ width: `${result.qualityScore}%` }}
                    />
                    <div 
                      className="absolute top-1/2 -translate-y-1/2 w-4 h-8 bg-white border-2 border-gray-800 rounded-full shadow-lg transition-all duration-500"
                      style={{ left: `calc(${result.qualityScore}% - 8px)` }}
                    />
                  </div>
                  <div className="flex justify-between mt-2 text-xs text-gray-500">
                    <span>Low Risk (0)</span>
                    <span>Medium (50)</span>
                    <span>High Risk (100)</span>
                  </div>
                  <p className="mt-4 text-center">
                    <span className={`text-2xl font-bold ${
                      result.qualityScore <= 30 ? 'text-green-600' : 
                      result.qualityScore <= 60 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {result.qualityScore}%
                    </span>
                    <span className="text-gray-500 ml-2">Quality Risk</span>
                  </p>
                </div>

                {/* Extracted Data */}
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <FileTextIcon className="w-5 h-5 text-orange-500" />
                    Extracted Information (OCR)
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { icon: HashIcon, label: 'Document Number', value: result.extractedData.documentNumber },
                      { icon: UserIcon, label: 'Holder Name', value: result.extractedData.holderName },
                      { icon: CalendarIcon, label: 'Date of Birth', value: result.extractedData.dateOfBirth },
                      { icon: UserIcon, label: 'Father Name', value: result.extractedData.fatherName },
                      { icon: CalendarIcon, label: 'Issue Date', value: result.extractedData.issueDate },
                      { icon: CalendarIcon, label: 'Expiry Date', value: result.extractedData.expiryDate },
                      { icon: BuildingIcon, label: 'Issuing Authority', value: result.extractedData.issuingAuthority },
                    ].map((item, idx) => (
                      <div key={idx} className="p-3 bg-gray-50 rounded-xl">
                        <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
                          <item.icon className="w-3 h-3" />
                          {item.label}
                        </div>
                        <p className="font-medium text-gray-900 text-sm truncate">{item.value || 'N/A'}</p>
                      </div>
                    ))}
                    <div className="col-span-2 p-3 bg-gray-50 rounded-xl">
                      <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
                        <MapPinIcon className="w-3 h-3" />
                        Address
                      </div>
                      <p className="font-medium text-gray-900 text-sm">{result.extractedData.address || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Security Checks */}
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <ShieldCheckIcon className="w-5 h-5 text-orange-500" />
                    Security Checks
                  </h3>
                  <div className="space-y-3">
                    {result.qualityChecks.map((check, idx) => (
                      <div key={idx} className={`p-4 rounded-xl border ${getStatusColor(check.status)}`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {getStatusIcon(check.status)}
                            <div>
                              <p className="font-medium">{check.name}</p>
                              <p className="text-sm opacity-80">{check.details}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xs opacity-70">Confidence</p>
                            <p className="font-bold">{check.confidence}%</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quality Indicators */}
                {result.qualityIndicators && result.qualityIndicators.length > 0 && (
                  <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                    <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <AlertOctagonIcon className="w-5 h-5 text-red-500" />
                      Quality Issues Detected
                    </h3>
                    <div className="space-y-3">
                      {result.qualityIndicators.map((indicator, idx) => (
                        <div key={idx} className={`p-4 rounded-xl border ${
                          indicator.severity === 'high' 
                            ? 'bg-red-50 border-red-200' 
                            : indicator.severity === 'medium'
                            ? 'bg-yellow-50 border-yellow-200'
                            : 'bg-blue-50 border-blue-200'
                        }`}>
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${
                              indicator.severity === 'high' 
                                ? 'bg-red-200 text-red-800' 
                                : indicator.severity === 'medium'
                                ? 'bg-yellow-200 text-yellow-800'
                                : 'bg-blue-200 text-blue-800'
                            }`}>
                              {indicator.severity.toUpperCase()}
                            </span>
                            <span className="font-medium text-gray-900">{indicator.type}</span>
                          </div>
                          <p className="text-sm text-gray-600">{indicator.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recommendation & Summary */}
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <SparklesIcon className="w-5 h-5 text-orange-500" />
                    AI Recommendation
                  </h3>
                  <div className={`p-4 rounded-xl mb-4 ${
                    result.recommendation === 'ACCEPT' 
                      ? 'bg-green-100 border border-green-200' 
                      : result.recommendation === 'REJECT'
                      ? 'bg-red-100 border border-red-200'
                      : 'bg-yellow-100 border border-yellow-200'
                  }`}>
                    <div className="flex items-center gap-3">
                      {result.recommendation === 'ACCEPT' ? (
                        <CheckCircleIcon className="w-8 h-8 text-green-600" />
                      ) : result.recommendation === 'REJECT' ? (
                        <XCircleIcon className="w-8 h-8 text-red-600" />
                      ) : (
                        <AlertTriangleIcon className="w-8 h-8 text-yellow-600" />
                      )}
                      <div>
                        <p className={`text-lg font-bold ${
                          result.recommendation === 'ACCEPT' 
                            ? 'text-green-700' 
                            : result.recommendation === 'REJECT'
                            ? 'text-red-700'
                            : 'text-yellow-700'
                        }`}>
                          {result.recommendation === 'ACCEPT' ? 'Accept Document' : 
                           result.recommendation === 'REJECT' ? 'Reject Document' : 'Manual Review Required'}
                        </p>
                        <p className="text-sm opacity-80">
                          {result.recommendation === 'ACCEPT' 
                            ? 'Document appears to be of good quality and can be accepted' 
                            : result.recommendation === 'REJECT'
                            ? 'Document shows quality issues and should be rejected'
                            : 'Document requires manual verification by an officer'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-1">Summary</p>
                      <p className="text-gray-800">{result.summary}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-1">Detailed Analysis</p>
                      <p className="text-gray-700 text-sm leading-relaxed">{result.detailedAnalysis}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
