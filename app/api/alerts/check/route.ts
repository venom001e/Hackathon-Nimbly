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

    // Get current metrics
    const metrics = await csvDataLoader.getAggregatedMetrics({
      state: state || undefined
    })
    
    const dailyTrends = await csvDataLoader.getDailyTrends(30)
    const dailyCounts = dailyTrends.map((d: any) => d.count)
    
    // Calculate current values
    const latestDailyCount = dailyCounts[dailyCounts.length - 1] || 0
    const mean = AnalyticsUtils.calculateMean(dailyCounts)
    const stdDev = AnalyticsUtils.calculateStandardDeviation(dailyCounts)
    const anomalyScore = stdDev > 0 ? Math.abs(latestDailyCount - mean) / stdDev : 0
    
    // Get growth rate
    let growthRate = 0
    if (dailyCounts.length >= 2) {
      const yesterday = dailyCounts[dailyCounts.length - 1]
      const dayBefore = dailyCounts[dailyCounts.length - 2]
      growthRate = dayBefore > 0 ? ((yesterday - dayBefore) / dayBefore) * 100 : 0
    }

    // Define alert rules
    const alertRules = [
      {
        id: 'rule-1',
        name: 'High Enrolment Spike',
        metric: 'daily_enrolments',
        getValue: () => latestDailyCount,
        condition: 'greater_than',
        threshold: mean + (2 * stdDev),
        severity: 'high' as const,
        getMessage: (val: number, thresh: number) => 
          `Daily enrolments (${val.toLocaleString()}) exceeded normal range (>${Math.round(thresh).toLocaleString()})`,
        recommendations: [
          'Verify data quality for recent uploads',
          'Check for any special enrolment drives',
          'Review regional distribution of spike'
        ]
      },
      {
        id: 'rule-2',
        name: 'Low Enrolment Warning',
        metric: 'daily_enrolments',
        getValue: () => latestDailyCount,
        condition: 'less_than',
        threshold: mean - (2 * stdDev),
        severity: 'medium' as const,
        getMessage: (val: number, thresh: number) => 
          `Daily enrolments (${val.toLocaleString()}) dropped below normal range (<${Math.round(thresh).toLocaleString()})`,
        recommendations: [
          'Check for system outages or data delays',
          'Review regional enrolment center status',
          'Verify data pipeline connectivity'
        ]
      },
      {
        id: 'rule-3',
        name: 'Anomaly Detection Alert',
        metric: 'anomaly_score',
        getValue: () => anomalyScore,
        condition: 'greater_than',
        threshold: 2.5,
        severity: 'high' as const,
        getMessage: (val: number, thresh: number) => 
          `Statistical anomaly detected (Z-score: ${val.toFixed(2)} > ${thresh})`,
        recommendations: [
          'Investigate unusual patterns in recent data',
          'Check for data quality issues',
          'Review affected regions for operational issues'
        ]
      },
      {
        id: 'rule-4',
        name: 'Rapid Growth Alert',
        metric: 'growth_rate',
        getValue: () => Math.abs(growthRate),
        condition: 'greater_than',
        threshold: 50,
        severity: 'medium' as const,
        getMessage: (val: number, thresh: number) => 
          `Rapid ${growthRate > 0 ? 'increase' : 'decrease'} in enrolments (${val.toFixed(1)}% change)`,
        recommendations: [
          'Monitor trend over next few days',
          'Identify contributing regions',
          'Prepare capacity adjustments if needed'
        ]
      }
    ]

    // Check each rule
    const triggeredAlerts: TriggeredAlert[] = []

    for (const rule of alertRules) {
      const currentValue = rule.getValue()
      let triggered = false

      switch (rule.condition) {
        case 'greater_than':
          triggered = currentValue > rule.threshold
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
      }
    }

    // Sort by severity
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
      metrics: {
        latestDailyCount,
        mean: Math.round(mean),
        stdDev: Math.round(stdDev),
        anomalyScore: Math.round(anomalyScore * 100) / 100,
        growthRate: Math.round(growthRate * 100) / 100
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
