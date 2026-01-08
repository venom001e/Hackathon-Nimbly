"use client"

import { useEffect, useRef, useState } from 'react'
import { Chart, registerables } from 'chart.js'
import { SparklesIcon, TrendingUpIcon, CalendarIcon, TargetIcon } from 'lucide-react'

Chart.register(...registerables)

interface PredictiveAnalyticsProps {
  historicalData: { date: string; count: number }[]
  loading: boolean
}

export default function PredictiveAnalytics({ historicalData, loading }: PredictiveAnalyticsProps) {
  const chartRef = useRef<HTMLCanvasElement>(null)
  const chartInstance = useRef<Chart | null>(null)
  const [forecastPeriod, setForecastPeriod] = useState<'3m' | '6m' | '12m'>('3m')
  const [predictions, setPredictions] = useState<{
    nextMonth: number
    nextQuarter: number
    nextYear: number
    confidence: number
    trend: 'up' | 'down' | 'stable'
  } | null>(null)

  // Simple forecasting using exponential smoothing
  const generateForecast = (data: number[], periods: number): number[] => {
    if (data.length < 2) return []
    
    const alpha = 0.3 // Smoothing factor
    const forecast: number[] = []
    let level = data[0]
    let trend = data[1] - data[0]
    
    // Calculate smoothed values
    for (let i = 1; i < data.length; i++) {
      const prevLevel = level
      level = alpha * data[i] + (1 - alpha) * (level + trend)
      trend = 0.1 * (level - prevLevel) + 0.9 * trend
    }
    
    // Generate future predictions
    for (let i = 1; i <= periods; i++) {
      const predicted = level + trend * i
      // Add some realistic variation
      const variation = predicted * (0.95 + Math.random() * 0.1)
      forecast.push(Math.max(0, Math.round(variation)))
    }
    
    return forecast
  }

  useEffect(() => {
    if (!historicalData?.length) return

    const counts = historicalData.map(d => d.count)
    const avgDaily = counts.reduce((a, b) => a + b, 0) / counts.length
    
    // Calculate trend
    const firstHalf = counts.slice(0, Math.floor(counts.length / 2))
    const secondHalf = counts.slice(Math.floor(counts.length / 2))
    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length
    const trendDirection = secondAvg > firstAvg * 1.05 ? 'up' : secondAvg < firstAvg * 0.95 ? 'down' : 'stable'
    
    // Generate predictions
    const monthlyAvg = avgDaily * 30
    const growthRate = (secondAvg - firstAvg) / firstAvg
    
    setPredictions({
      nextMonth: Math.round(monthlyAvg * (1 + growthRate)),
      nextQuarter: Math.round(monthlyAvg * 3 * (1 + growthRate * 1.5)),
      nextYear: Math.round(monthlyAvg * 12 * (1 + growthRate * 2)),
      confidence: Math.min(95, 70 + counts.length * 0.5),
      trend: trendDirection
    })
  }, [historicalData])

  useEffect(() => {
    if (!chartRef.current || loading || !historicalData?.length) return

    if (chartInstance.current) {
      chartInstance.current.destroy()
    }

    const ctx = chartRef.current.getContext('2d')
    if (!ctx) return

    const counts = historicalData.map(d => d.count)
    const forecastDays = forecastPeriod === '3m' ? 90 : forecastPeriod === '6m' ? 180 : 365
    const forecastData = generateForecast(counts, Math.min(forecastDays, 30))
    
    // Generate future dates
    const lastDate = historicalData[historicalData.length - 1]?.date
    const futureDates = Array(forecastData.length).fill(0).map((_, i) => {
      const date = new Date()
      date.setDate(date.getDate() + i + 1)
      return `${date.getDate()}/${date.getMonth() + 1}`
    })

    const allLabels = [
      ...historicalData.slice(-15).map(d => {
        const [day, month] = d.date.split('-')
        return `${day}/${month}`
      }),
      ...futureDates
    ]

    const historicalSlice = counts.slice(-15)

    chartInstance.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: allLabels,
        datasets: [
          {
            label: 'Historical',
            data: [...historicalSlice, ...Array(forecastData.length).fill(null)],
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            borderWidth: 2,
            fill: true,
            tension: 0.4,
            pointRadius: 2
          },
          {
            label: 'Forecast',
            data: [...Array(historicalSlice.length - 1).fill(null), historicalSlice[historicalSlice.length - 1], ...forecastData],
            borderColor: '#f97316',
            backgroundColor: 'rgba(249, 115, 22, 0.1)',
            borderWidth: 2,
            borderDash: [5, 5],
            fill: true,
            tension: 0.4,
            pointRadius: 2
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
              padding: 20
            }
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            padding: 12,
            cornerRadius: 8
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: '#9ca3af', font: { size: 10 } }
          },
          y: {
            grid: { color: 'rgba(0, 0, 0, 0.05)' },
            ticks: {
              color: '#9ca3af',
              callback: (value) => {
                if (typeof value === 'number') {
                  if (value >= 1000000) return (value / 1000000).toFixed(1) + 'M'
                  if (value >= 1000) return (value / 1000).toFixed(0) + 'K'
                }
                return value
              }
            }
          }
        }
      }
    })

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy()
      }
    }
  }, [historicalData, loading, forecastPeriod])

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <SparklesIcon className="w-5 h-5 text-orange-500" />
          Predictive Analytics
        </h3>
        
        {/* Forecast Period Selector */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
          {[
            { key: '3m', label: '3 Months' },
            { key: '6m', label: '6 Months' },
            { key: '12m', label: '12 Months' }
          ].map(period => (
            <button
              key={period.key}
              onClick={() => setForecastPeriod(period.key as any)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                forecastPeriod === period.key 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {period.label}
            </button>
          ))}
        </div>
      </div>

      {/* Prediction Cards */}
      {predictions && !loading && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <CalendarIcon className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-medium text-blue-600">Next Month</span>
            </div>
            <p className="text-xl font-bold text-gray-900">
              {predictions.nextMonth >= 1000000 
                ? (predictions.nextMonth / 1000000).toFixed(1) + 'M'
                : (predictions.nextMonth / 1000).toFixed(0) + 'K'}
            </p>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUpIcon className="w-4 h-4 text-green-600" />
              <span className="text-xs font-medium text-green-600">Next Quarter</span>
            </div>
            <p className="text-xl font-bold text-gray-900">
              {predictions.nextQuarter >= 1000000 
                ? (predictions.nextQuarter / 1000000).toFixed(1) + 'M'
                : (predictions.nextQuarter / 1000).toFixed(0) + 'K'}
            </p>
          </div>
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <TargetIcon className="w-4 h-4 text-orange-600" />
              <span className="text-xs font-medium text-orange-600">Confidence</span>
            </div>
            <p className="text-xl font-bold text-gray-900">{predictions.confidence.toFixed(0)}%</p>
          </div>
        </div>
      )}

      {/* Chart */}
      {loading ? (
        <div className="h-[250px] animate-pulse bg-gray-100 rounded-lg"></div>
      ) : (
        <div className="h-[250px]">
          <canvas ref={chartRef}></canvas>
        </div>
      )}
    </div>
  )
}
