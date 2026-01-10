<p align="center">
  <img src="public/apple-icon.png" alt="Nimbly Logo" width="80" height="80">
</p>

<h1 align="center">Nimbly</h1>

<p align="center">
  <strong>Aadhaar Analytics Dashboard</strong>
</p>

<p align="center">
  <em>Hackathon project for analyzing UIDAI enrolment data with trend analysis and insights</em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/UIDAI_Data-Hackathon-blue?style=for-the-badge" alt="UIDAI Dataset">
  <img src="https://img.shields.io/badge/Next.js-16.1-black?style=for-the-badge&logo=next.js" alt="Next.js">
  <img src="https://img.shields.io/badge/Analytics-Dashboard-orange?style=for-the-badge" alt="Analytics">
</p>

---

## Problem Statement

UIDAI manages Aadhaar enrolment across different regions and demographics. Key challenges include:

* Uneven enrolment distribution across districts
* Delays in update operations
* Coverage gaps in different age groups and regions
* Difficulty prioritizing districts for enrolment drives
* Limited tools for data-driven planning

**Nimbly** analyzes UIDAI enrolment datasets to provide district-level insights for operational decisions.

---

## What it does

Analytics dashboard that processes UIDAI enrolment data using:

* Statistical analysis
* Pattern detection
* Trend estimation
* Data-driven recommendations

> Note: This is a prototype for decision support, not a replacement for official UIDAI systems.

---

## Dataset Usage

This project uses **only the UIDAI datasets provided for the hackathon**.

**Dataset Files Used:**

* `api_data_aadhar_enrolment_0_500000.csv`
* `api_data_aadhar_enrolment_500000_1000000.csv`
* `api_data_aadhar_enrolment_1000000_1006029.csv`

**Total Records:** 1,006,029+

**Key Columns Analysed:**

* Date of enrolment
* State and district
* Pincode
* Age group counts (0–5, 5–17, 18+)

These fields are used to identify enrolment density, demographic trends, and district-wise variations.

---

## 🔍 Analytics & AI-Assisted Methodology

### Data Processing

* CSV ingestion and schema validation
* Missing value handling and basic outlier checks
* Aggregation at district, state, and time levels

### Analytics Techniques

* Descriptive statistics for enrolment coverage
* Time-series trend analysis (moving averages & smoothing)
* Cluster-based grouping of districts with similar patterns
* Threshold-based and ML-assisted anomaly identification

> AI components are used to **assist analysis**, not as black-box decision makers.

---

## 🛡️ Document Scan (Research Prototype)

**DocScan AI** is included as a **conceptual research prototype** to demonstrate how computer vision *may assist* field officers in assessing document quality (blur, readability, completeness).

* No real Aadhaar documents are processed
* No document is marked as valid or invalid
* No UIDAI verification logic is replicated

> This module is strictly **non-authoritative** and meant for exploratory demonstration only.

---

## 📈 Dashboard Capabilities

* District-wise enrolment comparison
* Age-group demographic analysis
* Identification of low-coverage districts
* Near real-time analytics on uploaded batch data
* Visual indicators to support prioritisation decisions

Example Decisions Supported:

* Which districts need additional enrolment camps?
* Which age group shows lower coverage trends?
* Where should operational focus be increased?

---

## 🧩 Technology Stack

**Frontend:**

* Next.js 16
* React 19
* TypeScript
* Tailwind CSS
* Chart.js / D3.js

**Backend & Processing:**

* Next.js API Routes
* Prisma ORM
* PostgreSQL (optional)
* Google Gemini (AI assistance)

---

## 🔗 Real-Time API Integration

**Nimbly** is designed with a flexible architecture that allows seamless integration with external APIs for real-time data streaming. The dashboard can easily connect to government databases, third-party services, and live data feeds.

### Integration Methods

#### 1. **API Integration (Most Common)**
The most probable integration method for government systems:

* **UIDAI APIs**: Connect to UIDAI या enrolment agencies के systems से data pull/push
* **Periodic Sync**: Secure APIs use करके periodic data fetch (हर minute या hour)
* **Technology**: RESTful APIs, GraphQL for batch data processing
* **Security**: OAuth, JWT tokens, HTTPS encryption (Aadhaar Act compliant)
* **Result**: Live charts, alerts, और metrics automatically update होते रहेंगे

