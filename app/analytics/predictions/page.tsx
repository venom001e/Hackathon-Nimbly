"use client"

import { useState, useEffect, useRef } from 'react'
import { Chart, registerables } from 'chart.js'
import { 
  TrendingUpIcon, ChevronRightIcon, CalendarIcon, TargetIcon,
  RefreshCwIcon, ArrowUpIcon, ArrowDownIcon, SparklesIcon,
  Loader2Icon, AlertTriangleIcon, InfoIcon,
  BarChart3Icon, ActivityIcon, ZapIcon
} from 'lucide-react'
import Link from 'next/link'

Chart.register(...registerables)

interface ForecastData {
  period: string
  predicted: number
  lower_bound: number
  upper_bound: number
  confidence: number
}

interface HistoricalTrend {
  date: string
  count: number
}

interface ForecastResponse {
  forecast: {
    horizon_days: number
    predictions: { date: string; predicted: number; lower: number; upper: number }[]
    summary: {
      next_week_total: number
      next_month_total: number
      daily_average_predicted: number
      growth_rate_percent: number
    }
  }
  trend: {
    direction: string
    strength: string
  }
  seasonal: {
    has_pattern: boolean
    amplitude: number
    peak_days: number[]
  }
  confidence: {
    score: number
    data_points: number
    model: string
  }
  historical: {
    mean: number
    std_dev: number
    min: number
    max: number
  }
}

