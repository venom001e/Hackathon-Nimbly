'use client'

import { useEffect, useState } from 'react'
import { Activity, Zap, Database, Clock } from 'lucide-react'

interface PerformanceMetrics {
  responseTime: number
  cacheHitRate: number
  memoryUsage: number
  activeConnections: number
  lastUpdated: number
}

export default function PerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Only show in development
    if (process.env.NODE_ENV !== 'development') return

    const fetchMetrics = async () => {
      try {
        const response = await fetch('/api/performance/metrics')
        if (response.ok) {
          const data = await response.json()
          setMetrics(data)
        }
      } catch (error) {
        console.warn('Performance metrics unavailable:', error)
      }
    }

    fetchMetrics()
    const interval = setInterval(fetchMetrics, 5000) // Update every 5 seconds

    return () => clearInterval(interval)
  }, [])

  if (process.env.NODE_ENV !== 'development' || !metrics) return null

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="bg-blue-600 text-white p-2 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
        title="Performance Monitor"
      >
        <Activity className="w-5 h-5" />
      </button>

      {isVisible && (
        <div className="absolute bottom-12 right-0 bg-white border border-gray-200 rounded-lg shadow-xl p-4 w-80">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900">Performance Monitor</h3>
            <button
              onClick={() => setIsVisible(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-blue-500" />
                <span className="text-sm text-gray-600">Response Time</span>
              </div>
              <span className={`text-sm font-medium ${
                metrics.responseTime < 100 ? 'text-green-600' :
                metrics.responseTime < 500 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {metrics.responseTime}ms
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Zap className="w-4 h-4 text-green-500" />
                <span className="text-sm text-gray-600">Cache Hit Rate</span>
              </div>
              <span className={`text-sm font-medium ${
                metrics.cacheHitRate > 80 ? 'text-green-600' :
                metrics.cacheHitRate > 60 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {metrics.cacheHitRate}%
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Database className="w-4 h-4 text-purple-500" />
                <span className="text-sm text-gray-600">Memory Usage</span>
              </div>
              <span className={`text-sm font-medium ${
                metrics.memoryUsage < 70 ? 'text-green-600' :
                metrics.memoryUsage < 85 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {metrics.memoryUsage}%
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Activity className="w-4 h-4 text-orange-500" />
                <span className="text-sm text-gray-600">Active Connections</span>
              </div>
              <span className="text-sm font-medium text-gray-900">
                {metrics.activeConnections}
              </span>
            </div>

            <div className="pt-2 border-t border-gray-100">
              <div className="text-xs text-gray-500">
                Last updated: {new Date(metrics.lastUpdated).toLocaleTimeString()}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}