"use client"

import { useState } from 'react'
import { FileTextIcon, DownloadIcon, CalendarIcon, FilterIcon, Loader2Icon, CheckCircleIcon } from 'lucide-react'

interface ReportGeneratorProps {
  states: string[]
}

export default function ReportGenerator({ states }: ReportGeneratorProps) {
  const [reportType, setReportType] = useState<'summary' | 'detailed' | 'comparison'>('summary')
  const [format, setFormat] = useState<'pdf' | 'csv' | 'excel'>('csv')
  const [selectedState, setSelectedState] = useState('')
  const [dateRange, setDateRange] = useState({ start: '', end: '' })
  const [generating, setGenerating] = useState(false)
  const [generated, setGenerated] = useState(false)

  const handleGenerate = async () => {
    setGenerating(true)
    setGenerated(false)
    
    try {
      const params = new URLSearchParams({
        format,
        type: reportType,
        ...(selectedState && { state: selectedState }),
        ...(dateRange.start && { startDate: dateRange.start }),
        ...(dateRange.end && { endDate: dateRange.end })
      })

      const response = await fetch(`/api/reports/generate?${params}`)
      
      if (format === 'csv') {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `aadhaar-report-${new Date().toISOString().split('T')[0]}.csv`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        a.remove()
      } else {
        const data = await response.json()
        // For JSON/PDF, download as JSON for now
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `aadhaar-report-${new Date().toISOString().split('T')[0]}.json`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        a.remove()
      }
      
      setGenerated(true)
      setTimeout(() => setGenerated(false), 3000)
    } catch (error) {
      console.error('Report generation failed:', error)
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-6">
        <FileTextIcon className="w-5 h-5 text-orange-500" />
        Report Generator
      </h3>

      <div className="space-y-4">
        {/* Report Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { key: 'summary', label: 'Summary', desc: 'Quick overview' },
              { key: 'detailed', label: 'Detailed', desc: 'Full analysis' },
              { key: 'comparison', label: 'Comparison', desc: 'State-wise' }
            ].map(type => (
              <button
                key={type.key}
                onClick={() => setReportType(type.key as any)}
                className={`p-3 rounded-lg border-2 transition-all text-left ${
                  reportType === type.key 
                    ? 'border-orange-500 bg-orange-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <p className="font-medium text-sm text-gray-900">{type.label}</p>
                <p className="text-xs text-gray-500">{type.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Format Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Export Format</label>
          <div className="flex gap-2">
            {[
              { key: 'csv', label: 'CSV' },
              { key: 'excel', label: 'Excel' },
              { key: 'pdf', label: 'PDF' }
            ].map(f => (
              <button
                key={f.key}
                onClick={() => setFormat(f.key as any)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  format === f.key 
                    ? 'bg-orange-500 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FilterIcon className="w-4 h-4 inline mr-1" />
              State Filter
            </label>
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
            >
              <option value="">All States</option>
              {states.map(state => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <CalendarIcon className="w-4 h-4 inline mr-1" />
              Date Range
            </label>
            <div className="flex gap-2">
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
              />
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
              />
            </div>
          </div>
        </div>

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={generating}
          className={`w-full py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-all ${
            generated 
              ? 'bg-green-500 text-white'
              : 'bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700'
          } disabled:opacity-50`}
        >
          {generating ? (
            <>
              <Loader2Icon className="w-5 h-5 animate-spin" />
              Generating Report...
            </>
          ) : generated ? (
            <>
              <CheckCircleIcon className="w-5 h-5" />
              Report Downloaded!
            </>
          ) : (
            <>
              <DownloadIcon className="w-5 h-5" />
              Generate & Download Report
            </>
          )}
        </button>
      </div>
    </div>
  )
}
