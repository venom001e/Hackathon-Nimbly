# 🚀 Quick API Key Setup Guide

## Current Status: ❌ API Key Missing

Aapka document verification feature currently **mock response** use kar raha hai kyunki valid Gemini API key nahi hai.

## ✅ Fix in 2 Minutes:

### Step 1: Get API Key
1. **Visit**: https://makersuite.google.com/app/apikey
2. **Sign in** with Google account
3. **Click**: "Create API Key" 
4. **Copy** the key (starts with `AIza...`)

### Step 2: Update .env File
1. Open `.env` file
2. Replace `YOUR_ACTUAL_API_KEY_HERE` with your real API key:
   ```
   GEMINI_API_KEY=AIzaSyC...your-real-key-here
   ```

### Step 3: Restart Server
```bash
# Stop current server (Ctrl+C)
# Then restart:
npm run dev
```

## 🧪 Current Mock Response Features:

✅ **Working Now** (with mock data):
- Document upload interface
- Analysis UI with all components
- Security checks display
- Fraud score visualization
- Recommendation system

❌ **Not Working** (needs real API key):
- Actual AI document analysis
- Real OCR text extraction
- Genuine fraud detection
- Authentic security validation

## 🔍 How to Test:

1. **With Mock**: Upload any image → Get sample analysis
2. **With Real API**: Add key → Upload document → Get real AI analysis

## ⚡ After Adding Real API Key:

- Real Gemini AI analysis
- Actual OCR extraction
- Genuine fraud detection
- Authentic security checks
- Support for all Indian documents (PAN, Aadhaar, Passport, etc.)

---

**Current Error in Logs**: `API key not valid` - This is expected until you add real key.

**Mock Response Indicator**: Look for "MOCK ANALYSIS" in results.