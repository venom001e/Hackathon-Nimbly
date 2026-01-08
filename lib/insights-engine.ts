import { csvDataLoader, AadhaarEnrolmentRecord } from './csv-data-loader'
import { AnalyticsUtils } from './analytics-utils'

export interface InsightQuery {
  type: 'trend' | 'comparison' | 'anomaly' | 'summary' | 'forecast'
  state?: string
  district?: string
  ageGroup?: 'age_0_5' | 'age_5_17' | 'age_18_greater'
  timePeriod?: string
}

export interface InsightResponse {
  answer: string
  data?: any
  chartType?: 'bar' | 'line' | 'pie' | 'none'
  chartData?: any[]
}

export class InsightsEngine {
  
  async processNaturalQuery(query: string): Promise<InsightResponse> {
    const lowerQuery = query.toLowerCase()
    
    // Parse intent and entities from query
    const state = this.extractState(lowerQuery)
    const district = this.extractDistrict(lowerQuery)
    const ageGroup = this.extractAgeGroup(lowerQuery)
    const timePeriod = this.extractTimePeriod(lowerQuery)
    
    // Determine query type
    if (lowerQuery.includes('trend') || lowerQuery.includes('pattern')) {
      return this.getTrendInsight(state, district, ageGroup, timePeriod)
    }
    
    if (lowerQuery.includes('spike') || lowerQuery.includes('anomal') || lowerQuery.includes('unusual')) {
      return this.getAnomalyInsight(state, timePeriod)
    }
    
    if (lowerQuery.includes('compare') || lowerQuery.includes('vs') || lowerQuery.includes('versus')) {
      return this.getComparisonInsight(state, district)
    }
    
    if (lowerQuery.includes('top') || lowerQuery.includes('best') || lowerQuery.includes('highest')) {
      return this.getTopPerformersInsight(ageGroup)
    }
    
    if (lowerQuery.includes('total') || lowerQuery.includes('kitne') || lowerQuery.includes('how many')) {
      return this.getSummaryInsight(state, district, ageGroup)
    }
    
    // Default: general summary
    return this.getGeneralInsight(state, district)
  }

  private extractState(query: string): string | undefined {
    const states = [
      'andhra pradesh', 'arunachal pradesh', 'assam', 'bihar', 'chhattisgarh',
      'goa', 'gujarat', 'haryana', 'himachal pradesh', 'jharkhand', 'karnataka',
      'kerala', 'madhya pradesh', 'maharashtra', 'manipur', 'meghalaya', 'mizoram',
      'nagaland', 'odisha', 'punjab', 'rajasthan', 'sikkim', 'tamil nadu',
      'telangana', 'tripura', 'uttar pradesh', 'uttarakhand', 'west bengal', 'delhi',
      'up', 'mp', 'ap', 'tn', 'wb', 'mh'
    ]
    
    const stateMap: Record<string, string> = {
      'up': 'Uttar Pradesh', 'mp': 'Madhya Pradesh', 'ap': 'Andhra Pradesh',
      'tn': 'Tamil Nadu', 'wb': 'West Bengal', 'mh': 'Maharashtra'
    }
    
    for (const state of states) {
      if (query.includes(state)) {
        return stateMap[state] || state.split(' ').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
      }
    }
    return undefined
  }

  private extractDistrict(query: string): string | undefined {
    // Common district patterns - would need full list for production
    const districtMatch = query.match(/(?:district|in)\s+([a-z\s]+?)(?:\s+(?:last|this|in|for|during)|$)/i)
    return districtMatch ? districtMatch[1].trim() : undefined
  }

  private extractAgeGroup(query: string): 'age_0_5' | 'age_5_17' | 'age_18_greater' | undefined {
    if (query.includes('0-5') || query.includes('0 to 5') || query.includes('infant') || query.includes('baby')) {
      return 'age_0_5'
    }
    if (query.includes('5-17') || query.includes('5 to 17') || query.includes('child') || query.includes('school')) {
      return 'age_5_17'
    }
    if (query.includes('18+') || query.includes('adult') || query.includes('18 above') || query.includes('greater')) {
      return 'age_18_greater'
    }
    return undefined
  }

  private extractTimePeriod(query: string): string {
    if (query.includes('today')) return '1d'
    if (query.includes('yesterday')) return '2d'
    if (query.includes('week') || query.includes('7 day')) return '7d'
    if (query.includes('month') || query.includes('30 day')) return '30d'
    if (query.includes('quarter') || query.includes('90 day')) return '90d'
    if (query.includes('year') || query.includes('365')) return '365d'
    return '30d'
  }


