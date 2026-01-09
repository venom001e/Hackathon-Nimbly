"use client"

import { useEffect, useRef } from 'react'
import { Chart, registerables } from 'chart.js'
import { gsap } from 'gsap'
import { ChartSkeleton } from '@/components/ui/loading-animations'

Chart.register(...registerables)

interface TrendChartProps {
  data: { date: string; count: number }[]
  title: string
  loading: boolean
}

export default function TrendChart({ data, title, loading }: TrendChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null)
  const chartInstance = useRef<Chart | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!chartRef.current || loading || !data?.length) return

    // Animate container in
    if (containerRef.current) {
      gsap.fromTo(containerRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }
      )
    }

    // Destroy existing chart
    if (chartInstance.current) {
      chartInstance.current.destroy()
    }

    const ctx = chartRef.current.getContext('2d')
    if (!ctx) return

    // Create gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, 300)
    gradient.addColorStop(0, 'rgba(249, 115, 22, 0.3)')
    gradient.addColorStop(1, 'rgba(249, 115, 22, 0.01)')

    chartInstance.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: data.map(d => {
          const [day, month] = d.date.split('-')
          return `${day}/${month}`
        }),
        datasets: [{
          label: 'Enrolments',
          data: data.map(d => d.count),
          borderColor: '#f97316',
          backgroundColor: gradient,
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointRadius: 0,
          pointHoverRadius: 6,
          pointHoverBackgroundColor: '#f97316',
          pointHoverBorderColor: '#fff',
          pointHoverBorderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
          duration: 1500,
          easing: 'easeOutQuart',
          delay: (context) => context.dataIndex * 20
        },
        interaction: {
          intersect: false,
          mode: 'index'
        },
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleColor: '#fff',
            bodyColor: '#fff',
            padding: 12,
            cornerRadius: 8,
            displayColors: false,
            callbacks: {
              label: (context) => `${context.parsed.y?.toLocaleString() ?? 0} enrolments`
            }
          }
        },
        scales: {
          x: {
            grid: {
              display: false
            },
            ticks: {
              color: '#9ca3af',
              font: { size: window.innerWidth < 640 ? 9 : 11 },
              maxTicksLimit: window.innerWidth < 640 ? 6 : 10
            }
          },
          y: {
            grid: {
              color: 'rgba(0, 0, 0, 0.05)'
            },
            ticks: {
              color: '#9ca3af',
              font: { size: window.innerWidth < 640 ? 9 : 11 },
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
  }, [data, loading])

  if (loading) {
    return <ChartSkeleton height="h-[380px]" />
  }

  return (
    <div 
      ref={containerRef}
      className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 hover:shadow-lg transition-shadow duration-300"
      style={{ opacity: 0 }}
    >
      <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">{title}</h3>
      <div className="h-[250px] sm:h-[300px]">
        <canvas ref={chartRef}></canvas>
      </div>
    </div>
  )
}
