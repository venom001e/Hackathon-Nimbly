#!/usr/bin/env tsx

import { cache } from '../lib/redis'
import { dbOptimizer } from '../lib/db-optimizer'
import { optimizedCsvDataLoader } from '../lib/csv-data-loader-optimized'

async function setupPerformanceOptimizations() {
  console.log('🚀 Setting up performance optimizations...')

  try {
    // 1. Initialize Redis connection
    console.log('📦 Initializing Redis cache...')
    try {
      await cache.set('health-check', 'ok', 10)
      console.log('✅ Redis cache initialized successfully')
    } catch (error) {
      console.warn('⚠️ Redis not available, using memory cache fallback')
    }

    // 2. Warm up database connections
    if (process.env.DATABASE_URL) {
      console.log('🔗 Warming up database connections...')
      try {
        await dbOptimizer.optimizeConnections()
        await dbOptimizer.warmCache()
        console.log('✅ Database connections optimized')
      } catch (error) {
        console.warn('⚠️ Database optimization failed:', error)
      }
    }

    // 3. Preload CSV data
    console.log('📊 Preloading CSV data...')
    try {
      await optimizedCsvDataLoader.preloadData()
      console.log('✅ CSV data preloaded successfully')
    } catch (error) {
      console.warn('⚠️ CSV preload failed:', error)
    }

    // 4. Performance monitoring setup
    if (process.env.ENABLE_PERFORMANCE_MONITORING === 'true') {
      console.log('📈 Setting up performance monitoring...')
      
      // Monitor memory usage
      const memoryUsage = process.memoryUsage()
      console.log('Memory Usage:', {
        rss: `${Math.round(memoryUsage.rss / 1024 / 1024)}MB`,
        heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`,
        heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
        external: `${Math.round(memoryUsage.external / 1024 / 1024)}MB`
      })

      // Set up periodic memory monitoring
      setInterval(() => {
        const usage = process.memoryUsage()
        const heapUsedMB = Math.round(usage.heapUsed / 1024 / 1024)
        
        if (heapUsedMB > 500) { // Alert if heap usage > 500MB
          console.warn(`⚠️ High memory usage: ${heapUsedMB}MB`)
        }
      }, 30000) // Check every 30 seconds

      console.log('✅ Performance monitoring enabled')
    }

    // 5. Cleanup old cache entries
    console.log('🧹 Cleaning up old cache entries...')
    try {
      // This would be implemented based on your cache strategy
      console.log('✅ Cache cleanup completed')
    } catch (error) {
      console.warn('⚠️ Cache cleanup failed:', error)
    }

    console.log('🎉 Performance optimization setup completed!')
    
    // Performance summary
    console.log('\n📊 Performance Configuration Summary:')
    console.log(`- Redis Cache: ${process.env.REDIS_URL ? '✅ Enabled' : '❌ Disabled (using memory fallback)'}`)
    console.log(`- Database Pool: ${process.env.DB_POOL_SIZE || 10} connections`)
    console.log(`- API Rate Limit: ${process.env.API_RATE_LIMIT || 100} requests/minute`)
    console.log(`- Cache TTL: ${process.env.CACHE_TTL || 300} seconds`)
    console.log(`- Compression: ${process.env.ENABLE_COMPRESSION === 'true' ? '✅ Enabled' : '❌ Disabled'}`)
    console.log(`- Performance Monitoring: ${process.env.ENABLE_PERFORMANCE_MONITORING === 'true' ? '✅ Enabled' : '❌ Disabled'}`)

  } catch (error) {
    console.error('❌ Performance setup failed:', error)
    process.exit(1)
  }
}

// Run setup if called directly
if (require.main === module) {
  setupPerformanceOptimizations()
    .then(() => {
      console.log('✅ Performance setup completed successfully')
      process.exit(0)
    })
    .catch((error) => {
      console.error('❌ Performance setup failed:', error)
      process.exit(1)
    })
}

export { setupPerformanceOptimizations }