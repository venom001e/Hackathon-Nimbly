"use client"

import { useState, useEffect } from 'react'
import { 
  MapPinIcon, BuildingIcon, TreesIcon, ChevronRightIcon,
  RefreshCwIcon, TrendingUpIcon, UsersIcon, BarChart3Icon,
  ArrowUpIcon, ArrowDownIcon, FilterIcon, DownloadIcon,
  Loader2Icon, MapIcon, GlobeIcon
} from 'lucide-react'
import Link from 'next/link'

interface StateData {
  state: string
  totalEnrolments: number
  age_0_5: number
  age_5_17: number
  age_18_greater: number
  districts: number
}

interface DistrictData {
  district: string
  total_enrolments: number
  age_0_5: number
  age_5_17: number
  age_18_greater: number
}

interface StateDetails {
  state: string
  total_enrolments: number
  age_distribution: {
    age_0_5: number
    age_5_17: number
    age_18_greater: number
  }
  districts: DistrictData[]
  district_count: number
}

export default function GeographicPage() {
  const [stateData, setStateData] = useState<StateData[]>([])
  const [selectedState, setSelectedState] = useState<string>('')
  const [stateDetails, setStateDetails] = useState<StateDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadingDetails, setLoadingDetails] = useState(false)
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map')
  const [sortBy, setSortBy] = useState<'enrolments' | 'districts' | 'name'>('enrolments')

  useEffect(() => {
    loadStateData()
  }, [])

  useEffect(() => {
    if (selectedState) {
      loadStateDetails(selectedState)
    } else {
      setStateDetails(null)
    }
  }, [selectedState])

  const loadStateData = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/analytics/states')
      if (res.ok) {
        const data = await res.json()
        setStateData(data.states || [])
      }
    } catch (error) {
      console.error('Error loading state data:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadStateDetails = async (state: string) => {
    setLoadingDetails(true)
    try {
      const res = await fetch(`/api/analytics/states?state=${encodeURIComponent(state)}`)
      if (res.ok) {
        const data = await res.json()
        setStateDetails(data)
      }
    } catch (error) {
      console.error('Error loading state details:', error)
    } finally {
      setLoadingDetails(false)
    }
  }

  const sortedStateData = [...stateData].sort((a, b) => {
    if (sortBy === 'enrolments') return b.totalEnrolments - a.totalEnrolments
    if (sortBy === 'districts') return b.districts - a.districts
    return a.state.localeCompare(b.state)
  })

  const totalEnrolments = stateData.reduce((sum, s) => sum + s.totalEnrolments, 0)
  const totalDistricts = stateData.reduce((sum, s) => sum + s.districts, 0)
  const avgEnrolmentsPerState = stateData.length > 0 ? totalEnrolments / stateData.length : 0

  // Top 5 states
  const topStates = [...stateData].sort((a, b) => b.totalEnrolments - a.totalEnrolments).slice(0, 5)

  const getIntensityColor = (enrolments: number) => {
    const maxCount = Math.max(...stateData.map(s => s.totalEnrolments))
    const intensity = enrolments / maxCount
    if (intensity > 0.8) return 'bg-orange-600 text-white'
    if (intensity > 0.6) return 'bg-orange-500 text-white'
    if (intensity > 0.4) return 'bg-orange-400 text-white'
    if (intensity > 0.2) return 'bg-orange-300 text-gray-800'
    return 'bg-orange-100 text-gray-700'
  }

  const formatNumber = (num: number) => {
    if (num >= 10000000) return (num / 10000000).toFixed(2) + ' Cr'
    if (num >= 100000) return (num / 100000).toFixed(2) + ' L'
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
    return num.toLocaleString()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50/30 to-slate-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link href="/analytics" className="hover:text-orange-600 transition-colors">Dashboard</Link>
          <ChevronRightIcon className="w-4 h-4" />
          <span className="text-gray-900 font-medium">Geographic Analysis</span>
          {selectedState && (
            <>
              <ChevronRightIcon className="w-4 h-4" />
              <span className="text-orange-600 font-medium">{selectedState}</span>
            </>
          )}
        </div>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl shadow-lg shadow-orange-500/25">
                <MapPinIcon className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Geographic Analysis</h1>
                <p className="text-gray-600">State & District-wise enrolment distribution</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3 mt-4 md:mt-0">
            <div className="flex bg-white border border-gray-200 p-1 rounded-xl">
              <button
                onClick={() => setViewMode('map')}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                  viewMode === 'map' ? 'bg-orange-500 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <MapIcon className="w-4 h-4 inline mr-1" />
                Map
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                  viewMode === 'list' ? 'bg-orange-500 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <BarChart3Icon className="w-4 h-4 inline mr-1" />
                List
              </button>
            </div>
            <button
              onClick={loadStateData}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
            >
              <RefreshCwIcon className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-orange-100 rounded-xl">
                <GlobeIcon className="w-5 h-5 text-orange-600" />
              </div>
              <span className="text-sm text-gray-500">Total States/UTs</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stateData.length}</p>
            <p className="text-xs text-gray-400 mt-1">Covered regions</p>
          </div>
          
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-blue-100 rounded-xl">
                <BuildingIcon className="w-5 h-5 text-blue-600" />
              </div>
              <span className="text-sm text-gray-500">Total Districts</span>
            </div>
            <p className="text-3xl font-bold text-blue-600">{totalDistricts}</p>
            <p className="text-xs text-gray-400 mt-1">Across all states</p>
          </div>
          
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-green-100 rounded-xl">
                <UsersIcon className="w-5 h-5 text-green-600" />
              </div>
              <span className="text-sm text-gray-500">Total Enrolments</span>
            </div>
            <p className="text-3xl font-bold text-green-600">{formatNumber(totalEnrolments)}</p>
            <p className="text-xs text-gray-400 mt-1">From CSV data</p>
          </div>
          
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-purple-100 rounded-xl">
                <TrendingUpIcon className="w-5 h-5 text-purple-600" />
              </div>
              <span className="text-sm text-gray-500">Avg per State</span>
            </div>
            <p className="text-3xl font-bold text-purple-600">{formatNumber(avgEnrolmentsPerState)}</p>
            <p className="text-xs text-gray-400 mt-1">Average enrolments</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* State Heatmap / List */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <MapPinIcon className="w-5 h-5 text-orange-500" />
                State-wise Distribution
              </h2>
              <div className="flex items-center gap-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                  className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                >
                  <option value="enrolments">Sort by Enrolments</option>
                  <option value="districts">Sort by Districts</option>
                  <option value="name">Sort by Name</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div className="p-12 text-center">
                <Loader2Icon className="w-10 h-10 text-orange-500 animate-spin mx-auto mb-3" />
                <p className="text-gray-500">Loading state data...</p>
              </div>
            ) : viewMode === 'map' ? (
              <div className="p-6">
                <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
                  <span>Low</span>
                  <div className="flex gap-0.5">
                    {['bg-orange-100', 'bg-orange-300', 'bg-orange-400', 'bg-orange-500', 'bg-orange-600'].map((c, i) => (
                      <div key={i} className={`w-6 h-3 ${c} rounded`}></div>
                    ))}
                  </div>
                  <span>High</span>
                </div>
                <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
                  {sortedStateData.map((state) => (
                    <button
                      key={state.state}
                      onClick={() => setSelectedState(state.state === selectedState ? '' : state.state)}
                      className={`p-3 rounded-xl transition-all text-center hover:scale-105 ${getIntensityColor(state.totalEnrolments)} ${
                        selectedState === state.state ? 'ring-2 ring-orange-600 ring-offset-2 scale-105' : ''
                      }`}
                    >
                      <div className="text-[10px] font-medium truncate">
                        {state.state.length > 12 ? state.state.slice(0, 10) + '..' : state.state}
                      </div>
                      <div className="text-sm font-bold mt-1">{formatNumber(state.totalEnrolments)}</div>
                      <div className="text-[9px] opacity-80 mt-0.5">{state.districts} dist</div>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="max-h-[500px] overflow-y-auto">
                {sortedStateData.map((state, index) => (
                  <button
                    key={state.state}
                    onClick={() => setSelectedState(state.state === selectedState ? '' : state.state)}
                    className={`w-full flex items-center justify-between p-4 border-b border-gray-100 transition-all ${
                      selectedState === state.state 
                        ? 'bg-orange-50 border-l-4 border-l-orange-500' 
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
                        index < 3 ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {index + 1}
                      </span>
                      <div className="text-left">
                        <p className="font-medium text-gray-900">{state.state}</p>
                        <p className="text-xs text-gray-500">{state.districts} districts</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">{formatNumber(state.totalEnrolments)}</p>
                      <p className="text-xs text-gray-500">
                        {((state.totalEnrolments / totalEnrolments) * 100).toFixed(1)}% share
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* State Details Panel */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">
                {stateDetails ? stateDetails.state : 'Select a State'}
              </h2>
            </div>
            
            {loadingDetails ? (
              <div className="p-12 text-center">
                <Loader2Icon className="w-8 h-8 text-orange-500 animate-spin mx-auto" />
              </div>
            ) : stateDetails ? (
              <div className="p-4 space-y-6">
                {/* Key Metrics */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-orange-50 rounded-xl text-center">
                    <p className="text-2xl font-bold text-orange-600">{formatNumber(stateDetails.total_enrolments)}</p>
                    <p className="text-xs text-gray-600">Total Enrolments</p>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-xl text-center">
                    <p className="text-2xl font-bold text-blue-600">{stateDetails.district_count}</p>
                    <p className="text-xs text-gray-600">Districts</p>
                  </div>
                </div>

                <div className="p-3 bg-green-50 rounded-xl">
                  <p className="text-sm text-gray-600 mb-1">National Share</p>
                  <p className="text-xl font-bold text-green-600">
                    {((stateDetails.total_enrolments / totalEnrolments) * 100).toFixed(2)}%
                  </p>
                </div>

                {/* Age Distribution */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Age Distribution</h3>
                  <div className="space-y-3">
                    {[
                      { label: '0-5 Years', value: stateDetails.age_distribution.age_0_5, color: 'bg-blue-500' },
                      { label: '5-17 Years', value: stateDetails.age_distribution.age_5_17, color: 'bg-green-500' },
                      { label: '18+ Years', value: stateDetails.age_distribution.age_18_greater, color: 'bg-orange-500' }
                    ].map(age => {
                      const total = stateDetails.age_distribution.age_0_5 + stateDetails.age_distribution.age_5_17 + stateDetails.age_distribution.age_18_greater
                      const percentage = total > 0 ? (age.value / total) * 100 : 0
                      return (
                        <div key={age.label}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-600">{age.label}</span>
                            <span className="font-medium">{formatNumber(age.value)}</span>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-2">
                            <div className={`h-2 rounded-full ${age.color}`} style={{ width: `${percentage}%` }}></div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Top Districts */}
                {stateDetails.districts.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Top Districts</h3>
                    <div className="space-y-2 max-h-[200px] overflow-y-auto">
                      {stateDetails.districts.slice(0, 10).map((district, idx) => (
                        <div key={district.district} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-gray-400">#{idx + 1}</span>
                            <span className="text-sm font-medium text-gray-900">{district.district}</span>
                          </div>
                          <span className="text-sm font-bold text-orange-600">{formatNumber(district.total_enrolments)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-12 text-center text-gray-500">
                <MapPinIcon className="w-16 h-16 mx-auto mb-4 text-gray-200" />
                <p className="font-medium">Click on a state to view details</p>
                <p className="text-sm mt-1">See district-wise breakdown and age distribution</p>
              </div>
            )}
          </div>
        </div>

        {/* Top 5 States Chart */}
        <div className="mt-8 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <TrendingUpIcon className="w-5 h-5 text-orange-500" />
            Top 5 States by Enrolments
          </h2>
          <div className="space-y-4">
            {topStates.map((state, idx) => {
              const percentage = (state.totalEnrolments / totalEnrolments) * 100
              return (
                <div key={state.state} className="flex items-center gap-4">
                  <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
                    idx === 0 ? 'bg-yellow-400 text-yellow-900' :
                    idx === 1 ? 'bg-gray-300 text-gray-700' :
                    idx === 2 ? 'bg-orange-300 text-orange-800' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {idx + 1}
                  </span>
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="font-medium text-gray-900">{state.state}</span>
                      <span className="font-bold text-orange-600">{formatNumber(state.totalEnrolments)}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-3">
                      <div 
                        className="h-3 rounded-full bg-gradient-to-r from-orange-400 to-orange-600 transition-all"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                  <span className="text-sm text-gray-500 w-16 text-right">{percentage.toFixed(1)}%</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
