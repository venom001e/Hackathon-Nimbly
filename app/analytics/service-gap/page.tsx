"use client"

import { useState, useEffect } from 'react'
import { 
  MapPinIcon, AlertTriangleIcon, CheckCircleIcon, TrendingUpIcon,
  ChevronRightIcon, RefreshCwIcon, FilterIcon, DownloadIcon,
  UsersIcon, BuildingIcon, CarIcon, ClockIcon, TargetIcon,
  ZapIcon, MapIcon, LayersIcon, NavigationIcon, AlertCircleIcon,
  SearchIcon, TruckIcon, SignalIcon, RouteIcon, SparklesIcon,
  Loader2Icon, XCircleIcon, CheckIcon, InfoIcon, ArrowRightIcon
} from 'lucide-react'
import Link from 'next/link'

interface PinCodeData {
  pinCode: string
  district: string
  state: string
  population: number
  nearestCenterDistance: number
  enrolmentRate: number
  accessibilityScore: number
  vulnerablePopulation: number
  failedAttempts: number
  gapScore: number
  severity: 'critical' | 'high' | 'moderate' | 'low'
  isRural: boolean
  isTribal: boolean
  isHilly: boolean
  centersInArea: number
  estimatedImpact: number
}

interface StateStats {
  state: string
  totalPinCodes: number
  criticalGaps: number
  highGaps: number
  moderateGaps: number
  lowGaps: number
  avgDistance: number
  avgEnrolmentRate: number
  avgAccessibility: number
  underservedPopulation: number
  totalPopulation: number
  ruralAreas: number
  tribalAreas: number
}

interface TotalStats {
  totalPinCodes: number
  criticalAreas: number
  highAreas: number
  moderateAreas: number
  lowAreas: number
  totalUnderserved: number
  totalPopulation: number
  avgGapScore: number
  avgDistance: number
  avgEnrolmentRate: number
}

interface Recommendation {
  pinCode: string
  district: string
  state: string
  action: string
  actionType: string
  estimatedCost: number
  expectedImpact: number
  timeline: string
  priority: number
  details: string
}

interface AIRecommendations {
  recommendations: Recommendation[]
  strategySummary: string
  quickWins: string[]
  mediumTermActions: string[]
  longTermNeeds: string[]
  totalEstimatedCost: number
  totalExpectedImpact: number
}

