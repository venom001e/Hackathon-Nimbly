import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

// Initialize Gemini AI with proper error handling
const getGenAI = () => {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY
  if (!apiKey || apiKey === 'YOUR_ACTUAL_API_KEY_HERE') {
    return null
  }
  return new GoogleGenerativeAI(apiKey)
}

export async function POST(request: NextRequest) {
  try {
    const { image } = await request.json()

    if (!image) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 })
    }

    // Validate image format
    if (!image.startsWith('data:image/')) {
      return NextResponse.json({ error: 'Invalid image format. Please upload a valid image file.' }, { status: 400 })
    }

    const genAI = getGenAI()

    // If no valid API key, return enhanced mock response for testing
    if (!genAI) {
      console.log('🔄 Using enhanced mock response - Gemini API key not configured')
      
      // Generate more realistic mock data based on common document patterns
      const mockDocumentTypes = ['PAN Card', 'Aadhaar Card', 'Voter ID', 'Passport', 'Driving License']
      const randomDocType = mockDocumentTypes[Math.floor(Math.random() * mockDocumentTypes.length)]
      
      // Simulate different fraud scenarios
      const fraudScenarios = [
        {
          verdict: "SUSPICIOUS",
          confidenceScore: 73,
          qualityScore: 65,
          recommendation: "MANUAL_REVIEW",
          indicators: [
            {"type": "Photo Manipulation", "severity": "high", "description": "Possible digital editing detected in photograph area"},
            {"type": "Font Inconsistency", "severity": "medium", "description": "Text fonts do not match standard government document fonts"}
          ],
          summary: "Document shows potential fraud indicators. Manual verification recommended.",
          checks: [
            {"name": "Document Format", "status": "pass", "confidence": 90, "details": "Layout appears consistent with official format"},
            {"name": "Font Analysis", "status": "warning", "confidence": 65, "details": "Font inconsistencies detected"},
            {"name": "Photo Integrity", "status": "fail", "confidence": 45, "details": "Photo shows signs of manipulation"},
            {"name": "Security Features", "status": "warning", "confidence": 60, "details": "Some security features missing or unclear"}
          ]
        },
        {
          verdict: "GOOD_QUALITY",
          confidenceScore: 92,
          qualityScore: 15,
          recommendation: "ACCEPT",
          indicators: [],
          summary: "Document appears authentic with no significant fraud indicators detected.",
          checks: [
            {"name": "Document Format", "status": "pass", "confidence": 95, "details": "Perfect layout match with official format"},
            {"name": "Font Analysis", "status": "pass", "confidence": 88, "details": "Fonts match official standards"},
            {"name": "Photo Integrity", "status": "pass", "confidence": 90, "details": "Photo appears authentic"},
            {"name": "Security Features", "status": "pass", "confidence": 85, "details": "Security features present and valid"}
          ]
        },
        {
          verdict: "POOR_QUALITY",
          confidenceScore: 45,
          qualityScore: 85,
          recommendation: "REJECT",
          indicators: [
            {"type": "Fake Document", "severity": "high", "description": "Multiple fraud indicators suggest this is a counterfeit document"},
            {"type": "Poor Print Quality", "severity": "high", "description": "Print quality indicates home printing rather than official printing"},
            {"type": "Missing Security Features", "severity": "high", "description": "Critical security features are completely missing"}
          ],
          summary: "Document appears to be fake and should be rejected immediately.",
          checks: [
            {"name": "Document Format", "status": "fail", "confidence": 30, "details": "Layout does not match official format"},
            {"name": "Font Analysis", "status": "fail", "confidence": 25, "details": "Fonts are completely wrong"},
            {"name": "Photo Integrity", "status": "fail", "confidence": 20, "details": "Photo is clearly manipulated or fake"},
            {"name": "Security Features", "status": "fail", "confidence": 15, "details": "No valid security features detected"}
          ]
        }
      ]
      
      const scenario = fraudScenarios[Math.floor(Math.random() * fraudScenarios.length)]
      
      const mockAnalysisResult = {
        isGoodQuality: scenario.verdict === "GOOD_QUALITY",
        confidenceScore: scenario.confidenceScore,
        qualityScore: scenario.qualityScore,
        verdict: scenario.verdict,
        documentType: `${randomDocType} (Auto-detected)`,
        extractedData: {
          documentNumber: randomDocType === 'PAN Card' ? "ABCDE1234F" : 
                         randomDocType === 'Aadhaar Card' ? "1234 5678 9012" :
                         randomDocType === 'Voter ID' ? "ABC1234567" :
                         randomDocType === 'Passport' ? "A1234567" : "DL1234567890123",
          holderName: "SAMPLE NAME",
          dateOfBirth: "01/01/1990",
          fatherName: "FATHER NAME",
          address: "Sample Address, City, State - 123456",
          issueDate: "01/01/2020",
          expiryDate: randomDocType === 'Passport' ? "01/01/2030" : "N/A",
          issuingAuthority: randomDocType === 'PAN Card' ? "Income Tax Department" :
                           randomDocType === 'Aadhaar Card' ? "UIDAI" :
                           randomDocType === 'Voter ID' ? "Election Commission" :
                           randomDocType === 'Passport' ? "Ministry of External Affairs" : "Transport Department"
        },
        qualityChecks: scenario.checks,
        qualityIndicators: scenario.indicators,
        recommendation: scenario.recommendation,
        summary: scenario.summary,
        detailedAnalysis: `ENHANCED MOCK ANALYSIS for ${randomDocType}: ${scenario.summary} This is a demonstration of the fraud detection system. The AI has analyzed the document structure, fonts, photo integrity, and security features. Add your real Gemini API key to enable actual AI-powered fraud detection with Google's advanced vision models.`
      }

      return NextResponse.json({
        success: true,
        analysis: mockAnalysisResult,
        processingTime: Date.now(),
        isMockResponse: true,
        message: "Using enhanced mock response. Add Gemini API key for real AI analysis."
      })
    }

    // Extract base64 data from data URL with better validation
    const base64Data = image.split(',')[1]
    const mimeType = image.split(';')[0].split(':')[1]

    if (!base64Data || !mimeType) {
      return NextResponse.json({ error: 'Invalid image format. Please upload a valid image file.' }, { status: 400 })
    }

    // Validate image type
    const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!validImageTypes.includes(mimeType.toLowerCase())) {
      return NextResponse.json({ error: 'Unsupported image format. Please upload JPG, PNG, or WEBP files only.' }, { status: 400 })
    }

    // Try different model names in order of preference with better error handling
    const modelNames = ['gemini-1.5-pro', 'gemini-1.5-flash', 'gemini-pro-vision']
    let model = null
    let modelError = null

    for (const modelName of modelNames) {
      try {
        model = genAI.getGenerativeModel({ 
          model: modelName,
          generationConfig: {
            temperature: 0.1, // Lower temperature for more consistent analysis
            topK: 1,
            topP: 0.8,
            maxOutputTokens: 4096,
          },
        })
        console.log(`✅ Successfully initialized model: ${modelName}`)
        break
      } catch (err) {
        console.log(`❌ Failed to initialize model ${modelName}:`, err)
        modelError = err
        continue
      }
    }

    if (!model) {
      console.error('❌ No valid model found:', modelError)
      return NextResponse.json({ 
        error: 'Unable to initialize Gemini AI model. Please check your API key and try again.', 
        details: String(modelError) 
      }, { status: 500 })
    }

    const prompt = `You are an advanced AI-powered fake document detection system specifically trained for Indian government ID documents. Your task is to perform comprehensive fraud analysis with 100% accuracy.

ANALYSIS INSTRUCTIONS:
1. **FIRST**: Automatically identify the document type (PAN Card, Aadhaar Card, Voter ID, Passport, Driving License, Ration Card, etc.)
2. **THEN**: Perform detailed fraud detection analysis

CRITICAL FRAUD DETECTION AREAS:

🔍 **PHOTO MANIPULATION ANALYSIS**
- Digital editing signatures (inconsistent pixels, compression artifacts)
- Photo replacement indicators (mismatched lighting, shadows, resolution)
- Face morphing or deepfake detection
- Photo-to-document quality mismatch
- Evidence of cut-and-paste operations

🔍 **TYPOGRAPHY & FONT FRAUD**
- Official government font verification (each document type has specific fonts)
- Text rendering quality (official vs home-printed)
- Character spacing and kerning analysis
- Font weight and style consistency
- Digital text overlay detection

🔍 **DOCUMENT STRUCTURE VERIFICATION**
- Official layout template matching
- Dimension and aspect ratio verification
- Logo placement and quality analysis
- Border and frame authenticity
- Background pattern verification

🔍 **SECURITY FEATURES ANALYSIS**
- Watermark presence and authenticity
- Holographic elements verification
- Security thread detection
- Microprint analysis
- UV-reactive elements (if visible)
- Embossed text verification

🔍 **PRINT QUALITY ASSESSMENT**
- Official printing vs consumer printing detection
- Paper quality indicators
- Ink quality and consistency
- Print resolution analysis
- Color accuracy and saturation

🔍 **DATA CONSISTENCY VERIFICATION**
- Document number format validation (each type has specific patterns)
- Date logic verification (issue dates, expiry dates)
- Cross-field data consistency
- Spelling and grammar accuracy
- Official terminology usage

🔍 **ADVANCED FRAUD INDICATORS**
- Template reuse detection
- Batch printing indicators
- Digital creation signatures
- Scan-and-print artifacts
- Copy-paste evidence

RESPONSE FORMAT - Return ONLY valid JSON (no markdown, no extra text):

{
  "isGoodQuality": true/false,
  "confidenceScore": 85,
  "qualityScore": 25,
  "verdict": "GOOD_QUALITY" | "POOR_QUALITY" | "SUSPICIOUS",
  "documentType": "Document Type (Auto-detected)",
  "extractedData": {
    "documentNumber": "extracted number",
    "holderName": "extracted name",
    "dateOfBirth": "DD/MM/YYYY",
    "fatherName": "father's name",
    "address": "full address",
    "issueDate": "DD/MM/YYYY",
    "expiryDate": "DD/MM/YYYY or N/A",
    "issuingAuthority": "authority name"
  },
  "qualityChecks": [
    {"name": "Document Format", "status": "pass/fail/warning", "confidence": 90, "details": "detailed analysis"},
    {"name": "Font Analysis", "status": "pass/fail/warning", "confidence": 85, "details": "font verification results"},
    {"name": "Photo Integrity", "status": "pass/fail/warning", "confidence": 80, "details": "photo analysis results"},
    {"name": "Security Features", "status": "pass/fail/warning", "confidence": 75, "details": "security verification"},
    {"name": "Print Quality", "status": "pass/fail/warning", "confidence": 88, "details": "print analysis"},
    {"name": "Text Consistency", "status": "pass/fail/warning", "confidence": 92, "details": "text verification"},
    {"name": "Document Number Format", "status": "pass/fail/warning", "confidence": 95, "details": "number format check"},
    {"name": "Advanced Fraud Detection", "status": "pass/fail/warning", "confidence": 78, "details": "comprehensive fraud analysis"}
  ],
  "qualityIndicators": [
    {"type": "Specific Issue Type", "severity": "high/medium/low", "description": "detailed description of the issue"}
  ],
  "recommendation": "ACCEPT" | "REJECT" | "MANUAL_REVIEW",
  "summary": "Brief summary of findings",
  "detailedAnalysis": "Comprehensive analysis explaining all findings, fraud indicators, and reasoning behind the verdict"
}

ACCURACY REQUIREMENTS:
- Confidence scores must reflect actual analysis accuracy
- All fraud indicators must be specific and actionable
- Recommendations must be based on concrete evidence
- Analysis must be thorough and professional-grade`

    try {
      console.log('🔍 Starting Gemini AI analysis...')
      
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
      
      console.log('✅ Received response from Gemini AI')

      // Enhanced JSON parsing with multiple fallback strategies
      let analysisResult
      try {
        // Strategy 1: Direct JSON parse
        let cleanText = text.trim()
        
        // Strategy 2: Remove markdown code blocks
        if (cleanText.startsWith('```json')) {
          cleanText = cleanText.replace(/^```json\s*/, '').replace(/\s*```$/, '')
        } else if (cleanText.startsWith('```')) {
          cleanText = cleanText.replace(/^```\s*/, '').replace(/\s*```$/, '')
        }
        
        // Strategy 3: Extract JSON from response
        const jsonMatch = cleanText.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          analysisResult = JSON.parse(jsonMatch[0])
        } else {
          throw new Error('No JSON found in response')
        }
        
        // Validate required fields
        if (!analysisResult.verdict || !analysisResult.documentType || !analysisResult.confidenceScore) {
          throw new Error('Invalid response structure')
        }
        
        console.log('✅ Successfully parsed AI analysis result')
        
      } catch (parseError) {
        console.error('❌ JSON parse error:', parseError)
        console.error('Raw response:', text.substring(0, 1000))
        
        // Enhanced fallback analysis with better error handling
        analysisResult = {
          isGoodQuality: false,
          confidenceScore: 40,
          qualityScore: 60,
          verdict: "SUSPICIOUS",
          documentType: "Unknown Document (Auto-detection failed)",
          extractedData: {
            documentNumber: "Could not extract",
            holderName: "Could not extract",
            dateOfBirth: "N/A",
            fatherName: "N/A",
            address: "N/A",
            issueDate: "N/A",
            expiryDate: "N/A",
            issuingAuthority: "N/A"
          },
          qualityChecks: [
            { name: "AI Analysis", status: "warning", confidence: 40, details: "AI analysis completed but response parsing failed" },
            { name: "Document Recognition", status: "fail", confidence: 30, details: "Could not properly identify document type" },
            { name: "Fraud Detection", status: "warning", confidence: 35, details: "Partial analysis completed, manual review recommended" }
          ],
          qualityIndicators: [
            { type: "Analysis Error", severity: "medium", description: "AI analysis encountered parsing issues - manual verification required" }
          ],
          recommendation: "MANUAL_REVIEW",
          summary: "AI analysis completed but encountered technical issues. Manual review strongly recommended.",
          detailedAnalysis: `The AI successfully analyzed the document but encountered issues parsing the response. This could indicate complex document features that require human verification. Error: ${parseError instanceof Error ? parseError.message : 'Unknown parsing error'}. Partial response: ${text.substring(0, 500)}...`
        }
      }

      return NextResponse.json({
        success: true,
        analysis: analysisResult,
        processingTime: Date.now(),
        aiModel: model.model || 'gemini-ai',
        message: "Analysis completed successfully"
      })

    } catch (apiError) {
      console.error('❌ Gemini API error:', apiError)
      
      // Enhanced error response with specific error handling
      let errorMessage = 'Gemini AI analysis failed'
      let errorDetails = String(apiError)
      
      if (String(apiError).includes('API_KEY')) {
        errorMessage = 'Invalid API key. Please check your Gemini API configuration.'
      } else if (String(apiError).includes('QUOTA')) {
        errorMessage = 'API quota exceeded. Please try again later.'
      } else if (String(apiError).includes('SAFETY')) {
        errorMessage = 'Content safety filters triggered. Please try a different image.'
      }
      
      return NextResponse.json({
        error: errorMessage,
        details: errorDetails,
        suggestion: 'Please check your API key configuration and try again with a clear document image.'
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
