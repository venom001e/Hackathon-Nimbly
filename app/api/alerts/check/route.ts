import { NextRequest, NextResponse } from 'next/server'
import { csvDataLoader } from '@/lib/csv-data-loader'
import { AnalyticsUtils } from '@/lib/analytics-utils'

interface TriggeredAlert {
  id: string
  configId: string
  configName: string
  metric: string
  currentValue: number
  threshold: number
  condition: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  message: string
  triggeredAt: string
  state?: string
  recommendations: string[]
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const state = searchParams.get('state')
    const timeRange = searchParams.get('time_range') || '30d'

    // Calculate date range for analysis
    const now = new Date()
    let days = 30
    switch (timeRange) {
      case '7d': days = 7; break
      case '30d': days = 30; break
      case '90d': days = 90; break
      case '365d': days = 365; break
    }

    const startDateTime = new Date(now.getTime() - (days * 24 * 60 * 60 * 1000))
    const startDate = `${startDateTime.getDate().toString().padStart(2, '0')}-${(startDateTime.getMonth() + 1).toString().padStart(2, '0')}-${startDateTime.getFullYear()}`

    // Get current metrics with time filtering
    const metrics = await csvDataLoader.getAggregatedMetrics({
      state: state || undefined,
      startDate: startDate
    })
    
    const dailyTrends = await csvDataLoader.getDailyTrends(days)
    const dailyCounts = dailyTrends.map((d: any) => d.count)
    
    // Calculate statistical measures
    const latestDailyCount = dailyCounts[dailyCounts.length - 1] || 0
    const mean = AnalyticsUtils.calculateMean(dailyCounts)
    const stdDev = AnalyticsUtils.calculateStandardDeviation(dailyCounts)
    const anomalyScore = stdDev > 0 ? Math.abs(latestDailyCount - mean) / stdDev : 0
    
    // Calculate growth rate
    let growthRate = 0
    if (dailyCounts.length >= 2) {
      const yesterday = dailyCounts[dailyCounts.length - 1]
      const dayBefore = dailyCounts[dailyCounts.length - 2]
      growthRate = dayBefore > 0 ? ((yesterday - dayBefore) / dayBefore) * 100 : 0
    }

    // Calculate percentiles for better thresholds
    const sortedCounts = [...dailyCounts].sort((a, b) => a - b)
    const p95 = sortedCounts[Math.floor(sortedCounts.length * 0.95)] || mean
    const p5 = sortedCounts[Math.floor(sortedCounts.length * 0.05)] || mean

