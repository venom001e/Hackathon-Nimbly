import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

export async function POST(request: NextRequest) {
  try {
    const { image, documentType } = await request.json()

    if (!image) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 })
    }

    // TEMPORARY: If no valid API key, return mock response for testing
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'YOUR_ACTUAL_API_KEY_HERE') {
      console.log('🔄 Using mock response - Please add real Gemini API key to .env file')
      
      const mockAnalysisResult = {
        isGenuine: true,
        confidenceScore: 87,
        fraudScore: 13,
        verdict: "GENUINE",
        documentType: documentType || "Unknown Document",
        extractedData: {
          documentNumber: "ABCDE1234F",
          holderName: "SAMPLE NAME",
          dateOfBirth: "01/01/1990",
          fatherName: "FATHER NAME",
          address: "Sample Address, City, State - 123456",
          issueDate: "01/01/2020",
          expiryDate: "N/A",
          issuingAuthority: "Government Authority"
        },
        securityChecks: [
          {"name": "Document Format", "status": "pass", "confidence": 90, "details": "Layout appears consistent with official format"},
          {"name": "Font Analysis", "status": "pass", "confidence": 85, "details": "Fonts appear standard"},
          {"name": "Photo Integrity", "status": "pass", "confidence": 80, "details": "Photo appears authentic"},
          {"name": "Security Features", "status": "warning", "confidence": 70, "details": "Some features not clearly visible"},
          {"name": "Print Quality", "status": "pass", "confidence": 85, "details": "Print quality appears good"},
          {"name": "Text Consistency", "status": "pass", "confidence": 90, "details": "Text alignment proper"},
          {"name": "Document Number Format", "status": "pass", "confidence": 95, "details": "Number format appears valid"},
          {"name": "Overall Authenticity", "status": "pass", "confidence": 87, "details": "Document appears genuine (MOCK ANALYSIS)"}
        ],
        fraudIndicators: [
          {"type": "Mock Analysis", "severity": "low", "description": "This is a mock response. Add real Gemini API key for actual analysis."}
        ],
        recommendation: "MANUAL_REVIEW",
        summary: "MOCK ANALYSIS: This is a sample response. Please add your Gemini API key to get real document verification.",
        detailedAnalysis: "This is a mock response for testing purposes. To get real AI-powered document verification, please add your Gemini API key to the .env file and restart the server."
      }

      return NextResponse.json({
        success: true,
        analysis: mockAnalysisResult,
        processingTime: Date.now(),
        isMockResponse: true
      })
    }

    // Extract base64 data from data URL
    const base64Data = image.split(',')[1]
    const mimeType = image.split(';')[0].split(':')[1]

    if (!base64Data || !mimeType) {
      return NextResponse.json({ error: 'Invalid image format' }, { status: 400 })
    }

    // Try different model names in order of preference
    const modelNames = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-2.5-pro']
    let model = null
    let modelError = null

    for (const modelName of modelNames) {
      try {
        model = genAI.getGenerativeModel({ model: modelName })
        console.log(`Using model: ${modelName}`)
        break
      } catch (err) {
        modelError = err
        continue
      }
    }

    if (!model) {
      console.error('No valid model found:', modelError)
      return NextResponse.json({ 
        error: 'Unable to initialize Gemini model', 
        details: String(modelError) 
      }, { status: 500 })
    }

    const prompt = `You are an AI-assisted document quality assessment tool for Indian government ID documents. Analyze this ${documentType || 'identity document'} image and assess its quality and completeness.

IMPORTANT: Analyze the document for these quality aspects:

1. **Document Format & Layout**
   - Is the layout consistent with expected ${documentType} format?
   - Are all required fields present in correct positions?
   - Is the document size/aspect ratio appropriate?

2. **Text & Typography**
   - Are fonts consistent and readable?
   - Is text alignment proper?
   - Any spelling errors or inconsistencies?
   - Is the text clarity appropriate?

3. **Photo Analysis**
   - Does the photo appear clear and unedited?
   - Is photo quality consistent with document standards?
   - Any signs of photo manipulation or poor quality?

4. **Quality Features**
   - Are expected quality features visible (hologram, watermark, etc.)?
   - Is the document number format valid?
   - Any signs of digital editing or poor reproduction?

5. **Print Quality**
   - Is print quality consistent with official standards?
   - Any pixelation or resolution issues?
   - Color consistency check

6. **Overall Assessment**
   - Does everything look consistent?
   - Any quality issues or anomalies?

Respond ONLY with valid JSON in this EXACT format (no markdown, no extra text):
{
  "isGoodQuality": true,
  "confidenceScore": 85,
  "qualityScore": 15,
  "verdict": "GOOD_QUALITY",
  "documentType": "${documentType || 'Unknown'}",
  "extractedData": {
    "documentNumber": "ABCDE1234F",
    "holderName": "John Doe",
    "dateOfBirth": "01/01/1990",
    "fatherName": "Father Name",
    "address": "Address details",
    "issueDate": "01/01/2020",
    "expiryDate": "N/A",
    "issuingAuthority": "Income Tax Department"
  },
  "qualityChecks": [
    {"name": "Document Format", "status": "pass", "confidence": 90, "details": "Layout matches expected format"},
    {"name": "Font Analysis", "status": "pass", "confidence": 85, "details": "Fonts appear consistent"},
    {"name": "Photo Quality", "status": "pass", "confidence": 80, "details": "Photo appears clear"},
    {"name": "Quality Features", "status": "warning", "confidence": 70, "details": "Some quality features not clearly visible"},
    {"name": "Print Quality", "status": "pass", "confidence": 85, "details": "Print quality is good"},
    {"name": "Text Consistency", "status": "pass", "confidence": 90, "details": "Text is consistent"},
    {"name": "Document Number Format", "status": "pass", "confidence": 95, "details": "Number format is valid"},
    {"name": "Overall Authenticity", "status": "pass", "confidence": 85, "details": "Document appears genuine"}
  ],
  "fraudIndicators": [],
  "recommendation": "ACCEPT",
  "summary": "Document appears to be genuine with good authenticity indicators",
  "detailedAnalysis": "The document shows consistent formatting, proper typography, and valid security features. No major fraud indicators detected."
}`

    try {
      const result = await model.generateContent([
        prompt,
        {
          inlineData: {
            mimeType: mimeType,
            data: base64Data
          }
        }
      ])

      const response = await result.response
      const text = response.text()

      // Parse JSON from response
      let analysisResult
      try {
        // Clean the response text - remove markdown code blocks if present
        let cleanText = text.trim()
        if (cleanText.startsWith('```json')) {
          cleanText = cleanText.replace(/^```json\s*/, '').replace(/\s*```$/, '')
        } else if (cleanText.startsWith('```')) {
          cleanText = cleanText.replace(/^```\s*/, '').replace(/\s*```$/, '')
        }
        
        // Try to find JSON in the response
        const jsonMatch = cleanText.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          analysisResult = JSON.parse(jsonMatch[0])
        } else {
          throw new Error('No JSON found in response')
        }
      } catch (parseError) {
        console.error('JSON parse error:', parseError)
        console.error('Raw response:', text)
        
        // Return a default analysis if parsing fails
        analysisResult = {
          isGenuine: false,
          confidenceScore: 30,
          fraudScore: 70,
          verdict: "SUSPICIOUS",
          documentType: documentType || "Unknown",
          extractedData: {
            documentNumber: "Unable to extract",
            holderName: "Unable to extract",
            dateOfBirth: "N/A",
            fatherName: "N/A",
            address: "N/A",
            issueDate: "N/A",
            expiryDate: "N/A",
            issuingAuthority: "N/A"
          },
          securityChecks: [
            { name: "Analysis Error", status: "warning", confidence: 30, details: "Could not fully analyze document due to parsing error" }
          ],
          fraudIndicators: [
            { type: "Analysis Incomplete", severity: "medium", description: "Document analysis could not be completed properly" }
          ],
          recommendation: "MANUAL_REVIEW",
          summary: "Document analysis incomplete due to technical error. Manual review recommended.",
          detailedAnalysis: `Analysis failed with error: ${parseError instanceof Error ? parseError.message : 'Unknown error'}. Raw response: ${text.substring(0, 500)}...`
        }
      }

      return NextResponse.json({
        success: true,
        analysis: analysisResult,
        processingTime: Date.now()
      })

    } catch (apiError) {
      console.error('Gemini API error:', apiError)
      return NextResponse.json({
        error: 'Gemini API request failed',
        details: String(apiError)
      }, { status: 500 })
    }

  } catch (error) {
    console.error('Document verification error:', error)
    return NextResponse.json(
      { error: 'Failed to analyze document', details: String(error) },
      { status: 500 }
    )
  }
}
