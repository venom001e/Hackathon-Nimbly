"use client"

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { gsap } from 'gsap'
import { AnalyticsMetrics, Anomaly } from '@/types'
import { 
  RefreshCwIcon,
  MessageCircleIcon,
  LayoutDashboardIcon,
  BrainCircuitIcon
} from 'lucide-react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import MetricsCards from '@/components/dashboard/MetricsCards'
import { AadhaarSpinner, PulseDotsLoader } from '@/components/ui/loading-animations'
import ProtectedRoute from '@/components/ProtectedRoute'
import { useAuth } from '@/contexts/AuthContext'

// Lazy load heavy components
const Chatbot = dynamic(() => import('@/components/chatbot'), { 
  ssr: false,
  loading: () => <div className="animate-pulse bg-gray-200 rounded-2xl h-96" />
})
const TrendChart = dynamic(() => import('@/components/dashboard/TrendChart'), {
  loading: () => <div className="animate-pulse bg-gray-200 rounded-2xl h-80" />
})
const StateHeatmap = dynamic(() => import('@/components/dashboard/StateHeatmap'), {
  loading: () => <div className="animate-pulse bg-gray-200 rounded-2xl h-96" />
})
const AnomalyAlerts = dynamic(() => import('@/components/dashboard/AnomalyAlerts'), {
  loading: () => <div className="animate-pulse bg-gray-200 rounded-2xl h-64" />
})
const PredictiveAnalytics = dynamic(() => import('@/components/dashboard/PredictiveAnalytics'), {
  loading: () => <div className="animate-pulse bg-gray-200 rounded-2xl h-80" />
})
const ReportGenerator = dynamic(() => import('@/components/dashboard/ReportGenerator'), {
  loading: () => <div className="animate-pulse bg-gray-200 rounded-2xl h-64" />
})
const AgeDistributionChart = dynamic(() => import('@/components/dashboard/AgeDistributionChart'), {
  loading: () => <div className="animate-pulse bg-gray-200 rounded-2xl h-80" />
})

