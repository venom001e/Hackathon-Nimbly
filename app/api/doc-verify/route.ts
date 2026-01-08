import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

export async function POST(request: NextRequest) {
  try {
    const { image, documentType } = await request.json()

    if (!image) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 })
    }

    // Extract base64 data from data URL
    const base64Data = image.split(',')[1]
    const mimeType = image.split(';')[0].split(':')[1]

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

    const prompt = `You are an expert document verification AI for Indian government ID documents. Analyze this ${documentType || 'identity document'} image and determine if it's GENUINE or FAKE.

IMPORTANT: Analyze the document thoroughly for these aspects:

1. **Document Format & Layout**
   - Is the layout consistent with official ${documentType} format?
   - Are all required fields present in correct positions?
   - Is the document size/aspect ratio correct?

2. **Text & Typography**
   - Are fonts consistent with official government documents?
   - Is text alignment proper?
   - Any spelling errors or inconsistencies?
   - Is the text clarity appropriate?

3. **Photo Analysis**
   - Does the photo appear tampered or edited?
   - Is photo quality consistent with document age?
   - Any signs of photo pasting or manipulation?

4. **Security Features**
   - Are expected security features visible (hologram, watermark, etc.)?
   - Is the document number format valid?
   - Any signs of digital editing or manipulation?

5. **Print Quality**
   - Is print quality consistent with official documents?
   - Any pixelation or resolution issues?
   - Color consistency check

6. **Overall Authenticity**
   - Does everything look consistent?
   - Any red flags or anomalies?

Respond in this EXACT JSON format:
{
  "isGenuine": true/false,
  "confidenceScore": 0-100,
  "fraudScore": 0-100,
  "verdict": "GENUINE" or "FAKE" or "SUSPICIOUS",
  "documentType": "detected document type",
  "extractedData": {
    "documentNumber": "extracted number or N/A",
    "holderName": "extracted name or N/A",
    "dateOfBirth": "extracted DOB or N/A",
    "fatherName": "extracted father name or N/A",
    "address": "extracted address or N/A",
    "issueDate": "extracted issue date or N/A",
    "expiryDate": "extracted expiry date or N/A",
    "issuingAuthority": "detected authority or N/A"
  },
  "securityChecks": [
    {"name": "Document Format", "status": "pass/fail/warning", "confidence": 0-100, "details": "explanation"},
    {"name": "Font Analysis", "status": "pass/fail/warning", "confidence": 0-100, "details": "explanation"},
    {"name": "Photo Integrity", "status": "pass/fail/warning", "confidence": 0-100, "details": "explanation"},
    {"name": "Security Features", "status": "pass/fail/warning", "confidence": 0-100, "details": "explanation"},
    {"name": "Print Quality", "status": "pass/fail/warning", "confidence": 0-100, "details": "explanation"},
    {"name": "Text Consistency", "status": "pass/fail/warning", "confidence": 0-100, "details": "explanation"},
    {"name": "Document Number Format", "status": "pass/fail/warning", "confidence": 0-100, "details": "explanation"},
    {"name": "Overall Authenticity", "status": "pass/fail/warning", "confidence": 0-100, "details": "explanation"}
  ],
  "fraudIndicators": [
    {"type": "indicator name", "severity": "high/medium/low", "description": "detailed explanation"}
  ],
  "recommendation": "ACCEPT" or "REJECT" or "MANUAL_REVIEW",
  "summary": "Brief summary of analysis",
  "detailedAnalysis": "Detailed explanation of findings"
}

If the image is not a valid document or is unclear, still provide analysis with appropriate low confidence scores.
Be strict in your analysis - even minor inconsistencies should be flagged.`

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
      // Extract JSON from response (handle markdown code blocks)
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        analysisResult = JSON.parse(jsonMatch[0])
      } else {
        throw new Error('No JSON found in response')
      }
    } catch (parseError) {
      console.error('JSON parse error:', parseError)
      // Return a default analysis if parsing fails
      analysisResult = {
        isGenuine: false,
        confidenceScore: 50,
        fraudScore: 50,
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
          { name: "Analysis Error", status: "warning", confidence: 50, details: "Could not fully analyze document" }
        ],
        fraudIndicators: [],
        recommendation: "MANUAL_REVIEW",
        summary: "Document analysis incomplete. Manual review recommended.",
        detailedAnalysis: text
      }
    }

    return NextResponse.json({
      success: true,
      analysis: analysisResult,
      processingTime: Date.now()
    })

  } catch (error) {
    console.error('Document verification error:', error)
    return NextResponse.json(
      { error: 'Failed to analyze document', details: String(error) },
      { status: 500 }
    )
  }
}
