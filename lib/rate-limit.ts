// Simple in-memory rate limiting (for production, use Redis)
interface RateLimitEntry {
  count: number
  resetTime: number
}

const rateLimitMap = new Map<string, RateLimitEntry>()

export interface RateLimitOptions {
  windowMs: number // Time window in milliseconds
  maxRequests: number // Maximum requests per window
}

export function rateLimit(options: RateLimitOptions) {
  return function checkRateLimit(identifier: string): { allowed: boolean; remaining: number; resetTime: number } {
    const now = Date.now()
    const entry = rateLimitMap.get(identifier)

    // Clean up expired entries periodically
    if (Math.random() < 0.01) { // 1% chance to clean up
      for (const [key, value] of rateLimitMap.entries()) {
        if (value.resetTime < now) {
          rateLimitMap.delete(key)
        }
      }
    }

    if (!entry || entry.resetTime < now) {
      // First request or window expired
      const resetTime = now + options.windowMs
      rateLimitMap.set(identifier, { count: 1, resetTime })
      return { allowed: true, remaining: options.maxRequests - 1, resetTime }
    }

    if (entry.count >= options.maxRequests) {
      // Rate limit exceeded
      return { allowed: false, remaining: 0, resetTime: entry.resetTime }
    }

    // Increment count
    entry.count++
    rateLimitMap.set(identifier, entry)
    return { allowed: true, remaining: options.maxRequests - entry.count, resetTime: entry.resetTime }
  }
}

// Common rate limit configurations
export const rateLimiters = {
  // API endpoints - 100 requests per minute
  api: rateLimit({ windowMs: 60 * 1000, maxRequests: 100 }),
  
  // Login attempts - 5 attempts per 15 minutes
  login: rateLimit({ windowMs: 15 * 60 * 1000, maxRequests: 5 }),
  
  // File uploads - 10 uploads per hour
  upload: rateLimit({ windowMs: 60 * 60 * 1000, maxRequests: 10 }),
  
  // AI chat - 20 messages per minute
  chat: rateLimit({ windowMs: 60 * 1000, maxRequests: 20 })
}

export function getClientIdentifier(request: Request): string {
  // In production, use proper IP detection with proxy headers
  const forwarded = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  const ip = forwarded?.split(',')[0] || realIp || 'unknown'
  return ip
}