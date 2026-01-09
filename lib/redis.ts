import { createClient } from 'redis'

// Redis client singleton
let redis: ReturnType<typeof createClient> | null = null

export async function getRedisClient() {
  if (!redis) {
    redis = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
      socket: {
        connectTimeout: 5000,
      },
    })

    redis.on('error', (err) => {
      console.error('Redis Client Error:', err)
    })

    redis.on('connect', () => {
      console.log('✅ Redis connected successfully')
    })

    redis.on('disconnect', () => {
      console.log('⚠️ Redis disconnected')
    })
  }

  if (!redis.isOpen) {
    try {
      await redis.connect()
    } catch (error) {
      console.error('Failed to connect to Redis:', error)
      // Return null if Redis is not available (graceful degradation)
      return null
    }
  }

  return redis
}

// Cache utilities with fallback
export class CacheManager {
  private static instance: CacheManager
  private memoryCache = new Map<string, { data: any; expires: number }>()

  static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager()
    }
    return CacheManager.instance
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const redis = await getRedisClient()
      if (redis) {
        const data = await redis.get(key)
        return data ? JSON.parse(data) : null
      }
    } catch (error) {
      console.warn('Redis get failed, using memory cache:', error)
    }

    // Fallback to memory cache
    const cached = this.memoryCache.get(key)
    if (cached && cached.expires > Date.now()) {
      return cached.data
    }
    return null
  }

  async set(key: string, value: any, ttlSeconds: number = 300): Promise<void> {
    try {
      const redis = await getRedisClient()
      if (redis) {
        await redis.setEx(key, ttlSeconds, JSON.stringify(value))
        return
      }
    } catch (error) {
      console.warn('Redis set failed, using memory cache:', error)
    }

    // Fallback to memory cache
    this.memoryCache.set(key, {
      data: value,
      expires: Date.now() + (ttlSeconds * 1000)
    })

    // Clean up expired entries periodically
    if (Math.random() < 0.01) {
      this.cleanupMemoryCache()
    }
  }

  async del(key: string): Promise<void> {
    try {
      const redis = await getRedisClient()
      if (redis) {
        await redis.del(key)
      }
    } catch (error) {
      console.warn('Redis del failed:', error)
    }

    this.memoryCache.delete(key)
  }

  async invalidatePattern(pattern: string): Promise<void> {
    try {
      const redis = await getRedisClient()
      if (redis) {
        const keys = await redis.keys(pattern)
        if (keys.length > 0) {
          await redis.del(keys)
        }
      }
    } catch (error) {
      console.warn('Redis pattern invalidation failed:', error)
    }

    // Memory cache pattern cleanup
    for (const key of this.memoryCache.keys()) {
      if (key.includes(pattern.replace('*', ''))) {
        this.memoryCache.delete(key)
      }
    }
  }

  private cleanupMemoryCache(): void {
    const now = Date.now()
    for (const [key, value] of this.memoryCache.entries()) {
      if (value.expires < now) {
        this.memoryCache.delete(key)
      }
    }
  }
}

export const cache = CacheManager.getInstance()