function AnalyticsContent() {
  const { user } = useAuth()
  const [metrics, setMetrics] = useState<AnalyticsMetrics | null>(null)
  const [anomalies, setAnomalies] = useState<Anomaly[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTimeRange, setSelectedTimeRange] = useState('30d')
  const [selectedState, setSelectedState] = useState('')

  const [csvMetrics, setCsvMetrics] = useState<any>(null)
  const [statesList, setStatesList] = useState<string[]>([])
  const [stateSummary, setStateSummary] = useState<any[]>([])
  const [showChatbot, setShowChatbot] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics' | 'reports'>('overview')

  // Animation refs
  const headerRef = useRef<HTMLDivElement>(null)
  const bannerRef = useRef<HTMLAnchorElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const chatButtonRef = useRef<HTMLButtonElement>(null)

  // Initial page animations
  useEffect(() => {
    const tl = gsap.timeline()
    
    if (headerRef.current) {
      tl.fromTo(headerRef.current, 
        { opacity: 0, y: -20 },
        { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }
      )
    }
    
    if (bannerRef.current) {
      tl.fromTo(bannerRef.current,
        { opacity: 0, y: 20, scale: 0.98 },
        { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: "power2.out" },
        "-=0.3"
      )
    }

    if (chatButtonRef.current) {
      gsap.fromTo(chatButtonRef.current,
        { scale: 0, rotation: -180 },
        { scale: 1, rotation: 0, duration: 0.6, delay: 1, ease: "back.out(1.7)" }
      )
    }
  }, [])

  // Memoized time ranges
  const timeRanges = useMemo(() => [
    { value: '7d', label: '7 Days' },
    { value: '30d', label: '30 Days' },
    { value: '90d', label: '90 Days' },
    { value: '365d', label: '1 Year' }
  ], [])

  // Load states list only once
  const loadStatesList = useCallback(async () => {
    try {
      const res = await fetch('/api/analytics/states')
      if (res.ok) {
        const data = await res.json()
        setStatesList(data.states?.map((s: any) => s.state) || [])
      }
    } catch (error) {
      console.error('Error loading states:', error)
    }
  }, [])

  // Load state summary only once
  const loadStateSummary = useCallback(async () => {
    try {
      const res = await fetch('/api/reports/generate?format=json')
      if (res.ok) {
        const data = await res.json()
        setStateSummary(data.stateSummary || [])
      }
    } catch (error) {
      console.error('Error loading state summary:', error)
    }
  }, [])

  // Optimized dashboard data loading
  const loadDashboardData = useCallback(async () => {
    setLoading(true)
    
    try {
      // Parallel fetch for better performance
      const [csvRes, anomaliesRes] = await Promise.all([
        fetch(`/api/analytics/csv-metrics${selectedState ? `?state=${selectedState}` : ''}`),
        fetch(`/api/analytics/anomalies?time_period=${selectedTimeRange}${selectedState ? `&state=${selectedState}` : ''}`)
      ])

      if (csvRes.ok) {
        const csvData = await csvRes.json()
        setCsvMetrics(csvData)
        
        setMetrics({
          total_enrolments: csvData.total_enrolments,
          daily_growth_rate: csvData.daily_growth_rate,
          top_performing_states: csvData.top_performing_states,
          anomaly_count: csvData.anomaly_count,
          prediction_accuracy: csvData.confidence_score * 100
        })
      }

      if (anomaliesRes.ok) {
        const anomaliesData = await anomaliesRes.json()
        setAnomalies(anomaliesData.anomalies || [])
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }, [selectedTimeRange, selectedState])

  useEffect(() => {
    loadStatesList()
    loadStateSummary()
  }, [loadStatesList, loadStateSummary])

  useEffect(() => {
    loadDashboardData()
  }, [loadDashboardData])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50/30 to-gray-50">
      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center z-50">
          <AadhaarSpinner size="lg" />
          <p className="mt-4 text-gray-600 font-medium">Loading analytics data...</p>
          <div className="mt-2">
            <PulseDotsLoader />
          </div>
        </div>
      )}

      {/* Header */}
      <div ref={headerRef} className="bg-white/80 backdrop-blur-lg border-b border-gray-200 sticky top-0 z-40" style={{ opacity: 0 }}>
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-900 flex items-center gap-2">
                <LayoutDashboardIcon className="w-6 h-6 md:w-7 md:h-7 text-orange-500" />
                Aadhaar Insights Dashboard
              </h1>
              <p className="text-xs md:text-sm text-gray-600 mt-1">
                Real-time analytics & predictive insights
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {/* Tab Navigation */}
              <div className="flex bg-gray-100 p-1 rounded-lg overflow-x-auto">
                {[
                  { key: 'overview', label: 'Overview' },
                  { key: 'analytics', label: 'Analytics' },
                  { key: 'reports', label: 'Reports' }
                ].map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key as any)}
                    className={`px-3 md:px-4 py-2 text-sm font-medium rounded-md transition-all whitespace-nowrap ${
                      activeTab === tab.key 
                        ? 'bg-white text-gray-900 shadow-sm' 
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Filters */}
              <div className="flex items-center gap-2 overflow-x-auto">
                <select
                  value={selectedTimeRange}
                  onChange={(e) => setSelectedTimeRange(e.target.value)}
                  className="px-2 md:px-3 py-2 text-xs md:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white min-w-0"
                >
                  {timeRanges.map(range => (
                    <option key={range.value} value={range.value}>
                      {range.label}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedState}
                  onChange={(e) => setSelectedState(e.target.value)}
                  className="px-2 md:px-3 py-2 text-xs md:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white min-w-0"
                >
                  <option value="">All States</option>
                  {statesList.map(state => (
                    <option key={state} value={state}>
                      {state.length > 15 ? state.slice(0, 12) + '...' : state}
                    </option>
                  ))}
                </select>

                <button
                  onClick={loadDashboardData}
                  disabled={loading}
                  className="p-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 transition-colors flex-shrink-0"
                  title="Refresh Data"
                >
                  <RefreshCwIcon className={`w-4 h-4 md:w-5 md:h-5 ${loading ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6">
        {/* AadhaarSense Banner */}
        <Link 
          href="/analytics/aadhaar-sense"
          ref={bannerRef}
          className="block mb-6 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 rounded-2xl p-5 text-white hover:shadow-xl hover:shadow-purple-500/20 transition-all group hover:scale-[1.01]"
          style={{ opacity: 0 }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-xl">
                <BrainCircuitIcon className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-bold flex items-center gap-2">
                  AadhaarSense - Smart Anomaly Detective
                  <span className="text-xs font-normal px-2 py-0.5 bg-white/20 rounded-full">AI-Powered</span>
                </h3>
                <p className="text-purple-100 text-sm mt-1">
                  Real-time fraud detection • Predictive crisis alerts • Smart resource optimization
                </p>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-2 text-sm font-medium group-hover:translate-x-1 transition-transform">
              Explore Now →
            </div>
          </div>
        </Link>

        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Metrics Cards */}
            <MetricsCards
              totalEnrolments={metrics?.total_enrolments || 0}
              dailyGrowthRate={metrics?.daily_growth_rate || 0}
              anomalyCount={anomalies.filter(a => a.severity === 'high').length}
              predictionAccuracy={metrics?.prediction_accuracy || 0}
              uniqueStates={csvMetrics?.unique_states || 0}
              loading={loading}
            />

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <TrendChart 
                data={csvMetrics?.daily_trends || []} 
                title="Enrolment Trends"
                loading={loading}
              />
              <AgeDistributionChart 
                data={csvMetrics?.age_group_distribution || null}
                loading={loading}
              />
            </div>

            {/* State Heatmap */}
            <StateHeatmap 
              data={stateSummary}
              loading={loading}
              onStateSelect={setSelectedState}
            />

            {/* Anomaly Alerts */}
            <AnomalyAlerts 
              anomalies={anomalies}
              loading={loading}
            />
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6">
            {/* Predictive Analytics */}
            <PredictiveAnalytics 
              historicalData={csvMetrics?.daily_trends || []}
              loading={loading}
            />

            {/* Trend Analysis */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <TrendChart 
                data={csvMetrics?.daily_trends || []} 
                title="Historical Trends"
                loading={loading}
              />
              <AgeDistributionChart 
                data={csvMetrics?.age_group_distribution || null}
                loading={loading}
              />
            </div>

            {/* State Heatmap */}
            <StateHeatmap 
              data={stateSummary}
              loading={loading}
              onStateSelect={setSelectedState}
            />
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ReportGenerator states={statesList} />
            
            <div className="space-y-6">
              <AnomalyAlerts 
                anomalies={anomalies}
                loading={loading}
              />
            </div>
          </div>
        )}
      </div>

      {/* Floating Chatbot Button */}
      <button
        ref={chatButtonRef}
        onClick={() => setShowChatbot(!showChatbot)}
        className={`fixed bottom-6 right-6 p-4 rounded-full shadow-lg transition-all hover:scale-110 z-50 ${
          showChatbot ? 'bg-gray-600' : 'bg-gradient-to-r from-orange-500 to-orange-600'
        } text-white`}
        style={{ transform: 'scale(0)' }}
        title="AI Assistant"
      >
        <MessageCircleIcon className="w-6 h-6" />
      </button>

      {/* Chatbot Panel */}
      {showChatbot && (
        <div className="fixed bottom-24 right-6 w-96 z-50 animate-in slide-in-from-bottom-4">
          <Chatbot />
        </div>
      )}
    </div>
  )
}

// Main export with protection
export default function AnalyticsPage() {
  return (
    <ProtectedRoute>
      <AnalyticsContent />
    </ProtectedRoute>
  )
}