    // Enhanced alert rules based on real data patterns
    const alertRules = [
      {
        id: 'rule-1',
        name: 'Extreme Enrolment Spike',
        metric: 'daily_enrolments',
        getValue: () => latestDailyCount,
        condition: 'greater_than',
        threshold: Math.max(p95, mean + (3 * stdDev)),
        severity: 'critical' as const,
        getMessage: (val: number, thresh: number) => 
          `Critical: Daily enrolments (${val.toLocaleString()}) far exceeded normal range (>${Math.round(thresh).toLocaleString()})`,
        recommendations: [
          'Immediate investigation required - possible data anomaly',
          'Verify system integrity and data sources',
          'Check for unusual regional activity or bulk uploads',
          'Alert senior management and technical team'
        ]
      },
      {
        id: 'rule-2',
        name: 'High Enrolment Alert',
        metric: 'daily_enrolments',
        getValue: () => latestDailyCount,
        condition: 'greater_than',
        threshold: Math.max(mean + (2 * stdDev), p95 * 0.8),
        severity: 'high' as const,
        getMessage: (val: number, thresh: number) => 
          `High enrolment activity: ${val.toLocaleString()} enrolments (>${Math.round(thresh).toLocaleString()} expected)`,
        recommendations: [
          'Monitor trend over next 24 hours',
          'Verify data quality and processing systems',
          'Check regional distribution for hotspots',
          'Prepare for increased system load if trend continues'
        ]
      },
      {
        id: 'rule-3',
        name: 'Low Enrolment Warning',
        metric: 'daily_enrolments',
        getValue: () => latestDailyCount,
        condition: 'less_than',
        threshold: Math.min(p5, mean - (2 * stdDev)),
        severity: 'medium' as const,
        getMessage: (val: number, thresh: number) => 
          `Low enrolment activity: ${val.toLocaleString()} enrolments (<${Math.round(thresh).toLocaleString()} expected)`,
        recommendations: [
          'Check system availability and connectivity',
          'Verify enrolment center operations',
          'Review data pipeline for delays or issues',
          'Contact regional coordinators for status update'
        ]
      },
      {
        id: 'rule-4',
        name: 'Critical System Failure',
        metric: 'daily_enrolments',
        getValue: () => latestDailyCount,
        condition: 'less_than',
        threshold: Math.max(1000, p5 * 0.1), // Less than 10% of 5th percentile or 1000
        severity: 'critical' as const,
        getMessage: (val: number, thresh: number) => 
          `Critical: Extremely low enrolments (${val.toLocaleString()}) - possible system failure`,
        recommendations: [
          'URGENT: Check all systems immediately',
          'Verify database connectivity and data pipelines',
          'Contact technical support and system administrators',
          'Prepare incident response and communication plan'
        ]
      },
      {
        id: 'rule-5',
        name: 'Statistical Anomaly Alert',
        metric: 'anomaly_score',
        getValue: () => anomalyScore,
        condition: 'greater_than',
        threshold: 2.5,
        severity: 'high' as const,
        getMessage: (val: number, thresh: number) => 
          `Statistical anomaly detected (Z-score: ${val.toFixed(2)} > ${thresh}) - unusual pattern identified`,
        recommendations: [
          'Investigate data patterns for last 48 hours',
          'Check for data quality issues or processing errors',
          'Review affected regions and demographics',
          'Consider temporary monitoring increase'
        ]
      },
      {
        id: 'rule-6',
        name: 'Rapid Growth Change',
        metric: 'growth_rate',
        getValue: () => Math.abs(growthRate),
        condition: 'greater_than',
        threshold: 100, // 100% change
        severity: 'high' as const,
        getMessage: (val: number, thresh: number) => 
          `Extreme ${growthRate > 0 ? 'increase' : 'decrease'}: ${val.toFixed(1)}% change in daily enrolments`,
        recommendations: [
          'Investigate cause of dramatic change',
          'Verify data accuracy and processing',
          'Check for system issues or policy changes',
          'Monitor closely for next 24-48 hours'
        ]
      },
      {
        id: 'rule-7',
        name: 'Moderate Growth Alert',
        metric: 'growth_rate',
        getValue: () => Math.abs(growthRate),
        condition: 'greater_than',
        threshold: 50, // 50% change
        severity: 'medium' as const,
        getMessage: (val: number, thresh: number) => 
          `Significant ${growthRate > 0 ? 'increase' : 'decrease'}: ${val.toFixed(1)}% change in enrolments`,
        recommendations: [
          'Monitor trend development',
          'Identify contributing regions or factors',
          'Prepare capacity adjustments if needed',
          'Document pattern for analysis'
        ]
      }
    ]

    // Check each rule and avoid duplicate alerts
    const triggeredAlerts: TriggeredAlert[] = []
    const triggeredMetrics = new Set<string>()

    for (const rule of alertRules) {
      const currentValue = rule.getValue()
      let triggered = false

      // Skip if we already have an alert for this metric type
      const metricKey = `${rule.metric}_${rule.condition}`
      if (triggeredMetrics.has(metricKey)) continue

      switch (rule.condition) {
        case 'greater_than':
          triggered = currentValue > rule.threshold && rule.threshold > 0
          break
        case 'less_than':
          triggered = currentValue < rule.threshold && rule.threshold > 0
          break
      }

      if (triggered) {
        triggeredAlerts.push({
          id: `triggered-${rule.id}-${Date.now()}`,
          configId: rule.id,
          configName: rule.name,
          metric: rule.metric,
          currentValue,
          threshold: rule.threshold,
          condition: rule.condition,
          severity: rule.severity,
          message: rule.getMessage(currentValue, rule.threshold),
          triggeredAt: new Date().toISOString(),
          state: state || undefined,
          recommendations: rule.recommendations
        })
        
        triggeredMetrics.add(metricKey)
      }
    }

    // Sort by severity (critical first)
    const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 }
    triggeredAlerts.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity])

    return NextResponse.json({
      alerts: triggeredAlerts,
      totalAlerts: triggeredAlerts.length,
      criticalCount: triggeredAlerts.filter(a => a.severity === 'critical').length,
      highCount: triggeredAlerts.filter(a => a.severity === 'high').length,
      mediumCount: triggeredAlerts.filter(a => a.severity === 'medium').length,
      lowCount: triggeredAlerts.filter(a => a.severity === 'low').length,
      checkedAt: new Date().toISOString(),
      timeRange: timeRange,
      state: state,
      metrics: {
        latestDailyCount,
        mean: Math.round(mean),
        stdDev: Math.round(stdDev),
        anomalyScore: Math.round(anomalyScore * 100) / 100,
        growthRate: Math.round(growthRate * 100) / 100,
        p95: Math.round(p95),
        p5: Math.round(p5),
        totalEnrolments: metrics.totalEnrolments
      }
    })

  } catch (error) {
    console.error('Alert check error:', error)
    return NextResponse.json(
      { error: 'Failed to check alerts', details: String(error) },
      { status: 500 }
    )
  }
}
