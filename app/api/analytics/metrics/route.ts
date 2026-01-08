import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { AnalyticsUtils } from '@/lib/analytics-utils'
import { AnalyticsMetrics } from '@/types'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const timePeriod = searchParams.get('time_period') || '30d'
    const state = searchParams.get('state')

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

    // Get total enrolments (sum of all age groups)
    const totals = await prisma.enrolmentData.aggregate({
      where: whereClause,
      _sum: {
        age_0_5: true,
        age_5_17: true,
        age_18_greater: true
      }
    })

    const totalEnrolments = (totals._sum.age_0_5 || 0) + 
                           (totals._sum.age_5_17 || 0) + 
                           (totals._sum.age_18_greater || 0)

    // Calculate daily growth rate
    const yesterdayStart = new Date(end)
    yesterdayStart.setDate(yesterdayStart.getDate() - 1)
    yesterdayStart.setHours(0, 0, 0, 0)
    
    const yesterdayEnd = new Date(end)
    yesterdayEnd.setHours(23, 59, 59, 999)

    const dayBeforeStart = new Date(yesterdayStart)
    dayBeforeStart.setDate(dayBeforeStart.getDate() - 1)
    
    const dayBeforeEnd = new Date(yesterdayStart)
    dayBeforeEnd.setHours(23, 59, 59, 999)

    const yesterdayTotals = await prisma.enrolmentData.aggregate({
      where: {
        ...whereClause,
        date: {
          gte: yesterdayStart,
          lte: yesterdayEnd
        }
      },
      _sum: {
        age_0_5: true,
        age_5_17: true,
        age_18_greater: true
      }
    })

    const dayBeforeTotals = await prisma.enrolmentData.aggregate({
      where: {
        ...whereClause,
        date: {
          gte: dayBeforeStart,
          lte: dayBeforeEnd
        }
      },
      _sum: {
        age_0_5: true,
        age_5_17: true,
        age_18_greater: true
      }
    })

    const yesterdayCount = (yesterdayTotals._sum.age_0_5 || 0) + 
                          (yesterdayTotals._sum.age_5_17 || 0) + 
                          (yesterdayTotals._sum.age_18_greater || 0)
    
    const dayBeforeCount = (dayBeforeTotals._sum.age_0_5 || 0) + 
                          (dayBeforeTotals._sum.age_5_17 || 0) + 
                          (dayBeforeTotals._sum.age_18_greater || 0)

    const dailyGrowthRate = dayBeforeCount > 0 
      ? ((yesterdayCount - dayBeforeCount) / dayBeforeCount) * 100
      : 0

    // Get top performing states
    const stateAggregation = await prisma.enrolmentData.groupBy({
      by: ['state'],
      where: whereClause,
      _sum: {
        age_0_5: true,
        age_5_17: true,
        age_18_greater: true
      }
    })

    const topPerformingStates = stateAggregation
      .map((item: any) => ({
        state: item.state,
        count: (item._sum.age_0_5 || 0) + (item._sum.age_5_17 || 0) + (item._sum.age_18_greater || 0)
      }))
      .sort((a: any, b: any) => b.count - a.count)
      .slice(0, 10)

    // Get anomaly count
    const anomalyCount = await prisma.anomaly.count({
      where: {
        timestamp: {
          gte: start,
          lte: end
        },
        resolved: false
      }
    })

    // Calculate prediction accuracy from recent forecasts
    const recentForecasts = await prisma.forecast.findMany({
      where: {
        created_at: {
          gte: AnalyticsUtils.getDateRange(7).start
        }
      },
      orderBy: {
        created_at: 'desc'
      },
      take: 10
    })

    let predictionAccuracy = 85.0
    if (recentForecasts.length > 0) {
      const accuracyScores = recentForecasts.map((forecast: any) => {
        const accuracy = forecast.accuracy_metrics as any
        return accuracy?.mape ? (100 - accuracy.mape) : 85
      })
      predictionAccuracy = AnalyticsUtils.calculateMean(accuracyScores)
    }

    // Get age group distribution
    const ageGroupDistribution = {
      age_0_5: totals._sum.age_0_5 || 0,
      age_5_17: totals._sum.age_5_17 || 0,
      age_18_greater: totals._sum.age_18_greater || 0
    }

    const metrics: AnalyticsMetrics & {
      additional_insights: any
    } = {
      total_enrolments: totalEnrolments,
      daily_growth_rate: dailyGrowthRate,
      top_performing_states: topPerformingStates,
      anomaly_count: anomalyCount,
      prediction_accuracy: predictionAccuracy,
      additional_insights: {
        age_group_distribution: [
          { age_group: '0-5', count: ageGroupDistribution.age_0_5, percentage: totalEnrolments > 0 ? (ageGroupDistribution.age_0_5 / totalEnrolments) * 100 : 0 },
          { age_group: '5-17', count: ageGroupDistribution.age_5_17, percentage: totalEnrolments > 0 ? (ageGroupDistribution.age_5_17 / totalEnrolments) * 100 : 0 },
          { age_group: '18+', count: ageGroupDistribution.age_18_greater, percentage: totalEnrolments > 0 ? (ageGroupDistribution.age_18_greater / totalEnrolments) * 100 : 0 }
        ],
        data_quality_score: 85
      }
    }

    return NextResponse.json(metrics)

  } catch (error) {
    console.error('Metrics calculation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      time_periods = ['7d', '30d', '90d'], 
      states = [],
      include_predictions = true,
      include_comparisons = true 
    } = body

    const results = []

    for (const timePeriod of time_periods) {
      if (states.length > 0) {
        for (const state of states) {
          const searchParams = new URLSearchParams({
            time_period: timePeriod,
            state
          })

          const mockRequest = new NextRequest(`http://localhost/api/analytics/metrics?${searchParams}`)
          const response = await GET(mockRequest)
          const data = await response.json()
          
          if (response.ok) {
            results.push({
              ...data,
              configuration: { time_period: timePeriod, state }
            })
          }
        }
      } else {
        const searchParams = new URLSearchParams({
          time_period: timePeriod
        })

        const mockRequest = new NextRequest(`http://localhost/api/analytics/metrics?${searchParams}`)
        const response = await GET(mockRequest)
        const data = await response.json()
        
        if (response.ok) {
          results.push({
            ...data,
            configuration: { time_period: timePeriod }
          })
        }
      }
    }

    let comparisons = {}
    if (include_comparisons && results.length >= 2) {
      const current = results.find(r => r.configuration.time_period === '30d')
      const previous = results.find(r => r.configuration.time_period === '60d')
      
      if (current && previous) {
        comparisons = {
          enrolment_growth: ((current.total_enrolments - previous.total_enrolments) / previous.total_enrolments) * 100,
          growth_rate_change: current.daily_growth_rate - previous.daily_growth_rate,
          anomaly_trend: current.anomaly_count - previous.anomaly_count,
          accuracy_improvement: current.prediction_accuracy - previous.prediction_accuracy
        }
      }
    }

    return NextResponse.json({
      batch_results: results,
      comparisons,
      summary: {
        total_configurations: results.length,
        generated_at: new Date().toISOString(),
        includes_predictions: include_predictions,
        includes_comparisons: include_comparisons
      }
    })

  } catch (error) {
    console.error('Batch metrics calculation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
