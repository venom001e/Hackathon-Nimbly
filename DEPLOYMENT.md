# 🚀 Production Deployment Guide

## Vercel Environment Variables Setup

### Required Environment Variables:

1. **DATABASE_URL**
   ```
   postgresql://neondb_owner:npg_3fnQzjI8wSbF@ep-dawn-glitter-a425otyu-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require
   ```

2. **NEXTAUTH_SECRET**
   ```
   your-super-secret-key-for-jwt-signing-minimum-32-characters
   ```

3. **NEXTAUTH_URL**
   ```
   https://your-vercel-domain.vercel.app
   ```

4. **GEMINI_API_KEY**
   ```
   AIzaSyAD7q1Z6bSrPnwvnVqdirhyeBMDucD0XiM
   ```

5. **GOOGLE_AI_API_KEY**
   ```
   AIzaSyAD7q1Z6bSrPnwvnVqdirhyeBMDucD0XiM
   ```

## Setup Steps:

### 1. Vercel Dashboard Setup
1. Go to your Vercel project dashboard
2. Navigate to Settings → Environment Variables
3. Add all the above environment variables
4. Redeploy your application

### 2. Database Setup
After deployment, run the database setup:
```bash
npm run db:setup
```

### 3. Verify Deployment
1. Check if the application loads
2. Test login with: admin@aadhaar-analytics.com / admin123
3. Verify analytics pages load properly
4. Check API endpoints are working

## Common Issues & Solutions:

### Issue 1: "PrismaClient is not a constructor"
**Solution:** Ensure `prisma generate` runs during build
- Check if `postinstall` script exists in package.json
- Verify DATABASE_URL is set in Vercel environment variables

### Issue 2: "Database connection failed"
**Solution:** 
- Verify DATABASE_URL format
- Ensure Neon database is accessible
- Check if database tables exist

### Issue 3: "NextAuth configuration error"
**Solution:**
- Set NEXTAUTH_SECRET (minimum 32 characters)
- Set NEXTAUTH_URL to your Vercel domain
- Ensure both are in Vercel environment variables

### Issue 4: "API routes returning 500 errors"
**Solution:**
- Check Vercel function logs
- Verify all environment variables are set
- Ensure database schema is pushed

## Monitoring & Debugging:

1. **Vercel Function Logs**: Check real-time logs in Vercel dashboard
2. **Database Monitoring**: Use Neon dashboard to monitor queries
3. **Error Tracking**: Check browser console for client-side errors

## Performance Optimization:

1. **Database Indexing**: Ensure proper indexes on frequently queried columns
2. **API Caching**: Implement caching for analytics data
3. **Image Optimization**: Use Next.js Image component
4. **Bundle Analysis**: Run `npm run analyze` to check bundle size

## Security Checklist:

- ✅ Environment variables are set in Vercel (not in code)
- ✅ Database connection uses SSL
- ✅ API routes have proper error handling
- ✅ Authentication is properly configured
- ✅ CORS is configured for production domain

## Support:

If you encounter issues:
1. Check Vercel deployment logs
2. Verify all environment variables
3. Test database connectivity
4. Check API endpoint responses