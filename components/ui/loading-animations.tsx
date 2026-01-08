"use client"

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

// Aadhaar themed spinner
export function AadhaarSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = { sm: 'w-8 h-8', md: 'w-12 h-12', lg: 'w-16 h-16' }
  const outerRef = useRef<HTMLDivElement>(null)
  const innerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (outerRef.current) {
      gsap.to(outerRef.current, { rotation: 360, duration: 1, repeat: -1, ease: "none" })
    }
    if (innerRef.current) {
      gsap.to(innerRef.current, { rotation: -360, duration: 1.5, repeat: -1, ease: "none" })
    }
  }, [])

  return (
    <div className={`${sizes[size]} relative`}>
      <div className="absolute inset-0 rounded-full border-4 border-orange-200" />
      <div ref={outerRef} className="absolute inset-0 rounded-full border-4 border-transparent border-t-orange-500" />
      <div ref={innerRef} className="absolute inset-2 rounded-full border-2 border-transparent border-t-green-500" />
    </div>
  )
}

// Pulse dots loader
export function PulseDotsLoader() {
  const dotsRef = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    dotsRef.current.forEach((dot, i) => {
      if (dot) {
        gsap.to(dot, {
          scale: 1.3,
          opacity: 1,
          duration: 0.4,
          repeat: -1,
          yoyo: true,
          delay: i * 0.15,
          ease: "power1.inOut"
        })
      }
    })
  }, [])

  return (
    <div className="flex items-center gap-1.5">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          ref={el => { dotsRef.current[i] = el }}
          className="w-2.5 h-2.5 bg-orange-500 rounded-full opacity-50"
        />
      ))}
    </div>
  )
}

// Data loading skeleton with shimmer
export function ShimmerSkeleton({ className = '' }: { className?: string }) {
  const shimmerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (shimmerRef.current) {
      gsap.fromTo(shimmerRef.current, 
        { x: '-100%' },
        { x: '100%', duration: 1.5, repeat: -1, ease: "none" }
      )
    }
  }, [])

  return (
    <div className={`relative overflow-hidden bg-gray-200 rounded-lg ${className}`}>
      <div ref={shimmerRef} className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent" />
    </div>
  )
}


// Card skeleton for metrics
export function MetricCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <ShimmerSkeleton className="w-10 h-10 rounded-xl" />
        <ShimmerSkeleton className="w-16 h-5 rounded-full" />
      </div>
      <ShimmerSkeleton className="w-24 h-8 mb-2" />
      <ShimmerSkeleton className="w-32 h-4" />
    </div>
  )
}

// Chart skeleton
export function ChartSkeleton({ height = 'h-80' }: { height?: string }) {
  const barsRef = useRef<(HTMLDivElement | null)[]>([])
  const heights = [40, 65, 45, 80, 55, 70, 50, 85, 60, 75]

  useEffect(() => {
    barsRef.current.forEach((bar, i) => {
      if (bar) {
        gsap.fromTo(bar,
          { scaleY: 0 },
          { scaleY: 1, duration: 0.5, delay: i * 0.05, ease: "power2.out" }
        )
      }
    })
  }, [])

  return (
    <div className={`bg-white rounded-2xl p-6 shadow-sm border border-gray-100 ${height}`}>
      <div className="flex items-center justify-between mb-6">
        <ShimmerSkeleton className="w-40 h-6" />
        <ShimmerSkeleton className="w-24 h-8 rounded-lg" />
      </div>
      <div className="flex items-end gap-2 h-48">
        {heights.map((h, i) => (
          <div
            key={i}
            ref={el => { barsRef.current[i] = el }}
            className="flex-1 bg-gray-200 rounded-t-lg origin-bottom"
            style={{ height: `${h}%` }}
          />
        ))}
      </div>
    </div>
  )
}

