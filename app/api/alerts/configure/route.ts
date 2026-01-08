import { NextRequest, NextResponse } from 'next/server'

// In-memory storage for alerts configuration (in production, use database)
let alertConfigurations: AlertConfiguration[] = [
  {
    id: 'alert-1',
    name: 'High Enrolment Spike',
    metric: 'daily_enrolments',
    condition: 'greater_than',
    threshold: 100000,
    severity: 'high',
    enabled: true,
    channels: ['email', 'dashboard'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'alert-2',
    name: 'Low Enrolment Warning',
    metric: 'daily_enrolments',
    condition: 'less_than',
    threshold: 10000,
    severity: 'medium',
    enabled: true,
    channels: ['dashboard'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'alert-3',
    name: 'Anomaly Detection',
    metric: 'anomaly_score',
    condition: 'greater_than',
    threshold: 2.5,
    severity: 'high',
    enabled: true,
    channels: ['email', 'sms', 'dashboard'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
]

interface AlertConfiguration {
  id: string
  name: string
  metric: string
  condition: 'greater_than' | 'less_than' | 'equals' | 'not_equals'
  threshold: number
  severity: 'low' | 'medium' | 'high' | 'critical'
  enabled: boolean
  channels: ('email' | 'sms' | 'dashboard' | 'webhook')[]
  state?: string
  createdAt: string
  updatedAt: string
}

// GET - Retrieve all alert configurations
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const enabled = searchParams.get('enabled')
    const severity = searchParams.get('severity')

    let filtered = [...alertConfigurations]

    if (enabled !== null) {
      filtered = filtered.filter(a => a.enabled === (enabled === 'true'))
    }

    if (severity) {
      filtered = filtered.filter(a => a.severity === severity)
    }

    return NextResponse.json({
      configurations: filtered,
      total: filtered.length,
      activeCount: filtered.filter(a => a.enabled).length
    })

  } catch (error) {
    console.error('Alert configuration error:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve alert configurations' },
      { status: 500 }
    )
  }
}

// POST - Create new alert configuration
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const { name, metric, condition, threshold, severity, channels, state } = body

    if (!name || !metric || !condition || threshold === undefined || !severity) {
      return NextResponse.json(
        { error: 'Missing required fields: name, metric, condition, threshold, severity' },
        { status: 400 }
      )
    }

    const newConfig: AlertConfiguration = {
      id: `alert-${Date.now()}`,
      name,
      metric,
      condition,
      threshold,
      severity,
      enabled: true,
      channels: channels || ['dashboard'],
      state,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    alertConfigurations.push(newConfig)

    return NextResponse.json({
      message: 'Alert configuration created successfully',
      configuration: newConfig
    }, { status: 201 })

  } catch (error) {
    console.error('Alert creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create alert configuration' },
      { status: 500 }
    )
  }
}

// PUT - Update existing alert configuration
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Alert ID is required' },
        { status: 400 }
      )
    }

    const index = alertConfigurations.findIndex(a => a.id === id)
    
    if (index === -1) {
      return NextResponse.json(
        { error: 'Alert configuration not found' },
        { status: 404 }
      )
    }

    alertConfigurations[index] = {
      ...alertConfigurations[index],
      ...updates,
      updatedAt: new Date().toISOString()
    }

    return NextResponse.json({
      message: 'Alert configuration updated successfully',
      configuration: alertConfigurations[index]
    })

  } catch (error) {
    console.error('Alert update error:', error)
    return NextResponse.json(
      { error: 'Failed to update alert configuration' },
      { status: 500 }
    )
  }
}

// DELETE - Remove alert configuration
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Alert ID is required' },
        { status: 400 }
      )
    }

    const index = alertConfigurations.findIndex(a => a.id === id)
    
    if (index === -1) {
      return NextResponse.json(
        { error: 'Alert configuration not found' },
        { status: 404 }
      )
    }

    const deleted = alertConfigurations.splice(index, 1)[0]

    return NextResponse.json({
      message: 'Alert configuration deleted successfully',
      configuration: deleted
    })

  } catch (error) {
    console.error('Alert deletion error:', error)
    return NextResponse.json(
      { error: 'Failed to delete alert configuration' },
      { status: 500 }
    )
  }
}
