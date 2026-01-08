import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { AnalyticsUtils } from '@/lib/analytics-utils'
import { TrendAnalysis } from '@/types'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const metric = searchParams.get('metric') || 'enrolment_count'
    const timePeriod = searchParams.get('time_period') || '30d'
    const state = searchParams.get('state')
    const district = searchParams.get('district')

    // Parse time period
    const days = parseInt(timePeriod.replace('d', ''))
    const { start, end } = AnalyticsUtils.getDateRange(days)

    // Build query filters
    const whereClause: any = {
      date: {
        gte: start,
        lte: end
      }
    }

    if (state) whereClause.state = state
    if (district) whereClause.district = district

    // Get enrolment data
    const enrolmentData = await prisma.enrolmentData.findMany({
      where: whereClause,
      orderBy: { date: 'asc' }
    })

    if (enrolmentData.length === 0) {
      return NextResponse.json({
        metric,
        time_period: timePeriod,
        trend_direction: 'stable',
        confidence_score: 0,
        geographic_breakdown: {},
        message: 'No data available for the specified period'
      })
    }

    // Aggregate data by day
    const dailyData = new Map<string, number>()
    const geographicData = new Map<string, number>()

    enrolmentData.forEach((record: any) => {
      const dateKey = AnalyticsUtils.formatDateForAPI(record.date)
      const geoKey = `${record.state}-${record.district}`
      const total = record.age_0_5 + record.age_5_17 + record.age_18_greater
      
      dailyData.set(dateKey, (dailyData.get(dateKey) || 0) + total)
      geographicData.set(geoKey, (geographicData.get(geoKey) || 0) + total)
    })

    // Convert to arrays for analysis
    const dailyCounts = Array.from(dailyData.values())
    const geographicBreakdown = Object.fromEntries(geographicData)

    // Perform trend analysis
    const trendDirection = AnalyticsUtils.detectTrendDirection(dailyCounts)
    const mean = AnalyticsUtils.calculateMean(dailyCounts)
    const stdDev = AnalyticsUtils.calculateStandardDeviation(dailyCounts)
    const variance = mean > 0 ? stdDev / mean : 0 // Coefficient of variation

    // Detect seasonal patterns
    const seasonalAnalysis = AnalyticsUtils.detectSeasonalPattern(dailyCounts, 7) // Weekly pattern

    // Calculate confidence score
    const confidenceScore = AnalyticsUtils.calculateConfidenceScore(
      enrolmentData.length,
      variance,
      0.85 // Assumed model accuracy
    )

    // Prepare seasonal component
    const seasonalComponent = seasonalAnalysis.hasPattern ? {
      pattern_type: 'weekly' as const,
      peak_periods: seasonalAnalysis.peakIndices.map((i: number) => `Day ${i + 1}`),
      low_periods: [],
      amplitude: seasonalAnalysis.amplitude
    } : undefined

    const trendAnalysis: TrendAnalysis = {
      metric,
      time_period: timePeriod,
      trend_direction: trendDirection,
      confidence_score: confidenceScore,
      seasonal_component: seasonalComponent,
      geographic_breakdown: geographicBreakdown
    }

    // Store analysis result
    await prisma.trendAnalysis.create({
      data: {
        metric,
        time_period: timePeriod,
        trend_direction: trendDirection,
        confidence_score: confidenceScore,
        geographic_breakdown: geographicBreakdown,
        seasonal_component: seasonalComponent || {}
      }
    })

    return NextResponse.json(trendAnalysis)

  } catch (error) {
    console.error('Trend analysis error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { metrics, time_periods, filters } = body

    const results: TrendAnalysis[] = []

    for (const metric of metrics || ['enrolment_count']) {
      for (const timePeriod of time_periods || ['30d']) {
        const searchParams = new URLSearchParams({
          metric,
          time_period: timePeriod,
          ...(filters?.state && { state: filters.state }),
          ...(filters?.district && { district: filters.district })
        })

        const mockRequest = new NextRequest(`http://localhost/api/analytics/trends?${searchParams}`)
        const response = await GET(mockRequest)
        const data = await response.json()
        
        if (response.ok) {
          results.push(data)
        }
      }
    }

    return NextResponse.json({
      results,
      total_analyses: results.length,
      generated_at: new Date().toISOString()
    })

  } catch (error) {
    console.error('Batch trend analysis error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
