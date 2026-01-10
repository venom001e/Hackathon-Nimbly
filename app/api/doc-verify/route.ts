import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

export async function POST(request: NextRequest) {
  try {
    const { image } = await request.json()

    if (!image) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 })
    }

    // TEMPORARY: If no valid API key, return mock response for testing
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'YOUR_ACTUAL_API_KEY_HERE') {
      console.log('🔄 Using mock response - Please add real Gemini API key to .env file')
      
      const mockAnalysisResult = {
        isGoodQuality: false,
        confidenceScore: 73,
        qualityScore: 27,
        verdict: "SUSPICIOUS",
        documentType: "PAN Card (Auto-detected)",
        extractedData: {
          documentNumber: "ABCDE1234F",
          holderName: "SAMPLE NAME",
          dateOfBirth: "01/01/1990",
          fatherName: "FATHER NAME",
          address: "Sample Address, City, State - 123456",
          issueDate: "01/01/2020",
          expiryDate: "N/A",
          issuingAuthority: "Income Tax Department"
        },
        qualityChecks: [
          {"name": "Document Format", "status": "pass", "confidence": 90, "details": "Layout appears consistent with official format"},
          {"name": "Font Analysis", "status": "warning", "confidence": 65, "details": "Font inconsistencies detected"},
          {"name": "Photo Integrity", "status": "fail", "confidence": 45, "details": "Photo shows signs of manipulation"},
          {"name": "Security Features", "status": "warning", "confidence": 60, "details": "Some security features missing or unclear"},
          {"name": "Print Quality", "status": "pass", "confidence": 85, "details": "Print quality appears acceptable"},
          {"name": "Text Consistency", "status": "warning", "confidence": 70, "details": "Minor text alignment issues"},
          {"name": "Document Number Format", "status": "pass", "confidence": 95, "details": "Number format appears valid"},
          {"name": "Fraud Detection", "status": "warning", "confidence": 73, "details": "Potential fraud indicators detected (MOCK ANALYSIS)"}
        ],
        qualityIndicators: [
          {"type": "Photo Manipulation", "severity": "high", "description": "Possible digital editing detected in photograph area"},
          {"type": "Font Inconsistency", "severity": "medium", "description": "Text fonts do not match standard government document fonts"},
          {"type": "Mock Analysis", "severity": "low", "description": "This is a mock response. Add real Gemini API key for actual fraud detection."}
        ],
        recommendation: "MANUAL_REVIEW",
        summary: "MOCK ANALYSIS: Document shows potential fraud indicators. Manual verification recommended.",
        detailedAnalysis: "This is a mock fraud detection response. The document shows several suspicious characteristics including possible photo manipulation and font inconsistencies. Please add your Gemini API key to get real AI-powered fraud detection."
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

    const prompt = `You are an AI-powered fake document detection system for Indian government ID documents. Analyze this identity document image and:

1. FIRST: Automatically detect what type of document this is (PAN Card, Aadhaar Card, Voter ID, Passport, Driving License, Ration Card, etc.)
2. THEN: Detect if it's fake, tampered, or authentic based on the document type

CRITICAL: Focus on FRAUD DETECTION, not just quality. Look for these fraud indicators:

1. **Photo Manipulation Detection**
   - Signs of digital editing or photo replacement
   - Inconsistent lighting or shadows on photo
   - Photo quality mismatch with document quality
   - Evidence of photo pasting or digital insertion

2. **Text & Font Fraud Analysis**
   - Non-standard fonts that don't match official documents
   - Text that appears digitally added or modified
   - Inconsistent text spacing or alignment
   - Spelling errors or formatting inconsistencies

3. **Document Structure Fraud**
   - Layout that doesn't match official document format
   - Missing or incorrect security features
   - Wrong document dimensions or aspect ratio
   - Suspicious background patterns or textures

4. **Print Quality Fraud Indicators**
   - Signs of home printing vs official printing
   - Pixelation or low resolution reproduction
   - Color inconsistencies or poor color reproduction
   - Paper quality that doesn't match official standards

5. **Security Features Analysis**
   - Missing watermarks, holograms, or security threads
   - Fake or poorly reproduced security elements
   - Incorrect placement of security features
   - Digital recreation of security elements

6. **Data Consistency Fraud**
   - Document number format that doesn't match official patterns
   - Impossible dates (future issue dates, etc.)
   - Inconsistent information across fields
   - Data that doesn't align with document type standards

Respond ONLY with valid JSON in this EXACT format (no markdown, no extra text):
{
  "isGoodQuality": false,
  "confidenceScore": 65,
  "qualityScore": 35,
  "verdict": "SUSPICIOUS",
  "documentType": "PAN Card (Auto-detected)",
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
    {"name": "Font Analysis", "status": "warning", "confidence": 65, "details": "Font inconsistencies detected"},
    {"name": "Photo Integrity", "status": "fail", "confidence": 40, "details": "Photo shows signs of manipulation"},
    {"name": "Security Features", "status": "warning", "confidence": 60, "details": "Some security features missing"},
    {"name": "Print Quality", "status": "pass", "confidence": 85, "details": "Print quality acceptable"},
    {"name": "Text Consistency", "status": "warning", "confidence": 70, "details": "Text alignment issues"},
    {"name": "Document Number Format", "status": "pass", "confidence": 95, "details": "Number format valid"},
    {"name": "Fraud Detection", "status": "warning", "confidence": 65, "details": "Multiple fraud indicators detected"}
  ],
  "qualityIndicators": [
    {"type": "Photo Manipulation", "severity": "high", "description": "Digital editing detected in photograph"},
    {"type": "Font Inconsistency", "severity": "medium", "description": "Non-standard fonts used"}
  ],
  "recommendation": "REJECT",
  "summary": "Document shows multiple fraud indicators and should be rejected",
  "detailedAnalysis": "The document exhibits several characteristics of a fake document including photo manipulation, font inconsistencies, and missing security features. Recommend immediate rejection and further investigation."
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
          isGoodQuality: false,
          confidenceScore: 30,
          qualityScore: 70,
          verdict: "SUSPICIOUS",
          documentType: "Unknown Document (Auto-detected)",
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
          qualityChecks: [
            { name: "Analysis Error", status: "warning", confidence: 30, details: "Could not fully analyze document due to parsing error" }
          ],
          qualityIndicators: [
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
