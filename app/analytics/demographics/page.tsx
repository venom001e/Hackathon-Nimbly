"use client"

import { useState, useEffect, useRef } from 'react'
import { Chart, registerables } from 'chart.js'
import { 
  UsersIcon, ChevronRightIcon, TrendingUpIcon, PieChartIcon,
  BarChart3Icon, RefreshCwIcon, Loader2Icon, BabyIcon,
  GraduationCapIcon, UserIcon, FilterIcon, DownloadIcon,
  ArrowUpIcon, ArrowDownIcon
} from 'lucide-react'
import Link from 'next/link'

Chart.register(...registerables)

interface AgeGroupData {
  age_0_5: { count: number; percentage: number }
  age_5_17: { count: number; percentage: number }
  age_18_greater: { count: number; percentage: number }
}

interface StateAgeData {
  state: string
  totalEnrolments: number
  age_0_5: number
  age_5_17: number
  age_18_greater: number
  districts: number
}

interface DailyTrend {
  date: string
  count: number
}

export default function DemographicsPage() {
  const [loading, setLoading] = useState(true)
  const [ageData, setAgeData] = useState<AgeGroupData | null>(null)
  const [stateAgeData, setStateAgeData] = useState<StateAgeData[]>([])
  const [dailyTrends, setDailyTrends] = useState<DailyTrend[]>([])
  const [totalEnrolments, setTotalEnrolments] = useState(0)
  const [selectedAgeGroup, setSelectedAgeGroup] = useState<string>('all')
  
  const pieChartRef = useRef<HTMLCanvasElement>(null)
  const barChartRef = useRef<HTMLCanvasElement>(null)
  const trendChartRef = useRef<HTMLCanvasElement>(null)
  const pieChartInstance = useRef<Chart | null>(null)
  const barChartInstance = useRef<Chart | null>(null)
  const trendChartInstance = useRef<Chart | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    if (ageData && pieChartRef.current) {
      renderPieChart()
    }
  }, [ageData])

  useEffect(() => {
    if (stateAgeData.length > 0 && barChartRef.current) {
      renderBarChart()
    }
  }, [stateAgeData, selectedAgeGroup])

  useEffect(() => {
    if (dailyTrends.length > 0 && trendChartRef.current) {
      renderTrendChart()
    }
  }, [dailyTrends])

  const loadData = async () => {
    setLoading(true)
    try {
      // Load metrics from CSV
      const metricsRes = await fetch('/api/analytics/csv-metrics')
      if (metricsRes.ok) {
        const data = await metricsRes.json()
        setAgeData(data.age_group_distribution)
        setTotalEnrolments(data.total_enrolments)
        setDailyTrends(data.daily_trends || [])
      }

      // Load state-wise data
      const statesRes = await fetch('/api/analytics/states')
      if (statesRes.ok) {
        const data = await statesRes.json()
        setStateAgeData(data.states || [])
      }
    } catch (error) {
      console.error('Error loading demographics data:', error)
    } finally {
      setLoading(false)
    }
  }

  const renderPieChart = () => {
    if (!pieChartRef.current || !ageData) return

    if (pieChartInstance.current) {
      pieChartInstance.current.destroy()
    }

    const ctx = pieChartRef.current.getContext('2d')
    if (!ctx) return

    pieChartInstance.current = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Children (0-5)', 'Youth (5-17)', 'Adults (18+)'],
        datasets: [{
          data: [ageData.age_0_5.count, ageData.age_5_17.count, ageData.age_18_greater.count],
          backgroundColor: ['#3b82f6', '#22c55e', '#f97316'],
          borderWidth: 0,
          hoverOffset: 15
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const value = context.raw as number
                const total = ageData.age_0_5.count + ageData.age_5_17.count + ageData.age_18_greater.count
                const percentage = ((value / total) * 100).toFixed(1)
                return `${context.label}: ${value.toLocaleString()} (${percentage}%)`
              }
            }
          }
        },
        cutout: '65%'
      }
    })
  }

  const renderBarChart = () => {
    if (!barChartRef.current || stateAgeData.length === 0) return

    if (barChartInstance.current) {
      barChartInstance.current.destroy()
    }

    const ctx = barChartRef.current.getContext('2d')
    if (!ctx) return

    const topStates = stateAgeData.slice(0, 10)

    const datasets = selectedAgeGroup === 'all' ? [
      {
        label: '0-5 Years',
        data: topStates.map(s => s.age_0_5),
        backgroundColor: '#3b82f6',
        borderRadius: 4
      },
      {
        label: '5-17 Years',
        data: topStates.map(s => s.age_5_17),
        backgroundColor: '#22c55e',
        borderRadius: 4
      },
      {
        label: '18+ Years',
        data: topStates.map(s => s.age_18_greater),
        backgroundColor: '#f97316',
        borderRadius: 4
      }
    ] : [
      {
        label: selectedAgeGroup === 'age_0_5' ? '0-5 Years' : selectedAgeGroup === 'age_5_17' ? '5-17 Years' : '18+ Years',
        data: topStates.map(s => selectedAgeGroup === 'age_0_5' ? s.age_0_5 : selectedAgeGroup === 'age_5_17' ? s.age_5_17 : s.age_18_greater),
        backgroundColor: selectedAgeGroup === 'age_0_5' ? '#3b82f6' : selectedAgeGroup === 'age_5_17' ? '#22c55e' : '#f97316',
        borderRadius: 4
      }
    ]

    barChartInstance.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: topStates.map(s => s.state.length > 12 ? s.state.slice(0, 10) + '..' : s.state),
        datasets
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: { usePointStyle: true, font: { size: 11 } }
          }
        },
        scales: {
          x: {
            stacked: selectedAgeGroup === 'all',
            grid: { display: false }
          },
          y: {
            stacked: selectedAgeGroup === 'all',
            grid: { color: '#f3f4f6' },
            ticks: {
              callback: (value) => {
                const num = Number(value)
                if (num >= 10000000) return (num / 10000000).toFixed(1) + 'Cr'
                if (num >= 100000) return (num / 100000).toFixed(1) + 'L'
                return (num / 1000).toFixed(0) + 'K'
              }
            }
          }
        }
      }
    })
  }

  const renderTrendChart = () => {
    if (!trendChartRef.current || dailyTrends.length === 0) return

    if (trendChartInstance.current) {
      trendChartInstance.current.destroy()
    }

    const ctx = trendChartRef.current.getContext('2d')
    if (!ctx) return

    trendChartInstance.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: dailyTrends.map(d => d.date),
        datasets: [{
          label: 'Daily Enrolments',
          data: dailyTrends.map(d => d.count),
          borderColor: '#f97316',
          backgroundColor: 'rgba(249, 115, 22, 0.1)',
          fill: true,
          tension: 0.4,
          pointRadius: 3,
          pointBackgroundColor: '#f97316'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { maxTicksLimit: 10 }
          },
          y: {
            grid: { color: '#f3f4f6' },
            ticks: {
              callback: (value) => {
                const num = Number(value)
                if (num >= 100000) return (num / 100000).toFixed(1) + 'L'
                return (num / 1000).toFixed(0) + 'K'
              }
            }
          }
        }
      }
    })
  }

  const formatNumber = (num: number) => {
    if (num >= 10000000) return (num / 10000000).toFixed(2) + ' Cr'
    if (num >= 100000) return (num / 100000).toFixed(2) + ' L'
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
    return num.toLocaleString()
  }

  // Calculate growth (comparing last 7 days vs previous 7 days)
  const calculateGrowth = () => {
    if (dailyTrends.length < 14) return 0
    const recent = dailyTrends.slice(-7).reduce((a, b) => a + b.count, 0)
    const previous = dailyTrends.slice(-14, -7).reduce((a, b) => a + b.count, 0)
    return previous > 0 ? ((recent - previous) / previous) * 100 : 0
  }

  const growth = calculateGrowth()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50/30 to-slate-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link href="/analytics" className="hover:text-orange-600 transition-colors">Dashboard</Link>
          <ChevronRightIcon className="w-4 h-4" />
          <span className="text-gray-900 font-medium">Demographics Analysis</span>
        </div>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-lg shadow-green-500/25">
                <UsersIcon className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Demographics Analysis</h1>
                <p className="text-gray-600">Age-wise enrolment distribution from CSV data</p>
              </div>
            </div>
          </div>
          
          <button
            onClick={loadData}
            disabled={loading}
            className="mt-4 md:mt-0 flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 transition-all shadow-lg shadow-green-500/25"
          >
            <RefreshCwIcon className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh Data
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-gray-100 rounded-xl">
                <UsersIcon className="w-5 h-5 text-gray-600" />
              </div>
              <span className="text-sm text-gray-500">Total</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {loading ? '...' : formatNumber(totalEnrolments)}
            </p>
            <div className={`flex items-center gap-1 mt-1 text-xs ${growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {growth >= 0 ? <ArrowUpIcon className="w-3 h-3" /> : <ArrowDownIcon className="w-3 h-3" />}
              {Math.abs(growth).toFixed(1)}% vs last week
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-blue-100 rounded-xl">
                <BabyIcon className="w-5 h-5 text-blue-600" />
              </div>
              <span className="text-sm text-gray-500">Children (0-5)</span>
            </div>
            <p className="text-2xl font-bold text-blue-600">
              {loading ? '...' : formatNumber(ageData?.age_0_5.count || 0)}
            </p>
            <p className="text-xs text-gray-500 mt-1">{ageData?.age_0_5.percentage || 0}% of total</p>
          </div>
          
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-green-100 rounded-xl">
                <GraduationCapIcon className="w-5 h-5 text-green-600" />
              </div>
              <span className="text-sm text-gray-500">Youth (5-17)</span>
            </div>
            <p className="text-2xl font-bold text-green-600">
              {loading ? '...' : formatNumber(ageData?.age_5_17.count || 0)}
            </p>
            <p className="text-xs text-gray-500 mt-1">{ageData?.age_5_17.percentage || 0}% of total</p>
          </div>
          
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-orange-100 rounded-xl">
                <UserIcon className="w-5 h-5 text-orange-600" />
              </div>
              <span className="text-sm text-gray-500">Adults (18+)</span>
            </div>
            <p className="text-2xl font-bold text-orange-600">
              {loading ? '...' : formatNumber(ageData?.age_18_greater.count || 0)}
            </p>
            <p className="text-xs text-gray-500 mt-1">{ageData?.age_18_greater.percentage || 0}% of total</p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-purple-100 rounded-xl">
                <TrendingUpIcon className="w-5 h-5 text-purple-600" />
              </div>
              <span className="text-sm text-gray-500">States</span>
            </div>
            <p className="text-2xl font-bold text-purple-600">{stateAgeData.length}</p>
            <p className="text-xs text-gray-500 mt-1">With age data</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Age Distribution Pie Chart */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <PieChartIcon className="w-5 h-5 text-green-500" />
                Age Distribution
              </h2>
            </div>
            
            {loading ? (
              <div className="h-[280px] flex items-center justify-center">
                <Loader2Icon className="w-10 h-10 text-green-500 animate-spin" />
              </div>
            ) : (
              <div className="h-[280px] relative">
                <canvas ref={pieChartRef}></canvas>
                {/* Center text */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">{formatNumber(totalEnrolments)}</p>
                    <p className="text-xs text-gray-500">Total</p>
                  </div>
                </div>
              </div>
            )}

            {/* Legend */}
            {ageData && (
              <div className="grid grid-cols-3 gap-3 mt-6">
                <div className="text-center p-3 bg-blue-50 rounded-xl">
                  <div className="w-4 h-4 bg-blue-500 rounded-full mx-auto mb-2"></div>
                  <p className="text-xs text-gray-600">0-5 Years</p>
                  <p className="font-bold text-blue-600">{ageData.age_0_5.percentage}%</p>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-xl">
                  <div className="w-4 h-4 bg-green-500 rounded-full mx-auto mb-2"></div>
                  <p className="text-xs text-gray-600">5-17 Years</p>
                  <p className="font-bold text-green-600">{ageData.age_5_17.percentage}%</p>
                </div>
                <div className="text-center p-3 bg-orange-50 rounded-xl">
                  <div className="w-4 h-4 bg-orange-500 rounded-full mx-auto mb-2"></div>
                  <p className="text-xs text-gray-600">18+ Years</p>
                  <p className="font-bold text-orange-600">{ageData.age_18_greater.percentage}%</p>
                </div>
              </div>
            )}
          </div>

          {/* Daily Trend Chart */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <TrendingUpIcon className="w-5 h-5 text-orange-500" />
                Enrolment Trend (Last 30 Days)
              </h2>
            </div>
            
            {loading ? (
              <div className="h-[350px] flex items-center justify-center">
                <Loader2Icon className="w-10 h-10 text-orange-500 animate-spin" />
              </div>
            ) : (
              <div className="h-[350px]">
                <canvas ref={trendChartRef}></canvas>
              </div>
            )}
          </div>
        </div>

        {/* State-wise Age Distribution */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <BarChart3Icon className="w-5 h-5 text-green-500" />
              Top 10 States by Age Group
            </h2>
            <select
              value={selectedAgeGroup}
              onChange={(e) => setSelectedAgeGroup(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20"
            >
              <option value="all">All Age Groups (Stacked)</option>
              <option value="age_0_5">Children (0-5 Years)</option>
              <option value="age_5_17">Youth (5-17 Years)</option>
              <option value="age_18_greater">Adults (18+ Years)</option>
            </select>
          </div>
          
          {loading ? (
            <div className="h-[350px] flex items-center justify-center">
              <Loader2Icon className="w-10 h-10 text-green-500 animate-spin" />
            </div>
          ) : (
            <div className="h-[350px]">
              <canvas ref={barChartRef}></canvas>
            </div>
          )}
        </div>

        {/* State-wise Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">State-wise Demographics</h2>
            <span className="text-sm text-gray-500">{stateAgeData.length} states</span>
          </div>
          
          {loading ? (
            <div className="p-12 text-center">
              <Loader2Icon className="w-10 h-10 text-green-500 animate-spin mx-auto" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">#</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">State</th>
                    <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Total</th>
                    <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase">0-5 Years</th>
                    <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase">5-17 Years</th>
                    <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase">18+ Years</th>
                    <th className="text-center py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Distribution</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {stateAgeData.slice(0, 20).map((state, idx) => {
                    const total = state.age_0_5 + state.age_5_17 + state.age_18_greater
                    return (
                      <tr key={state.state} className="hover:bg-orange-50/50 transition-colors">
                        <td className="py-3 px-4">
                          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                            idx < 3 ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600'
                          }`}>
                            {idx + 1}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-medium text-gray-900">{state.state}</td>
                        <td className="py-3 px-4 text-right font-bold text-gray-900">{formatNumber(state.totalEnrolments)}</td>
                        <td className="py-3 px-4 text-right text-blue-600 font-medium">{formatNumber(state.age_0_5)}</td>
                        <td className="py-3 px-4 text-right text-green-600 font-medium">{formatNumber(state.age_5_17)}</td>
                        <td className="py-3 px-4 text-right text-orange-600 font-medium">{formatNumber(state.age_18_greater)}</td>
                        <td className="py-3 px-4">
                          <div className="flex h-3 rounded-full overflow-hidden w-32 mx-auto">
                            <div className="bg-blue-500" style={{ width: `${total > 0 ? (state.age_0_5 / total) * 100 : 0}%` }}></div>
                            <div className="bg-green-500" style={{ width: `${total > 0 ? (state.age_5_17 / total) * 100 : 0}%` }}></div>
                            <div className="bg-orange-500" style={{ width: `${total > 0 ? (state.age_18_greater / total) * 100 : 0}%` }}></div>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
