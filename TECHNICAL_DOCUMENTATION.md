# Nimbly - Technical Documentation

## Project Architecture

### Overview
Nimbly is a comprehensive Aadhaar Analytics Dashboard built with Next.js 16, designed to process and analyze over 1 million Aadhaar enrolment records. The application provides real-time insights, predictive analytics, and AI-powered document verification for government decision-makers.

### Technology Stack

#### Frontend
- **Next.js 16.1.1** - React framework with App Router
- **React 19.2.3** - UI library with latest features
- **TypeScript 5.9.3** - Type-safe development
- **Tailwind CSS 4.1.18** - Utility-first CSS framework
- **Framer Motion 11.11.17** - Animation library
- **Chart.js 4.4.6** - Data visualization
- **D3.js 7.9.0** - Advanced data visualization

#### Backend
- **Next.js API Routes** - Serverless API endpoints
- **Prisma 5.22.0** - Database ORM
- **PostgreSQL** - Primary database (optional)
- **Redis 4.7.0** - Caching layer
- **Google Gemini AI** - Document fraud detection

#### Development Tools
- **ESLint 9.39.2** - Code linting
- **Jest 29.7.0** - Testing framework
- **TypeScript** - Static type checking
- **Prettier** - Code formatting

## System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   API Layer     │    │   Data Layer    │
│                 │    │                 │    │                 │
│ • React Pages   │◄──►│ • Next.js APIs  │◄──►│ • PostgreSQL    │
│ • Components    │    │ • Authentication│    │ • Redis Cache   │
│ • State Mgmt    │    │ • Data Processing│    │ • CSV Files     │
│ • Charts/Viz    │    │ • AI Integration│    │ • File Storage  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │              ┌─────────────────┐              │
         └──────────────►│  External APIs  │◄─────────────┘
                        │                 │
                        │ • Gemini AI     │
                        │ • Analytics     │
                        └─────────────────┘
