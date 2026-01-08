import { NextRequest, NextResponse } from 'next/server'
import { insightsEngine } from '@/lib/insights-engine'

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json()
    
    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    const response = await insightsEngine.processNaturalQuery(message)
    
    return NextResponse.json({
      success: true,
      response: response.answer,
      data: response.data,
      chartType: response.chartType,
      chartData: response.chartData,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: 'Failed to process query', details: String(error) },
      { status: 500 }
    )
  }
}

// Example queries endpoint
export async function GET() {
  return NextResponse.json({
    examples: [
      "What's the enrolment trend in Uttar Pradesh?",
      "Show me districts with sudden spikes this week",
      "Total enrolments in Bihar",
      "Compare top 5 states",
      "0-5 age group trend in Karnataka",
      "Any anomalies in Maharashtra?",
      "Top performing districts"
    ]
  })
}
