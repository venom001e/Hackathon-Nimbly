"use client"

import { useState, useEffect } from 'react'
import { 
  FileTextIcon, 
  DownloadIcon, 
  ArrowLeftIcon,
  ClockIcon,
  PlusIcon,
  TrashIcon,
  EyeIcon
} from 'lucide-react'
import Link from 'next/link'
import ReportGenerator from '@/components/dashboard/ReportGenerator'

interface ScheduledReport {
  id: string
  name: string
  type: 'summary' | 'detailed' | 'comparison'
  frequency: 'daily' | 'weekly' | 'monthly'
  format: 'csv' | 'pdf' | 'excel'
  state?: string
  lastRun?: string
  nextRun: string
  enabled: boolean
}

interface GeneratedReport {
  id: string
  name: string
  type: string
  generatedAt: string
  size: string
  format: string
}

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState<'generate' | 'scheduled' | 'history'>('generate')
  const [statesList, setStatesList] = useState<string[]>([])
  const [scheduledReports, setScheduledReports] = useState<ScheduledReport[]>([
    {
      id: 'sched-1',
      name: 'Weekly Summary Report',
      type: 'summary',
      frequency: 'weekly',
      format: 'csv',
      lastRun: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      nextRun: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      enabled: true
    },
    {
      id: 'sched-2',
      name: 'Monthly State Comparison',
      type: 'comparison',
      frequency: 'monthly',
      format: 'pdf',
      lastRun: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      nextRun: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      enabled: true
    }
  ])
  const [reportHistory, setReportHistory] = useState<GeneratedReport[]>([
    {
      id: 'rep-1',
      name: 'Summary Report - Jan 2026',
      type: 'summary',
      generatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      size: '2.4 MB',
      format: 'csv'
    },
    {
      id: 'rep-2',
      name: 'Detailed Analysis - Maharashtra',
      type: 'detailed',
      generatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      size: '5.1 MB',
      format: 'csv'
    },
    {
      id: 'rep-3',
      name: 'State Comparison Report',
      type: 'comparison',
      generatedAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
      size: '3.8 MB',
      format: 'pdf'
    }
  ])

  useEffect(() => {
    loadStates()
  }, [])

  const loadStates = async () => {
    try {
      const res = await fetch('/api/analytics/states')
      if (res.ok) {
        const data = await res.json()
        setStatesList(data.states?.map((s: any) => s.state) || [])
      }
    } catch (error) {
      console.error('Error loading states:', error)
    }
  }

  const toggleScheduledReport = (id: string) => {
    setScheduledReports(prev => prev.map(r => 
      r.id === id ? { ...r, enabled: !r.enabled } : r
    ))
  }

  const deleteScheduledReport = (id: string) => {
    if (confirm('Are you sure you want to delete this scheduled report?')) {
      setScheduledReports(prev => prev.filter(r => r.id !== id))
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getFrequencyBadge = (frequency: string) => {
    const colors = {
      daily: 'bg-blue-100 text-blue-700',
      weekly: 'bg-green-100 text-green-700',
      monthly: 'bg-purple-100 text-purple-700'
    }
    return colors[frequency as keyof typeof colors] || 'bg-gray-100 text-gray-700'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50/30 to-gray-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-lg border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4">
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
                  <FileTextIcon className="w-7 h-7 text-orange-500" />
                  Reports Center
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  Generate, schedule, and manage analytics reports
                </p>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex bg-gray-100 p-1 rounded-lg">
              {[
                { key: 'generate', label: 'Generate' },
                { key: 'scheduled', label: 'Scheduled' },
                { key: 'history', label: 'History' }
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                    activeTab === tab.key 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6">
        {activeTab === 'generate' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ReportGenerator states={statesList} />
            
            {/* Quick Stats */}
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Report Statistics</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-orange-50 rounded-lg">
                    <p className="text-2xl font-bold text-orange-600">{reportHistory.length}</p>
                    <p className="text-sm text-gray-600">Reports Generated</p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">{scheduledReports.filter(r => r.enabled).length}</p>
                    <p className="text-sm text-gray-600">Active Schedules</p>
                  </div>
                </div>
              </div>

              {/* Recent Reports */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Reports</h3>
                <div className="space-y-3">
                  {reportHistory.slice(0, 3).map(report => (
                    <div key={report.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileTextIcon className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-900 text-sm">{report.name}</p>
                          <p className="text-xs text-gray-500">{formatDate(report.generatedAt)}</p>
                        </div>
                      </div>
                      <button className="p-2 text-orange-500 hover:bg-orange-50 rounded-lg transition-colors">
                        <DownloadIcon className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'scheduled' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <ClockIcon className="w-5 h-5 text-orange-500" />
                Scheduled Reports
              </h3>
              <button className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm font-medium">
                <PlusIcon className="w-4 h-4" />
                New Schedule
              </button>
            </div>

            {scheduledReports.length === 0 ? (
              <div className="text-center py-12">
                <ClockIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-600 font-medium">No scheduled reports</p>
                <p className="text-sm text-gray-500">Create a schedule to automate report generation</p>
              </div>
            ) : (
              <div className="space-y-4">
                {scheduledReports.map(report => (
                  <div 
                    key={report.id}
                    className={`border rounded-lg p-4 transition-all ${
                      report.enabled ? 'bg-white' : 'bg-gray-50 opacity-60'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-medium text-gray-900">{report.name}</h4>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${getFrequencyBadge(report.frequency)}`}>
                            {report.frequency}
                          </span>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 uppercase">
                            {report.format}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          {report.lastRun && (
                            <span>Last run: {formatDate(report.lastRun)}</span>
                          )}
                          <span>Next run: {formatDate(report.nextRun)}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleScheduledReport(report.id)}
                          className={`relative w-12 h-6 rounded-full transition-colors ${
                            report.enabled ? 'bg-green-500' : 'bg-gray-300'
                          }`}
                        >
                          <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                            report.enabled ? 'left-7' : 'left-1'
                          }`}></span>
                        </button>
                        <button
                          onClick={() => deleteScheduledReport(report.id)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'history' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <FileTextIcon className="w-5 h-5 text-orange-500" />
                Report History
              </h3>
              <div className="flex items-center gap-2">
                <select className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent">
                  <option value="">All Types</option>
                  <option value="summary">Summary</option>
                  <option value="detailed">Detailed</option>
                  <option value="comparison">Comparison</option>
                </select>
              </div>
            </div>

            {reportHistory.length === 0 ? (
              <div className="text-center py-12">
                <FileTextIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-600 font-medium">No reports generated yet</p>
                <p className="text-sm text-gray-500">Generate your first report to see it here</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Report Name</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Type</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Generated</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Size</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Format</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportHistory.map(report => (
                      <tr key={report.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <FileTextIcon className="w-4 h-4 text-gray-400" />
                            <span className="font-medium text-gray-900">{report.name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm text-gray-600 capitalize">{report.type}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm text-gray-600">{formatDate(report.generatedAt)}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm text-gray-600">{report.size}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded uppercase">
                            {report.format}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                              <EyeIcon className="w-4 h-4" />
                            </button>
                            <button className="p-2 text-orange-500 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors">
                              <DownloadIcon className="w-4 h-4" />
                            </button>
                            <button className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
