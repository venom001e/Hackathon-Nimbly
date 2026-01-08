"use client"

import { useState, useEffect } from 'react'
import { 
  BellIcon, 
  RefreshCwIcon, 
  AlertTriangleIcon,
  CheckCircleIcon,
  ArrowLeftIcon
} from 'lucide-react'
import Link from 'next/link'
import AlertManager from '@/components/dashboard/AlertManager'
import AlertHistory from '@/components/dashboard/AlertHistory'

interface TriggeredAlert {
  id: string
  configName: string
  metric: string
  currentValue: number
  threshold: number
  severity: 'low' | 'medium' | 'high' | 'critical'
  message: string
  triggeredAt: string
  recommendations: string[]
}

export default function AlertsPage() {
  const [triggeredAlerts, setTriggeredAlerts] = useState<TriggeredAlert[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'live' | 'configure' | 'history'>('live')

  useEffect(() => {
    checkAlerts()
    // Auto-refresh every 30 seconds
    const interval = setInterval(checkAlerts, 30000)
    return () => clearInterval(interval)
  }, [])

  const checkAlerts = async () => {
    try {
      const res = await fetch('/api/alerts/check')
      if (res.ok) {
        const data = await res.json()
        setTriggeredAlerts(data.alerts || [])
      }
    } catch (error) {
      console.error('Error checking alerts:', error)
    } finally {
      setLoading(false)
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-50 border-red-200 text-red-800'
      case 'high': return 'bg-orange-50 border-orange-200 text-orange-800'
      case 'medium': return 'bg-yellow-50 border-yellow-200 text-yellow-800'
      default: return 'bg-blue-50 border-blue-200 text-blue-800'
    }
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
                  <BellIcon className="w-7 h-7 text-orange-500" />
                  Alert Management
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  Configure and monitor real-time alerts
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Tab Navigation */}
              <div className="flex bg-gray-100 p-1 rounded-lg">
                {[
                  { key: 'live', label: 'Live Alerts' },
                  { key: 'configure', label: 'Configure' },
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

              <button
                onClick={checkAlerts}
                disabled={loading}
                className="p-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 transition-colors"
              >
                <RefreshCwIcon className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6">
        {activeTab === 'live' && (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Total Alerts</p>
                    <p className="text-2xl font-bold text-gray-900">{triggeredAlerts.length}</p>
                  </div>
                  <div className="p-3 bg-orange-100 rounded-lg">
                    <BellIcon className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Critical</p>
                    <p className="text-2xl font-bold text-red-600">
                      {triggeredAlerts.filter(a => a.severity === 'critical').length}
                    </p>
                  </div>
                  <div className="p-3 bg-red-100 rounded-lg">
                    <AlertTriangleIcon className="w-6 h-6 text-red-600" />
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">High</p>
                    <p className="text-2xl font-bold text-orange-600">
                      {triggeredAlerts.filter(a => a.severity === 'high').length}
                    </p>
                  </div>
                  <div className="p-3 bg-orange-100 rounded-lg">
                    <AlertTriangleIcon className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <p className="text-2xl font-bold text-green-600">
                      {triggeredAlerts.length === 0 ? 'Normal' : 'Active'}
                    </p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-lg">
                    <CheckCircleIcon className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Live Alerts */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <AlertTriangleIcon className="w-5 h-5 text-orange-500" />
                Active Alerts
                {triggeredAlerts.length > 0 && (
                  <span className="ml-2 px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full">
                    {triggeredAlerts.length} active
                  </span>
                )}
              </h3>

              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-24 bg-gray-100 rounded-lg animate-pulse"></div>
                  ))}
                </div>
              ) : triggeredAlerts.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <p className="text-xl font-medium text-gray-900">All Systems Normal</p>
                  <p className="text-gray-500 mt-1">No alerts triggered at this time</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {triggeredAlerts.map(alert => (
                    <div 
                      key={alert.id}
                      className={`border rounded-xl p-5 ${getSeverityColor(alert.severity)}`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <AlertTriangleIcon className="w-5 h-5" />
                            <span className="font-semibold">{alert.configName}</span>
                            <span className="text-xs px-2 py-0.5 bg-white/50 rounded-full uppercase">
                              {alert.severity}
                            </span>
                          </div>
                          <p className="text-sm opacity-90">{alert.message}</p>
                        </div>
                        <span className="text-xs opacity-75">
                          {new Date(alert.triggeredAt).toLocaleTimeString()}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                        <div>
                          <span className="opacity-75">Current Value:</span>
                          <span className="ml-2 font-semibold">{alert.currentValue.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="opacity-75">Threshold:</span>
                          <span className="ml-2 font-semibold">{alert.threshold.toLocaleString()}</span>
                        </div>
                      </div>

                      {alert.recommendations.length > 0 && (
                        <div className="bg-white/30 rounded-lg p-3">
                          <p className="text-xs font-medium mb-2 opacity-75">Recommended Actions:</p>
                          <ul className="space-y-1">
                            {alert.recommendations.map((rec, i) => (
                              <li key={i} className="text-sm flex items-start gap-2">
                                <span>•</span>
                                {rec}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'configure' && (
          <AlertManager />
        )}

        {activeTab === 'history' && (
          <AlertHistory />
        )}
      </div>
    </div>
  )
}
