"use client"

import { useState, useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { MapPinIcon, TrendingUpIcon, TrendingDownIcon } from 'lucide-react'
import { ShimmerSkeleton } from '@/components/ui/loading-animations'

interface StateData {
  state: string
  count: number
  totalEnrolments?: number
  age_0_5?: number
  age_5_17?: number
  age_18_greater?: number
  districts?: number
}

interface StateHeatmapProps {
  data: StateData[]
  loading: boolean
  onStateSelect?: (state: string) => void
}

export default function StateHeatmap({ data, loading, onStateSelect }: StateHeatmapProps) {
  const [selectedState, setSelectedState] = useState<string | null>(null)
  const [hoveredState, setHoveredState] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const tilesRef = useRef<(HTMLButtonElement | null)[]>([])
  const detailsRef = useRef<HTMLDivElement>(null)

  const maxCount = Math.max(...data.map(d => d.count || d.totalEnrolments || 0))

  // Animate tiles on load
  useEffect(() => {
    if (!loading && data.length > 0) {
      tilesRef.current.forEach((tile, i) => {
        if (tile) {
          gsap.fromTo(tile,
            { opacity: 0, scale: 0.8, y: 10 },
            { 
              opacity: 1, 
              scale: 1, 
              y: 0, 
              duration: 0.3, 
              delay: i * 0.02, 
              ease: "back.out(1.5)" 
            }
          )
        }
      })
    }
  }, [loading, data.length])

  // Animate details panel
  useEffect(() => {
    if (detailsRef.current && selectedState) {
      gsap.fromTo(detailsRef.current,
        { opacity: 0, y: 20, height: 0 },
        { opacity: 1, y: 0, height: 'auto', duration: 0.4, ease: "power2.out" }
      )
    }
  }, [selectedState])
  
  const getHeatColor = (count: number) => {
    const intensity = count / maxCount
    if (intensity > 0.8) return 'bg-orange-600 text-white'
    if (intensity > 0.6) return 'bg-orange-500 text-white'
    if (intensity > 0.4) return 'bg-orange-400 text-white'
    if (intensity > 0.2) return 'bg-orange-300 text-gray-800'
    return 'bg-orange-100 text-gray-700'
  }

  const handleStateClick = (state: string) => {
    setSelectedState(state === selectedState ? null : state)
    onStateSelect?.(state === selectedState ? '' : state)
  }

  const selectedStateData = data.find(d => d.state === selectedState)

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <MapPinIcon className="w-5 h-5 text-orange-500" />
          State-wise Heatmap
        </h3>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span>Low</span>
          <div className="flex gap-0.5">
            <div className="w-4 h-4 bg-orange-100 rounded"></div>
            <div className="w-4 h-4 bg-orange-300 rounded"></div>
            <div className="w-4 h-4 bg-orange-400 rounded"></div>
            <div className="w-4 h-4 bg-orange-500 rounded"></div>
            <div className="w-4 h-4 bg-orange-600 rounded"></div>
          </div>
          <span>High</span>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
          {Array(36).fill(0).map((_, i) => (
            <ShimmerSkeleton key={i} className="h-16 rounded-lg" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2 mb-6">
            {data.slice(0, 36).map((item, index) => {
              const count = item.count || item.totalEnrolments || 0
              const isSelected = selectedState === item.state
              const isHovered = hoveredState === item.state
              
              return (
                <button
                  key={item.state}
                  ref={el => { tilesRef.current[index] = el }}
                  onClick={() => handleStateClick(item.state)}
                  onMouseEnter={() => setHoveredState(item.state)}
                  onMouseLeave={() => setHoveredState(null)}
                  className={`
                    relative p-2 md:p-3 rounded-lg transition-all duration-200 text-center
                    ${getHeatColor(count)}
                    ${isSelected ? 'ring-2 ring-orange-600 ring-offset-2 scale-105' : ''}
                    ${isHovered ? 'scale-105 shadow-lg' : ''}
                    hover:shadow-md cursor-pointer
                  `}
                  style={{ opacity: 0 }}
                >
                  <div className="text-[9px] md:text-[10px] font-medium truncate">
                    {item.state.length > 10 ? item.state.slice(0, 8) + '..' : item.state}
                  </div>
                  <div className="text-xs md:text-sm font-bold mt-1">
                    {count >= 1000000 
                      ? (count / 1000000).toFixed(1) + 'M'
                      : count >= 1000 
                        ? (count / 1000).toFixed(0) + 'K'
                        : count}
                  </div>
                </button>
              )
            })}
          </div>

          {/* Selected State Details */}
          {selectedStateData && (
            <div 
              ref={detailsRef}
              className="mt-4 p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl border border-orange-100 overflow-hidden"
              style={{ opacity: 0 }}
            >
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-gray-900">{selectedStateData.state}</h4>
                <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full">
                  {selectedStateData.districts || 0} Districts
                </span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Total Enrolments</p>
                  <p className="text-lg font-bold text-gray-900">
                    {(selectedStateData.count || selectedStateData.totalEnrolments || 0).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Age 0-5</p>
                  <p className="text-lg font-bold text-blue-600">
                    {(selectedStateData.age_0_5 || 0).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Age 5-17</p>
                  <p className="text-lg font-bold text-green-600">
                    {(selectedStateData.age_5_17 || 0).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Age 18+</p>
                  <p className="text-lg font-bold text-orange-600">
                    {(selectedStateData.age_18_greater || 0).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
