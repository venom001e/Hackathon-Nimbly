"use client"

import { useState, useEffect, useRef } from 'react'
import { Chart, registerables } from 'chart.js'
import { 
  TrophyIcon, StarIcon, FlameIcon, TargetIcon, UsersIcon, GiftIcon,
  ChevronRightIcon, RefreshCwIcon, MedalIcon, ZapIcon, TrendingUpIcon,
  CalendarIcon, MapPinIcon, AwardIcon, CrownIcon, SparklesIcon,
  CheckCircleIcon, ClockIcon, ShareIcon, BrainCircuitIcon, AlertTriangleIcon,
  ShieldAlertIcon, BellRingIcon, TruckIcon, MessageSquareIcon, PhoneIcon,
  MailIcon, ActivityIcon, EyeIcon, XIcon
} from 'lucide-react'
import Link from 'next/link'

Chart.register(...registerables)

// ============ INTERFACES ============
interface EnrolmentCenter {
  id: string; name: string; state: string; district: string; rank: number
  totalEnrolments: number; weeklyEnrolments: number; streak: number
  points: number; level: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond'
  badges: string[]; trend: 'up' | 'down' | 'stable'
}

interface Challenge {
  id: string; title: string; description: string; target: number; current: number
  reward: string; rewardPoints: number; deadline: string
  type: 'daily' | 'weekly' | 'monthly' | 'special'
  status: 'active' | 'completed' | 'expired'; participants: number
}

interface Achievement {
  id: string; name: string; description: string; icon: string
  unlockedAt?: string; progress: number; target: number
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
}

interface AIAlert {
  id: string; type: 'fraud' | 'bottleneck' | 'quality' | 'opportunity'
  severity: 'critical' | 'warning' | 'info'
  title: string; message: string; location: string
  timestamp: string; recommendation: string; impact: string
}

interface CrisisZone {
  id: string; state: string; district: string; riskLevel: number
  alertCount: number; type: 'critical' | 'warning' | 'opportunity'
  issue: string; recommendation: string
}

interface Prediction {
  date: string; actual?: number; predicted: number; confidence: number
}

interface ResourceSuggestion {
  id: string; location: string; type: string; pendingCitizens: number
  cost: string; impact: string; roi: 'high' | 'medium' | 'low'
  recommendation: string
}

