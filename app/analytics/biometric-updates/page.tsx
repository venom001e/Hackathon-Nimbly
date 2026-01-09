'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import MetricsCards from '@/components/dashboard/MetricsCards'
import TrendChart from '@/components/dashboard/TrendChart'
import StateHeatmap from '@/components/dashboard/StateHeatmap'

interface BiometricMetrics {
  total_updates: number
  fingerprint_updates: number
  iris_updates: number
  face_updates: number
  success_rate: number
  quality_score: number
}

interface BiometricData {
  date: string
  count: number
  type: string
  quality: number
}

export default function BiometricUpdatesPage() {
  const [metrics, setMetrics] = useState<BiometricMetrics | null>(null)
  const [biometricData, setBiometricData] = useState<BiometricData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchBiometricData()
  }, [])

  const fetchBiometricData = async () => {
    try {
      setLoading(true)
      
      // Mock data for now - replace with actual API calls
      setMetrics({
        total_updates: 89340,
        fingerprint_updates: 45230,
        iris_updates: 28450,
        face_updates: 15660,
        success_rate: 91.8,
        quality_score: 87.5
      })
      
      // Mock trend data
      const mockData = Array.from({ length: 30 }, (_, i) => ({
        date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        count: Math.floor(Math.random() * 800) + 200,
        type: 'fingerprint',
        quality: Math.floor(Math.random() * 20) + 80
      }))
      
      setBiometricData(mockData)
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
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
              onClick={fetchBiometricData}
              className="mt-4 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
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
          <h1 className="text-3xl font-bold text-gray-900">Biometric Update Analytics</h1>
          <p className="text-gray-600 mt-2">
            Monitor and analyze biometric data updates including fingerprints, iris, and facial recognition
          </p>
        </div>
      </div>

      {/* Metrics Overview */}
      {metrics && (
        <MetricsCards 
          totalEnrolments={metrics.total_updates}
          growthRate={18.2}
          anomalies={Math.round(metrics.total_updates * 0.05)}
          accuracy={metrics.success_rate}
          states={28}
          loading={false}
        />
      )}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Biometric Update Trends</CardTitle>
            <CardDescription>Daily biometric update patterns</CardDescription>
          </CardHeader>
          <CardContent>
            <TrendChart data={biometricData} title="Biometric Update Trends" loading={false} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Biometric Types Distribution</CardTitle>
            <CardDescription>Breakdown by biometric modalities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="flex items-center">
                  <div className="w-4 h-4 bg-blue-500 rounded mr-3"></div>
                  Fingerprint
                </span>
                <div className="flex items-center space-x-2">
                  <div className="w-32 bg-gray-200 rounded-full h-3">
                    <div className="bg-blue-500 h-3 rounded-full" style={{ width: '51%' }}></div>
                  </div>
                  <span className="text-sm font-medium">51%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center">
                  <div className="w-4 h-4 bg-green-500 rounded mr-3"></div>
                  Iris Scan
                </span>
                <div className="flex items-center space-x-2">
                  <div className="w-32 bg-gray-200 rounded-full h-3">
                    <div className="bg-green-500 h-3 rounded-full" style={{ width: '32%' }}></div>
                  </div>
                  <span className="text-sm font-medium">32%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center">
                  <div className="w-4 h-4 bg-purple-500 rounded mr-3"></div>
                  Facial Recognition
                </span>
                <div className="flex items-center space-x-2">
                  <div className="w-32 bg-gray-200 rounded-full h-3">
                    <div className="bg-purple-500 h-3 rounded-full" style={{ width: '17%' }}></div>
                  </div>
                  <span className="text-sm font-medium">17%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Geographic Distribution</CardTitle>
            <CardDescription>State-wise biometric update heatmap</CardDescription>
          </CardHeader>
          <CardContent>
            <StateHeatmap 
              data={[
                { state: "Uttar Pradesh", count: 12000 },
                { state: "Maharashtra", count: 9800 },
                { state: "Bihar", count: 8700 },
                { state: "West Bengal", count: 7600 },
                { state: "Madhya Pradesh", count: 6500 }
              ]}
              loading={false}
            />
          </CardContent>
        </Card>
      </div>

      {/* Quality Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Quality Scores</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                  Excellent (90-100%)
                </span>
                <span className="font-semibold">45%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="flex items-center">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                  Good (80-89%)
                </span>
                <span className="font-semibold">38%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="flex items-center">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                  Fair (70-79%)
                </span>
                <span className="font-semibold">12%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="flex items-center">
                  <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                  Poor (&lt;70%)
                </span>
                <span className="font-semibold">5%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Update Reasons</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Quality Improvement</span>
                <span className="font-semibold">38%</span>
              </div>
              <div className="flex justify-between">
                <span>Missing Biometric</span>
                <span className="font-semibold">25%</span>
              </div>
              <div className="flex justify-between">
                <span>Damaged/Injured</span>
                <span className="font-semibold">20%</span>
              </div>
              <div className="flex justify-between">
                <span>System Error</span>
                <span className="font-semibold">17%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Processing Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Instant</span>
                <span className="font-semibold">62%</span>
              </div>
              <div className="flex justify-between">
                <span>1-5 Minutes</span>
                <span className="font-semibold">28%</span>
              </div>
              <div className="flex justify-between">
                <span>5-15 Minutes</span>
                <span className="font-semibold">8%</span>
              </div>
              <div className="flex justify-between">
                <span>15+ Minutes</span>
                <span className="font-semibold">2%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Device Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Device Performance Analysis</CardTitle>
          <CardDescription>Biometric capture device efficiency and reliability</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">98.2%</div>
              <div className="text-sm text-gray-600">Device Uptime</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">91.8%</div>
              <div className="text-sm text-gray-600">Capture Success</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">2.3s</div>
              <div className="text-sm text-gray-600">Avg Capture Time</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">87.5%</div>
              <div className="text-sm text-gray-600">Quality Score</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}