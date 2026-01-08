import { NextRequest, NextResponse } from 'next/server'
import { csvDataLoader } from '@/lib/csv-data-loader'

const GEMINI_API_KEY = process.env.GEMINI_API_KEY

interface Message {
  role: 'user' | 'model'
  parts: { text: string }[]
}

export async function POST(request: NextRequest) {
  try {
    const { message, history = [] } = await request.json()

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    if (!GEMINI_API_KEY) {
      return NextResponse.json({ 
        error: 'Gemini API key not configured',
        fallback: true,
        response: await getFallbackResponse(message)
      })
    }

    // Get context data for Aadhaar analytics
    const contextData = await getAnalyticsContext()

    // Build conversation with system context
    const systemPrompt = `You are an AI assistant specialized in Aadhaar enrollment analytics for India. You help policy makers and analysts understand enrollment trends, patterns, and insights.

Current Data Context:
${contextData}

Guidelines:
- Provide data-driven insights when asked about enrollment statistics
- Support both Hindi and English queries
- Be concise but informative
- When showing numbers, format them properly (e.g., 10,18,629)
- Suggest relevant follow-up questions when appropriate
- If asked about something outside Aadhaar analytics, politely redirect to your expertise area`

    const messages: Message[] = [
      { role: 'user', parts: [{ text: systemPrompt }] },
      { role: 'model', parts: [{ text: 'Understood. I am ready to help with Aadhaar enrollment analytics.' }] },
      ...history.map((msg: any) => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      })),
      { role: 'user', parts: [{ text: message }] }
    ]

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: messages,
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          },
          safetySettings: [
            { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
            { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
            { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
            { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' }
          ]
        })
      }
    )

    if (!response.ok) {
      const error = await response.text()
      console.error('Gemini API error:', error)
      return NextResponse.json({ 
        error: 'Gemini API error',
        fallback: true,
        response: await getFallbackResponse(message)
      })
    }

    const data = await response.json()
    const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, I could not generate a response.'

    return NextResponse.json({
      success: true,
      response: aiResponse,
      model: 'gemini-1.5-flash'
    })

  } catch (error) {
    console.error('Gemini route error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      fallback: true,
      response: await getFallbackResponse('')
    })
  }
}

async function getAnalyticsContext(): Promise<string> {
  try {
    const metrics = await csvDataLoader.getAggregatedMetrics()
    const topStates = await csvDataLoader.getTopStates(5)
    const dailyTrends = await csvDataLoader.getDailyTrends(7)

    return `
Total Enrollments: ${metrics.totalEnrolments.toLocaleString()}
Age Distribution:
- 0-5 years: ${metrics.byAgeGroup.age_0_5.toLocaleString()} (${((metrics.byAgeGroup.age_0_5/metrics.totalEnrolments)*100).toFixed(1)}%)
- 5-17 years: ${metrics.byAgeGroup.age_5_17.toLocaleString()} (${((metrics.byAgeGroup.age_5_17/metrics.totalEnrolments)*100).toFixed(1)}%)
- 18+ years: ${metrics.byAgeGroup.age_18_greater.toLocaleString()} (${((metrics.byAgeGroup.age_18_greater/metrics.totalEnrolments)*100).toFixed(1)}%)

Top 5 States by Enrollment:
${topStates.map((s, i) => `${i+1}. ${s.state}: ${s.count.toLocaleString()}`).join('\n')}

Recent Daily Trends (Last 7 days):
${dailyTrends.map(d => `${d.date}: ${d.count.toLocaleString()}`).join('\n')}
`
  } catch {
    return 'Data context unavailable'
  }
}

async function getFallbackResponse(message: string): Promise<string> {
  // Use local insights engine as fallback
  const { insightsEngine } = await import('@/lib/insights-engine')
  const result = await insightsEngine.processNaturalQuery(message || 'summary')
  return result.answer
}
