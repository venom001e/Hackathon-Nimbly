'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import MetricsCards from '@/components/dashboard/MetricsCards'
import TrendChart from '@/components/dashboard/TrendChart'
import StateHeatmap from '@/components/dashboard/StateHeatmap'
import AgeDistributionChart from '@/components/dashboard/AgeDistributionChart'

interface EnrolmentMetrics {
  total_enrolments: number
  daily_average: number
  growth_rate: number
  completion_rate: number
}

interface EnrolmentData {
  date: string
  count: number
  state: string
  district: string
  age_group: string
}

export default function EnrolmentDataPage() {
  const [metrics, setMetrics] = useState<EnrolmentMetrics | null>(null)
  const [trendData, setTrendData] = useState<EnrolmentData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchEnrolmentData()
  }, [])

  const fetchEnrolmentData = async () => {
    try {
      setLoading(true)
      
      // Fetch metrics
      const metricsResponse = await fetch('/api/analytics/metrics?type=enrolment')
      if (!metricsResponse.ok) throw new Error('Failed to fetch metrics')
      const metricsData = await metricsResponse.json()
      
      // Fetch trend data
      const trendsResponse = await fetch('/api/analytics/trends?metric=enrolment_count&time_period=30d')
      if (!trendsResponse.ok) throw new Error('Failed to fetch trends')
      const trendsData = await trendsResponse.json()
      
      setMetrics({
        total_enrolments: metricsData.total_records || 0,
        daily_average: Math.round(metricsData.total_records / 30) || 0,
        growth_rate: 12.5, // Mock data
        completion_rate: 89.2 // Mock data
      })
      
      setTrendData(trendsData.daily_data || [])
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
            <button 
              onClick={fetchEnrolmentData}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Retry
            </button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Enrolment Data Analytics</h1>
          <p className="text-gray-600 mt-2">
            Comprehensive analysis of Aadhaar enrolment patterns and trends
          </p>
        </div>
      </div>

      {/* Metrics Overview */}
      {metrics && (
        <MetricsCards 
          totalEnrolments={metrics.total_enrolments}
          dailyGrowthRate={metrics.growth_rate}
          anomalyCount={0}
          predictionAccuracy={metrics.completion_rate}
          uniqueStates={28}
          loading={false}
        />
      )}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Enrolment Trends</CardTitle>
            <CardDescription>Daily enrolment patterns over time</CardDescription>
          </CardHeader>
          <CardContent>
            <TrendChart data={trendData} title="Enrolment Trends" loading={false} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Age Distribution</CardTitle>
            <CardDescription>Enrolment breakdown by age groups</CardDescription>
          </CardHeader>
          <CardContent>
            <AgeDistributionChart 
              data={{
                age_0_5: { count: 125000, percentage: 25 },
                age_5_17: { count: 200000, percentage: 40 },
                age_18_greater: { count: 175000, percentage: 35 }
              }}
              loading={false}
            />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Geographic Distribution</CardTitle>
            <CardDescription>State-wise enrolment heatmap</CardDescription>
          </CardHeader>
          <CardContent>
            <StateHeatmap 
              data={[
                { state: "Uttar Pradesh", count: 125000 },
                { state: "Maharashtra", count: 98000 },
                { state: "Bihar", count: 87000 },
                { state: "West Bengal", count: 76000 },
                { state: "Madhya Pradesh", count: 65000 }
              ]}
              loading={false}
            />
          </CardContent>
        </Card>
      </div>

      {/* Additional Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Peak Hours</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>10:00 AM - 12:00 PM</span>
                <span className="font-semibold">35%</span>
              </div>
              <div className="flex justify-between">
                <span>2:00 PM - 4:00 PM</span>
                <span className="font-semibold">28%</span>
              </div>
              <div className="flex justify-between">
                <span>4:00 PM - 6:00 PM</span>
                <span className="font-semibold">22%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top States</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Uttar Pradesh</span>
                <span className="font-semibold">18.2%</span>
              </div>
              <div className="flex justify-between">
                <span>Maharashtra</span>
                <span className="font-semibold">12.8%</span>
              </div>
              <div className="flex justify-between">
                <span>Bihar</span>
                <span className="font-semibold">9.5%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Document Types</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Birth Certificate</span>
                <span className="font-semibold">45%</span>
              </div>
              <div className="flex justify-between">
                <span>School ID</span>
                <span className="font-semibold">32%</span>
              </div>
              <div className="flex justify-between">
                <span>Passport</span>
                <span className="font-semibold">23%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}