"use client"

import { useState, useEffect } from 'react'
import { 
  HistoryIcon, 
  CheckCircleIcon, 
  AlertTriangleIcon,
  ClockIcon,
  FilterIcon,
  RefreshCwIcon,
  EyeIcon
} from 'lucide-react'

interface AlertHistoryEntry {
  id: string
  alertName: string
  metric: string
  value: number
  threshold: number
  severity: 'low' | 'medium' | 'high' | 'critical'
  message: string
  state?: string
  triggeredAt: string
  acknowledgedAt?: string
  acknowledgedBy?: string
  resolvedAt?: string
  status: 'active' | 'acknowledged' | 'resolved'
}

export default function AlertHistory() {
  const [history, setHistory] = useState<AlertHistoryEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'active' | 'acknowledged' | 'resolved'>('all')
  const [selectedEntry, setSelectedEntry] = useState<AlertHistoryEntry | null>(null)

  useEffect(() => {
    loadHistory()
  }, [filter])

  const loadHistory = async () => {
    setLoading(true)
    try {
      const params = filter !== 'all' ? `?status=${filter}` : ''
      const res = await fetch(`/api/alerts/history${params}`)
      if (res.ok) {
        const data = await res.json()
        setHistory(data.history || [])
      }
    } catch (error) {
      console.error('Error loading history:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (id: string, action: 'acknowledge' | 'resolve') => {
    try {
      await fetch('/api/alerts/history', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action, user: 'admin@uidai.gov.in' })
      })
      loadHistory()
    } catch (error) {
      console.error('Error updating status:', error)
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-700'
      case 'high': return 'bg-orange-100 text-orange-700'
      case 'medium': return 'bg-yellow-100 text-yellow-700'
      default: return 'bg-blue-100 text-blue-700'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <AlertTriangleIcon className="w-4 h-4 text-red-500" />
      case 'acknowledged': return <ClockIcon className="w-4 h-4 text-yellow-500" />
      case 'resolved': return <CheckCircleIcon className="w-4 h-4 text-green-500" />
      default: return null
    }
  }

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    
    if (diff < 60000) return 'Just now'
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
    return date.toLocaleDateString()
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <HistoryIcon className="w-5 h-5 text-orange-500" />
          Alert History
        </h3>
        
        <div className="flex items-center gap-2">
          <div className="flex bg-gray-100 p-1 rounded-lg">
            {['all', 'active', 'acknowledged', 'resolved'].map(status => (
              <button
                key={status}
                onClick={() => setFilter(status as any)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all capitalize ${
                  filter === status 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
          <button
            onClick={loadHistory}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <RefreshCwIcon className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse"></div>
          ))}
        </div>
      ) : history.length === 0 ? (
        <div className="text-center py-12">
          <HistoryIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-600 font-medium">No alert history</p>
          <p className="text-sm text-gray-500">Alerts will appear here when triggered</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-[400px] overflow-y-auto">
          {history.map(entry => (
            <div 
              key={entry.id}
              className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                {getStatusIcon(entry.status)}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900 text-sm">{entry.alertName}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${getSeverityColor(entry.severity)}`}>
                      {entry.severity}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {entry.message}
                    {entry.state && <span className="ml-1">• {entry.state}</span>}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">{formatTime(entry.triggeredAt)}</span>
                
                {entry.status === 'active' && (
                  <button
                    onClick={() => updateStatus(entry.id, 'acknowledge')}
                    className="px-2 py-1 text-xs bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200 transition-colors"
                  >
                    Acknowledge
                  </button>
                )}
                
                {entry.status === 'acknowledged' && (
                  <button
                    onClick={() => updateStatus(entry.id, 'resolve')}
                    className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
                  >
                    Resolve
                  </button>
                )}

                <button
                  onClick={() => setSelectedEntry(entry)}
                  className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                >
                  <EyeIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {selectedEntry && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Alert Details</h3>
              <button 
                onClick={() => setSelectedEntry(null)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                {getStatusIcon(selectedEntry.status)}
                <span className="font-medium capitalize">{selectedEntry.status}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${getSeverityColor(selectedEntry.severity)}`}>
                  {selectedEntry.severity}
                </span>
              </div>

              <div>
                <p className="text-sm text-gray-500">Alert Name</p>
                <p className="font-medium">{selectedEntry.alertName}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Message</p>
                <p className="text-gray-700">{selectedEntry.message}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Value</p>
                  <p className="font-medium">{selectedEntry.value.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Threshold</p>
                  <p className="font-medium">{selectedEntry.threshold.toLocaleString()}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-500">Triggered At</p>
                <p className="text-gray-700">{new Date(selectedEntry.triggeredAt).toLocaleString()}</p>
              </div>

              {selectedEntry.acknowledgedAt && (
                <div>
                  <p className="text-sm text-gray-500">Acknowledged</p>
                  <p className="text-gray-700">
                    {new Date(selectedEntry.acknowledgedAt).toLocaleString()}
                    {selectedEntry.acknowledgedBy && ` by ${selectedEntry.acknowledgedBy}`}
                  </p>
                </div>
              )}

              {selectedEntry.resolvedAt && (
                <div>
                  <p className="text-sm text-gray-500">Resolved At</p>
                  <p className="text-gray-700">{new Date(selectedEntry.resolvedAt).toLocaleString()}</p>
                </div>
              )}
            </div>

            <button
              onClick={() => setSelectedEntry(null)}
              className="w-full mt-6 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