```javascript
// Example: UIDAI API Integration
export const uidaiAPI = {
  baseURL: 'https://api.uidai.gov.in',
  endpoints: {
    enrolment: '/enrolment/realtime',
    updates: '/updates/stream'
  }
}
```

#### 2. **Webhooks & Event Streaming**
For true real-time updates (second-level):

* **Instant Notifications**: Enrolment होने पर source system से webhook trigger
* **Advanced Streaming**: Kafka, Apache Flink, AWS Kinesis streaming tools
* **Use Case**: Continuous data flow for big data processing
* **Benefit**: Real-time dashboard updates और instant alerts

#### 3. **Database Sync & Cloud Integration**
Direct database connections:

* **Government DBs**: NIC या state-level databases से direct sync
* **ETL Tools**: Apache Airflow for Extract, Transform, Load processes
* **Cloud Services**: Firebase Realtime Database, Supabase integration
* **Hosting**: AWS/GCP migration for better performance और scalability

#### 4. **WebSocket & Live Streaming**
Bi-directional real-time communication:

* **Live Updates**: Dashboard automatically refresh होता रहेगा
* **Technology**: Socket.io, WebSocket APIs
* **Use Cases**: Live enrolment counts, real-time alerts
* **Performance**: Minimal latency के साथ instant updates

```javascript
// Example: WebSocket Integration
const ws = new WebSocket('wss://data.gov.in/stream');
ws.onmessage = (event) => {
  updateDashboard(event.data);
}
```

### Quick Integration Steps

1. **Configure API Endpoint**
   ```bash
   # Add to .env file
   EXTERNAL_API_URL=https://your-api.gov.in
   EXTERNAL_API_KEY=your_api_key
   ```

2. **Create API Service**
   - Implement API service in `lib/external-api.ts`
   - Add error handling और retry logic
   - Configure rate limiting और caching

3. **Update Dashboard**
   - Integrate API calls into dashboard components
   - Enable real-time data display
   - Add automatic refresh mechanisms

### Supported Integration Types

| Type | Features | Use Case |
|------|----------|----------|
| **REST APIs** | GET/POST endpoints, JSON format, Authentication | Standard government APIs |
| **WebSocket** | Real-time feeds, Bi-directional communication | Live data streaming |
| **Database** | Direct connections, Scheduled sync, Bulk import | Government database integration |

### Integration Benefits

* **Real-time Updates**: Live data synchronization with automatic refresh
* **Scalable Architecture**: Handle multiple API connections simultaneously  
* **Error Handling**: Robust retry mechanisms और fallback options
* **Performance Optimized**: Caching और rate limiting for optimal performance
* **Security Compliant**: Aadhaar Act के अनुसार secure data handling

> **Note**: यह dashboard किसी भी external API के साथ easily integrate हो सकता है for real-time data streaming. Government systems, third-party services, और live data feeds के साथ seamless connection possible है.

---

## Getting Started

```bash
git clone https://github.com/venom001e/Nimbly-.git
cd nimbly
npm install
npm run dev
```

**Default Login Credentials:**
- Username: `admin`
- Password: `admin123`

### 📚 Complete Documentation

For detailed setup instructions, API integration guides, and comprehensive documentation, visit:
**[/docs](http://localhost:3000/docs)** - Complete project documentation with:

* Installation & Configuration Guide
* Real-time API Integration Methods
* User Guide & Dashboard Navigation
* API Reference & Examples
* Troubleshooting & Support

### Environment Setup

Create a `.env` file:

```bash
# Gemini AI (Optional)
GEMINI_API_KEY=your_gemini_api_key_here

# Database (Optional)
DATABASE_URL="postgresql://username:password@host:port/database"

# Performance (Optional)
REDIS_URL="redis://localhost:6379"
ENABLE_PERFORMANCE_MONITORING="true"
```

---

## 🏆 Why This Project Fits UIDAI Hackathon

* Uses **official UIDAI-provided datasets**
* Directly addresses enrolment and update challenges
* Focuses on **actionable insights**, not just charts
* Designed for government decision-makers
* Honest, explainable, and policy-aware AI usage

---

## ⚠️ Disclaimer

This project is developed solely for the UIDAI Hackathon as a proof-of-concept. It does not claim production readiness or official integration with UIDAI systems.

---

<p align="center">
  <strong>Built for data-driven governance 🇮🇳</strong>
</p>
