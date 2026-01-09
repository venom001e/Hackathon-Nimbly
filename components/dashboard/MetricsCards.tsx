"use client"

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { UsersIcon, TrendingUpIcon, AlertTriangleIcon, BarChart3Icon, MapPinIcon, CalendarIcon } from 'lucide-react'
import { MetricCardSkeleton } from '@/components/ui/loading-animations'

interface MetricsCardsProps {
  totalEnrolments: number
  dailyGrowthRate: number
  anomalyCount: number
  predictionAccuracy: number
  uniqueStates: number
  loading: boolean
}

export default function MetricsCards({ 
  totalEnrolments, 
  dailyGrowthRate, 
  anomalyCount, 
  predictionAccuracy,
  uniqueStates,
  loading 
}: MetricsCardsProps) {
  const cardsRef = useRef<(HTMLDivElement | null)[]>([])
  const countersRef = useRef<(HTMLDivElement | null)[]>([])

  const metrics = [
    {
      title: 'Total Enrolments',
      value: totalEnrolments || 0,
      displayValue: totalEnrolments?.toLocaleString() || '0',
      icon: UsersIcon,
      color: 'blue',
      bgGradient: 'from-blue-500 to-blue-600',
      change: '+12.5%',
      changeType: 'positive'
    },
    {
      title: 'Daily Growth Rate',
      value: dailyGrowthRate || 0,
      displayValue: `${dailyGrowthRate?.toFixed(2) || '0'}%`,
      icon: TrendingUpIcon,
      color: 'green',
      bgGradient: 'from-green-500 to-green-600',
      change: dailyGrowthRate > 0 ? 'Growing' : 'Declining',
      changeType: dailyGrowthRate > 0 ? 'positive' : 'negative'
    },
    {
      title: 'Active Anomalies',
      value: anomalyCount || 0,
      displayValue: anomalyCount?.toString() || '0',
      icon: AlertTriangleIcon,
      color: 'red',
      bgGradient: 'from-red-500 to-red-600',
      change: anomalyCount > 0 ? 'Needs Review' : 'All Clear',
      changeType: anomalyCount > 0 ? 'negative' : 'positive'
    },
    {
      title: 'Prediction Accuracy',
      value: predictionAccuracy || 0,
      displayValue: `${predictionAccuracy?.toFixed(1) || '0'}%`,
      icon: BarChart3Icon,
      color: 'purple',
      bgGradient: 'from-purple-500 to-purple-600',
      change: 'High Confidence',
      changeType: 'positive'
    },
    {
      title: 'States Covered',
      value: uniqueStates || 0,
      displayValue: uniqueStates?.toString() || '0',
      icon: MapPinIcon,
      color: 'orange',
      bgGradient: 'from-orange-500 to-orange-600',
      change: 'All India',
      changeType: 'neutral'
    },
    {
      title: 'Data Freshness',
      value: 0,
      displayValue: 'Live',
      icon: CalendarIcon,
      color: 'teal',
      bgGradient: 'from-teal-500 to-teal-600',
      change: 'Real-time',
      changeType: 'positive'
    }
  ]

  useEffect(() => {
    if (!loading) {
      // Stagger animation for cards
      cardsRef.current.forEach((card, i) => {
        if (card) {
          gsap.fromTo(card,
            { opacity: 0, y: 30, scale: 0.95 },
            { opacity: 1, y: 0, scale: 1, duration: 0.5, delay: i * 0.08, ease: "power2.out" }
          )
        }
      })

      // Animate counters
      countersRef.current.forEach((counter, i) => {
        if (counter && metrics[i].value > 0) {
          const target = metrics[i].value
          gsap.fromTo(counter,
            { innerText: 0 },
            {
              innerText: target,
              duration: 1.5,
              delay: i * 0.08 + 0.3,
              snap: { innerText: 1 },
              ease: "power2.out",
              onUpdate: function() {
                if (counter) {
                  const val = Math.round(Number(counter.innerText))
                  if (metrics[i].title === 'Total Enrolments') {
                    counter.innerText = val.toLocaleString()
                  } else if (metrics[i].title.includes('Rate') || metrics[i].title.includes('Accuracy')) {
                    counter.innerText = val.toFixed(1) + '%'
                  } else {
                    counter.innerText = val.toString()
                  }
                }
              }
            }
          )
        }
      })
    }
  }, [loading, totalEnrolments, dailyGrowthRate, anomalyCount, predictionAccuracy, uniqueStates])

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        {[...Array(6)].map((_, i) => (
          <MetricCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 md:gap-4 mb-6 md:mb-8">
      {metrics.map((metric, index) => (
        <div 
          key={metric.title}
          ref={el => { cardsRef.current[index] = el }}
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-5 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer group"
          style={{ opacity: 0 }}
        >
          <div className="flex items-center justify-between mb-2 md:mb-3">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              {metric.title}
            </span>
            <div className={`p-1.5 md:p-2 rounded-lg bg-gradient-to-br ${metric.bgGradient} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
              <metric.icon className="w-3.5 h-3.5 md:w-4 md:h-4 text-white" />
            </div>
          </div>
          <div 
            ref={el => { countersRef.current[index] = el }}
            className="text-xl md:text-2xl font-bold text-gray-900 mb-1"
          >
            {metric.displayValue}
          </div>
          <div className={`text-xs font-medium ${
            metric.changeType === 'positive' ? 'text-green-600' :
            metric.changeType === 'negative' ? 'text-red-600' :
            'text-gray-500'
          }`}>
            {metric.change}
          </div>
        </div>
      ))}
    </div>
  )
}
