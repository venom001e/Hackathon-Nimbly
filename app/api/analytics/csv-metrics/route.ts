import { NextRequest, NextResponse } from 'next/server'
import { csvDataLoader } from '@/lib/csv-data-loader'
import { AnalyticsUtils } from '@/lib/analytics-utils'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const state = searchParams.get('state')
    const district = searchParams.get('district')
    const timeRange = searchParams.get('time_range') || '30d'

    // Calculate date range based on time_range parameter
    const now = new Date()
    let startDate: string | undefined
    let days = 30

    switch (timeRange) {
      case '7d':
        days = 7
        break
      case '30d':
        days = 30
        break
      case '90d':
        days = 90
        break
      case '365d':
        days = 365
        break
      default:
        days = 30
    }

    const startDateTime = new Date(now.getTime() - (days * 24 * 60 * 60 * 1000))
    startDate = `${startDateTime.getDate().toString().padStart(2, '0')}-${(startDateTime.getMonth() + 1).toString().padStart(2, '0')}-${startDateTime.getFullYear()}`

    // Get aggregated metrics from CSV data with date filtering
    const metrics = await csvDataLoader.getAggregatedMetrics({
      state: state || undefined,
      district: district || undefined,
      startDate: startDate
    })

    // Get top performing states
    const topStates = await csvDataLoader.getTopStates(10)

    // Get daily trends for the selected time range
    const dailyTrends = await csvDataLoader.getDailyTrends(days)
    const dailyCounts = dailyTrends.map((d: any) => d.count)

    // Calculate growth rate
    let dailyGrowthRate = 0
    if (dailyCounts.length >= 2) {
      const yesterday = dailyCounts[dailyCounts.length - 1]
      const dayBefore = dailyCounts[dailyCounts.length - 2]
      dailyGrowthRate = dayBefore > 0 ? ((yesterday - dayBefore) / dayBefore) * 100 : 0
    }

    // Detect trend direction
    const trendDirection = AnalyticsUtils.detectTrendDirection(dailyCounts)

    // Detect anomalies
    const anomalyIndices = AnalyticsUtils.detectAnomaliesZScore(dailyCounts, 2.0)

    // Calculate confidence score
    const mean = AnalyticsUtils.calculateMean(dailyCounts)
    const stdDev = AnalyticsUtils.calculateStandardDeviation(dailyCounts)
    const variance = mean > 0 ? stdDev / mean : 0
    const confidenceScore = AnalyticsUtils.calculateConfidenceScore(
      metrics.totalEnrolments,
      variance,
      0.85
    )

    // Age group distribution
    const totalAgeEnrolments = metrics.byAgeGroup.age_0_5 + 
      metrics.byAgeGroup.age_5_17 + metrics.byAgeGroup.age_18_greater

    const response = {
      total_enrolments: metrics.totalEnrolments,
      daily_growth_rate: Math.round(dailyGrowthRate * 100) / 100,
      trend_direction: trendDirection,
      confidence_score: Math.round(confidenceScore * 100) / 100,
      top_performing_states: topStates,
      anomaly_count: anomalyIndices.length,
      time_range: timeRange,
      date_range: {
        start: startDate,
        end: `${now.getDate().toString().padStart(2, '0')}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getFullYear()}`
      },
      age_group_distribution: {
        age_0_5: {
          count: metrics.byAgeGroup.age_0_5,
          percentage: totalAgeEnrolments > 0 
            ? Math.round((metrics.byAgeGroup.age_0_5 / totalAgeEnrolments) * 10000) / 100 
            : 0
        },
        age_5_17: {
          count: metrics.byAgeGroup.age_5_17,
          percentage: totalAgeEnrolments > 0 
            ? Math.round((metrics.byAgeGroup.age_5_17 / totalAgeEnrolments) * 10000) / 100 
            : 0
        },
        age_18_greater: {
          count: metrics.byAgeGroup.age_18_greater,
          percentage: totalAgeEnrolments > 0 
            ? Math.round((metrics.byAgeGroup.age_18_greater / totalAgeEnrolments) * 10000) / 100 
            : 0
        }
      },
      daily_trends: dailyTrends,
      unique_states: (await csvDataLoader.getUniqueStates()).length,
      data_source: 'csv'
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('CSV Metrics error:', error)
    return NextResponse.json(
      { error: 'Failed to load CSV data', details: String(error) },
      { status: 500 }
    )
  }
}