export default function ServiceGapPage() {
  const [pinCodeData, setPinCodeData] = useState<PinCodeData[]>([])
  const [stateStats, setStateStats] = useState<StateStats[]>([])
  const [totalStats, setTotalStats] = useState<TotalStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedState, setSelectedState] = useState<string>('all')
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'gapScore' | 'population' | 'distance'>('gapScore')
  const [activeTab, setActiveTab] = useState<'map' | 'list' | 'analysis' | 'recommendations'>('map')
  const [aiRecommendations, setAiRecommendations] = useState<AIRecommendations | null>(null)
  const [loadingRecommendations, setLoadingRecommendations] = useState(false)
  const [selectedPinCode, setSelectedPinCode] = useState<PinCodeData | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/service-gap/analyze')
      const result = await response.json()
      
      if (result.success) {
        setPinCodeData(result.data.pinCodes)
        setStateStats(result.data.stateStats)
        setTotalStats(result.data.totalStats)
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchAIRecommendations = async () => {
    setLoadingRecommendations(true)
    try {
      const criticalPinCodes = pinCodeData.filter(p => p.severity === 'critical' || p.severity === 'high').slice(0, 15)
      
      if (criticalPinCodes.length === 0) {
        // Use all data if no critical/high areas
        const allPinCodes = pinCodeData.slice(0, 15)
        const response = await fetch('/api/service-gap/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            pinCodes: allPinCodes,
            action: 'getRecommendations'
          })
        })
        const result = await response.json()
        if (result.success && result.recommendations) {
          setAiRecommendations(result.recommendations)
          setActiveTab('recommendations')
        }
      } else {
        const response = await fetch('/api/service-gap/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            pinCodes: criticalPinCodes,
            action: 'getRecommendations'
          })
        })
        
        const result = await response.json()
        console.log('AI Recommendations result:', result)
        
        if (result.success && result.recommendations) {
          setAiRecommendations(result.recommendations)
          setActiveTab('recommendations')
        } else {
          console.error('Invalid response:', result)
        }
      }
    } catch (error) {
      console.error('Failed to get recommendations:', error)
    } finally {
      setLoadingRecommendations(false)
    }
  }

  const filteredData = pinCodeData.filter(pc => {
    if (selectedState !== 'all' && pc.state !== selectedState) return false
    if (selectedSeverity !== 'all' && pc.severity !== selectedSeverity) return false
    if (searchQuery && !pc.pinCode.includes(searchQuery) && !pc.district.toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  }).sort((a, b) => {
    if (sortBy === 'gapScore') return b.gapScore - a.gapScore
    if (sortBy === 'population') return b.population - a.population
    return b.nearestCenterDistance - a.nearestCenterDistance
  })

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-700 border-red-200'
      case 'high': return 'bg-orange-100 text-orange-700 border-orange-200'
      case 'moderate': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      default: return 'bg-green-100 text-green-700 border-green-200'
    }
  }

  const getSeverityBg = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500'
      case 'high': return 'bg-orange-500'
      case 'moderate': return 'bg-yellow-500'
      default: return 'bg-green-500'
    }
  }

  const getActionTypeIcon = (type: string) => {
    switch (type) {
      case 'mobile_camp': return TruckIcon
      case 'new_center': return BuildingIcon
      case 'partnership': return UsersIcon
      case 'capacity_increase': return TrendingUpIcon
      default: return MapPinIcon
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50/30 to-slate-50 pt-20 flex items-center justify-center">
        <div className="text-center">
          <Loader2Icon className="w-12 h-12 text-orange-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Analyzing service gaps across India...</p>
          <p className="text-sm text-gray-400 mt-1">Processing PIN code data</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50/30 to-slate-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link href="/analytics" className="hover:text-orange-600 transition-colors">Dashboard</Link>
          <ChevronRightIcon className="w-4 h-4" />
          <span className="text-gray-900 font-medium">Service Gap Identifier</span>
        </div>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-4 mb-2">
              <div className="p-3 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl shadow-lg shadow-orange-500/25">
                <MapIcon className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Service Gap Identifier</h1>
                <p className="text-gray-600">AI-powered underserved area detection</p>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-4">
              <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full flex items-center gap-1">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                Live Data
              </span>
              <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full">
                {totalStats?.totalPinCodes || 0} PIN Codes
              </span>
              <span className="px-3 py-1 bg-purple-100 text-purple-700 text-sm font-medium rounded-full">
                {stateStats.length} States
              </span>
            </div>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={fetchData}
              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
            >
              <RefreshCwIcon className="w-4 h-4" />
              Refresh
            </button>
            <button
              onClick={fetchAIRecommendations}
              disabled={loadingRecommendations}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl hover:from-orange-600 hover:to-red-600 transition-all shadow-lg shadow-orange-500/25 disabled:opacity-50"
            >
              {loadingRecommendations ? (
                <Loader2Icon className="w-4 h-4 animate-spin" />
              ) : (
                <SparklesIcon className="w-4 h-4" />
              )}
              Get AI Recommendations
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        {totalStats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-red-100 rounded-xl">
                  <AlertTriangleIcon className="w-5 h-5 text-red-600" />
                </div>
                <span className="text-sm text-gray-500">Critical</span>
              </div>
              <p className="text-3xl font-bold text-red-600">{totalStats.criticalAreas}</p>
              <p className="text-xs text-gray-400 mt-1">Immediate action</p>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-orange-100 rounded-xl">
                  <AlertCircleIcon className="w-5 h-5 text-orange-600" />
                </div>
                <span className="text-sm text-gray-500">High Priority</span>
              </div>
              <p className="text-3xl font-bold text-orange-600">{totalStats.highAreas}</p>
              <p className="text-xs text-gray-400 mt-1">Within 3 months</p>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-blue-100 rounded-xl">
                  <UsersIcon className="w-5 h-5 text-blue-600" />
                </div>
                <span className="text-sm text-gray-500">Underserved</span>
              </div>
              <p className="text-3xl font-bold text-blue-600">{(totalStats.totalUnderserved / 100000).toFixed(1)}L</p>
              <p className="text-xs text-gray-400 mt-1">Citizens need access</p>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-purple-100 rounded-xl">
                  <NavigationIcon className="w-5 h-5 text-purple-600" />
                </div>
                <span className="text-sm text-gray-500">Avg Distance</span>
              </div>
              <p className="text-3xl font-bold text-purple-600">{totalStats.avgDistance} km</p>
              <p className="text-xs text-gray-400 mt-1">To nearest center</p>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-green-100 rounded-xl">
                  <TrendingUpIcon className="w-5 h-5 text-green-600" />
                </div>
                <span className="text-sm text-gray-500">Avg Enrolment</span>
              </div>
              <p className="text-3xl font-bold text-green-600">{totalStats.avgEnrolmentRate}%</p>
              <p className="text-xs text-gray-400 mt-1">Completion rate</p>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {[
            { key: 'map', label: 'Gap Map', icon: MapIcon },
            { key: 'list', label: 'Priority List', icon: LayersIcon },
            { key: 'analysis', label: 'State Analysis', icon: TrendingUpIcon },
            { key: 'recommendations', label: 'AI Recommendations', icon: SparklesIcon, badge: aiRecommendations ? aiRecommendations.recommendations.length : null }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all whitespace-nowrap ${
                activeTab === tab.key
                  ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/25'
                  : 'bg-white text-gray-600 hover:bg-orange-50 border border-gray-200'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
              {tab.badge && (
                <span className={`px-2 py-0.5 text-xs rounded-full ${activeTab === tab.key ? 'bg-white/20' : 'bg-orange-100 text-orange-600'}`}>
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <FilterIcon className="w-4 h-4 text-gray-400" />
              <span className="text-sm font-medium text-gray-700">Filters:</span>
            </div>
            
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search PIN code or district..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 w-64"
              />
            </div>

            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
            >
              <option value="all">All States</option>
              {Array.from(new Set(pinCodeData.map(p => p.state))).sort().map(state => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>

            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
            >
              <option value="all">All Severity</option>
              <option value="critical">🔴 Critical</option>
              <option value="high">🟠 High</option>
              <option value="moderate">🟡 Moderate</option>
              <option value="low">🟢 Low</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
            >
              <option value="gapScore">Sort by Gap Score</option>
              <option value="population">Sort by Population</option>
              <option value="distance">Sort by Distance</option>
            </select>

            <span className="ml-auto text-sm text-gray-500">
              Showing {filteredData.length} of {pinCodeData.length} areas
            </span>
          </div>
        </div>

        {/* Map Tab */}
        {activeTab === 'map' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Map Visualization */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <MapIcon className="w-5 h-5 text-orange-500" />
                  Service Gap Heat Map
                </h3>
                <div className="flex items-center gap-4 text-xs">
                  <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-red-500"></div><span>Critical</span></div>
                  <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-orange-500"></div><span>High</span></div>
                  <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-yellow-500"></div><span>Moderate</span></div>
                  <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-green-500"></div><span>Low</span></div>
                </div>
              </div>
              
              <div className="relative h-[550px] bg-gradient-to-br from-blue-50 to-slate-100 p-4 overflow-hidden">
                {/* India Map SVG */}
                <svg viewBox="0 0 500 550" className="w-full h-full">
                  {/* Simplified India outline */}
                  <path 
                    d="M250,30 L320,50 L380,80 L420,130 L440,200 L430,280 L400,350 L350,420 L280,480 L220,500 L160,480 L120,420 L80,350 L60,280 L70,200 L100,130 L150,70 L200,40 Z" 
                    fill="#e2e8f0" 
                    stroke="#94a3b8" 
                    strokeWidth="2"
                  />
                  
                  {/* State regions (simplified) */}
                  <ellipse cx="280" cy="150" rx="60" ry="40" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="1" />
                  <ellipse cx="180" cy="200" rx="50" ry="35" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="1" />
                  <ellipse cx="320" cy="250" rx="55" ry="45" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="1" />
                  <ellipse cx="200" cy="320" rx="60" ry="50" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="1" />
                  <ellipse cx="300" cy="380" rx="50" ry="40" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="1" />
                </svg>
                
                {/* Gap Markers */}
                {filteredData.slice(0, 30).map((pc, idx) => {
                  // Position based on state
                  const statePositions: Record<string, {x: number, y: number}> = {
                    'Uttar Pradesh': { x: 55, y: 28 },
                    'Maharashtra': { x: 35, y: 50 },
                    'Bihar': { x: 65, y: 32 },
                    'Madhya Pradesh': { x: 45, y: 40 },
                    'Rajasthan': { x: 30, y: 30 },
                    'Tamil Nadu': { x: 50, y: 80 },
                    'Karnataka': { x: 40, y: 70 },
                    'Gujarat': { x: 22, y: 42 },
                    'West Bengal': { x: 72, y: 38 },
                    'Odisha': { x: 62, y: 50 },
                    'Andhra Pradesh': { x: 52, y: 65 },
                    'Telangana': { x: 48, y: 55 },
                    'Kerala': { x: 42, y: 82 },
                    'Jharkhand': { x: 68, y: 35 },
                    'Assam': { x: 82, y: 28 },
                  }
                  const basePos = statePositions[pc.state] || { x: 50, y: 50 }
                  const x = basePos.x + (Math.random() - 0.5) * 10
                  const y = basePos.y + (Math.random() - 0.5) * 8
                  
                  return (
                    <div
                      key={pc.pinCode}
                      onClick={() => setSelectedPinCode(pc)}
                      className={`absolute w-4 h-4 rounded-full ${getSeverityBg(pc.severity)} shadow-lg cursor-pointer hover:scale-150 transition-all z-10 ${selectedPinCode?.pinCode === pc.pinCode ? 'ring-4 ring-white scale-150' : ''}`}
                      style={{ left: `${x}%`, top: `${y}%` }}
                      title={`${pc.district}, ${pc.state} - Gap Score: ${pc.gapScore}`}
                    >
                      {pc.severity === 'critical' && (
                        <span className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-50"></span>
                      )}
                    </div>
                  )
                })}

                {/* Selected PIN Code Info */}
                {selectedPinCode && (
                  <div className="absolute bottom-4 left-4 right-4 bg-white rounded-xl p-4 shadow-xl border border-gray-200">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono font-bold text-lg">{selectedPinCode.pinCode}</span>
                          <span className={`px-2 py-0.5 text-xs font-bold rounded-full uppercase ${getSeverityColor(selectedPinCode.severity)}`}>
                            {selectedPinCode.severity}
                          </span>
                        </div>
                        <p className="text-gray-600">{selectedPinCode.district}, {selectedPinCode.state}</p>
                      </div>
                      <button onClick={() => setSelectedPinCode(null)} className="p-1 hover:bg-gray-100 rounded-lg">
                        <XCircleIcon className="w-5 h-5 text-gray-400" />
                      </button>
                    </div>
                    <div className="grid grid-cols-4 gap-3 mt-3 text-sm">
                      <div className="text-center p-2 bg-gray-50 rounded-lg">
                        <p className="text-gray-500 text-xs">Population</p>
                        <p className="font-bold">{(selectedPinCode.population / 1000).toFixed(1)}K</p>
                      </div>
                      <div className="text-center p-2 bg-gray-50 rounded-lg">
                        <p className="text-gray-500 text-xs">Distance</p>
                        <p className="font-bold">{selectedPinCode.nearestCenterDistance} km</p>
                      </div>
                      <div className="text-center p-2 bg-gray-50 rounded-lg">
                        <p className="text-gray-500 text-xs">Enrolment</p>
                        <p className="font-bold">{selectedPinCode.enrolmentRate}%</p>
                      </div>
                      <div className="text-center p-2 bg-gray-50 rounded-lg">
                        <p className="text-gray-500 text-xs">Gap Score</p>
                        <p className="font-bold text-red-600">{selectedPinCode.gapScore}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-3">
                      {selectedPinCode.isRural && <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs rounded-full">Rural</span>}
                      {selectedPinCode.isTribal && <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">Tribal</span>}
                      {selectedPinCode.isHilly && <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">Hilly</span>}
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">{selectedPinCode.centersInArea} centers nearby</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Critical Areas List */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
              <div className="p-4 border-b border-gray-100">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <AlertTriangleIcon className="w-5 h-5 text-red-500" />
                  Top Critical Areas
                </h3>
              </div>
              <div className="p-4 space-y-3 max-h-[550px] overflow-y-auto">
                {filteredData.filter(p => p.severity === 'critical' || p.severity === 'high').slice(0, 12).map((pc) => (
                  <div 
                    key={pc.pinCode} 
                    onClick={() => setSelectedPinCode(pc)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all hover:shadow-md ${getSeverityColor(pc.severity)} ${selectedPinCode?.pinCode === pc.pinCode ? 'ring-2 ring-orange-500' : ''}`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-bold text-gray-900">{pc.pinCode}</p>
                        <p className="text-sm">{pc.district}, {pc.state}</p>
                      </div>
                      <span className={`px-2 py-1 text-xs font-bold rounded-full ${
                        pc.severity === 'critical' ? 'bg-red-200 text-red-800' : 'bg-orange-200 text-orange-800'
                      }`}>
                        {pc.gapScore}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs mt-3">
                      <div className="flex items-center gap-1">
                        <UsersIcon className="w-3 h-3" />
                        <span>{(pc.population / 1000).toFixed(1)}K pop</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <NavigationIcon className="w-3 h-3" />
                        <span>{pc.nearestCenterDistance} km</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <TrendingUpIcon className="w-3 h-3" />
                        <span>{pc.enrolmentRate}% enrolled</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <SignalIcon className="w-3 h-3" />
                        <span>{pc.accessibilityScore}/100</span>
                      </div>
                    </div>
                    <p className="text-xs mt-2 pt-2 border-t border-current/20">
                      <span className="font-medium">{pc.estimatedImpact.toLocaleString()}</span> citizens need service
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* List Tab */}
        {activeTab === 'list' && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <LayersIcon className="w-5 h-5 text-orange-500" />
                Priority PIN Code List
              </h3>
              <button className="flex items-center gap-2 px-3 py-1.5 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors text-sm font-medium">
                <DownloadIcon className="w-4 h-4" />
                Export CSV
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">PIN Code</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Location</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Population</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Distance</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Enrolment</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Access</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Gap Score</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Severity</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Tags</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredData.slice(0, 50).map((pc) => (
                    <tr key={pc.pinCode} className="hover:bg-orange-50/50 transition-colors">
                      <td className="py-3 px-4">
                        <span className="font-mono font-bold text-gray-900">{pc.pinCode}</span>
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-medium text-gray-900">{pc.district}</p>
                        <p className="text-xs text-gray-500">{pc.state}</p>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-medium">{pc.population.toLocaleString()}</span>
                        <p className="text-xs text-gray-400">{pc.estimatedImpact.toLocaleString()} underserved</p>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`font-medium ${pc.nearestCenterDistance > 15 ? 'text-red-600' : pc.nearestCenterDistance > 10 ? 'text-orange-600' : 'text-green-600'}`}>
                          {pc.nearestCenterDistance} km
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${pc.enrolmentRate > 80 ? 'bg-green-500' : pc.enrolmentRate > 70 ? 'bg-yellow-500' : 'bg-red-500'}`}
                              style={{ width: `${pc.enrolmentRate}%` }}
                            />
                          </div>
                          <span className="text-sm">{pc.enrolmentRate}%</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`font-medium ${pc.accessibilityScore < 40 ? 'text-red-600' : pc.accessibilityScore < 60 ? 'text-orange-600' : 'text-green-600'}`}>
                          {pc.accessibilityScore}/100
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-white ${getSeverityBg(pc.severity)}`}>
                          {pc.gapScore}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 text-xs font-bold rounded-full uppercase ${getSeverityColor(pc.severity)}`}>
                          {pc.severity}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1">
                          {pc.isRural && <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 text-xs rounded">Rural</span>}
                          {pc.isTribal && <span className="px-1.5 py-0.5 bg-purple-100 text-purple-700 text-xs rounded">Tribal</span>}
                          {pc.isHilly && <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 text-xs rounded">Hilly</span>}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Analysis Tab */}
        {activeTab === 'analysis' && (
          <div className="space-y-6">
            {/* State-wise Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {stateStats.map((state) => (
                <div key={state.state} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-gray-900">{state.state}</h4>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">{state.totalPinCodes} areas</span>
                  </div>
                  
                  {/* Severity Distribution */}
                  <div className="flex gap-1 mb-4">
                    {state.criticalGaps > 0 && (
                      <div className="h-2 bg-red-500 rounded-full" style={{ width: `${(state.criticalGaps / state.totalPinCodes) * 100}%` }}></div>
                    )}
                    {state.highGaps > 0 && (
                      <div className="h-2 bg-orange-500 rounded-full" style={{ width: `${(state.highGaps / state.totalPinCodes) * 100}%` }}></div>
                    )}
                    {state.moderateGaps > 0 && (
                      <div className="h-2 bg-yellow-500 rounded-full" style={{ width: `${(state.moderateGaps / state.totalPinCodes) * 100}%` }}></div>
                    )}
                    {state.lowGaps > 0 && (
                      <div className="h-2 bg-green-500 rounded-full" style={{ width: `${(state.lowGaps / state.totalPinCodes) * 100}%` }}></div>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Critical</span>
                      <span className="font-bold text-red-600">{state.criticalGaps}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">High</span>
                      <span className="font-bold text-orange-600">{state.highGaps}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Avg Distance</span>
                      <span className="font-medium">{state.avgDistance} km</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Enrolment</span>
                      <span className="font-medium">{state.avgEnrolmentRate}%</span>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500 text-sm">Underserved Citizens</span>
                      <span className="font-bold text-blue-600">{(state.underservedPopulation / 1000).toFixed(1)}K</span>
                    </div>
                    <div className="flex gap-2 mt-2">
                      {state.ruralAreas > 0 && <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded">{state.ruralAreas} Rural</span>}
                      {state.tribalAreas > 0 && <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">{state.tribalAreas} Tribal</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Scoring Methodology */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <TargetIcon className="w-5 h-5 text-orange-500" />
                Gap Scoring Methodology
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {[
                  { factor: 'Distance', weight: '25%', icon: NavigationIcon, color: 'orange' },
                  { factor: 'Population', weight: '20%', icon: UsersIcon, color: 'blue' },
                  { factor: 'Enrolment Rate', weight: '20%', icon: TrendingUpIcon, color: 'green' },
                  { factor: 'Accessibility', weight: '15%', icon: RouteIcon, color: 'purple' },
                  { factor: 'Vulnerable %', weight: '10%', icon: AlertCircleIcon, color: 'red' },
                  { factor: 'Failed Attempts', weight: '10%', icon: XCircleIcon, color: 'gray' },
                ].map((item) => (
                  <div key={item.factor} className={`p-4 bg-${item.color}-50 rounded-xl border border-${item.color}-100 text-center`}>
                    <item.icon className={`w-6 h-6 text-${item.color}-500 mx-auto mb-2`} />
                    <p className="font-medium text-gray-900 text-sm">{item.factor}</p>
                    <p className={`text-lg font-bold text-${item.color}-600`}>{item.weight}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* AI Recommendations Tab */}
        {activeTab === 'recommendations' && (
          <div className="space-y-6">
            {!aiRecommendations ? (
              <div className="bg-white rounded-2xl p-12 border border-gray-100 shadow-sm text-center">
                <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-orange-100 to-orange-200 rounded-3xl flex items-center justify-center">
                  <SparklesIcon className="w-10 h-10 text-orange-500" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Get AI-Powered Recommendations</h3>
                <p className="text-gray-500 max-w-md mx-auto mb-6">
                  Click the button below to analyze critical areas and get intelligent recommendations for service deployment
                </p>
                <button
                  onClick={fetchAIRecommendations}
                  disabled={loadingRecommendations}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl hover:from-orange-600 hover:to-red-600 transition-all shadow-lg shadow-orange-500/25 disabled:opacity-50"
                >
                  {loadingRecommendations ? (
                    <>
                      <Loader2Icon className="w-5 h-5 animate-spin" />
                      Analyzing with Gemini AI...
                    </>
                  ) : (
                    <>
                      <SparklesIcon className="w-5 h-5" />
                      Generate Recommendations
                    </>
                  )}
                </button>
              </div>
            ) : (
              <>
                {/* Strategy Summary */}
                <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 text-white">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <SparklesIcon className="w-5 h-5 text-orange-400" />
                    AI Strategy Summary
                  </h3>
                  <p className="text-slate-300 leading-relaxed">{aiRecommendations.strategySummary}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                    <div className="p-4 bg-white/10 rounded-xl">
                      <p className="text-sm text-slate-400 mb-1">Total Estimated Cost</p>
                      <p className="text-2xl font-bold text-orange-400">₹{(aiRecommendations.totalEstimatedCost / 100000).toFixed(1)}L</p>
                    </div>
                    <div className="p-4 bg-white/10 rounded-xl">
                      <p className="text-sm text-slate-400 mb-1">Expected Impact</p>
                      <p className="text-2xl font-bold text-green-400">{(aiRecommendations.totalExpectedImpact / 1000).toFixed(0)}K citizens</p>
                    </div>
                    <div className="p-4 bg-white/10 rounded-xl">
                      <p className="text-sm text-slate-400 mb-1">Recommendations</p>
                      <p className="text-2xl font-bold text-blue-400">{aiRecommendations.recommendations.length} actions</p>
                    </div>
                  </div>
                </div>

                {/* Action Timeline */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white rounded-2xl p-5 border border-green-200 shadow-sm">
                    <h4 className="font-semibold text-green-700 mb-3 flex items-center gap-2">
                      <ZapIcon className="w-5 h-5" />
                      Quick Wins (30 days)
                    </h4>
                    <ul className="space-y-2">
                      {aiRecommendations.quickWins.map((win, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                          <CheckIcon className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          {win}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="bg-white rounded-2xl p-5 border border-orange-200 shadow-sm">
                    <h4 className="font-semibold text-orange-700 mb-3 flex items-center gap-2">
                      <ClockIcon className="w-5 h-5" />
                      Medium Term (3-6 months)
                    </h4>
                    <ul className="space-y-2">
                      {aiRecommendations.mediumTermActions.map((action, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                          <ArrowRightIcon className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                          {action}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="bg-white rounded-2xl p-5 border border-blue-200 shadow-sm">
                    <h4 className="font-semibold text-blue-700 mb-3 flex items-center gap-2">
                      <BuildingIcon className="w-5 h-5" />
                      Long Term Infrastructure
                    </h4>
                    <ul className="space-y-2">
                      {aiRecommendations.longTermNeeds.map((need, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                          <InfoIcon className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                          {need}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Detailed Recommendations */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="p-4 border-b border-gray-100">
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                      <TargetIcon className="w-5 h-5 text-orange-500" />
                      Detailed Action Plan
                    </h3>
                  </div>
                  <div className="divide-y divide-gray-100">
                    {aiRecommendations.recommendations.map((rec, idx) => {
                      const ActionIcon = getActionTypeIcon(rec.actionType)
                      return (
                        <div key={idx} className="p-5 hover:bg-orange-50/50 transition-colors">
                          <div className="flex items-start gap-4">
                            <div className={`p-3 rounded-xl ${
                              rec.priority <= 2 ? 'bg-red-100' : rec.priority <= 4 ? 'bg-orange-100' : 'bg-blue-100'
                            }`}>
                              <ActionIcon className={`w-6 h-6 ${
                                rec.priority <= 2 ? 'text-red-600' : rec.priority <= 4 ? 'text-orange-600' : 'text-blue-600'
                              }`} />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-1">
                                <span className="font-mono font-bold">{rec.pinCode}</span>
                                <span className="text-gray-500">•</span>
                                <span className="text-gray-600">{rec.district}, {rec.state}</span>
                                <span className={`ml-auto px-2 py-0.5 text-xs font-bold rounded-full ${
                                  rec.priority <= 2 ? 'bg-red-100 text-red-700' : rec.priority <= 4 ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
                                }`}>
                                  Priority {rec.priority}
                                </span>
                              </div>
                              <p className="font-medium text-gray-900 mb-2">{rec.action}</p>
                              <p className="text-sm text-gray-600 mb-3">{rec.details}</p>
                              <div className="flex flex-wrap gap-4 text-sm">
                                <div className="flex items-center gap-1 text-green-600">
                                  <UsersIcon className="w-4 h-4" />
                                  <span>{rec.expectedImpact.toLocaleString()} citizens impacted</span>
                                </div>
                                <div className="flex items-center gap-1 text-blue-600">
                                  <span>₹{(rec.estimatedCost / 1000).toFixed(0)}K estimated cost</span>
                                </div>
                                <div className="flex items-center gap-1 text-purple-600">
                                  <ClockIcon className="w-4 h-4" />
                                  <span>{rec.timeline}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Regenerate Button */}
                <div className="text-center">
                  <button
                    onClick={fetchAIRecommendations}
                    disabled={loadingRecommendations}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50"
                  >
                    {loadingRecommendations ? (
                      <Loader2Icon className="w-4 h-4 animate-spin" />
                    ) : (
                      <RefreshCwIcon className="w-4 h-4" />
                    )}
                    Regenerate Recommendations
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