  private async getTrendInsight(
    state?: string, 
    district?: string, 
    ageGroup?: string,
    timePeriod?: string
  ): Promise<InsightResponse> {
    const metrics = await csvDataLoader.getAggregatedMetrics({ state, district })
    const dailyTrends = await csvDataLoader.getDailyTrends(30)
    const dailyCounts = dailyTrends.map((d: any) => d.count)
    
    const trendDirection = AnalyticsUtils.detectTrendDirection(dailyCounts)
    const mean = AnalyticsUtils.calculateMean(dailyCounts)
    
    let ageInfo = ''
    if (ageGroup) {
      const ageData = metrics.byAgeGroup[ageGroup as keyof typeof metrics.byAgeGroup]
      const total = metrics.byAgeGroup.age_0_5 + metrics.byAgeGroup.age_5_17 + metrics.byAgeGroup.age_18_greater
      const percentage = ((ageData / total) * 100).toFixed(1)
      ageInfo = ` The ${ageGroup.replace('age_', '').replace('_', '-')} age group accounts for ${percentage}% (${ageData.toLocaleString()}) of total enrolments.`
    }
    
    const location = state ? (district ? `${district}, ${state}` : state) : 'all India'
    
    return {
      answer: `📈 Trend Analysis for ${location}:\n\nThe enrolment trend is ${trendDirection} over the last 30 days. Average daily enrolments: ${Math.round(mean).toLocaleString()}.${ageInfo}\n\nTotal enrolments: ${metrics.totalEnrolments.toLocaleString()}`,
      data: { trendDirection, mean, total: metrics.totalEnrolments },
      chartType: 'line',
      chartData: dailyTrends
    }
  }

  private async getAnomalyInsight(state?: string, timePeriod?: string): Promise<InsightResponse> {
    const data = await csvDataLoader.loadAllData()
    const filteredData = state ? data.filter(r => r.state === state) : data
    
    // Aggregate by date
    const dailyData = new Map<string, number>()
    filteredData.forEach(r => {
      dailyData.set(r.date, (dailyData.get(r.date) || 0) + r.total)
    })
    
    const dailyCounts = Array.from(dailyData.values())
    const dates = Array.from(dailyData.keys())
    const anomalyIndices = AnalyticsUtils.detectAnomaliesZScore(dailyCounts, 2.0)
    
    if (anomalyIndices.length === 0) {
      return {
        answer: `✅ No significant anomalies detected ${state ? `in ${state}` : 'across India'} in the recent data. Enrolment patterns are within normal range.`,
        chartType: 'none'
      }
    }
    
    const anomalies = anomalyIndices.map((i: number) => ({
      date: dates[i],
      count: dailyCounts[i],
      type: dailyCounts[i] > AnalyticsUtils.calculateMean(dailyCounts) ? 'spike' : 'drop'
    }))
    
    const spikes = anomalies.filter(a => a.type === 'spike')
    const drops = anomalies.filter(a => a.type === 'drop')
    
    let answer = `⚠️ Anomaly Report ${state ? `for ${state}` : '(All India)'}:\n\n`
    
    if (spikes.length > 0) {
      answer += `📈 ${spikes.length} unusual spike(s) detected:\n`
      spikes.slice(0, 3).forEach(s => {
        answer += `  • ${s.date}: ${s.count.toLocaleString()} enrolments\n`
      })
    }
    
    if (drops.length > 0) {
      answer += `\n📉 ${drops.length} unusual drop(s) detected:\n`
      drops.slice(0, 3).forEach(d => {
        answer += `  • ${d.date}: ${d.count.toLocaleString()} enrolments\n`
      })
    }
    
    return {
      answer,
      data: { anomalies, totalAnomalies: anomalyIndices.length },
      chartType: 'line',
      chartData: dates.map((date, i) => ({ 
        date, 
        count: dailyCounts[i],
        isAnomaly: anomalyIndices.includes(i)
      }))
    }
  }

  private async getComparisonInsight(state1?: string, state2?: string): Promise<InsightResponse> {
    const topStates = await csvDataLoader.getTopStates(5)
    
    if (state1) {
      const stateMetrics = await csvDataLoader.getAggregatedMetrics({ state: state1 })
      const allMetrics = await csvDataLoader.getAggregatedMetrics()
      const percentage = ((stateMetrics.totalEnrolments / allMetrics.totalEnrolments) * 100).toFixed(2)
      
      return {
        answer: `📊 ${state1} Comparison:\n\nTotal enrolments: ${stateMetrics.totalEnrolments.toLocaleString()}\nShare of national total: ${percentage}%\n\nAge breakdown:\n• 0-5 years: ${stateMetrics.byAgeGroup.age_0_5.toLocaleString()}\n• 5-17 years: ${stateMetrics.byAgeGroup.age_5_17.toLocaleString()}\n• 18+ years: ${stateMetrics.byAgeGroup.age_18_greater.toLocaleString()}`,
        data: stateMetrics,
        chartType: 'pie',
        chartData: [
          { name: '0-5 years', value: stateMetrics.byAgeGroup.age_0_5 },
          { name: '5-17 years', value: stateMetrics.byAgeGroup.age_5_17 },
          { name: '18+ years', value: stateMetrics.byAgeGroup.age_18_greater }
        ]
      }
    }
    
    let answer = '📊 State-wise Comparison (Top 5):\n\n'
    topStates.forEach((s, i) => {
      answer += `${i + 1}. ${s.state}: ${s.count.toLocaleString()} enrolments\n`
    })
    
    return {
      answer,
      chartType: 'bar',
      chartData: topStates
    }
  }

