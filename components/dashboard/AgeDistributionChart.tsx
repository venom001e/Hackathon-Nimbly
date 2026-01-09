"use client"

import { useEffect, useRef } from 'react'
import { Chart, registerables } from 'chart.js'
import { UsersIcon } from 'lucide-react'

Chart.register(...registerables)

interface AgeDistributionChartProps {
  data: {
    age_0_5: { count: number; percentage: number }
    age_5_17: { count: number; percentage: number }
    age_18_greater: { count: number; percentage: number }
  } | null
  loading: boolean
}

export default function AgeDistributionChart({ data, loading }: AgeDistributionChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null)
  const chartInstance = useRef<Chart | null>(null)

  useEffect(() => {
    if (!chartRef.current || loading || !data) return

    if (chartInstance.current) {
      chartInstance.current.destroy()
    }

    const ctx = chartRef.current.getContext('2d')
    if (!ctx) return

    chartInstance.current = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['0-5 Years', '5-17 Years', '18+ Years'],
        datasets: [{
          data: [data.age_0_5.count, data.age_5_17.count, data.age_18_greater.count],
          backgroundColor: [
            'rgba(59, 130, 246, 0.8)',
            'rgba(34, 197, 94, 0.8)',
            'rgba(249, 115, 22, 0.8)'
          ],
          borderColor: [
            'rgba(59, 130, 246, 1)',
            'rgba(34, 197, 94, 1)',
            'rgba(249, 115, 22, 1)'
          ],
          borderWidth: 2,
          hoverOffset: 10
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '65%',
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            padding: 12,
            cornerRadius: 8,
            callbacks: {
              label: (context) => {
                const value = context.parsed
                const total = data.age_0_5.count + data.age_5_17.count + data.age_18_greater.count
                const percentage = ((value / total) * 100).toFixed(1)
                return `${value.toLocaleString()} (${percentage}%)`
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
  }, [data, loading])

  const ageGroups = data ? [
    { label: '0-5 Years', count: data.age_0_5.count, percentage: data.age_0_5.percentage, color: 'bg-blue-500' },
    { label: '5-17 Years', count: data.age_5_17.count, percentage: data.age_5_17.percentage, color: 'bg-green-500' },
    { label: '18+ Years', count: data.age_18_greater.count, percentage: data.age_18_greater.percentage, color: 'bg-orange-500' }
  ] : []

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
      <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4 sm:mb-6">
        <UsersIcon className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500" />
        Age Distribution
      </h3>

      {loading ? (
        <div className="h-[200px] sm:h-[250px] animate-pulse bg-gray-100 rounded-lg"></div>
      ) : (
        <div className="flex flex-col lg:flex-row items-center gap-4 sm:gap-6">
          <div className="w-40 h-40 sm:w-48 sm:h-48 flex-shrink-0">
            <canvas ref={chartRef}></canvas>
          </div>
          
          <div className="flex-1 w-full space-y-3">
            {ageGroups.map(group => (
              <div key={group.label} className="flex items-center gap-2 sm:gap-3">
                <div className={`w-3 h-3 rounded-full ${group.color} flex-shrink-0`}></div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs sm:text-sm font-medium text-gray-700 truncate">{group.label}</span>
                    <span className="text-xs sm:text-sm font-bold text-gray-900 ml-2">{group.count.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${group.color}`}
                      style={{ width: `${group.percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-500">{group.percentage.toFixed(1)}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
