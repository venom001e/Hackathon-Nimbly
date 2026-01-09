import { prisma } from './prisma'
import { cache } from './redis'

export class DatabaseOptimizer {
  private static instance: DatabaseOptimizer

  static getInstance(): DatabaseOptimizer {
    if (!DatabaseOptimizer.instance) {
      DatabaseOptimizer.instance = new DatabaseOptimizer()
    }
    return DatabaseOptimizer.instance
  }

  // Optimized query with caching and pagination
  async getEnrolmentData(options: {
    state?: string
    district?: string
    startDate?: Date
    endDate?: Date
    page?: number
    limit?: number
  }) {
    const cacheKey = `db:enrolment:${JSON.stringify(options)}`
    
    // Try cache first
    try {
      const cached = await cache.get(cacheKey)
      if (cached) return cached
    } catch (error) {
      console.warn('Database cache miss:', error)
    }

    const { page = 1, limit = 1000, ...filters } = options
    const skip = (page - 1) * limit

    // Build optimized where clause
    const where: any = {}
    if (filters.state) where.state = filters.state
    if (filters.district) where.district = filters.district
    if (filters.startDate || filters.endDate) {
      where.date = {}
      if (filters.startDate) where.date.gte = filters.startDate
      if (filters.endDate) where.date.lte = filters.endDate
    }

    // Use database indexes efficiently
    const [data, total] = await Promise.all([
      prisma.enrolmentData.findMany({
        where,
        skip,
        take: limit,
        orderBy: { date: 'desc' }, // Use indexed field for ordering
        select: {
          // Only select needed fields to reduce data transfer
          id: true,
          date: true,
          state: true,
          district: true,
          age_0_5: true,
          age_5_17: true,
          age_18_greater: true,
        }
      }),
      prisma.enrolmentData.count({ where })
    ])

    const result = {
      data,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }

    // Cache for 5 minutes
    await cache.set(cacheKey, result, 300)
    return result
  }

  // Optimized aggregation queries
  async getAggregatedStats(filters: {
    state?: string
    startDate?: Date
    endDate?: Date
  }) {
    const cacheKey = `db:stats:${JSON.stringify(filters)}`
    
    try {
      const cached = await cache.get(cacheKey)
      if (cached) return cached
    } catch (error) {
      console.warn('Stats cache miss:', error)
    }

    const where: any = {}
    if (filters.state) where.state = filters.state
    if (filters.startDate || filters.endDate) {
      where.date = {}
      if (filters.startDate) where.date.gte = filters.startDate
      if (filters.endDate) where.date.lte = filters.endDate
    }

    // Use database aggregation functions for better performance
    const [totals, stateStats] = await Promise.all([
      prisma.enrolmentData.aggregate({
        where,
        _sum: {
          age_0_5: true,
          age_5_17: true,
          age_18_greater: true,
        },
        _count: {
          id: true
        }
      }),
      prisma.enrolmentData.groupBy({
        by: ['state'],
        where,
        _sum: {
          age_0_5: true,
          age_5_17: true,
          age_18_greater: true,
        },
        orderBy: {
          _sum: {
            age_0_5: 'desc'
          }
        },
        take: 10
      })
    ])

    const result = {
      totalEnrolments: (totals._sum.age_0_5 || 0) + (totals._sum.age_5_17 || 0) + (totals._sum.age_18_greater || 0),
      totalRecords: totals._count.id,
      ageDistribution: {
        age_0_5: totals._sum.age_0_5 || 0,
        age_5_17: totals._sum.age_5_17 || 0,
        age_18_greater: totals._sum.age_18_greater || 0,
      },
      topStates: stateStats.map(stat => ({
        state: stat.state,
        total: (stat._sum.age_0_5 || 0) + (stat._sum.age_5_17 || 0) + (stat._sum.age_18_greater || 0)
      }))
    }

    // Cache for 10 minutes
    await cache.set(cacheKey, result, 600)
    return result
  }

  // Batch operations for better performance
  async batchInsertEnrolmentData(records: any[]) {
    const BATCH_SIZE = 1000
    const batches = []
    
    for (let i = 0; i < records.length; i += BATCH_SIZE) {
      batches.push(records.slice(i, i + BATCH_SIZE))
    }

    console.log(`📦 Processing ${batches.length} batches of ${BATCH_SIZE} records each`)

    const results = await Promise.all(
      batches.map(async (batch, index) => {
        console.log(`⏳ Processing batch ${index + 1}/${batches.length}`)
        return prisma.enrolmentData.createMany({
          data: batch,
          skipDuplicates: true
        })
      })
    )

    // Invalidate related caches
    await cache.invalidatePattern('db:*')
    
    const totalInserted = results.reduce((sum, result) => sum + result.count, 0)
    console.log(`✅ Inserted ${totalInserted} records in ${batches.length} batches`)
    
    return totalInserted
  }

  // Connection pool optimization
  async optimizeConnections() {
    // Warm up the connection pool
    await prisma.$connect()
    
    // Test query to ensure connection is working
    const count = await prisma.enrolmentData.count()
    console.log(`🔗 Database connected. Total records: ${count}`)
    
    return count
  }

  // Cache warming for frequently accessed data
  async warmCache() {
    console.log('🔥 Warming database cache...')
    
    const promises = [
      this.getAggregatedStats({}),
      this.getAggregatedStats({ startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }),
      this.getEnrolmentData({ limit: 100 }),
    ]

    await Promise.all(promises)
    console.log('✅ Database cache warmed')
  }
}

export const dbOptimizer = DatabaseOptimizer.getInstance()