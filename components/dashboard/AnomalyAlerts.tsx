"use client"

import { useState, useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { AlertTriangleIcon, BellIcon, CheckCircleIcon, XCircleIcon, ChevronDownIcon, MapPinIcon, CalendarIcon } from 'lucide-react'
import { Anomaly } from '@/types'
import { ShimmerSkeleton } from '@/components/ui/loading-animations'

interface AnomalyAlertsProps {
  anomalies: Anomaly[]
  loading: boolean
}

export default function AnomalyAlerts({ anomalies, loading }: AnomalyAlertsProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all')
  const containerRef = useRef<HTMLDivElement>(null)
  const alertsRef = useRef<(HTMLDivElement | null)[]>([])

  const filteredAnomalies = anomalies.filter(a => 
    filter === 'all' || a.severity === filter
  )

  // Animate alerts when they appear
  useEffect(() => {
    if (!loading && filteredAnomalies.length > 0) {
      alertsRef.current.forEach((alert, i) => {
        if (alert) {
          gsap.fromTo(alert,
            { opacity: 0, x: -20 },
            { opacity: 1, x: 0, duration: 0.4, delay: i * 0.08, ease: "power2.out" }
          )
        }
      })
    }
  }, [loading, filteredAnomalies.length, filter])

  const getSeverityStyles = (severity: string) => {
    switch (severity) {
      case 'high':
        return {
          bg: 'bg-red-50 border-red-200',
          badge: 'bg-red-100 text-red-700',
          icon: 'text-red-500'
        }
      case 'medium':
        return {
          bg: 'bg-yellow-50 border-yellow-200',
          badge: 'bg-yellow-100 text-yellow-700',
          icon: 'text-yellow-500'
        }
      default:
        return {
          bg: 'bg-blue-50 border-blue-200',
          badge: 'bg-blue-100 text-blue-700',
          icon: 'text-blue-500'
        }
    }
  }

  const highCount = anomalies.filter(a => a.severity === 'high').length
  const mediumCount = anomalies.filter(a => a.severity === 'medium').length
  const lowCount = anomalies.filter(a => a.severity === 'low').length

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <BellIcon className="w-5 h-5 text-orange-500" />
          Anomaly Alerts
        </h3>
        
        {/* Filter Tabs */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
          {[
            { key: 'all', label: 'All', count: anomalies.length },
            { key: 'high', label: 'High', count: highCount },
            { key: 'medium', label: 'Medium', count: mediumCount },
            { key: 'low', label: 'Low', count: lowCount }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key as any)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                filter === tab.key 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="rounded-lg p-4 border border-gray-100">
              <div className="flex items-start gap-3">
                <ShimmerSkeleton className="w-5 h-5 rounded" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <ShimmerSkeleton className="w-16 h-5 rounded-full" />
                    <ShimmerSkeleton className="w-24 h-4" />
                  </div>
                  <ShimmerSkeleton className="w-full h-4 mb-2" />
                  <ShimmerSkeleton className="w-32 h-3" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredAnomalies.length === 0 ? (
        <div className="text-center py-12">
          <CheckCircleIcon className="w-12 h-12 text-green-500 mx-auto mb-3 animate-bounce" />
          <p className="text-gray-600 font-medium">No anomalies detected</p>
          <p className="text-sm text-gray-500">All systems operating normally</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
          {filteredAnomalies.map((anomaly, index) => {
            const styles = getSeverityStyles(anomaly.severity)
            const isExpanded = expandedId === anomaly.id
            
            return (
              <div 
                key={anomaly.id || index}
                ref={el => { alertsRef.current[index] = el }}
                className={`border rounded-lg p-4 transition-all hover:shadow-md cursor-pointer ${styles.bg}`}
                style={{ opacity: 0 }}
              >
                <div 
                  className="flex items-start justify-between cursor-pointer"
                  onClick={() => setExpandedId(isExpanded ? null : anomaly.id)}
                >
                  <div className="flex items-start gap-3">
                    <AlertTriangleIcon className={`w-5 h-5 mt-0.5 ${styles.icon}`} />
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${styles.badge}`}>
                          {anomaly.severity.toUpperCase()}
                        </span>
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <CalendarIcon className="w-3 h-3" />
                          {new Date(anomaly.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-800 font-medium">{anomaly.description}</p>
                      <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                        <MapPinIcon className="w-3 h-3" />
                        {anomaly.affected_regions?.join(', ') || 'Multiple regions'}
                      </div>
                    </div>
                  </div>
                  <ChevronDownIcon className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                </div>

                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Confidence Score</p>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-orange-500 h-2 rounded-full" 
                              style={{ width: `${(anomaly.confidence_score || 0) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium">
                            {((anomaly.confidence_score || 0) * 100).toFixed(0)}%
                          </span>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Type</p>
                        <p className="text-sm font-medium capitalize">{anomaly.anomaly_type || 'Data Anomaly'}</p>
                      </div>
                    </div>
                    
                    {anomaly.suggested_actions && anomaly.suggested_actions.length > 0 && (
                      <div>
                        <p className="text-xs text-gray-500 mb-2">Suggested Actions</p>
                        <ul className="space-y-1">
                          {anomaly.suggested_actions.map((action, i) => (
                            <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                              <span className="text-orange-500">•</span>
                              {action}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
