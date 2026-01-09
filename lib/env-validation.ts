// Environment variable validation
export function validateEnvironment() {
  const requiredVars = [
    'DATABASE_URL',
    'NEXTAUTH_SECRET',
    'NEXTAUTH_URL'
  ]

  const missingVars = requiredVars.filter(varName => !process.env[varName])
  
  if (missingVars.length > 0) {
    console.error('❌ Missing required environment variables:')
    missingVars.forEach(varName => {
      console.error(`   - ${varName}`)
    })
    
    if (process.env.NODE_ENV === 'production') {
      throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`)
    } else {
      console.warn('⚠️  Running in development mode with missing environment variables')
    }
  }

  // Validate API keys
  if (!process.env.GEMINI_API_KEY && !process.env.GOOGLE_AI_API_KEY) {
    console.warn('⚠️  No Gemini API key configured - AI features will use fallback responses')
  }

  console.log('✅ Environment validation complete')
}

// Check if database is properly configured
export function isDatabaseConfigured(): boolean {
  return !!process.env.DATABASE_URL && process.env.DATABASE_URL !== 'your-database-url-here'
}

// Check if AI is properly configured
export function isAIConfigured(): boolean {
  return !!(process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY) &&
         process.env.GEMINI_API_KEY !== 'YOUR_ACTUAL_API_KEY_HERE' &&
         process.env.GOOGLE_AI_API_KEY !== 'YOUR_ACTUAL_API_KEY_HERE'
}