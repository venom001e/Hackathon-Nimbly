'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import MetricsCards from '@/components/dashboard/MetricsCards'
import TrendChart from '@/components/dashboard/TrendChart'
import StateHeatmap from '@/components/dashboard/StateHeatmap'

interface DemographicMetrics {
  total_updates: number
  pending_updates: number
  success_rate: number
  average_processing_time: number
}

interface UpdateData {
  date: string
  count: number
  type: string
  status: string
}

export default function DemographicUpdatesPage() {
  const [metrics, setMetrics] = useState<DemographicMetrics | null>(null)
  const [updateData, setUpdateData] = useState<UpdateData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchDemographicData()
  }, [])

  const fetchDemographicData = async () => {
    try {
      setLoading(true)
      
      // Mock data for now - replace with actual API calls
      setMetrics({
        total_updates: 125430,
        pending_updates: 8920,
        success_rate: 94.2,
        average_processing_time: 2.5
      })
      
      // Mock trend data
      const mockData = Array.from({ length: 30 }, (_, i) => ({
        date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        count: Math.floor(Math.random() * 1000) + 500,
        type: 'address_update',
        status: 'completed'
      }))
      
      setUpdateData(mockData)
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
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
              onClick={fetchDemographicData}
              className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
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
          <h1 className="text-3xl font-bold text-gray-900">Demographic Update Analytics</h1>
          <p className="text-gray-600 mt-2">
            Track and analyze demographic information updates and modifications
          </p>
        </div>
      </div>

      {/* Metrics Overview */}
      {metrics && (
        <MetricsCards 
          totalEnrolments={metrics.total_updates}
          growthRate={15.3}
          anomalies={metrics.pending_updates}
          accuracy={metrics.success_rate}
          states={28}
          loading={false}
        />
      )}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Update Trends</CardTitle>
            <CardDescription>Daily demographic update patterns</CardDescription>
          </CardHeader>
          <CardContent>
            <TrendChart data={updateData} title="Update Trends" loading={false} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Update Types Distribution</CardTitle>
            <CardDescription>Breakdown by update categories</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Address Updates</span>
                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: '45%' }}></div>
                  </div>
                  <span className="text-sm font-medium">45%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span>Name Corrections</span>
                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '28%' }}></div>
                  </div>
                  <span className="text-sm font-medium">28%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span>Phone Updates</span>
                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div className="bg-purple-600 h-2 rounded-full" style={{ width: '18%' }}></div>
                  </div>
                  <span className="text-sm font-medium">18%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span>Email Updates</span>
                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div className="bg-orange-600 h-2 rounded-full" style={{ width: '9%' }}></div>
                  </div>
                  <span className="text-sm font-medium">9%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Geographic Distribution</CardTitle>
            <CardDescription>State-wise demographic update heatmap</CardDescription>
          </CardHeader>
          <CardContent>
            <StateHeatmap 
              data={[
                { state: "Uttar Pradesh", count: 15000 },
                { state: "Maharashtra", count: 12000 },
                { state: "Bihar", count: 10000 },
                { state: "West Bengal", count: 8500 },
                { state: "Madhya Pradesh", count: 7200 }
              ]}
              loading={false}
            />
          </CardContent>
        </Card>
      </div>

      {/* Status Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Processing Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                  Completed
                </span>
                <span className="font-semibold">94.2%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="flex items-center">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                  In Progress
                </span>
                <span className="font-semibold">4.1%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="flex items-center">
                  <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                  Failed
                </span>
                <span className="font-semibold">1.7%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Reasons for Updates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Address Change</span>
                <span className="font-semibold">42%</span>
              </div>
              <div className="flex justify-between">
                <span>Marriage</span>
                <span className="font-semibold">23%</span>
              </div>
              <div className="flex justify-between">
                <span>Job Transfer</span>
                <span className="font-semibold">18%</span>
              </div>
              <div className="flex justify-between">
                <span>Data Correction</span>
                <span className="font-semibold">17%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Processing Time Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Same Day</span>
                <span className="font-semibold">35%</span>
              </div>
              <div className="flex justify-between">
                <span>1-3 Days</span>
                <span className="font-semibold">45%</span>
              </div>
              <div className="flex justify-between">
                <span>4-7 Days</span>
                <span className="font-semibold">15%</span>
              </div>
              <div className="flex justify-between">
                <span>7+ Days</span>
                <span className="font-semibold">5%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}