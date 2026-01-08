import { NextRequest, NextResponse } from 'next/server'
import { csvDataLoader } from '@/lib/csv-data-loader'
import { AnalyticsUtils } from '@/lib/analytics-utils'
import { Anomaly } from '@/types'

function parseDate(dateStr: string): Date {
  const [day, month, year] = dateStr.split('-').map(Number)
  return new Date(year, month - 1, day)
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const threshold = parseFloat(searchParams.get('threshold') || '2.5')
    const state = searchParams.get('state')
    const severity = searchParams.get('severity')

    const data = await csvDataLoader.loadAllData()
    const filteredData = state ? data.filter(r => r.state === state) : data

    if (filteredData.length < 10) {
      return NextResponse.json({
        anomalies: [],
        message: 'Insufficient data for anomaly detection'
      })
    }

    const dailyData = new Map<string, number>()
    const regionalData = new Map<string, Map<string, number>>()

    filteredData.forEach(record => {
      const dateKey = record.date
      const regionKey = `${record.state}-${record.district}`
      
      dailyData.set(dateKey, (dailyData.get(dateKey) || 0) + record.total)
      
      if (!regionalData.has(regionKey)) {
        regionalData.set(regionKey, new Map())
      }
      const regionDailyData = regionalData.get(regionKey)!
      regionDailyData.set(dateKey, (regionDailyData.get(dateKey) || 0) + record.total)
    })

    const anomalies: Anomaly[] = []
    const dailyCounts = Array.from(dailyData.values())
    const dailyAnomalyIndices = AnalyticsUtils.detectAnomaliesZScore(dailyCounts, threshold)
    const dates = Array.from(dailyData.keys())

    for (const index of dailyAnomalyIndices) {
      const date = dates[index]
      const count = dailyCounts[index]
      const mean = AnalyticsUtils.calculateMean(dailyCounts)
      const stdDev = AnalyticsUtils.calculateStandardDeviation(dailyCounts)
      const zScore = AnalyticsUtils.calculateZScore(count, mean, stdDev)
      
      const severityLevel = Math.abs(zScore) > 3 ? 'high' : Math.abs(zScore) > 2.5 ? 'medium' : 'low'
      const anomalyType = count > mean ? 'spike' : 'drop'
      
      anomalies.push({
        id: `daily-${date}-${Date.now()}`,
        timestamp: parseDate(date),
        anomaly_type: `daily_${anomalyType}`,
        severity: severityLevel as 'low' | 'medium' | 'high',
        affected_regions: ['national'],
        description: `${anomalyType === 'spike' ? 'Unusual spike' : 'Unusual drop'} in daily enrolments: ${count.toLocaleString()}`,
        confidence_score: Math.min(Math.abs(zScore) / 3, 1),
        suggested_actions: ['Investigate data patterns', 'Review regional breakdown']
      })
    }

    const topRegions = Array.from(regionalData.entries())
      .sort((a, b) => {
        const sumA = Array.from(a[1].values()).reduce((s, v) => s + v, 0)
        const sumB = Array.from(b[1].values()).reduce((s, v) => s + v, 0)
        return sumB - sumA
      })
      .slice(0, 30)

    for (const [regionKey, regionDailyData] of topRegions) {
      const regionCounts = Array.from(regionDailyData.values())
      if (regionCounts.length < 5) continue
      
      const regionAnomalyIndices = AnalyticsUtils.detectAnomaliesZScore(regionCounts, threshold)
      const regionDates = Array.from(regionDailyData.keys())
      
      for (const index of regionAnomalyIndices) {
        const date = regionDates[index]
        const count = regionCounts[index]
        const mean = AnalyticsUtils.calculateMean(regionCounts)
        const zScore = AnalyticsUtils.calculateZScore(count, mean, AnalyticsUtils.calculateStandardDeviation(regionCounts))
        
        const severityLevel = Math.abs(zScore) > 3 ? 'high' : Math.abs(zScore) > 2.5 ? 'medium' : 'low'
        
        anomalies.push({
          id: `regional-${regionKey}-${date}`,
          timestamp: parseDate(date),
          anomaly_type: count > mean ? 'regional_spike' : 'regional_drop',
          severity: severityLevel as 'low' | 'medium' | 'high',
          affected_regions: [regionKey],
          description: `Regional ${count > mean ? 'spike' : 'drop'} in ${regionKey}: ${count.toLocaleString()} enrolments`,
          confidence_score: Math.min(Math.abs(zScore) / 3, 1),
          suggested_actions: ['Investigate regional issues', 'Check local infrastructure']
        })
      }
    }

    const filteredAnomalies = severity ? anomalies.filter(a => a.severity === severity) : anomalies

    filteredAnomalies.sort((a, b) => {
      const severityOrder = { high: 3, medium: 2, low: 1 }
      return severityOrder[b.severity] - severityOrder[a.severity] || b.confidence_score - a.confidence_score
    })

    return NextResponse.json({
      anomalies: filteredAnomalies.slice(0, 20),
      total_anomalies: filteredAnomalies.length,
      data_source: 'csv'
    })

  } catch (error) {
    console.error('Anomaly detection error:', error)
    return NextResponse.json({ error: 'Internal server error', details: String(error) }, { status: 500 })
  }
}
