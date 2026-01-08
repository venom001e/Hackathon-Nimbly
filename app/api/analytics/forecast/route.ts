import { NextRequest, NextResponse } from 'next/server'
import { csvDataLoader } from '@/lib/csv-data-loader'
import { AnalyticsUtils } from '@/lib/analytics-utils'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const horizon = parseInt(searchParams.get('horizon') || '30') // days

    // Get historical data
    const dailyTrends = await csvDataLoader.getDailyTrends(90)
    const counts = dailyTrends.map((d: any) => d.count)

    if (counts.length < 7) {
      return NextResponse.json({
        error: 'Insufficient data for forecasting',
        minRequired: 7,
        available: counts.length
      }, { status: 400 })
    }

    // Calculate statistics
    const mean = AnalyticsUtils.calculateMean(counts)
    const stdDev = AnalyticsUtils.calculateStandardDeviation(counts)
    
    // Detect trend
    const trendDirection = AnalyticsUtils.detectTrendDirection(counts)
    
    // Simple exponential smoothing forecast
    const alpha = 0.3
    const smoothed = AnalyticsUtils.exponentialSmoothing(counts, alpha)
    const lastSmoothed = smoothed[smoothed.length - 1]
    
    // Calculate growth rate
    const recentGrowth = counts.length >= 14 
      ? (AnalyticsUtils.calculateMean(counts.slice(-7)) - AnalyticsUtils.calculateMean(counts.slice(-14, -7))) / AnalyticsUtils.calculateMean(counts.slice(-14, -7))
      : 0

    // Generate forecasts
    const forecasts: { date: string; predicted: number; lower: number; upper: number }[] = []
    let currentValue = lastSmoothed
    
    for (let i = 1; i <= Math.min(horizon, 90); i++) {
      const date = new Date()
      date.setDate(date.getDate() + i)
      
      // Apply growth trend
      currentValue = currentValue * (1 + recentGrowth / 30)
      
      // Add some realistic variation
      const variation = stdDev * 0.5
      
      forecasts.push({
        date: date.toISOString().split('T')[0],
        predicted: Math.round(currentValue),
        lower: Math.round(Math.max(0, currentValue - variation * 1.96)),
        upper: Math.round(currentValue + variation * 1.96)
      })
    }

    // Calculate summary predictions
    const nextWeekTotal = forecasts.slice(0, 7).reduce((sum, f) => sum + f.predicted, 0)
    const nextMonthTotal = forecasts.slice(0, 30).reduce((sum, f) => sum + f.predicted, 0)
    
    // Detect seasonal patterns
    const seasonalPattern = AnalyticsUtils.detectSeasonalPattern(counts, 7)

    // Calculate confidence score
    const confidenceScore = AnalyticsUtils.calculateConfidenceScore(
      counts.length,
      stdDev / mean,
      0.85
    )

    return NextResponse.json({
      forecast: {
        horizon_days: horizon,
        predictions: forecasts,
        summary: {
          next_week_total: nextWeekTotal,
          next_month_total: nextMonthTotal,
          daily_average_predicted: Math.round(mean * (1 + recentGrowth)),
          growth_rate_percent: Math.round(recentGrowth * 10000) / 100
        }
      },
      trend: {
        direction: trendDirection,
        strength: Math.abs(recentGrowth) > 0.1 ? 'strong' : Math.abs(recentGrowth) > 0.05 ? 'moderate' : 'weak'
      },
      seasonal: {
        has_pattern: seasonalPattern.hasPattern,
        amplitude: seasonalPattern.amplitude,
        peak_days: seasonalPattern.peakIndices
      },
      confidence: {
        score: Math.round(confidenceScore * 100) / 100,
        data_points: counts.length,
        model: 'exponential_smoothing'
      },
      historical: {
        mean: Math.round(mean),
        std_dev: Math.round(stdDev),
        min: Math.min(...counts),
        max: Math.max(...counts)
      }
    })

  } catch (error) {
    console.error('Forecast error:', error)
    return NextResponse.json(
      { error: 'Failed to generate forecast', details: String(error) },
      { status: 500 }
    )
  }
}