export default function AadhaarConnectPage() {
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'dashboard' | 'gamification' | 'ai-center' | 'crisis-map'>('dashboard')
  const [centers, setCenters] = useState<EnrolmentCenter[]>([])
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [aiAlerts, setAiAlerts] = useState<AIAlert[]>([])
  const [crisisZones, setCrisisZones] = useState<CrisisZone[]>([])
  const [predictions, setPredictions] = useState<Prediction[]>([])
  const [suggestions, setSuggestions] = useState<ResourceSuggestion[]>([])
  const [myCenter, setMyCenter] = useState<EnrolmentCenter | null>(null)
  const [showAlertPanel, setShowAlertPanel] = useState(false)
  const [selectedZone, setSelectedZone] = useState<CrisisZone | null>(null)
  
  const predictionChartRef = useRef<HTMLCanvasElement>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const chartInstance = useRef<Chart<any> | null>(null)

  useEffect(() => { loadAllData() }, [])
  
  useEffect(() => {
    if (predictions.length > 0 && predictionChartRef.current && activeTab === 'ai-center') {
      renderPredictionChart()
    }
  }, [predictions, activeTab])

  const loadAllData = async () => {
    setLoading(true)
    await new Promise(r => setTimeout(r, 600))
    setCenters(generateMockCenters())
    setChallenges(generateMockChallenges())
    setAchievements(generateMockAchievements())
    setAiAlerts(generateMockAlerts())
    setCrisisZones(generateMockCrisisZones())
    setPredictions(generateMockPredictions())
    setSuggestions(generateMockSuggestions())
    setMyCenter(generateMockCenters()[2])
    setLoading(false)
  }

  // ============ MOCK DATA GENERATORS ============
  const generateMockCenters = (): EnrolmentCenter[] => [
    { id: 'c1', name: 'Aadhaar Seva Kendra - CP', state: 'Delhi', district: 'Central Delhi', rank: 1, totalEnrolments: 45230, weeklyEnrolments: 1250, streak: 45, points: 125000, level: 'diamond', badges: ['🏆', '⚡', '🎯', '👑'], trend: 'up' },
    { id: 'c2', name: 'CSC Digital Seva - Andheri', state: 'Maharashtra', district: 'Mumbai', rank: 2, totalEnrolments: 42100, weeklyEnrolments: 1180, streak: 38, points: 118000, level: 'diamond', badges: ['🏆', '⚡', '🎯'], trend: 'up' },
    { id: 'c3', name: 'Jan Seva Kendra - Gomti Nagar', state: 'Uttar Pradesh', district: 'Lucknow', rank: 3, totalEnrolments: 38500, weeklyEnrolments: 980, streak: 32, points: 98000, level: 'platinum', badges: ['🏆', '⚡'], trend: 'stable' },
    { id: 'c4', name: 'Aadhaar Point - Salt Lake', state: 'West Bengal', district: 'Kolkata', rank: 4, totalEnrolments: 35200, weeklyEnrolments: 920, streak: 28, points: 89000, level: 'platinum', badges: ['🏆', '🎯'], trend: 'up' },
    { id: 'c5', name: 'Digital India - Koramangala', state: 'Karnataka', district: 'Bengaluru', rank: 5, totalEnrolments: 32800, weeklyEnrolments: 850, streak: 25, points: 82000, level: 'gold', badges: ['🏆'], trend: 'down' },
  ]

  const generateMockChallenges = (): Challenge[] => [
    { id: 'ch1', title: '🔥 Weekend Warrior', description: 'Complete 500 enrolments this weekend', target: 500, current: 342, reward: 'Gold Badge', rewardPoints: 5000, deadline: '2 days', type: 'weekly', status: 'active', participants: 1250 },
    { id: 'ch2', title: '👶 Child Enrolment Drive', description: 'Enrol 200 children (0-5 years)', target: 200, current: 156, reward: 'Special Recognition', rewardPoints: 8000, deadline: '12 days', type: 'monthly', status: 'active', participants: 890 },
    { id: 'ch3', title: '🏃 Speed Champion', description: 'Maintain <5 min processing time', target: 100, current: 100, reward: 'Efficiency Badge', rewardPoints: 3000, deadline: 'Done!', type: 'daily', status: 'completed', participants: 456 },
  ]

  const generateMockAchievements = (): Achievement[] => [
    { id: 'a1', name: 'First Steps', description: 'Complete 100 enrolments', icon: '🎯', unlockedAt: '2024-01-15', progress: 100, target: 100, rarity: 'common' },
    { id: 'a2', name: 'Rising Star', description: 'Reach 1,000 enrolments', icon: '⭐', unlockedAt: '2024-02-20', progress: 1000, target: 1000, rarity: 'common' },
    { id: 'a3', name: 'Speed Demon', description: 'Process 50 in <4 min each', icon: '⚡', unlockedAt: '2024-03-10', progress: 50, target: 50, rarity: 'rare' },
    { id: 'a4', name: 'Legendary Operator', description: 'Reach 50,000 lifetime', icon: '👑', progress: 38500, target: 50000, rarity: 'legendary' },
  ]

  const generateMockAlerts = (): AIAlert[] => [
    { id: 'al1', type: 'fraud', severity: 'critical', title: '🚨 Fraud Detected', message: '47 suspicious duplicate entries detected with 94% confidence', location: 'Mumbai, Maharashtra', timestamp: '2 hours ago', recommendation: 'Freeze affected records & initiate manual verification', impact: '47 records affected' },
    { id: 'al2', type: 'bottleneck', severity: 'warning', title: '⚠️ Bottleneck Predicted', message: 'AI predicts 340% surge in enrolment requests due to school admissions', location: 'Lucknow, UP', timestamp: '6 hours ago', recommendation: 'Deploy 3 additional mobile camps', impact: '15,000 citizens affected' },
    { id: 'al3', type: 'quality', severity: 'warning', title: '⚠️ Quality Alert', message: '15% error rate detected - above 5% threshold', location: 'Patna, Bihar', timestamp: '12 hours ago', recommendation: 'Retrain operators & audit recent entries', impact: '230 entries need review' },
    { id: 'al4', type: 'opportunity', severity: 'info', title: '💡 High Opportunity Zone', message: '12 villages with <30% coverage identified. High conversion expected.', location: 'Jaisalmer, Rajasthan', timestamp: '1 day ago', recommendation: 'Deploy mobile camp for 5 days', impact: '+8,500 potential enrolments' },
  ]

  const generateMockCrisisZones = (): CrisisZone[] => [
    { id: 'cz1', state: 'Uttar Pradesh', district: 'Lucknow', riskLevel: 92, alertCount: 5, type: 'critical', issue: 'Capacity Overflow in 3 days', recommendation: 'Add 3 mobile camps + extend hours' },
    { id: 'cz2', state: 'Maharashtra', district: 'Mumbai', riskLevel: 85, alertCount: 3, type: 'critical', issue: 'Fraud Pattern Detected', recommendation: 'Freeze & verify 47 records' },
    { id: 'cz3', state: 'Bihar', district: 'Patna', riskLevel: 72, alertCount: 2, type: 'warning', issue: 'Quality Issues', recommendation: 'Operator retraining needed' },
    { id: 'cz4', state: 'Rajasthan', district: 'Jaisalmer', riskLevel: 45, alertCount: 1, type: 'opportunity', issue: 'Coverage Gap', recommendation: 'Deploy mobile camp - high ROI' },
    { id: 'cz5', state: 'West Bengal', district: 'Kolkata', riskLevel: 35, alertCount: 0, type: 'opportunity', issue: 'Weekend Drive Opportunity', recommendation: 'High conversion expected' },
  ]

  const generateMockPredictions = (): Prediction[] => {
    const today = new Date()
    return Array.from({ length: 14 }, (_, i) => {
      const date = new Date(today)
      date.setDate(date.getDate() - 7 + i)
      const isPast = i < 7
      return {
        date: date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
        actual: isPast ? Math.floor(800 + Math.random() * 400) : undefined,
        predicted: Math.floor(850 + i * 30 + Math.random() * 100),
        confidence: isPast ? 100 : Math.max(60, 95 - (i - 7) * 5)
      }
    })
  }

  const generateMockSuggestions = (): ResourceSuggestion[] => [
    { id: 's1', location: 'Sam-Khuri Block, Jaisalmer', type: 'Mobile Camp', pendingCitizens: 8500, cost: '₹1.2 Lakhs', impact: '+42% coverage', roi: 'high', recommendation: 'Deploy 2 camps for 5 days' },
    { id: 's2', location: 'Central Zone, Lucknow', type: 'Staff Allocation', pendingCitizens: 15000, cost: '₹45,000', impact: '-60% wait time', roi: 'high', recommendation: 'Reassign 5 operators from low-demand centers' },
    { id: 's3', location: 'Industrial Area, Pune', type: 'Extended Hours', pendingCitizens: 2000, cost: '₹20,000/month', impact: '+25% coverage', roi: 'medium', recommendation: 'Evening hours (6-9 PM) for factory workers' },
  ]

  const renderPredictionChart = () => {
    if (!predictionChartRef.current) return
    if (chartInstance.current) chartInstance.current.destroy()
    const ctx = predictionChartRef.current.getContext('2d')
    if (!ctx) return

    chartInstance.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: predictions.map(p => p.date),
        datasets: [
          {
            label: 'Actual',
            data: predictions.map(p => p.actual),
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            borderWidth: 3,
            fill: true,
            tension: 0.4,
            pointRadius: 4
          },
          {
            label: 'AI Predicted',
            data: predictions.map(p => p.predicted),
            borderColor: '#f97316',
            borderDash: [5, 5],
            borderWidth: 2,
            fill: false,
            tension: 0.4,
            pointRadius: 3
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'top' },
          tooltip: {
            callbacks: {
              afterLabel: (ctx) => {
                const pred = predictions[ctx.dataIndex]
                return pred.confidence < 100 ? `Confidence: ${pred.confidence}%` : ''
              }
            }
          }
        },
        scales: {
          y: { beginAtZero: false, grid: { color: 'rgba(0,0,0,0.05)' } },
          x: { grid: { display: false } }
        }
      }
    })
  }

  // ============ HELPER FUNCTIONS ============
  const getLevelBg = (level: string) => {
    const colors: Record<string, string> = {
      bronze: 'bg-amber-100 text-amber-700', silver: 'bg-gray-100 text-gray-700',
      gold: 'bg-yellow-100 text-yellow-700', platinum: 'bg-cyan-100 text-cyan-700',
      diamond: 'bg-purple-100 text-purple-700'
    }
    return colors[level] || colors.bronze
  }

  const getSeverityStyle = (severity: string) => {
    const styles: Record<string, string> = {
      critical: 'bg-red-100 text-red-700 border-red-200',
      warning: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      info: 'bg-blue-100 text-blue-700 border-blue-200'
    }
    return styles[severity] || styles.info
  }

  const criticalAlerts = aiAlerts.filter(a => a.severity === 'critical').length
  const warningAlerts = aiAlerts.filter(a => a.severity === 'warning').length
  const totalPoints = myCenter?.points || 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50/30 to-gray-50 pt-20">
      {/* Floating Alert Panel */}
      {showAlertPanel && (
        <div className="fixed top-24 right-4 w-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 max-h-[70vh] overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-t-xl">
            <h3 className="font-semibold flex items-center gap-2">
              <BellRingIcon className="w-5 h-5" />
              AI Alerts ({aiAlerts.length})
            </h3>
            <button onClick={() => setShowAlertPanel(false)} className="p-1 hover:bg-white/20 rounded">
              <XIcon className="w-4 h-4" />
            </button>
          </div>
          <div className="overflow-y-auto max-h-[calc(70vh-60px)]">
            {aiAlerts.map(alert => (
              <div key={alert.id} className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer`}>
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${
                    alert.severity === 'critical' ? 'bg-red-100 text-red-600' :
                    alert.severity === 'warning' ? 'bg-yellow-100 text-yellow-600' :
                    'bg-blue-100 text-blue-600'
                  }`}>
                    {alert.type === 'fraud' ? <ShieldAlertIcon className="w-4 h-4" /> :
                     alert.type === 'bottleneck' ? <ActivityIcon className="w-4 h-4" /> :
                     alert.type === 'quality' ? <AlertTriangleIcon className="w-4 h-4" /> :
                     <SparklesIcon className="w-4 h-4" />}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 text-sm">{alert.title}</p>
                    <p className="text-xs text-gray-500 mt-1">{alert.location} • {alert.timestamp}</p>
                    <p className="text-xs text-gray-600 mt-2">{alert.message}</p>
                    <button className="mt-2 text-xs text-orange-600 font-medium hover:underline">
                      View Details →
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link href="/analytics" className="hover:text-orange-600">Dashboard</Link>
          <ChevronRightIcon className="w-4 h-4" />
          <span className="text-gray-900 font-medium">AadhaarConnect</span>
        </div>

        {/* Header with Alert Badge */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl">
                <BrainCircuitIcon className="w-6 h-6 text-white" />
              </div>
              AadhaarConnect
              <span className="text-xs font-normal px-2 py-1 bg-gradient-to-r from-orange-100 to-purple-100 text-orange-600 rounded-full">
                AI + Gamified
              </span>
            </h1>
            <p className="text-gray-600 mt-1">Intelligent Enrolment Ecosystem</p>
          </div>
          
          <div className="flex items-center gap-3 mt-4 md:mt-0">
            {/* Alert Button with Badge */}
            <button
              onClick={() => setShowAlertPanel(!showAlertPanel)}
              className="relative flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
            >
              <BellRingIcon className="w-4 h-4" />
              Alerts
              {criticalAlerts > 0 && (
                <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
                  {criticalAlerts}
                </span>
              )}
            </button>
            <button
              onClick={loadAllData}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 transition-colors text-sm font-medium"
            >
              <RefreshCwIcon className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Quick Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 uppercase">My Points</p>
                <p className="text-xl font-bold text-orange-600">{totalPoints.toLocaleString()}</p>
              </div>
              <StarIcon className="w-8 h-8 text-orange-200" />
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 uppercase">Streak</p>
                <p className="text-xl font-bold text-red-500">{myCenter?.streak || 0} 🔥</p>
              </div>
              <FlameIcon className="w-8 h-8 text-red-200" />
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-red-100 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 uppercase">Critical</p>
                <p className="text-xl font-bold text-red-600">{criticalAlerts}</p>
              </div>
              <AlertTriangleIcon className="w-8 h-8 text-red-200" />
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-yellow-100 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 uppercase">Warnings</p>
                <p className="text-xl font-bold text-yellow-600">{warningAlerts}</p>
              </div>
              <ShieldAlertIcon className="w-8 h-8 text-yellow-200" />
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-green-100 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 uppercase">AI Suggestions</p>
                <p className="text-xl font-bold text-green-600">{suggestions.length}</p>
              </div>
              <SparklesIcon className="w-8 h-8 text-green-200" />
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex bg-gray-100 p-1 rounded-lg mb-6 overflow-x-auto">
          {[
            { key: 'dashboard', label: 'Dashboard', icon: ActivityIcon },
            { key: 'gamification', label: 'Gamification', icon: TrophyIcon },
            { key: 'ai-center', label: 'AI Intelligence', icon: BrainCircuitIcon },
            { key: 'crisis-map', label: 'Crisis Map', icon: MapPinIcon }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-md transition-all whitespace-nowrap ${
                activeTab === tab.key 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
              {tab.key === 'ai-center' && criticalAlerts > 0 && (
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
              )}
            </button>
          ))}
        </div>

        {/* ============ DASHBOARD TAB ============ */}
        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Welcome Card */}
              <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold">Welcome back! 👋</h2>
                    <p className="text-orange-100 mt-1">You&apos;re ranked #{myCenter?.rank} this month</p>
                    <div className="flex items-center gap-4 mt-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold">{myCenter?.weeklyEnrolments}</p>
                        <p className="text-xs text-orange-100">This Week</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold">{myCenter?.totalEnrolments.toLocaleString()}</p>
                        <p className="text-xs text-orange-100">Total</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold">{myCenter?.badges.length}</p>
                        <p className="text-xs text-orange-100">Badges</p>
                      </div>
                    </div>
                  </div>
                  <div className="text-6xl">{myCenter?.level === 'platinum' ? '🏆' : '💎'}</div>
                </div>
              </div>

              {/* AI Suggestions for Worker */}
              <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <BrainCircuitIcon className="w-5 h-5 text-orange-500" />
                  AI Suggestions for You
                </h3>
                <div className="space-y-3">
                  <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <TargetIcon className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Focus on Village Rampur today</p>
                        <p className="text-sm text-gray-600 mt-1">High conversion probability (87%) - 45 pending citizens</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <ClockIcon className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Optimal time: 10 AM - 1 PM</p>
                        <p className="text-sm text-gray-600 mt-1">Historical data shows 40% higher completion rate</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Active Challenges */}
              <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <TargetIcon className="w-5 h-5 text-orange-500" />
                  Active Challenges
                </h3>
                <div className="space-y-4">
                  {challenges.filter(c => c.status === 'active').slice(0, 2).map(challenge => (
                    <div key={challenge.id} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium text-gray-900">{challenge.title}</p>
                        <span className="text-sm text-orange-600 font-medium">+{challenge.rewardPoints} pts</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                        <div className="bg-orange-500 h-2 rounded-full" style={{ width: `${(challenge.current / challenge.target) * 100}%` }}></div>
                      </div>
                      <p className="text-xs text-gray-500">{challenge.current}/{challenge.target} • {challenge.deadline} left</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar - AI Alerts */}
            <div className="space-y-6">
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-red-500 to-orange-500 text-white">
                  <h3 className="font-semibold flex items-center gap-2">
                    <AlertTriangleIcon className="w-5 h-5" />
                    AI Alerts
                  </h3>
                </div>
                <div className="divide-y divide-gray-100">
                  {aiAlerts.slice(0, 3).map(alert => (
                    <div key={alert.id} className="p-4 hover:bg-gray-50">
                      <div className="flex items-start gap-3">
                        <span className={`px-2 py-1 text-xs font-medium rounded ${getSeverityStyle(alert.severity)}`}>
                          {alert.severity}
                        </span>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{alert.title}</p>
                          <p className="text-xs text-gray-500 mt-1">{alert.location}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-3 border-t border-gray-100">
                  <button 
                    onClick={() => setActiveTab('ai-center')}
                    className="w-full text-center text-sm text-orange-600 font-medium hover:underline"
                  >
                    View All Alerts →
                  </button>
                </div>
              </div>

              {/* Leaderboard Preview */}
              <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <TrophyIcon className="w-5 h-5 text-yellow-500" />
                  Top 3 This Week
                </h3>
                <div className="space-y-3">
                  {centers.slice(0, 3).map((center, idx) => (
                    <div key={center.id} className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        idx === 0 ? 'bg-yellow-100 text-yellow-700' :
                        idx === 1 ? 'bg-gray-100 text-gray-700' :
                        'bg-amber-100 text-amber-700'
                      }`}>
                        {idx + 1}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{center.name.split(' - ')[0]}</p>
                        <p className="text-xs text-gray-500">{center.points.toLocaleString()} pts</p>
                      </div>
                      <span className="text-lg">{center.badges[0]}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============ GAMIFICATION TAB ============ */}
        {activeTab === 'gamification' && (
          <div className="space-y-6">
            {/* Top 3 Podium */}
            <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <CrownIcon className="w-5 h-5 text-yellow-500" />
                Leaderboard
              </h2>
              <div className="flex justify-center items-end gap-4 mb-8">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-2 rounded-full bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center text-white text-xl font-bold shadow-lg">2</div>
                  <p className="font-medium text-gray-900 text-sm">{centers[1]?.name.split(' - ')[0]}</p>
                  <p className="text-sm font-bold text-gray-600">{centers[1]?.points.toLocaleString()}</p>
                </div>
                <div className="text-center -mt-4">
                  <div className="w-20 h-20 mx-auto mb-2 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-500 flex items-center justify-center text-3xl shadow-xl ring-4 ring-yellow-200">👑</div>
                  <p className="font-semibold text-gray-900">{centers[0]?.name.split(' - ')[0]}</p>
                  <p className="text-lg font-bold text-yellow-600">{centers[0]?.points.toLocaleString()}</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-2 rounded-full bg-gradient-to-br from-amber-600 to-amber-700 flex items-center justify-center text-white text-xl font-bold shadow-lg">3</div>
                  <p className="font-medium text-gray-900 text-sm">{centers[2]?.name.split(' - ')[0]}</p>
                  <p className="text-sm font-bold text-amber-600">{centers[2]?.points.toLocaleString()}</p>
                </div>
              </div>

              {/* Full Rankings */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Rank</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Center</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Level</th>
                      <th className="text-center py-3 px-4 text-xs font-medium text-gray-500 uppercase">Streak</th>
                      <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase">Points</th>
                    </tr>
                  </thead>
                  <tbody>
                    {centers.map((center, idx) => (
                      <tr key={center.id} className={`border-b border-gray-100 hover:bg-orange-50/50 ${myCenter?.id === center.id ? 'bg-orange-50' : ''}`}>
                        <td className="py-3 px-4">
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                            idx === 0 ? 'bg-yellow-100 text-yellow-700' : idx === 1 ? 'bg-gray-100 text-gray-700' : idx === 2 ? 'bg-amber-100 text-amber-700' : 'bg-gray-50 text-gray-600'
                          }`}>{center.rank}</div>
                        </td>
                        <td className="py-3 px-4">
                          <p className="font-medium text-gray-900 text-sm">{center.name}</p>
                          <p className="text-xs text-gray-500">{center.district}, {center.state}</p>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${getLevelBg(center.level)}`}>{center.level}</span>
                        </td>
                        <td className="py-3 px-4 text-center"><span className="text-sm">🔥 {center.streak}</span></td>
                        <td className="py-3 px-4 text-right font-bold text-orange-600">{center.points.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Challenges Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {challenges.map(challenge => (
                <div key={challenge.id} className={`bg-white rounded-xl p-5 border shadow-sm ${challenge.status === 'completed' ? 'border-green-200 bg-green-50/30' : 'border-gray-100'}`}>
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold text-gray-900">{challenge.title}</h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      challenge.type === 'daily' ? 'bg-blue-100 text-blue-600' : challenge.type === 'weekly' ? 'bg-purple-100 text-purple-600' : 'bg-orange-100 text-orange-600'
                    }`}>{challenge.type}</span>
                  </div>
                  <p className="text-sm text-gray-500 mb-3">{challenge.description}</p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                    <div className={`h-2 rounded-full ${challenge.status === 'completed' ? 'bg-green-500' : 'bg-orange-500'}`} style={{ width: `${(challenge.current / challenge.target) * 100}%` }}></div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{challenge.current}/{challenge.target}</span>
                    <span className="text-orange-600 font-medium">+{challenge.rewardPoints} pts</span>
                  </div>
                  {challenge.status === 'completed' && (
                    <div className="mt-3 pt-3 border-t border-green-200 flex items-center gap-2 text-green-600">
                      <CheckCircleIcon className="w-4 h-4" />
                      <span className="text-sm font-medium">Completed!</span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Achievements */}
            <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <MedalIcon className="w-5 h-5 text-orange-500" />
                Achievements
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {achievements.map(a => (
                  <div key={a.id} className={`p-4 rounded-xl border-2 text-center ${a.unlockedAt ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50 opacity-60'}`}>
                    <div className="text-3xl mb-2">{a.icon}</div>
                    <p className="font-medium text-gray-900 text-sm">{a.name}</p>
                    <p className="text-xs text-gray-500 mt-1">{a.description}</p>
                    {!a.unlockedAt && (
                      <div className="mt-2">
                        <div className="w-full bg-gray-200 rounded-full h-1">
                          <div className="bg-orange-500 h-1 rounded-full" style={{ width: `${(a.progress / a.target) * 100}%` }}></div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{a.progress}/{a.target}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ============ AI INTELLIGENCE CENTER TAB ============ */}
        {activeTab === 'ai-center' && (
          <div className="space-y-6">
            {/* AI Header */}
            <div className="bg-gradient-to-r from-purple-600 via-orange-500 to-orange-600 rounded-xl p-6 text-white">
              <div className="flex items-center gap-3 mb-2">
                <BrainCircuitIcon className="w-8 h-8" />
                <div>
                  <h2 className="text-xl font-bold">AI Intelligence Center</h2>
                  <p className="text-white/80 text-sm">Real-time anomaly detection, predictions & smart recommendations</p>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-4 mt-4">
                <div className="bg-white/10 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold">{criticalAlerts}</p>
                  <p className="text-xs text-white/70">Critical</p>
                </div>
                <div className="bg-white/10 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold">{warningAlerts}</p>
                  <p className="text-xs text-white/70">Warnings</p>
                </div>
                <div className="bg-white/10 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold">{suggestions.length}</p>
                  <p className="text-xs text-white/70">Suggestions</p>
                </div>
                <div className="bg-white/10 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold">94.7%</p>
                  <p className="text-xs text-white/70">Model Accuracy</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Active Alerts */}
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-100">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <AlertTriangleIcon className="w-5 h-5 text-red-500" />
                    Active Alerts
                  </h3>
                </div>
                <div className="divide-y divide-gray-100 max-h-[400px] overflow-y-auto">
                  {aiAlerts.map(alert => (
                    <div key={alert.id} className="p-4 hover:bg-gray-50">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${
                          alert.severity === 'critical' ? 'bg-red-100 text-red-600' :
                          alert.severity === 'warning' ? 'bg-yellow-100 text-yellow-600' :
                          'bg-blue-100 text-blue-600'
                        }`}>
                          {alert.type === 'fraud' ? <ShieldAlertIcon className="w-5 h-5" /> :
                           alert.type === 'bottleneck' ? <ActivityIcon className="w-5 h-5" /> :
                           alert.type === 'quality' ? <AlertTriangleIcon className="w-5 h-5" /> :
                           <SparklesIcon className="w-5 h-5" />}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium text-gray-900">{alert.title}</p>
                            <span className={`px-2 py-0.5 text-xs font-medium rounded ${getSeverityStyle(alert.severity)}`}>
                              {alert.severity}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">{alert.message}</p>
                          <p className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                            <MapPinIcon className="w-3 h-3" /> {alert.location} • {alert.timestamp}
                          </p>
                          <div className="mt-3 p-2 bg-orange-50 rounded-lg">
                            <p className="text-xs text-orange-700"><strong>Recommendation:</strong> {alert.recommendation}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Prediction Chart */}
              <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <TrendingUpIcon className="w-5 h-5 text-blue-500" />
                  7-Day Prediction
                </h3>
                <div className="h-[300px]">
                  <canvas ref={predictionChartRef}></canvas>
                </div>
                <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-100">
                  <p className="text-sm text-yellow-800 flex items-center gap-2">
                    <AlertTriangleIcon className="w-4 h-4" />
                    <strong>Bottleneck Alert:</strong> Predicted capacity overflow on Day 5 in Lucknow
                  </p>
                </div>
              </div>
            </div>

            {/* Resource Optimizer */}
            <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <TargetIcon className="w-5 h-5 text-green-500" />
                AI Resource Optimizer
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {suggestions.map(s => (
                  <div key={s.id} className="p-4 border border-gray-200 rounded-xl hover:border-orange-300 hover:shadow-md transition-all">
                    <div className="flex items-center justify-between mb-3">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        s.roi === 'high' ? 'bg-green-100 text-green-700' : s.roi === 'medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {s.roi.toUpperCase()} ROI
                      </span>
                      <TruckIcon className="w-5 h-5 text-gray-400" />
                    </div>
                    <p className="font-medium text-gray-900 text-sm">{s.location}</p>
                    <p className="text-xs text-gray-500 mt-1">{s.type}</p>
                    <div className="grid grid-cols-2 gap-2 mt-3">
                      <div className="bg-gray-50 rounded p-2 text-center">
                        <p className="text-lg font-bold text-gray-900">{s.pendingCitizens.toLocaleString()}</p>
                        <p className="text-xs text-gray-500">Pending</p>
                      </div>
                      <div className="bg-green-50 rounded p-2 text-center">
                        <p className="text-lg font-bold text-green-600">{s.impact}</p>
                        <p className="text-xs text-gray-500">Impact</p>
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 mt-3">💰 Cost: {s.cost}</p>
                    <button className="w-full mt-3 px-3 py-2 bg-orange-500 text-white text-sm rounded-lg hover:bg-orange-600 transition-colors">
                      Deploy Resource
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Alert Configuration */}
            <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <BellRingIcon className="w-5 h-5 text-orange-500" />
                Alert Notifications
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border border-gray-200 rounded-xl flex items-center gap-4">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <MessageSquareIcon className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">WhatsApp</p>
                    <p className="text-xs text-green-600">Connected ✓</p>
                  </div>
                </div>
                <div className="p-4 border border-gray-200 rounded-xl flex items-center gap-4">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <PhoneIcon className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">SMS</p>
                    <p className="text-xs text-green-600">Connected ✓</p>
                  </div>
                </div>
                <div className="p-4 border border-gray-200 rounded-xl flex items-center gap-4">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <MailIcon className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Email</p>
                    <p className="text-xs text-green-600">Connected ✓</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============ CRISIS MAP TAB ============ */}
        {activeTab === 'crisis-map' && (
          <div className="space-y-6">
            {/* Map Header */}
            <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <MapPinIcon className="w-5 h-5 text-orange-500" />
                Interactive Crisis Map
              </h2>
              
              {/* Legend */}
              <div className="flex items-center gap-6 mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-red-500"></div>
                  <span className="text-sm text-gray-600">Critical ({crisisZones.filter(z => z.type === 'critical').length})</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
                  <span className="text-sm text-gray-600">Warning ({crisisZones.filter(z => z.type === 'warning').length})</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-green-500"></div>
                  <span className="text-sm text-gray-600">Opportunity ({crisisZones.filter(z => z.type === 'opportunity').length})</span>
                </div>
              </div>

              {/* Crisis Zone Cards (Visual Map Representation) */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {crisisZones.map(zone => (
                  <div 
                    key={zone.id}
                    onClick={() => setSelectedZone(zone)}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all hover:scale-105 ${
                      zone.type === 'critical' ? 'bg-red-50 border-red-300 hover:border-red-500' :
                      zone.type === 'warning' ? 'bg-yellow-50 border-yellow-300 hover:border-yellow-500' :
                      'bg-green-50 border-green-300 hover:border-green-500'
                    } ${selectedZone?.id === zone.id ? 'ring-2 ring-offset-2 ring-orange-500' : ''}`}
                  >
                    <div className="text-center">
                      <p className={`text-2xl font-bold ${
                        zone.type === 'critical' ? 'text-red-600' :
                        zone.type === 'warning' ? 'text-yellow-600' : 'text-green-600'
                      }`}>{zone.riskLevel}%</p>
                      <p className="text-sm font-medium text-gray-900 mt-1">{zone.district}</p>
                      <p className="text-xs text-gray-500">{zone.state}</p>
                      {zone.alertCount > 0 && (
                        <span className="inline-block mt-2 px-2 py-0.5 bg-red-100 text-red-600 text-xs rounded-full">
                          {zone.alertCount} alerts
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Selected Zone Details */}
            {selectedZone && (
              <div className={`rounded-xl p-6 border-2 ${
                selectedZone.type === 'critical' ? 'bg-red-50 border-red-200' :
                selectedZone.type === 'warning' ? 'bg-yellow-50 border-yellow-200' :
                'bg-green-50 border-green-200'
              }`}>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                      <MapPinIcon className="w-5 h-5" />
                      {selectedZone.district}, {selectedZone.state}
                    </h3>
                    <p className={`text-sm mt-1 ${
                      selectedZone.type === 'critical' ? 'text-red-700' :
                      selectedZone.type === 'warning' ? 'text-yellow-700' : 'text-green-700'
                    }`}>
                      {selectedZone.issue}
                    </p>
                  </div>
                  <div className={`px-4 py-2 rounded-lg ${
                    selectedZone.type === 'critical' ? 'bg-red-100 text-red-700' :
                    selectedZone.type === 'warning' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    <p className="text-2xl font-bold">{selectedZone.riskLevel}%</p>
                    <p className="text-xs">Risk Level</p>
                  </div>
                </div>

                <div className="mt-4 p-4 bg-white rounded-lg">
                  <p className="text-sm text-gray-700">
                    <strong>AI Recommendation:</strong> {selectedZone.recommendation}
                  </p>
                </div>

                <div className="flex gap-3 mt-4">
                  <button className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm font-medium flex items-center justify-center gap-2">
                    <EyeIcon className="w-4 h-4" />
                    View Details
                  </button>
                  <button className="flex-1 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium flex items-center justify-center gap-2">
                    <TruckIcon className="w-4 h-4" />
                    Deploy Resources
                  </button>
                </div>
              </div>
            )}

            {/* Crisis Summary Table */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-100">
                <h3 className="font-semibold text-gray-900">All Crisis Zones</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Location</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Issue</th>
                      <th className="text-center py-3 px-4 text-xs font-medium text-gray-500 uppercase">Risk</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Recommendation</th>
                    </tr>
                  </thead>
                  <tbody>
                    {crisisZones.map(zone => (
                      <tr key={zone.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <p className="font-medium text-gray-900">{zone.district}</p>
                          <p className="text-xs text-gray-500">{zone.state}</p>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            zone.type === 'critical' ? 'bg-red-100 text-red-700' :
                            zone.type === 'warning' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-green-100 text-green-700'
                          }`}>
                            {zone.type}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">{zone.issue}</td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-12 bg-gray-200 rounded-full h-2">
                              <div className={`h-2 rounded-full ${
                                zone.riskLevel > 70 ? 'bg-red-500' : zone.riskLevel > 40 ? 'bg-yellow-500' : 'bg-green-500'
                              }`} style={{ width: `${zone.riskLevel}%` }}></div>
                            </div>
                            <span className="text-sm font-medium">{zone.riskLevel}%</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">{zone.recommendation}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
