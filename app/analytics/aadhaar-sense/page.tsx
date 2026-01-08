"use client"

import { useState, useEffect, useRef } from 'react'
import { Chart, registerables } from 'chart.js'
import { 
  BrainCircuitIcon, 
  AlertTriangleIcon,
  ShieldAlertIcon,
  TrendingUpIcon,
  MapPinIcon,
  BellRingIcon,
  ZapIcon,
  TargetIcon,
  RefreshCwIcon,
  ChevronRightIcon,
  CheckCircleIcon,
  ClockIcon,
  UsersIcon,
  TruckIcon,
  MessageSquareIcon
} from 'lucide-react'
import Link from 'next/link'

Chart.register(...registerables)

interface AnomalyAlert {
  id: string
  type: 'fraud' | 'duplicate' | 'bottleneck' | 'coverage_gap' | 'unusual_pattern'
  severity: 'critical' | 'high' | 'medium' | 'low'
  title: string
  description: string
  location: { state: string; district: string }
  detectedAt: string
  confidence: number
  affectedRecords: number
  status: 'active' | 'investigating' | 'resolved'
  suggestedActions: string[]
}

interface ResourceSuggestion {
  id: string
  type: 'mobile_camp' | 'staff_allocation' | 'equipment' | 'timing_change'
  location: { state: string; district: string; area?: string }
  impact: { coverageIncrease: number; enrolmentBoost: number }
  priority: 'urgent' | 'high' | 'medium'
  description: string
  estimatedCost: string
  implementationTime: string
}

interface CrisisZone {
  id: string
  state: string
  district: string
  riskLevel: number
  predictedIssue: string
  timeframe: string
  currentEnrolments: number
  expectedDemand: number
  gap: number
}