// Full page loader
export function FullPageLoader({ message = 'Loading data...' }: { message?: string }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLParagraphElement>(null)

  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(containerRef.current, { opacity: 0 }, { opacity: 1, duration: 0.3 })
    }
    if (textRef.current) {
      gsap.to(textRef.current, { opacity: 0.5, duration: 0.75, repeat: -1, yoyo: true })
    }
  }, [])

  return (
    <div ref={containerRef} className="fixed inset-0 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center z-50">
      <AadhaarSpinner size="lg" />
      <p ref={textRef} className="mt-4 text-gray-600 font-medium">{message}</p>
    </div>
  )
}

// Animated number counter
export function AnimatedCounter({ value, duration = 1 }: { value: number; duration?: number }) {
  const counterRef = useRef<HTMLSpanElement>(null)
  const prevValue = useRef(0)

  useEffect(() => {
    if (counterRef.current) {
      gsap.fromTo(counterRef.current,
        { innerText: prevValue.current },
        {
          innerText: value,
          duration,
          snap: { innerText: 1 },
          ease: "power2.out",
          onUpdate: function() {
            if (counterRef.current) {
              counterRef.current.innerText = Math.round(Number(counterRef.current.innerText)).toLocaleString()
            }
          }
        }
      )
      prevValue.current = value
    }
  }, [value, duration])

  return <span ref={counterRef}>0</span>
}

// Fade in animation wrapper
export function FadeIn({ 
  children, 
  delay = 0,
  direction = 'up'
}: { 
  children: React.ReactNode
  delay?: number
  direction?: 'up' | 'down' | 'left' | 'right'
}) {
  const ref = useRef<HTMLDivElement>(null)
  const directions = {
    up: { y: 20, x: 0 },
    down: { y: -20, x: 0 },
    left: { x: 20, y: 0 },
    right: { x: -20, y: 0 }
  }

  useEffect(() => {
    if (ref.current) {
      gsap.fromTo(ref.current,
        { opacity: 0, ...directions[direction] },
        { opacity: 1, x: 0, y: 0, duration: 0.5, delay, ease: "power2.out" }
      )
    }
  }, [delay, direction])

  return <div ref={ref} style={{ opacity: 0 }}>{children}</div>
}

// Progress bar animation
export function AnimatedProgress({ value, color = 'orange' }: { value: number; color?: string }) {
  const barRef = useRef<HTMLDivElement>(null)
  const colors: Record<string, string> = {
    orange: 'bg-orange-500',
    green: 'bg-green-500',
    blue: 'bg-blue-500',
    purple: 'bg-purple-500'
  }

  useEffect(() => {
    if (barRef.current) {
      gsap.to(barRef.current, { width: `${value}%`, duration: 1, ease: "power2.out" })
    }
  }, [value])

  return (
    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
      <div ref={barRef} className={`h-full ${colors[color]} rounded-full`} style={{ width: 0 }} />
    </div>
  )
}

// Hover scale card
export function HoverCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const onEnter = () => gsap.to(el, { scale: 1.02, y: -4, duration: 0.2, ease: "power2.out" })
    const onLeave = () => gsap.to(el, { scale: 1, y: 0, duration: 0.2, ease: "power2.out" })

    el.addEventListener('mouseenter', onEnter)
    el.addEventListener('mouseleave', onLeave)
    return () => {
      el.removeEventListener('mouseenter', onEnter)
      el.removeEventListener('mouseleave', onLeave)
    }
  }, [])

  return <div ref={ref} className={className}>{children}</div>
}

// Data loading overlay for sections
export function LoadingOverlay({ show, message = 'Loading...' }: { show: boolean; message?: string }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (ref.current) {
      gsap.to(ref.current, { 
        opacity: show ? 1 : 0, 
        duration: 0.3,
        display: show ? 'flex' : 'none'
      })
    }
  }, [show])

  return (
    <div 
      ref={ref} 
      className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center rounded-2xl z-10"
      style={{ opacity: 0, display: 'none' }}
    >
      <div className="flex flex-col items-center gap-3">
        <AadhaarSpinner size="md" />
        <span className="text-sm text-gray-600 font-medium">{message}</span>
      </div>
    </div>
  )
}