```

## Core Features

### 1. Analytics Dashboard
- **Real-time Metrics**: Live data processing with automatic updates
- **Interactive Charts**: Chart.js and D3.js visualizations
- **Time Range Filtering**: Dynamic date range selection
- **Performance Optimized**: Redis caching for sub-second response times

### 2. Data Processing Pipeline
- **CSV Ingestion**: Handles large files (1M+ records)
- **Data Validation**: Schema validation and error reporting
- **Batch Processing**: Async processing for large datasets
- **Error Handling**: Comprehensive error tracking and recovery

### 3. AI Document Detection
- **Gemini Integration**: Google's latest AI models
- **Fraud Detection**: Advanced document authenticity analysis
- **Real-time Processing**: Instant analysis results
- **Fallback Systems**: Graceful degradation when AI unavailable

### 4. Geographic Analysis
- **State-wise Mapping**: Interactive geographic visualizations
- **District Analysis**: Granular location-based insights
- **Coverage Metrics**: Enrolment density calculations
- **Trend Identification**: Geographic pattern recognition

## Database Schema

### Core Tables

#### EnrolmentData
```sql
CREATE TABLE enrolment_data (
  id SERIAL PRIMARY KEY,
  enrolment_date DATE NOT NULL,
  state VARCHAR(100) NOT NULL,
  district VARCHAR(100) NOT NULL,
  pincode VARCHAR(10),
  age_group_0_5 INTEGER DEFAULT 0,
  age_group_5_17 INTEGER DEFAULT 0,
  age_group_18_plus INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Analytics Cache
```sql
CREATE TABLE analytics_cache (
  id SERIAL PRIMARY KEY,
  cache_key VARCHAR(255) UNIQUE NOT NULL,
  data JSONB NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### User Sessions
```sql
CREATE TABLE user_sessions (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(100) NOT NULL,
  session_token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## API Documentation

### Analytics Endpoints

#### GET /api/analytics/csv-metrics
Retrieve processed CSV metrics with filtering options.

**Parameters:**
- `time_range` (string): "24h", "7d", "30d", "90d", "1y"
- `state` (string, optional): Filter by state
- `district` (string, optional): Filter by district

**Response:**
```json
{
  "success": true,
  "data": {
    "totalRecords": 1006029,
    "dateRange": {
      "start": "2023-01-01",
      "end": "2024-12-31"
    },
    "metrics": {
      "totalEnrolments": 1006029,
      "stateCount": 36,
      "districtCount": 640,
      "ageGroups": {
        "0-5": 150000,
        "5-17": 350000,
        "18+": 506029
      }
    },
    "trends": [...],
    "topStates": [...],
    "topDistricts": [...]
  }
}
```

#### POST /api/data/upload
Upload and process CSV files with validation.

**Request:**
```json
{
  "file": "base64_encoded_csv_data",
  "filename": "enrolment_data.csv"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "processedRows": 50000,
    "errors": [],
    "warnings": [],
    "processingTime": 2.5,
    "fileId": "upload_123456"
  }
}
```

#### POST /api/doc-verify
AI-powered document fraud detection using Gemini AI.

**Request:**
```json
{
  "image": "data:image/jpeg;base64,..."
}
```

**Response:**
```json
{
  "success": true,
  "analysis": {
    "isGoodQuality": true,
    "confidenceScore": 85,
    "qualityScore": 20,
    "verdict": "GOOD_QUALITY",
    "documentType": "PAN Card (Auto-detected)",
    "extractedData": {...},
    "qualityChecks": [...],
    "recommendation": "ACCEPT"
  }
}
```

### Alert Management

#### GET /api/alerts/check
Check for system anomalies and generate alerts.

#### POST /api/alerts/configure
Configure alert thresholds and notification settings.

## Performance Optimizations

### Caching Strategy
- **Redis Integration**: Multi-layer caching system
- **API Response Caching**: 5-minute TTL for analytics data
- **Database Query Optimization**: Indexed queries and connection pooling
- **Frontend Caching**: Browser caching for static assets

### Database Optimizations
- **Indexing Strategy**: Composite indexes on frequently queried columns
- **Connection Pooling**: Optimized connection management
- **Query Optimization**: Efficient aggregation queries
- **Batch Processing**: Bulk insert operations for large datasets

### Frontend Performance
- **Code Splitting**: Dynamic imports for route-based splitting
- **Image Optimization**: Next.js Image component with WebP support
- **Bundle Analysis**: Webpack bundle analyzer integration
- **Lazy Loading**: Component-level lazy loading

## Security Implementation

### Authentication & Authorization
- **Session Management**: Secure session handling with JWT
- **Role-Based Access**: Admin, Analyst, and Demo user roles
- **Password Security**: Bcrypt hashing with salt rounds
- **Session Expiry**: Configurable session timeout

### Data Security
- **Input Validation**: Comprehensive input sanitization
- **SQL Injection Prevention**: Parameterized queries via Prisma
- **XSS Protection**: Content Security Policy headers
- **File Upload Security**: Type validation and size limits

### API Security
- **Rate Limiting**: Request throttling per IP/user
- **CORS Configuration**: Restricted cross-origin requests
- **Error Handling**: Sanitized error responses
- **Logging**: Comprehensive audit logging

## Deployment Architecture

### Production Setup
```yaml
# docker-compose.yml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}
    depends_on:
      - postgres
      - redis

  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: nimbly
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

### Environment Configuration
```bash
# Production Environment Variables
NODE_ENV=production
DATABASE_URL="postgresql://user:pass@host:5432/nimbly"
REDIS_URL="redis://redis:6379"
GEMINI_API_KEY="your_gemini_api_key"
NEXTAUTH_SECRET="your_secure_secret_key"
NEXTAUTH_URL="https://your-domain.com"

# Performance Settings
CACHE_TTL=300
MAX_CACHE_SIZE=1000
API_RATE_LIMIT=100
ENABLE_PERFORMANCE_MONITORING=true
```

## Testing Strategy

### Unit Testing
- **Jest Configuration**: Comprehensive test setup
- **Component Testing**: React Testing Library integration
- **API Testing**: Endpoint testing with mock data
- **Utility Testing**: Helper function validation

### Integration Testing
- **Database Testing**: Prisma integration tests
- **API Integration**: End-to-end API testing
- **Authentication Testing**: Login flow validation
- **File Processing**: CSV upload and processing tests

### Performance Testing
- **Load Testing**: Artillery.js for API load testing
- **Database Performance**: Query performance benchmarks
- **Frontend Performance**: Lighthouse CI integration
- **Memory Profiling**: Node.js memory usage monitoring

## Monitoring & Logging

### Application Monitoring
- **Performance Metrics**: Response time and throughput tracking
- **Error Tracking**: Comprehensive error logging and alerting
- **User Analytics**: Usage pattern analysis
- **System Health**: Resource utilization monitoring

### Logging Strategy
```javascript
// Structured logging implementation
const logger = {
  info: (message, metadata) => {
    console.log(JSON.stringify({
      level: 'info',
      message,
      timestamp: new Date().toISOString(),
      ...metadata
    }));
  },
  error: (message, error, metadata) => {
    console.error(JSON.stringify({
      level: 'error',
      message,
      error: error.stack,
      timestamp: new Date().toISOString(),
      ...metadata
    }));
  }
};
```

## Development Workflow

### Code Standards
- **TypeScript**: Strict mode enabled with comprehensive type checking
- **ESLint**: Custom rules for code quality enforcement
- **Prettier**: Automated code formatting
- **Husky**: Pre-commit hooks for quality gates

### Git Workflow
```bash
# Feature development workflow
git checkout -b feature/new-analytics-feature
git add .
git commit -m "feat: add new analytics dashboard feature"
git push origin feature/new-analytics-feature
# Create pull request for review
```

### Build Process
```bash
# Development build
npm run dev

# Production build
npm run build
npm run start

# Testing
npm run test
npm run test:coverage

# Performance analysis
npm run perf:analyze
```

## Troubleshooting Guide

### Common Issues

#### Database Connection Issues
```bash
# Check database connectivity
npx prisma db pull

# Reset database schema
npx prisma migrate reset

# Generate Prisma client
npx prisma generate
```

#### Redis Connection Issues
```bash
# Test Redis connection
redis-cli ping

# Check Redis configuration
redis-cli config get "*"
```

#### Performance Issues
```bash
# Run performance diagnostics
npm run perf:analyze

# Check memory usage
node --inspect app.js

# Database query analysis
EXPLAIN ANALYZE SELECT * FROM enrolment_data WHERE state = 'Maharashtra';
```

### Debug Configuration
```javascript
// Debug logging configuration
const debug = {
  database: process.env.DEBUG_DB === 'true',
  api: process.env.DEBUG_API === 'true',
  performance: process.env.DEBUG_PERF === 'true'
};
```

## Future Enhancements

### Planned Features
- **Real-time Data Streaming**: WebSocket integration for live updates
- **Advanced ML Models**: Custom machine learning for pattern detection
- **Mobile Application**: React Native mobile app
- **API Gateway**: Centralized API management and rate limiting

### Scalability Improvements
- **Microservices Architecture**: Service decomposition for better scalability
- **Container Orchestration**: Kubernetes deployment
- **CDN Integration**: Global content delivery network
- **Database Sharding**: Horizontal database scaling

## Contributing Guidelines

### Development Setup
1. Fork the repository
2. Clone your fork: `git clone https://github.com/your-username/Hackathon-Nimbly.git`
3. Install dependencies: `npm install`
4. Set up environment variables
5. Run development server: `npm run dev`

### Code Contribution Process
1. Create feature branch from main
2. Implement changes with tests
3. Run quality checks: `npm run lint && npm run test`
4. Commit with conventional commit format
5. Push and create pull request
6. Address review feedback

### Documentation Updates
- Update API documentation for new endpoints
- Add JSDoc comments for new functions
- Update README for new features
- Include migration guides for breaking changes

---

**Built for the UIDAI Hackathon 2025**  
**Technology Stack**: Next.js, TypeScript, PostgreSQL, Redis, Gemini AI  
**License**: MIT License  
**Maintainers**: Development Team