  private async getTopPerformersInsight(ageGroup?: string): Promise<InsightResponse> {
    const topStates = await csvDataLoader.getTopStates(10)
    const topDistricts = await csvDataLoader.getTopDistricts(10)
    
    let answer = '🏆 Top Performers:\n\n'
    answer += '📍 Top 5 States:\n'
    topStates.slice(0, 5).forEach((s, i) => {
      answer += `  ${i + 1}. ${s.state}: ${s.count.toLocaleString()}\n`
    })
    
    answer += '\n📍 Top 5 Districts:\n'
    topDistricts.slice(0, 5).forEach((d, i) => {
      answer += `  ${i + 1}. ${d.district}, ${d.state}: ${d.count.toLocaleString()}\n`
    })
    
    return {
      answer,
      chartType: 'bar',
      chartData: topStates.slice(0, 10)
    }
  }

  private async getSummaryInsight(state?: string, district?: string, ageGroup?: string): Promise<InsightResponse> {
    const metrics = await csvDataLoader.getAggregatedMetrics({ state, district })
    const location = state ? (district ? `${district}, ${state}` : state) : 'All India'
    
    let answer = `📋 Summary for ${location}:\n\n`
    answer += `Total Enrolments: ${metrics.totalEnrolments.toLocaleString()}\n\n`
    answer += `Age Group Breakdown:\n`
    answer += `• 0-5 years: ${metrics.byAgeGroup.age_0_5.toLocaleString()}\n`
    answer += `• 5-17 years: ${metrics.byAgeGroup.age_5_17.toLocaleString()}\n`
    answer += `• 18+ years: ${metrics.byAgeGroup.age_18_greater.toLocaleString()}`
    
    return {
      answer,
      data: metrics,
      chartType: 'pie',
      chartData: [
        { name: '0-5 years', value: metrics.byAgeGroup.age_0_5 },
        { name: '5-17 years', value: metrics.byAgeGroup.age_5_17 },
        { name: '18+ years', value: metrics.byAgeGroup.age_18_greater }
      ]
    }
  }

  private async getGeneralInsight(state?: string, district?: string): Promise<InsightResponse> {
    return this.getSummaryInsight(state, district)
  }

  // Generate automated report data
  async generateWeeklyReport(): Promise<{
    summary: any
    trends: any
    anomalies: any
    topPerformers: any
    recommendations: string[]
  }> {
    const metrics = await csvDataLoader.getAggregatedMetrics()
    const topStates = await csvDataLoader.getTopStates(10)
    const dailyTrends = await csvDataLoader.getDailyTrends(7)
    const dailyCounts = dailyTrends.map((d: any) => d.count)
    
    const trendDirection = AnalyticsUtils.detectTrendDirection(dailyCounts)
    const anomalyIndices = AnalyticsUtils.detectAnomaliesZScore(dailyCounts, 2.0)
    
    const recommendations: string[] = []
    
    if (trendDirection === 'decreasing') {
      recommendations.push('Enrolment trend is declining. Consider reviewing operational capacity in low-performing regions.')
    }
    if (anomalyIndices.length > 0) {
      recommendations.push(`${anomalyIndices.length} anomalies detected. Investigate data quality and regional issues.`)
    }
    if (metrics.byAgeGroup.age_0_5 < metrics.byAgeGroup.age_18_greater * 0.3) {
      recommendations.push('0-5 age group enrolments are relatively low. Consider targeted awareness campaigns.')
    }
    
    return {
      summary: {
        totalEnrolments: metrics.totalEnrolments,
        ageDistribution: metrics.byAgeGroup,
        uniqueDates: dailyTrends.length
      },
      trends: {
        direction: trendDirection,
        dailyAverage: Math.round(AnalyticsUtils.calculateMean(dailyCounts)),
        data: dailyTrends
      },
      anomalies: {
        count: anomalyIndices.length,
        indices: anomalyIndices
      },
      topPerformers: topStates,
      recommendations
    }
  }
}

export const insightsEngine = new InsightsEngine()
