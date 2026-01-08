import { NextRequest, NextResponse } from 'next/server'
import { insightsEngine } from '@/lib/insights-engine'
import { csvDataLoader } from '@/lib/csv-data-loader'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const format = searchParams.get('format') || 'json'
    const state = searchParams.get('state')
    const reportType = searchParams.get('type') || 'summary'
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    // Generate report data
    const reportData = await insightsEngine.generateWeeklyReport()
    const stateSummary = await csvDataLoader.getStateSummary()
    const dailyTrends = await csvDataLoader.getDailyTrends(30)
    
    // Add state-specific data if requested
    let stateData = null
    if (state) {
      const stateMetrics = await csvDataLoader.getAggregatedMetrics({ 
        state,
        startDate: startDate || undefined,
        endDate: endDate || undefined
      })
      const districts = await csvDataLoader.getDistrictsByState(state)
      stateData = {
        state,
        metrics: {
          totalEnrolments: stateMetrics.totalEnrolments,
          byAgeGroup: stateMetrics.byAgeGroup
        },
        districtCount: districts.length,
        districts: districts
      }
    }

    const report = {
      title: 'Nimbly Enrolment Analytics Report',
      generatedAt: new Date().toISOString(),
      reportType,
      period: startDate && endDate ? `${startDate} to ${endDate}` : 'Last 7 Days',
      
      executiveSummary: {
        totalEnrolments: reportData.summary.totalEnrolments,
        trendDirection: reportData.trends.direction,
        dailyAverage: reportData.trends.dailyAverage,
        anomaliesDetected: reportData.anomalies.count,
        topState: reportData.topPerformers[0]?.state || 'N/A',
        dataQuality: 'High',
        lastUpdated: new Date().toISOString()
      },
      
      ageDistribution: {
        age_0_5: {
          count: reportData.summary.ageDistribution.age_0_5,
          percentage: ((reportData.summary.ageDistribution.age_0_5 / reportData.summary.totalEnrolments) * 100).toFixed(2)
        },
        age_5_17: {
          count: reportData.summary.ageDistribution.age_5_17,
          percentage: ((reportData.summary.ageDistribution.age_5_17 / reportData.summary.totalEnrolments) * 100).toFixed(2)
        },
        age_18_greater: {
          count: reportData.summary.ageDistribution.age_18_greater,
          percentage: ((reportData.summary.ageDistribution.age_18_greater / reportData.summary.totalEnrolments) * 100).toFixed(2)
        }
      },
      
      topPerformingStates: reportData.topPerformers.slice(0, 10),
      
      stateSummary: stateSummary,
      
      dailyTrends: dailyTrends,
      
      anomalyAnalysis: {
        totalAnomalies: reportData.anomalies.count,
        status: reportData.anomalies.count === 0 ? 'Normal' : 'Attention Required',
        severity: reportData.anomalies.count > 5 ? 'High' : reportData.anomalies.count > 0 ? 'Medium' : 'Low'
      },
      
      recommendations: reportData.recommendations,
      
      stateSpecificData: stateData,

      metadata: {
        generatedBy: 'Nimbly EnrolmentAnalytics Dashboard',
        version: '2.0',
        dataSource: 'UIDAI CSV Data'
      }
    }

    if (format === 'csv') {
      let csvRows: string[] = []
      
      if (reportType === 'detailed') {
        // Detailed report with daily trends
        csvRows = [
          'Report Type: Detailed Analytics Report',
          `Generated: ${new Date().toISOString()}`,
          '',
          'STATE SUMMARY',
          'State,Total Enrolments,Age 0-5,Age 5-17,Age 18+,Districts',
          ...stateSummary.map(s => 
            `${s.state},${s.totalEnrolments},${s.age_0_5},${s.age_5_17},${s.age_18_greater},${s.districts}`
          ),
          '',
          'DAILY TRENDS',
          'Date,Enrolments',
          ...dailyTrends.map(d => `${d.date},${d.count}`)
        ]
      } else if (reportType === 'comparison') {
        // State comparison report
        csvRows = [
          'Report Type: State Comparison Report',
          `Generated: ${new Date().toISOString()}`,
          '',
          'Rank,State,Total Enrolments,Age 0-5,Age 5-17,Age 18+,Districts,Share %',
          ...stateSummary.map((s, i) => {
            const share = ((s.totalEnrolments / reportData.summary.totalEnrolments) * 100).toFixed(2)
            return `${i + 1},${s.state},${s.totalEnrolments},${s.age_0_5},${s.age_5_17},${s.age_18_greater},${s.districts},${share}%`
          })
        ]
      } else {
        // Summary report
        csvRows = [
          'Report Type: Summary Report',
          `Generated: ${new Date().toISOString()}`,
          '',
          'EXECUTIVE SUMMARY',
          `Total Enrolments,${reportData.summary.totalEnrolments}`,
          `Daily Average,${reportData.trends.dailyAverage}`,
          `Trend Direction,${reportData.trends.direction}`,
          `Anomalies Detected,${reportData.anomalies.count}`,
          '',
          'STATE SUMMARY',
          'State,Total Enrolments,Age 0-5,Age 5-17,Age 18+,Districts',
          ...stateSummary.map(s => 
            `${s.state},${s.totalEnrolments},${s.age_0_5},${s.age_5_17},${s.age_18_greater},${s.districts}`
          )
        ]
      }
      
      return new NextResponse(csvRows.join('\n'), {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="aadhaar-${reportType}-report-${new Date().toISOString().split('T')[0]}.csv"`
        }
      })
    }

    return NextResponse.json(report)

  } catch (error) {
    console.error('Report generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate report', details: String(error) },
      { status: 500 }
    )
  }
}
