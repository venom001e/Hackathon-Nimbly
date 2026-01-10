import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

export async function GET() {
  try {
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY
    
    if (!apiKey || apiKey === 'YOUR_ACTUAL_API_KEY_HERE') {
      return NextResponse.json({
        success: false,
        message: 'No valid API key found',
        apiKeyFound: false,
        apiKeyPreview: 'Not configured'
      })
    }

    console.log('🔑 Testing Gemini API key...')
    
    try {
      const genAI = new GoogleGenerativeAI(apiKey)
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
      
      console.log('📝 Sending test prompt...')
      const result = await model.generateContent('Hello, please respond with "API test successful"')
      const response = await result.response
      const text = response.text()
      
      console.log('✅ Test successful!')
      
      return NextResponse.json({
        success: true,
        message: 'Gemini API is working correctly',
        apiKeyFound: true,
        apiKeyPreview: `${apiKey.substring(0, 10)}...`,
        testResponse: text,
        model: 'gemini-1.5-flash'
      })
      
    } catch (apiError) {
      console.error('❌ API test failed:', apiError)
      
      return NextResponse.json({
        success: false,
        message: 'API key found but API call failed',
        apiKeyFound: true,
        apiKeyPreview: `${apiKey.substring(0, 10)}...`,
        error: String(apiError)
      })
    }
    
  } catch (error) {
    console.error('❌ Test endpoint error:', error)
    
    return NextResponse.json({
      success: false,
      message: 'Test endpoint error',
      error: String(error)
    })
  }
}