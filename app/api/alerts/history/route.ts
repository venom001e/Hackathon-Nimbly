import { NextRequest, NextResponse } from 'next/server'

// In-memory alert history (in production, use database)
let alertHistory: AlertHistoryEntry[] = []

interface AlertHistoryEntry {
  id: string
  alertName: string
  metric: string
  value: number
  threshold: number
  severity: 'low' | 'medium' | 'high' | 'critical'
  message: string
  state?: string
  triggeredAt: string
  acknowledgedAt?: string
  acknowledgedBy?: string
  resolvedAt?: string
  status: 'active' | 'acknowledged' | 'resolved'
}

// Initialize with some sample history
if (alertHistory.length === 0) {
  const now = new Date()
  alertHistory = [
    {
      id: 'hist-1',
      alertName: 'High Enrolment Spike',
      metric: 'daily_enrolments',
      value: 125000,
      threshold: 100000,
      severity: 'high',
      message: 'Daily enrolments exceeded threshold in Maharashtra',
      state: 'Maharashtra',
      triggeredAt: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
      acknowledgedAt: new Date(now.getTime() - 1 * 60 * 60 * 1000).toISOString(),
      acknowledgedBy: 'admin@uidai.gov.in',
      status: 'acknowledged'
    },
    {
      id: 'hist-2',
      alertName: 'Anomaly Detection',
      metric: 'anomaly_score',
      value: 3.2,
      threshold: 2.5,
      severity: 'high',
      message: 'Statistical anomaly detected in Uttar Pradesh',
      state: 'Uttar Pradesh',
      triggeredAt: new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString(),
      acknowledgedAt: new Date(now.getTime() - 23 * 60 * 60 * 1000).toISOString(),
      resolvedAt: new Date(now.getTime() - 20 * 60 * 60 * 1000).toISOString(),
      status: 'resolved'
    },
    {
      id: 'hist-3',
      alertName: 'Low Enrolment Warning',
      metric: 'daily_enrolments',
      value: 5000,
      threshold: 10000,
      severity: 'medium',
      message: 'Daily enrolments dropped below threshold',
      triggeredAt: new Date(now.getTime() - 48 * 60 * 60 * 1000).toISOString(),
      resolvedAt: new Date(now.getTime() - 46 * 60 * 60 * 1000).toISOString(),
      status: 'resolved'
    }
  ]
}

// GET - Retrieve alert history
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const severity = searchParams.get('severity')
    const state = searchParams.get('state')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    let filtered = [...alertHistory]

    if (status) {
      filtered = filtered.filter(a => a.status === status)
    }

    if (severity) {
      filtered = filtered.filter(a => a.severity === severity)
    }

    if (state) {
      filtered = filtered.filter(a => a.state === state)
    }

    // Sort by triggered time (newest first)
    filtered.sort((a, b) => 
      new Date(b.triggeredAt).getTime() - new Date(a.triggeredAt).getTime()
    )

    const total = filtered.length
    const paginated = filtered.slice(offset, offset + limit)

    return NextResponse.json({
      history: paginated,
      total,
      limit,
      offset,
      hasMore: offset + limit < total,
      summary: {
        active: alertHistory.filter(a => a.status === 'active').length,
        acknowledged: alertHistory.filter(a => a.status === 'acknowledged').length,
        resolved: alertHistory.filter(a => a.status === 'resolved').length
      }
    })

  } catch (error) {
    console.error('Alert history error:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve alert history' },
      { status: 500 }
    )
  }
}

// POST - Add new alert to history
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const newEntry: AlertHistoryEntry = {
      id: `hist-${Date.now()}`,
      alertName: body.alertName,
      metric: body.metric,
      value: body.value,
      threshold: body.threshold,
      severity: body.severity,
      message: body.message,
      state: body.state,
      triggeredAt: new Date().toISOString(),
      status: 'active'
    }

    alertHistory.unshift(newEntry)

    // Keep only last 1000 entries
    if (alertHistory.length > 1000) {
      alertHistory = alertHistory.slice(0, 1000)
    }

    return NextResponse.json({
      message: 'Alert added to history',
      entry: newEntry
    }, { status: 201 })

  } catch (error) {
    console.error('Alert history add error:', error)
    return NextResponse.json(
      { error: 'Failed to add alert to history' },
      { status: 500 }
    )
  }
}

// PUT - Update alert status (acknowledge/resolve)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, action, user } = body

    if (!id || !action) {
      return NextResponse.json(
        { error: 'Alert ID and action are required' },
        { status: 400 }
      )
    }

    const index = alertHistory.findIndex(a => a.id === id)
    
    if (index === -1) {
      return NextResponse.json(
        { error: 'Alert not found in history' },
        { status: 404 }
      )
    }

    if (action === 'acknowledge') {
      alertHistory[index].status = 'acknowledged'
      alertHistory[index].acknowledgedAt = new Date().toISOString()
      alertHistory[index].acknowledgedBy = user || 'system'
    } else if (action === 'resolve') {
      alertHistory[index].status = 'resolved'
      alertHistory[index].resolvedAt = new Date().toISOString()
    }

    return NextResponse.json({
      message: `Alert ${action}d successfully`,
      entry: alertHistory[index]
    })

  } catch (error) {
    console.error('Alert history update error:', error)
    return NextResponse.json(
      { error: 'Failed to update alert' },
      { status: 500 }
    )
  }
}
