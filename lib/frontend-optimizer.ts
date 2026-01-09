'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

// Debounced hook for search inputs
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

// Optimized API fetcher with caching
export function useOptimizedFetch<T>(
  url: string,
  options: {
    dependencies?: any[]
    cacheTime?: number
    staleTime?: number
    enabled?: boolean
  } = {}
) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const cacheRef = useRef<Map<string, { data: T; timestamp: number }>>(new Map())
  
  const { dependencies = [], cacheTime = 5 * 60 * 1000, staleTime = 30 * 1000, enabled = true } = options

  const fetchData = useCallback(async () => {
    if (!enabled) return

    const cache = cacheRef.current
    const cached = cache.get(url)
    const now = Date.now()

    // Return cached data if still fresh
    if (cached && (now - cached.timestamp) < staleTime) {
      setData(cached.data)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      const responseData = result.success ? result.data : result

      // Cache the result
      cache.set(url, { data: responseData, timestamp: now })
      
      // Clean up old cache entries
      if (cache.size > 50) {
        const entries = Array.from(cache.entries())
        entries.sort((a, b) => a[1].timestamp - b[1].timestamp)
        entries.slice(0, 10).forEach(([key]) => cache.delete(key))
      }

      setData(responseData)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      console.error('Fetch error:', err)
    } finally {
      setLoading(false)
    }
  }, [url, enabled, staleTime])

  useEffect(() => {
    fetchData()
  }, [fetchData, ...dependencies])

  const refetch = useCallback(() => {
    cacheRef.current.delete(url)
    fetchData()
  }, [url, fetchData])

  return { data, loading, error, refetch }
}

// Virtual scrolling for large lists
export function useVirtualScroll<T>(
  items: T[],
  itemHeight: number,
  containerHeight: number
) {
  const [scrollTop, setScrollTop] = useState(0)
  
  const visibleItems = useMemo(() => {
    const startIndex = Math.floor(scrollTop / itemHeight)
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight) + 1,
      items.length
    )
    
    return {
      startIndex,
      endIndex,
      items: items.slice(startIndex, endIndex),
      totalHeight: items.length * itemHeight,
      offsetY: startIndex * itemHeight
    }
  }, [items, itemHeight, containerHeight, scrollTop])

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop)
  }, [])

  return {
    visibleItems,
    handleScroll,
    totalHeight: visibleItems.totalHeight
  }
}

// Intersection Observer for lazy loading
export function useIntersectionObserver(
  options: IntersectionObserverInit = {}
) {
  const [isIntersecting, setIsIntersecting] = useState(false)
  const [entry, setEntry] = useState<IntersectionObserverEntry | null>(null)
  const elementRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting)
        setEntry(entry)
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
        ...options
      }
    )

    observer.observe(element)

    return () => {
      observer.unobserve(element)
    }
  }, [options])

  return { elementRef, isIntersecting, entry }
}

// Optimized chart data processing
export function useChartDataProcessor<T>(
  rawData: T[],
  processor: (data: T[]) => any,
  dependencies: any[] = []
) {
  return useMemo(() => {
    if (!rawData || rawData.length === 0) return null
    
    const startTime = performance.now()
    const result = processor(rawData)
    const endTime = performance.now()
    
    if (endTime - startTime > 100) {
      console.warn(`Chart data processing took ${endTime - startTime}ms`)
    }
    
    return result
  }, [rawData, ...dependencies])
}

// Performance monitoring hook
export function usePerformanceMonitor(componentName: string) {
  const renderCount = useRef(0)
  const startTime = useRef(performance.now())

  useEffect(() => {
    renderCount.current += 1
    const endTime = performance.now()
    const renderTime = endTime - startTime.current
    
    if (renderTime > 16) { // More than one frame (60fps)
      console.warn(`${componentName} render took ${renderTime}ms (render #${renderCount.current})`)
    }
    
    startTime.current = performance.now()
  })

  return {
    renderCount: renderCount.current,
    logPerformance: (operation: string, time: number) => {
      if (time > 100) {
        console.warn(`${componentName} ${operation} took ${time}ms`)
      }
    }
  }
}

// Optimized state management for large datasets
export function useOptimizedState<T>(
  initialState: T,
  options: {
    batchUpdates?: boolean
    maxBatchSize?: number
    batchDelay?: number
  } = {}
) {
  const [state, setState] = useState<T>(initialState)
  const batchRef = useRef<Array<(prev: T) => T>>([])
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  
  const { batchUpdates = false, maxBatchSize = 10, batchDelay = 16 } = options

  const optimizedSetState = useCallback((updater: (prev: T) => T) => {
    if (!batchUpdates) {
      setState(updater)
      return
    }

    batchRef.current.push(updater)

    if (batchRef.current.length >= maxBatchSize) {
      // Flush immediately if batch is full
      const updates = batchRef.current
      batchRef.current = []
      
      setState(prev => updates.reduce((acc, update) => update(acc), prev))
    } else {
      // Schedule batch flush
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      
      timeoutRef.current = setTimeout(() => {
        const updates = batchRef.current
        batchRef.current = []
        
        if (updates.length > 0) {
          setState(prev => updates.reduce((acc, update) => update(acc), prev))
        }
      }, batchDelay)
    }
  }, [batchUpdates, maxBatchSize, batchDelay])

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return [state, optimizedSetState] as const
}