export default function PredictionsPage() {
  const [loading, setLoading] = useState(true)
  const [forecastPeriod, setForecastPeriod] = useState<'3' | '6' | '12'>('6')
  const [forecasts, setForecasts] = useState<ForecastData[]>([])
  const [historicalData, setHistoricalData] = useState<HistoricalTrend[]>([])
  const [forecastResponse, setForecastResponse] = useState<ForecastResponse | null>(null)
  const [currentMetrics, setCurrentMetrics] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  
  const chartRef = useRef<HTMLCanvasElement>(null)
  const chartInstance = useRef<Chart | null>(null)

  useEffect(() => {
    loadData()
  }, [forecastPeriod])

  useEffect(() => {
    if (historicalData.length > 0 && chartRef.current) {
      renderChart()
    }
  }, [historicalData, forecasts])

  const loadData = async () => {
    setLoading(true)
    setError(null)
    try {
      // Load historical data
      const metricsRes = await fetch('/api/analytics/csv-metrics')
      if (metricsRes.ok) {
        const data = await metricsRes.json()
        setHistoricalData(data.daily_trends || [])
        setCurrentMetrics(data)
      }

      // Load forecasts
      const horizon = parseInt(forecastPeriod) * 30
      const forecastRes = await fetch(`/api/analytics/forecast?horizon=${horizon}`)
      
      if (forecastRes.ok) {
        const data: ForecastResponse = await forecastRes.json()
        setForecastResponse(data)
        
        // Transform API response to monthly forecasts
        const predictions = data.forecast?.predictions || []
        const monthlyForecasts: ForecastData[] = []
        
        const months = parseInt(forecastPeriod)
        for (let i = 0; i < months; i++) {
          const startIdx = i * 30
          const endIdx = Math.min(startIdx + 30, predictions.length)
          const monthPredictions = predictions.slice(startIdx, endIdx)
          
          if (monthPredictions.length > 0) {
            const monthTotal = monthPredictions.reduce((sum, p) => sum + p.predicted, 0)
            const monthLower = monthPredictions.reduce((sum, p) => sum + p.lower, 0)
            const monthUpper = monthPredictions.reduce((sum, p) => sum + p.upper, 0)
            
            const date = new Date()
            date.setMonth(date.getMonth() + i + 1)
            
            // Confidence decreases over time
            const baseConfidence = data.confidence?.score * 100 || 75
            const timeDecay = 1 - (i * 0.05)
            
            monthlyForecasts.push({
              period: date.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }),
              predicted: monthTotal,
              lower_bound: monthLower,
              upper_bound: monthUpper,
              confidence: Math.max(50, baseConfidence * timeDecay)
            })
          }
        }
        
        setForecasts(monthlyForecasts)
      } else {
        const errData = await forecastRes.json()
        setError(errData.error || 'Failed to load forecast')
      }
    } catch (err) {
      console.error('Error loading prediction data:', err)
      setError('Failed to connect to forecast API')
    } finally {
      setLoading(false)
    }
  }

  const renderChart = () => {
    if (!chartRef.current) return

    if (chartInstance.current) {
      chartInstance.current.destroy()
    }

    const ctx = chartRef.current.getContext('2d')
    if (!ctx) return

    // Prepare historical data (last 30 days)
    const recentHistory = historicalData.slice(-30)
    const historyLabels = recentHistory.map(d => {
      const parts = d.date.split('-')
      if (parts.length === 3) {
        return `${parts[0]}/${parts[1]}`
      }
      return d.date
    })
    const historyValues = recentHistory.map(d => d.count)

    // Prepare forecast data
    const forecastLabels = forecasts.map(f => f.period)
    const forecastValues = forecasts.map(f => f.predicted)
    const lowerBounds = forecasts.map(f => f.lower_bound)
    const upperBounds = forecasts.map(f => f.upper_bound)

    // Combine labels
    const allLabels = [...historyLabels, ...forecastLabels]

    chartInstance.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: allLabels,
        datasets: [
          {
            label: 'Historical',
            data: [...historyValues, ...Array(forecastLabels.length).fill(null)],
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            fill: true,
            tension: 0.4,
            pointRadius: 2,
            borderWidth: 2
          },
          {
            label: 'Predicted',
            data: [...Array(historyLabels.length - 1).fill(null), historyValues[historyValues.length - 1], ...forecastValues],
            borderColor: '#f97316',
            backgroundColor: 'rgba(249, 115, 22, 0.15)',
            fill: true,
            tension: 0.4,
            borderDash: [6, 4],
            pointRadius: 4,
            borderWidth: 2
          },
          {
            label: 'Confidence Band',
            data: [...Array(historyLabels.length).fill(null), ...upperBounds],
            borderColor: 'rgba(249, 115, 22, 0.2)',
            backgroundColor: 'rgba(249, 115, 22, 0.05)',
            fill: '+1',
            tension: 0.4,
            borderDash: [2, 2],
            pointRadius: 0,
            borderWidth: 1
          },
          {
            label: 'Lower Bound',
            data: [...Array(historyLabels.length).fill(null), ...lowerBounds],
            borderColor: 'rgba(249, 115, 22, 0.2)',
            backgroundColor: 'transparent',
            fill: false,
            tension: 0.4,
            borderDash: [2, 2],
            pointRadius: 0,
            borderWidth: 1
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: {
              usePointStyle: true,
              filter: (item) => item.text === 'Historical' || item.text === 'Predicted'
            }
          },
          tooltip: {
            mode: 'index',
            intersect: false,
            callbacks: {
              label: (context) => {
                const value = context.raw as number
                if (value === null) return ''
                return `${context.dataset.label}: ${value.toLocaleString()}`
              }
            }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { maxTicksLimit: 12 }
          },
          y: {
            grid: { color: '#f3f4f6' },
            ticks: {
              callback: (value) => {
                const num = Number(value)
                if (num >= 10000000) return (num / 10000000).toFixed(1) + 'Cr'
                if (num >= 100000) return (num / 100000).toFixed(1) + 'L'
                if (num >= 1000) return (num / 1000).toFixed(0) + 'K'
                return num.toString()
              }
            }
          }
        },
        interaction: {
          mode: 'nearest',
          axis: 'x',
          intersect: false
        }
      }
    })
  }

  const totalPredicted = forecasts.reduce((sum, f) => sum + f.predicted, 0)
  const avgConfidence = forecasts.length > 0 
    ? forecasts.reduce((sum, f) => sum + f.confidence, 0) / forecasts.length 
    : 0

  const growthRate = forecastResponse?.forecast?.summary?.growth_rate_percent || currentMetrics?.daily_growth_rate || 0
  const trendDirection = forecastResponse?.trend?.direction || 'stable'
  const trendStrength = forecastResponse?.trend?.strength || 'moderate'

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
          <span className="text-gray-900 font-medium">Predictive Analytics</span>
        </div>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-lg shadow-purple-500/25">
                <SparklesIcon className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Predictive Analytics</h1>
                <p className="text-gray-600">AI-powered enrolment forecasting from real data</p>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-3">
              <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full flex items-center gap-1">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                Live Model
              </span>
              <span className="px-3 py-1 bg-purple-100 text-purple-700 text-sm font-medium rounded-full">
                {forecastResponse?.confidence?.model || 'Exponential Smoothing'}
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-3 mt-4 md:mt-0">
            <div className="flex bg-white border border-gray-200 p-1 rounded-xl">
              {[
                { value: '3', label: '3M' },
                { value: '6', label: '6M' },
                { value: '12', label: '12M' }
              ].map(period => (
                <button
                  key={period.value}
                  onClick={() => setForecastPeriod(period.value as any)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                    forecastPeriod === period.value 
                      ? 'bg-purple-500 text-white shadow-sm' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {period.label}
                </button>
              ))}
            </div>

            <button
              onClick={loadData}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl hover:from-purple-600 hover:to-purple-700 disabled:opacity-50 transition-all shadow-lg shadow-purple-500/25"
            >
              <RefreshCwIcon className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
            <AlertTriangleIcon className="w-5 h-5 text-red-500" />
            <p className="text-red-700">{error}</p>
            <button onClick={loadData} className="ml-auto text-red-600 hover:text-red-800 text-sm font-medium">
              Retry
            </button>
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-purple-100 rounded-xl">
                <CalendarIcon className="w-5 h-5 text-purple-600" />
              </div>
              <span className="text-sm text-gray-500">Forecast</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{forecastPeriod} Months</p>
            <p className="text-xs text-gray-400 mt-1">{parseInt(forecastPeriod) * 30} days ahead</p>
          </div>
          
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-orange-100 rounded-xl">
                <TrendingUpIcon className="w-5 h-5 text-orange-600" />
              </div>
              <span className="text-sm text-gray-500">Predicted</span>
            </div>
            <p className="text-2xl font-bold text-orange-600">
              {loading ? <Loader2Icon className="w-6 h-6 animate-spin" /> : formatNumber(totalPredicted)}
            </p>
            <p className="text-xs text-gray-400 mt-1">Total enrolments</p>
          </div>
          
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-green-100 rounded-xl">
                <TargetIcon className="w-5 h-5 text-green-600" />
              </div>
              <span className="text-sm text-gray-500">Confidence</span>
            </div>
            <p className="text-2xl font-bold text-green-600">
              {loading ? '...' : avgConfidence.toFixed(0)}%
            </p>
            <p className="text-xs text-gray-400 mt-1">Model accuracy</p>
          </div>
          
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className={`p-2 rounded-xl ${growthRate >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                {growthRate >= 0 ? <ArrowUpIcon className="w-5 h-5 text-green-600" /> : <ArrowDownIcon className="w-5 h-5 text-red-600" />}
              </div>
              <span className="text-sm text-gray-500">Growth</span>
            </div>
            <p className={`text-2xl font-bold ${growthRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {growthRate >= 0 ? '+' : ''}{growthRate.toFixed(2)}%
            </p>
            <p className="text-xs text-gray-400 mt-1">Monthly rate</p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-blue-100 rounded-xl">
                <ActivityIcon className="w-5 h-5 text-blue-600" />
              </div>
              <span className="text-sm text-gray-500">Trend</span>
            </div>
            <p className="text-2xl font-bold text-blue-600 capitalize">{trendDirection}</p>
            <p className="text-xs text-gray-400 mt-1 capitalize">{trendStrength} strength</p>
          </div>
        </div>

        {/* Main Chart */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <BarChart3Icon className="w-5 h-5 text-purple-500" />
              Enrolment Forecast
            </h2>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-gray-600">Historical</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                <span className="text-gray-600">Predicted</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-3 bg-orange-100 border border-orange-200 rounded"></div>
                <span className="text-gray-600">Confidence Band</span>
              </div>
            </div>
          </div>
          
          {loading ? (
            <div className="h-[400px] flex items-center justify-center">
              <div className="text-center">
                <Loader2Icon className="w-10 h-10 text-purple-500 animate-spin mx-auto mb-3" />
                <p className="text-gray-500">Generating forecast...</p>
              </div>
            </div>
          ) : (
            <div className="h-[400px]">
              <canvas ref={chartRef}></canvas>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Forecast Details Table */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">Monthly Forecast Details</h2>
            </div>
            
            {loading ? (
              <div className="p-12 text-center">
                <Loader2Icon className="w-8 h-8 text-purple-500 animate-spin mx-auto" />
              </div>
            ) : forecasts.length === 0 ? (
              <div className="p-12 text-center text-gray-500">
                <AlertTriangleIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No forecast data available</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Period</th>
                      <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Predicted</th>
                      <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Range</th>
                      <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Confidence</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {forecasts.map((forecast, index) => (
                      <tr key={index} className="hover:bg-orange-50/50 transition-colors">
                        <td className="py-4 px-4 font-medium text-gray-900">{forecast.period}</td>
                        <td className="py-4 px-4 text-right">
                          <span className="text-lg font-bold text-orange-600">{formatNumber(forecast.predicted)}</span>
                        </td>
                        <td className="py-4 px-4 text-right text-sm text-gray-500">
                          {formatNumber(forecast.lower_bound)} - {formatNumber(forecast.upper_bound)}
                        </td>
                        <td className="py-4 px-4 text-right">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            forecast.confidence >= 75 ? 'bg-green-100 text-green-700' :
                            forecast.confidence >= 60 ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {forecast.confidence.toFixed(0)}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Model Info */}
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <SparklesIcon className="w-5 h-5" />
                AI Model Status
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-purple-200">Model Type</span>
                  <span className="font-medium">{forecastResponse?.confidence?.model || 'Exponential Smoothing'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-purple-200">Data Points</span>
                  <span className="font-medium">{forecastResponse?.confidence?.data_points || historicalData.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-purple-200">Historical Mean</span>
                  <span className="font-medium">{formatNumber(forecastResponse?.historical?.mean || 0)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-purple-200">Std Deviation</span>
                  <span className="font-medium">{formatNumber(forecastResponse?.historical?.std_dev || 0)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-purple-200">Seasonal Pattern</span>
                  <span className="font-medium">{forecastResponse?.seasonal?.has_pattern ? 'Detected' : 'None'}</span>
                </div>
              </div>
            </div>

            {forecastResponse && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <ZapIcon className="w-5 h-5 text-orange-500" />
                  Quick Insights
                </h3>
                <div className="space-y-3">
                  <div className="p-3 bg-blue-50 rounded-xl">
                    <p className="text-sm text-blue-800">
                      <span className="font-medium">Next Week:</span> {formatNumber(forecastResponse.forecast.summary.next_week_total)} expected
                    </p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-xl">
                    <p className="text-sm text-green-800">
                      <span className="font-medium">Next Month:</span> {formatNumber(forecastResponse.forecast.summary.next_month_total)} expected
                    </p>
                  </div>
                  <div className="p-3 bg-orange-50 rounded-xl">
                    <p className="text-sm text-orange-800">
                      <span className="font-medium">Daily Avg:</span> {formatNumber(forecastResponse.forecast.summary.daily_average_predicted)} predicted
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Insights Section */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <InfoIcon className="w-5 h-5 text-purple-500" />
            Forecast Methodology
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 bg-purple-50 rounded-xl">
              <p className="font-medium text-purple-900">Algorithm</p>
              <p className="text-sm text-purple-700 mt-1">Exponential Smoothing with trend adjustment</p>
            </div>
            <div className="p-4 bg-blue-50 rounded-xl">
              <p className="font-medium text-blue-900">Training Data</p>
              <p className="text-sm text-blue-700 mt-1">Last 90 days of enrolment data</p>
            </div>
            <div className="p-4 bg-green-50 rounded-xl">
              <p className="font-medium text-green-900">Confidence Bands</p>
              <p className="text-sm text-green-700 mt-1">95% prediction interval (±1.96σ)</p>
            </div>
            <div className="p-4 bg-orange-50 rounded-xl">
              <p className="font-medium text-orange-900">Update Frequency</p>
              <p className="text-sm text-orange-700 mt-1">Real-time with each data refresh</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
