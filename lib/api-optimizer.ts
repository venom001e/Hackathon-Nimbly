import { NextResponse } from 'next/server'
import { cache } from './redis'
import { rateLimiters, getClientIdentifier } from './rate-limit'

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  meta?: {
    cached?: boolean
    timestamp: number
    processingTime?: number
    details?: any
  }
}

export class ApiOptimizer {
  // Optimized response with caching and compression
  static async createResponse<T>(
    data: T,
    options: {
      cacheKey?: string
      cacheTTL?: number
      compress?: boolean
      headers?: Record<string, string>
    } = {}
  ): Promise<NextResponse> {
    const startTime = Date.now()
    
    const response: ApiResponse<T> = {
      success: true,
      data,
      meta: {
        timestamp: startTime,
        cached: false
      }
    }

    // Set performance headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Response-Time': `${Date.now() - startTime}ms`,
      ...options.headers
    }

    // Add caching headers for client-side caching
    if (options.cacheKey) {
      headers['Cache-Control'] = `public, max-age=${options.cacheTTL || 300}, stale-while-revalidate=60`
      headers['ETag'] = `"${Buffer.from(options.cacheKey).toString('base64')}"`
    }

    // Add compression hint
    if (options.compress !== false) {
      headers['Content-Encoding'] = 'gzip'
    }

    response.meta!.processingTime = Date.now() - startTime

    return NextResponse.json(response, { headers })
  }

  // Error response with consistent format
  static createErrorResponse(
    error: string,
    status: number = 500,
    details?: any
  ): NextResponse {
    const response: ApiResponse = {
      success: false,
      error,
      meta: {
        timestamp: Date.now()
      }
    }

    if (process.env.NODE_ENV === 'development' && details) {
      response.meta!.details = details
    }

    return NextResponse.json(response, { 
      status,
      headers: {
        'Content-Type': 'application/json',
        'X-Error': 'true'
      }
    })
  }

  // Cached API handler wrapper
  static withCache<T>(
    handler: () => Promise<T>,
    cacheKey: string,
    ttl: number = 300
  ) {
    return async (): Promise<T> => {
      // Try cache first
      try {
        const cached = await cache.get<T>(cacheKey)
        if (cached) {
          return cached
        }
      } catch (error) {
        console.warn('Cache miss:', error)
      }

      // Execute handler
      const result = await handler()
      
      // Cache result
      await cache.set(cacheKey, result, ttl)
      
      return result
    }
  }

  // Rate limited API handler wrapper
  static withRateLimit(
    handler: (request: Request) => Promise<NextResponse>,
    limiterType: keyof typeof rateLimiters = 'api'
  ) {
    return async (request: Request): Promise<NextResponse> => {
      const identifier = getClientIdentifier(request)
      const limiter = rateLimiters[limiterType]
      const result = limiter(identifier)

      if (!result.allowed) {
        return NextResponse.json(
          {
            success: false,
            error: 'Rate limit exceeded',
            meta: {
              resetTime: result.resetTime,
              remaining: result.remaining
            }
          },
          {
            status: 429,
            headers: {
              'X-RateLimit-Limit': '100',
              'X-RateLimit-Remaining': result.remaining.toString(),
              'X-RateLimit-Reset': result.resetTime.toString(),
              'Retry-After': Math.ceil((result.resetTime - Date.now()) / 1000).toString()
            }
          }
        )
      }

      // Add rate limit headers to successful responses
      const response = await handler(request)
      response.headers.set('X-RateLimit-Limit', '100')
      response.headers.set('X-RateLimit-Remaining', result.remaining.toString())
      response.headers.set('X-RateLimit-Reset', result.resetTime.toString())

      return response
    }
  }

  // Batch processing for multiple requests
  static async batchProcess<T, R>(
    items: T[],
    processor: (item: T) => Promise<R>,
    batchSize: number = 10
  ): Promise<R[]> {
    const results: R[] = []
    
    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize)
      const batchResults = await Promise.all(
        batch.map(item => processor(item))
      )
      results.push(...batchResults)
    }
    
    return results
  }

  // Response streaming for large datasets
  static createStreamResponse<T>(
    dataGenerator: AsyncGenerator<T>,
    transform?: (item: T) => any
  ): Response {
    const encoder = new TextEncoder()
    
    const stream = new ReadableStream({
      async start(controller) {
        controller.enqueue(encoder.encode('{"success":true,"data":['))
        
        let first = true
        try {
          for await (const item of dataGenerator) {
            if (!first) {
              controller.enqueue(encoder.encode(','))
            }
            
            const data = transform ? transform(item) : item
            controller.enqueue(encoder.encode(JSON.stringify(data)))
            first = false
          }
        } catch (error) {
          controller.enqueue(encoder.encode(`],"error":"${error}","success":false}`))
        }
        
        controller.enqueue(encoder.encode(']}'))
        controller.close()
      }
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'application/json',
        'Transfer-Encoding': 'chunked'
      }
    })
  }
}

// Middleware for automatic performance monitoring
export function withPerformanceMonitoring(
  handler: (request: Request) => Promise<NextResponse>
) {
  return async (request: Request): Promise<NextResponse> => {
    const startTime = Date.now()
    const url = new URL(request.url)
    
    console.log(`🚀 ${request.method} ${url.pathname} - Started`)
    
    try {
      const response = await handler(request)
      const duration = Date.now() - startTime
      
      console.log(`✅ ${request.method} ${url.pathname} - ${response.status} (${duration}ms)`)
      
      // Add performance headers
      response.headers.set('X-Response-Time', `${duration}ms`)
      response.headers.set('X-Timestamp', startTime.toString())
      
      return response
    } catch (error) {
      const duration = Date.now() - startTime
      console.error(`❌ ${request.method} ${url.pathname} - Error (${duration}ms):`, error)
      
      return ApiOptimizer.createErrorResponse(
        'Internal server error',
        500,
        process.env.NODE_ENV === 'development' ? error : undefined
      )
    }
  }
}