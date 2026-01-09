# Gemini API Setup Guide for Document Verification

## 🚨 Important Security Notice
Your current Gemini API key has been compromised and reported as leaked. You need to get a new API key immediately.

## Step 1: Get a New Gemini API Key

1. **Visit Google AI Studio**: Go to [https://makersuite.google.com/app/apikey](https://makersuite.google.com/app/apikey)

2. **Sign in** with your Google account

3. **Create API Key**: Click "Create API Key" button

4. **Copy the Key**: Copy the generated API key (starts with `AIza...`)

5. **Update .env file**: Replace `YOUR_NEW_API_KEY_HERE` in your `.env` file with the new key:
   ```
   GEMINI_API_KEY=AIza...your-new-key-here
   ```

## Step 2: Verify the Setup

1. **Restart your development server** if it's running
2. **Test the API** by uploading a document image in the Document Verification page

## Step 3: Security Best Practices

1. **Never commit API keys** to version control
2. **Use environment variables** for sensitive data
3. **Rotate keys regularly** for production applications
4. **Monitor API usage** in Google Cloud Console

## Features of the Updated Document Verification

✅ **Multi-model Support**: Automatically tries different Gemini models (2.5-flash, 2.0-flash, 2.5-pro)
✅ **Enhanced Error Handling**: Better error messages and fallback responses
✅ **Improved JSON Parsing**: Handles various response formats from Gemini
✅ **Comprehensive Analysis**: 8 quality checks with detailed pattern indicators
✅ **OCR Data Extraction**: Extracts document details like name, number, dates
✅ **Visual Quality Score**: Interactive document quality assessment meter
✅ **Recommendation System**: ACCEPT/REJECT/MANUAL_REVIEW recommendations

## Supported Document Types

- PAN Card
- Voter ID (EPIC)
- Passport
- Driving License
- Ration Card
- Other Government IDs

## API Response Format

The API returns detailed analysis including:
- **Quality assessment** (GOOD/POOR/SUSPICIOUS)
- **Confidence score** (0-100%)
- **Quality risk score** (0-100%)
- **Extracted data** (OCR results)
- **Quality checks** (8 different validation tests)
- **Pattern indicators** (specific issues found)
- **Recommendation** (action to take)

## Troubleshooting

### Common Issues:

1. **403 Forbidden**: API key is invalid or compromised
   - Solution: Get a new API key from Google AI Studio

2. **404 Not Found**: Model not available
   - Solution: The code automatically tries multiple models

3. **Rate Limiting**: Too many requests
   - Solution: Implement request throttling or upgrade API plan

4. **Image Format Issues**: Invalid image data
   - Solution: Ensure images are in JPG, PNG, or WEBP format

### Testing the API

Use the test script provided:
```bash
node test-doc-verify.js
```

This will test the API with a sample image and show the response format.

## Next Steps

1. Get your new API key
2. Update the .env file
3. Restart the development server
4. Test with real document images
5. Monitor API usage and costs

The document verification feature is now properly configured with the latest Gemini models and enhanced security checks!