export default function AadhaarSensePage() {
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'anomalies' | 'predictions' | 'optimizer' | 'alerts'>('anomalies')
  const [anomalies, setAnomalies] = useState<AnomalyAlert[]>([])
  const [suggestions, setSuggestions] = useState<ResourceSuggestion[]>([])
  const [crisisZones, setCrisisZones] = useState<CrisisZone[]>([])
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all')
  const [alertsEnabled, setAlertsEnabled] = useState(true)
  
  const anomalyChartRef = useRef<HTMLCanvasElement>(null)
  const chartInstance = useRef<Chart | null>(null)

  useEffect(() => {
    loadAadhaarSenseData()
  }, [])

  useEffect(() => {
    if (anomalies.length > 0 && anomalyChartRef.current) {
      renderAnomalyChart()
    }
  }, [anomalies])

  const loadAadhaarSenseData = async () => {
    setLoading(true)
    try {
      const [anomalyRes, suggestRes, crisisRes] = await Promise.all([
        fetch('/api/aadhaar-sense/anomalies'),
        fetch('/api/aadhaar-sense/suggestions'),
        fetch('/api/aadhaar-sense/crisis-zones')
      ])

      if (anomalyRes.ok) {
        const data = await anomalyRes.json()
        console.log('Anomalies loaded:', data)
        setAnomalies(data.anomalies || [])
      }

      if (suggestRes.ok) {
        const data = await suggestRes.json()
        console.log('Suggestions loaded:', data)
        setSuggestions(data.suggestions || [])
      }

      if (crisisRes.ok) {
        const data = await crisisRes.json()
        console.log('Crisis zones loaded:', data)
        setCrisisZones(data.zones || [])
      }
    } catch (error) {
      console.error('Error loading AadhaarSense data:', error)
    } finally {
      setLoading(false)
    }
  }

  const renderAnomalyChart = () => {
    if (!anomalyChartRef.current) return
    if (chartInstance.current) chartInstance.current.destroy()

    const ctx = anomalyChartRef.current.getContext('2d')
    if (!ctx) return

    const typeCounts = {
      fraud: anomalies.filter(a => a.type === 'fraud').length,
      duplicate: anomalies.filter(a => a.type === 'duplicate').length,
      bottleneck: anomalies.filter(a => a.type === 'bottleneck').length,
      coverage_gap: anomalies.filter(a => a.type === 'coverage_gap').length,
      unusual_pattern: anomalies.filter(a => a.type === 'unusual_pattern').length
    }

    chartInstance.current = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Fraud', 'Duplicates', 'Bottleneck', 'Coverage Gap', 'Unusual Pattern'],
        datasets: [{
          data: Object.values(typeCounts),
          backgroundColor: ['#ef4444', '#f97316', '#eab308', '#3b82f6', '#8b5cf6'],
          borderWidth: 0, hoverOffset: 8
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom', labels: { padding: 15, usePointStyle: true } } },
        cutout: '65%'
      }
    })
  }

  const getSeverityColor = (severity: string) => {
    const colors: Record<string, string> = {
      critical: 'bg-red-100 text-red-700 border-red-200',
      high: 'bg-orange-100 text-orange-700 border-orange-200',
      medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      low: 'bg-green-100 text-green-700 border-green-200'
    }
    return colors[severity] || colors.medium
  }

  const getTypeIcon = (type: string) => {
    const icons: Record<string, React.ReactNode> = {
      fraud: <ShieldAlertIcon className="w-5 h-5" />,
      duplicate: <UsersIcon className="w-5 h-5" />,
      bottleneck: <ClockIcon className="w-5 h-5" />,
      coverage_gap: <MapPinIcon className="w-5 h-5" />,
      unusual_pattern: <ZapIcon className="w-5 h-5" />
    }
    return icons[type] || <AlertTriangleIcon className="w-5 h-5" />
  }

  const filteredAnomalies = selectedSeverity === 'all' ? anomalies : anomalies.filter(a => a.severity === selectedSeverity)
  const criticalCount = anomalies.filter(a => a.severity === 'critical').length
  const activeCount = anomalies.filter(a => a.status === 'active').length

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50/30 to-gray-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link href="/analytics" className="hover:text-orange-600">Dashboard</Link>
          <ChevronRightIcon className="w-4 h-4" />
          <span className="text-gray-900 font-medium">AadhaarSense</span>
        </div>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl">
                <BrainCircuitIcon className="w-6 h-6 text-white" />
              </div>
              AadhaarSense
              <span className="text-xs font-normal px-2 py-1 bg-orange-100 text-orange-600 rounded-full">AI-Powered</span>
            </h1>
            <p className="text-gray-600 mt-1">Smart Anomaly Detection & Predictive Crisis Management</p>
          </div>
          
          <div className="flex items-center gap-3 mt-4 md:mt-0">
            <button
              onClick={() => setAlertsEnabled(!alertsEnabled)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all text-sm font-medium ${
                alertsEnabled ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-gray-100 text-gray-600'
              }`}
            >
              <BellRingIcon className="w-4 h-4" />
              {alertsEnabled ? 'Alerts ON' : 'Alerts OFF'}
            </button>
            <button
              onClick={loadAadhaarSenseData}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 transition-colors text-sm font-medium"
            >
              <RefreshCwIcon className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">Critical Alerts</p>
                <p className="text-2xl font-bold text-red-600 mt-1">{criticalCount}</p>
              </div>
              <div className="p-3 bg-red-100 rounded-lg">
                <AlertTriangleIcon className="w-5 h-5 text-red-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">Active Issues</p>
                <p className="text-2xl font-bold text-orange-600 mt-1">{activeCount}</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-lg">
                <ZapIcon className="w-5 h-5 text-orange-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">AI Suggestions</p>
                <p className="text-2xl font-bold text-blue-600 mt-1">{suggestions.length}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <TargetIcon className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">Crisis Zones</p>
                <p className="text-2xl font-bold text-purple-600 mt-1">{crisisZones.filter(z => z.riskLevel > 70).length}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <MapPinIcon className="w-5 h-5 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex bg-gray-100 p-1 rounded-lg mb-6 overflow-x-auto">
          {[
            { key: 'anomalies', label: 'Anomaly Detection', icon: ShieldAlertIcon },
            { key: 'predictions', label: 'Crisis Predictions', icon: TrendingUpIcon },
            { key: 'optimizer', label: 'Resource Optimizer', icon: TargetIcon },
            { key: 'alerts', label: 'Alert Center', icon: BellRingIcon }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-md transition-all whitespace-nowrap ${
                activeTab === tab.key 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Anomaly Detection Tab */}
        {activeTab === 'anomalies' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Detected Anomalies</h2>
                <select
                  value={selectedSeverity}
                  onChange={(e) => setSelectedSeverity(e.target.value)}
                  className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500"
                >
                  <option value="all">All Severities</option>
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>

              {loading ? (
                <div className="space-y-4">
                  {[1,2,3].map(i => (
                    <div key={i} className="bg-white rounded-xl p-6 animate-pulse border border-gray-100">
                      <div className="h-4 bg-gray-200 rounded w-1/3 mb-3"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredAnomalies.map(anomaly => (
                    <div 
                      key={anomaly.id}
                      className={`bg-white rounded-xl p-5 border shadow-sm transition-all hover:shadow-md ${
                        anomaly.severity === 'critical' ? 'border-red-200' : 'border-gray-100'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${
                            anomaly.severity === 'critical' ? 'bg-red-100 text-red-600' :
                            anomaly.severity === 'high' ? 'bg-orange-100 text-orange-600' :
                            anomaly.severity === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                            'bg-green-100 text-green-600'
                          }`}>
                            {getTypeIcon(anomaly.type)}
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{anomaly.title}</h3>
                            <p className="text-sm text-gray-500">{anomaly.location.district}, {anomaly.location.state}</p>
                          </div>
                        </div>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getSeverityColor(anomaly.severity)}`}>
                          {anomaly.severity.toUpperCase()}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-4">{anomaly.description}</p>
                      
                      <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 mb-4">
                        <span className="flex items-center gap-1"><TargetIcon className="w-3 h-3" />{anomaly.confidence}% confidence</span>
                        <span className="flex items-center gap-1"><UsersIcon className="w-3 h-3" />{anomaly.affectedRecords.toLocaleString()} records</span>
                        <span className="flex items-center gap-1"><ClockIcon className="w-3 h-3" />{new Date(anomaly.detectedAt).toLocaleString('en-IN')}</span>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {anomaly.suggestedActions.slice(0, 2).map((action, i) => (
                          <button key={i} className="px-3 py-1.5 bg-orange-50 text-orange-600 text-xs rounded-lg hover:bg-orange-100 transition-colors">
                            {action}
                          </button>
                        ))}
                        {anomaly.status === 'active' && (
                          <button className="px-3 py-1.5 bg-green-50 text-green-600 text-xs rounded-lg hover:bg-green-100 transition-colors flex items-center gap-1">
                            <CheckCircleIcon className="w-3 h-3" /> Mark Resolved
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Anomaly Stats Sidebar */}
            <div className="space-y-6">
              <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Anomaly Distribution</h3>
                <div className="h-[200px]">
                  <canvas ref={anomalyChartRef}></canvas>
                </div>
              </div>

              <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white">
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <BrainCircuitIcon className="w-5 h-5" />
                  AI Model Status
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-orange-100">Model Accuracy</span>
                    <span className="font-medium">94.7%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-orange-100">Last Training</span>
                    <span>2 hours ago</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-orange-100">Data Points</span>
                    <span>1.2M records</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-orange-100">False Positive Rate</span>
                    <span>3.2%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Crisis Predictions Tab */}
        {activeTab === 'predictions' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <MapPinIcon className="w-5 h-5 text-orange-500" />
                Interactive Crisis Map
              </h2>
              
              {/* Crisis Zone Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                {crisisZones.map(zone => (
                  <div 
                    key={zone.id}
                    className={`p-4 rounded-xl border-2 transition-all cursor-pointer hover:scale-105 ${
                      zone.riskLevel > 80 ? 'bg-red-50 border-red-200' :
                      zone.riskLevel > 60 ? 'bg-orange-50 border-orange-200' :
                      'bg-yellow-50 border-yellow-200'
                    }`}
                  >
                    <div className="text-center">
                      <p className={`text-2xl font-bold ${
                        zone.riskLevel > 80 ? 'text-red-600' :
                        zone.riskLevel > 60 ? 'text-orange-600' : 'text-yellow-600'
                      }`}>{zone.riskLevel}%</p>
                      <p className="text-sm text-gray-900 font-medium mt-1">{zone.district}</p>
                      <p className="text-xs text-gray-500">{zone.state}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Crisis Details Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Location</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Risk</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Issue</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Timeframe</th>
                      <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase">Gap</th>
                    </tr>
                  </thead>
                  <tbody>
                    {crisisZones.map(zone => (
                      <tr key={zone.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <p className="font-medium text-gray-900">{zone.district}</p>
                          <p className="text-xs text-gray-500">{zone.state}</p>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div className={`h-2 rounded-full ${
                                zone.riskLevel > 80 ? 'bg-red-500' : zone.riskLevel > 60 ? 'bg-orange-500' : 'bg-yellow-500'
                              }`} style={{ width: `${zone.riskLevel}%` }}></div>
                            </div>
                            <span className="text-sm text-gray-900">{zone.riskLevel}%</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">{zone.predictedIssue}</td>
                        <td className="py-3 px-4 text-sm text-gray-600">{zone.timeframe}</td>
                        <td className="py-3 px-4 text-right"><span className="text-red-600 font-medium">+{zone.gap.toLocaleString()}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Resource Optimizer Tab */}
        {activeTab === 'optimizer' && (
          <div className="space-y-6">
            {/* Header Banner */}
            <div className="bg-gradient-to-r from-orange-500 via-orange-600 to-amber-500 rounded-xl p-6 text-white mb-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2"></div>
              <div className="relative">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <BrainCircuitIcon className="w-6 h-6" />
                  </div>
                  <h2 className="text-xl font-bold">AI Resource Optimizer</h2>
                </div>
                <p className="text-orange-100 text-sm max-w-2xl">
                  Smart suggestions to maximize coverage and minimize wait times based on real-time data analysis. 
                  Our AI analyzes enrollment patterns, demographic data, and resource utilization to provide actionable recommendations.
                </p>
              </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Total Suggestions</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{suggestions.length}</p>
                  </div>
                  <div className="p-3 bg-orange-100 rounded-lg">
                    <TargetIcon className="w-5 h-5 text-orange-600" />
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Urgent Actions</p>
                    <p className="text-2xl font-bold text-red-600 mt-1">{suggestions.filter(s => s.priority === 'urgent').length}</p>
                  </div>
                  <div className="p-3 bg-red-100 rounded-lg">
                    <AlertTriangleIcon className="w-5 h-5 text-red-600" />
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Potential Enrolments</p>
                    <p className="text-2xl font-bold text-green-600 mt-1">
                      +{suggestions.reduce((sum, s) => sum + s.impact.enrolmentBoost, 0).toLocaleString()}
                    </p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-lg">
                    <TrendingUpIcon className="w-5 h-5 text-green-600" />
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Avg Coverage Boost</p>
                    <p className="text-2xl font-bold text-blue-600 mt-1">
                      +{suggestions.length > 0 ? Math.round(suggestions.reduce((sum, s) => sum + s.impact.coverageIncrease, 0) / suggestions.length) : 0}%
                    </p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <MapPinIcon className="w-5 h-5 text-blue-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-gray-500 mr-2">Filter by type:</span>
              {['all', 'mobile_camp', 'staff_allocation', 'timing_change', 'equipment'].map(type => (
                <button
                  key={type}
                  className={`px-3 py-1.5 text-sm rounded-lg transition-all ${
                    type === 'all' 
                      ? 'bg-orange-500 text-white' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {type === 'all' ? 'All' : type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </button>
              ))}
            </div>

            {/* Suggestions Grid */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="bg-white rounded-xl p-6 border border-gray-100 animate-pulse">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                      <div className="flex-1">
                        <div className="h-3 bg-gray-200 rounded w-20 mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-40"></div>
                      </div>
                    </div>
                    <div className="h-12 bg-gray-200 rounded mb-4"></div>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="h-16 bg-gray-200 rounded"></div>
                      <div className="h-16 bg-gray-200 rounded"></div>
                    </div>
                    <div className="h-10 bg-gray-200 rounded"></div>
                  </div>
                ))}
              </div>
            ) : suggestions.length === 0 ? (
              <div className="bg-white rounded-xl p-12 border border-gray-100 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <TargetIcon className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Suggestions Available</h3>
                <p className="text-gray-500 mb-4">AI is analyzing your data. Check back soon for optimization recommendations.</p>
                <button
                  onClick={loadAadhaarSenseData}
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                >
                  Refresh Data
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {suggestions.map(suggestion => (
                  <div key={suggestion.id} className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-lg transition-all group">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-2.5 rounded-xl transition-transform group-hover:scale-110 ${
                          suggestion.type === 'mobile_camp' ? 'bg-green-100 text-green-600' :
                          suggestion.type === 'staff_allocation' ? 'bg-blue-100 text-blue-600' :
                          suggestion.type === 'equipment' ? 'bg-purple-100 text-purple-600' :
                          'bg-orange-100 text-orange-600'
                        }`}>
                          {suggestion.type === 'mobile_camp' ? <TruckIcon className="w-5 h-5" /> :
                           suggestion.type === 'staff_allocation' ? <UsersIcon className="w-5 h-5" /> :
                           suggestion.type === 'equipment' ? <TargetIcon className="w-5 h-5" /> :
                           <ClockIcon className="w-5 h-5" />}
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 uppercase font-medium tracking-wider">{suggestion.type.replace(/_/g, ' ')}</p>
                          <p className="font-semibold text-gray-900">{suggestion.location.district}, {suggestion.location.state}</p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                        suggestion.priority === 'urgent' ? 'bg-red-100 text-red-600 animate-pulse' :
                        suggestion.priority === 'high' ? 'bg-orange-100 text-orange-600' :
                        'bg-blue-100 text-blue-600'
                      }`}>
                        {suggestion.priority.toUpperCase()}
                      </span>
                    </div>

                    <p className="text-sm text-gray-600 mb-4 leading-relaxed">{suggestion.description}</p>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 text-center border border-green-100">
                        <p className="text-3xl font-bold text-green-600">+{suggestion.impact.coverageIncrease}%</p>
                        <p className="text-xs text-gray-600 mt-1">Coverage Increase</p>
                      </div>
                      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 text-center border border-blue-100">
                        <p className="text-3xl font-bold text-blue-600">+{suggestion.impact.enrolmentBoost.toLocaleString()}</p>
                        <p className="text-xs text-gray-600 mt-1">New Enrolments</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4 p-3 bg-gray-50 rounded-lg">
                      <span className="flex items-center gap-1">
                        <span className="text-gray-400">💰</span>
                        <span className="text-gray-900 font-medium">{suggestion.estimatedCost}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="text-gray-400">⏱️</span>
                        <span className="text-gray-900 font-medium">{suggestion.implementationTime}</span>
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <button className="flex-1 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-lg font-semibold hover:from-orange-600 hover:to-amber-600 transition-all shadow-md shadow-orange-500/20 flex items-center justify-center gap-2">
                        <CheckCircleIcon className="w-4 h-4" />
                        Implement
                      </button>
                      <button className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-all">
                        Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* AI Insights Panel */}
            <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-xl p-6 text-white">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-orange-500/20 rounded-lg">
                  <BrainCircuitIcon className="w-6 h-6 text-orange-400" />
                </div>
                <div>
                  <h3 className="font-semibold">AI Optimization Insights</h3>
                  <p className="text-sm text-gray-400">Based on analysis of 1M+ enrollment records</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <p className="text-2xl font-bold text-green-400">94.7%</p>
                  <p className="text-sm text-gray-400">Model Accuracy</p>
                </div>
                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <p className="text-2xl font-bold text-blue-400">₹2.3 Cr</p>
                  <p className="text-sm text-gray-400">Potential Savings</p>
                </div>
                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <p className="text-2xl font-bold text-purple-400">45%</p>
                  <p className="text-sm text-gray-400">Wait Time Reduction</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Alert Center Tab */}
        {activeTab === 'alerts' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                  <BellRingIcon className="w-5 h-5 text-orange-500" />
                  Alert Configuration
                </h2>

                <div className="space-y-4">
                  {[
                    { label: 'Critical Fraud Alerts', desc: 'Immediate notification for fraud detection', enabled: true },
                    { label: 'Bottleneck Predictions', desc: 'Alert 7 days before predicted surge', enabled: true },
                    { label: 'Coverage Gap Alerts', desc: 'Weekly report on underserved areas', enabled: true },
                    { label: 'Equipment Failure Risk', desc: 'Predictive maintenance alerts', enabled: false },
                    { label: 'Daily Summary Digest', desc: 'End of day summary via email', enabled: true }
                  ].map((alert, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{alert.label}</p>
                        <p className="text-sm text-gray-500">{alert.desc}</p>
                      </div>
                      <button className={`relative w-12 h-6 rounded-full transition-colors ${alert.enabled ? 'bg-green-500' : 'bg-gray-300'}`}>
                        <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${alert.enabled ? 'left-7' : 'left-1'}`}></span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Notification Channels</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { icon: MessageSquareIcon, label: 'WhatsApp', status: 'Connected', color: 'green' },
                    { icon: BellRingIcon, label: 'SMS', status: 'Connected', color: 'green' },
                    { icon: MessageSquareIcon, label: 'Email', status: 'Connected', color: 'green' },
                    { icon: BellRingIcon, label: 'Push', status: 'Setup Required', color: 'yellow' }
                  ].map((channel, i) => (
                    <div key={i} className="p-4 bg-gray-50 rounded-lg text-center">
                      <channel.icon className={`w-8 h-8 mx-auto mb-2 ${channel.color === 'green' ? 'text-green-500' : 'text-yellow-500'}`} />
                      <p className="font-medium text-gray-900">{channel.label}</p>
                      <p className={`text-xs ${channel.color === 'green' ? 'text-green-600' : 'text-yellow-600'}`}>{channel.status}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Alerts Sent</h2>
              <div className="space-y-3">
                {[
                  { type: 'WhatsApp', message: 'Critical: Fraud detected in Mumbai', time: '2 min ago' },
                  { type: 'SMS', message: 'Bottleneck alert: Lucknow surge', time: '1 hour ago' },
                  { type: 'Email', message: 'Daily digest: 5 new anomalies', time: '6 hours ago' },
                  { type: 'WhatsApp', message: 'Coverage gap: Jaisalmer', time: '12 hours ago' }
                ].map((alert, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <CheckCircleIcon className="w-4 h-4 text-green-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900 truncate">{alert.message}</p>
                      <p className="text-xs text-gray-500">{alert.type} • {alert.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
