<p align="center">
  <img src="public/apple-icon.png" alt="Nimbly Logo" width="80" height="80">
</p>

<h1 align="center">Nimbly</h1>

<p align="center">
  <strong>AI-Powered Enrolment Analytics Dashboard</strong>
</p>

<p align="center">
  Real-time insights, trend analysis, anomaly detection, and predictive forecasting for smarter data-driven decisions.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16.1-black?style=flat-square&logo=next.js" alt="Next.js">
  <img src="https://img.shields.io/badge/React-19-blue?style=flat-square&logo=react" alt="React">
  <img src="https://img.shields.io/badge/TypeScript-5.9-blue?style=flat-square&logo=typescript" alt="TypeScript">
  <img src="https://img.shields.io/badge/Tailwind-4.1-38B2AC?style=flat-square&logo=tailwind-css" alt="Tailwind">
  <img src="https://img.shields.io/badge/Gemini_AI-Powered-orange?style=flat-square&logo=google" alt="Gemini AI">
</p>

---

## 🚀 Overview

**Nimbly** is a comprehensive analytics platform designed to identify meaningful patterns, trends, anomalies, and predictive indicators in large-scale enrolment data. Built for government agencies and policy makers, it transforms raw data into actionable insights through advanced analytics and AI-powered visualizations.

### Key Highlights
- 📊 Process **10L+ records** with instant insights
- 🤖 **12 AI-powered features** for intelligent analysis
- 🗺️ Coverage across **28+ states and UTs**
- ⚡ **Real-time** data processing and visualization

---

## ✨ Features

### 🧠 AI-Powered Tools

| Feature | Description |
|---------|-------------|
| **NimblySense AI** | AI-powered anomaly detection that identifies unusual patterns, predicts crisis zones, and provides intelligent resource allocation suggestions |
| **DocScan AI** | Advanced document verification using Gemini Vision API to detect fake/tampered documents with fraud scoring and OCR extraction |
| **Service Gap Identifier** | Identify underserved areas with interactive heat maps and AI recommendations for optimal center placement |
| **Predictive Analytics** | AI-powered forecasting using exponential smoothing to predict future trends with confidence bands |
| **AI Chat Assistant** | Intelligent chatbot powered by Gemini AI to answer queries and provide insights in natural language |

### 📈 Analytics & Visualization

| Feature | Description |
|---------|-------------|
| **Real-time Dashboard** | Central analytics hub with live metrics, trend charts, and quick access to all features |
| **Geographic Analysis** | Interactive state-wise heatmap with drill-down to district level and comparative insights |
| **Demographics Dashboard** | Comprehensive age group analysis with doughnut charts, daily trends, and growth calculations |
| **Trend Analysis** | Seasonal pattern detection, geographic trends, and growth rate calculations |

### 🛠️ Utility Features

| Feature | Description |
|---------|-------------|
| **NimblyConnect** | Gamified citizen engagement platform with achievements, leaderboards, and rewards |
| **Report Generator** | Generate comprehensive PDF/Excel reports with customizable filters |
| **Smart Alerts** | Configurable alert system for anomalies, threshold breaches, and critical events |
| **Data Upload** | Secure CSV data ingestion with validation and automatic processing |

---

## 🛠️ Tech Stack

### Frontend
- **Next.js 16** - React framework with App Router
- **React 19** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS 4** - Styling
- **Chart.js & D3.js** - Data visualization
- **GSAP & Motion** - Animations
- **Lenis** - Smooth scrolling

### Backend
- **Next.js API Routes** - Server-side APIs
- **Prisma** - Database ORM
- **Google Gemini AI** - AI/ML capabilities

### Data & Storage
- **PostgreSQL** - Primary database
- **Redis** - Caching
- **CSV Processing** - PapaParse

### Authentication & Security
- **JWT** - Token-based auth
- **bcrypt** - Password hashing
- **Role-based access control**

---

## 📦 Installation

### Prerequisites
- Node.js 18+
- npm or pnpm
- PostgreSQL (optional, for database features)

### Setup

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/nimbly.git
cd nimbly
```

2. **Install dependencies**
```bash
npm install
# or
pnpm install
```

3. **Environment setup**
```bash
cp .env.example .env
```

4. **Configure environment variables**
Edit the `.env` file with your actual values:
```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/nimbly"

# Google Gemini AI
GEMINI_API_KEY="your-gemini-api-key"

# JWT Secret
JWT_SECRET="your-jwt-secret"
```

⚠️ **Security Note**: Never commit your `.env` file to version control. It contains sensitive information like API keys and database credentials.

5. **Setup database (optional)**
```bash
npm run db:generate
npm run db:push
```

6. **Run development server**
```bash
npm run dev
```

7. **Open browser**
```
http://localhost:3000
```

---

## 📁 Project Structure

```
nimbly/
├── app/                    # Next.js App Router
│   ├── analytics/          # Analytics pages
│   │   ├── aadhaar-sense/  # AI Anomaly Detection
│   │   ├── aadhaar-connect/# Gamified Platform
│   │   ├── demographics/   # Demographics Analysis
│   │   ├── doc-scan/       # Document Verification
│   │   ├── geographic/     # Geographic Analysis
│   │   ├── predictions/    # Predictive Analytics
│   │   ├── service-gap/    # Service Gap Finder
│   │   └── alerts/         # Alert Management
│   ├── api/                # API Routes
│   ├── chat/               # AI Chat Interface
│   ├── login/              # Authentication
│   ├── reports/            # Report Generation
│   └── upload/             # Data Upload
├── components/             # React Components
│   ├── dashboard/          # Dashboard components
│   └── ui/                 # UI components
├── contexts/               # React Contexts
├── data/                   # Static data
├── lib/                    # Utility functions
├── prisma/                 # Database schema
├── public/                 # Static assets
├── sections/               # Page sections
└── __tests__/              # Test files
```

---

## 🔐 Authentication

The platform supports role-based access control:

| Role | Access Level |
|------|--------------|
| **Admin** | Full access to all features |
| **Analyst** | Analytics and reports |
| **Viewer** | Read-only dashboard access |

### Demo Credentials
```
Email: admin@nimbly.com
Password: admin123
```

---

## 📊 API Endpoints

### Analytics
- `GET /api/analytics/metrics` - Dashboard metrics
- `GET /api/analytics/trends` - Trend analysis
- `GET /api/analytics/anomalies` - Anomaly detection
- `GET /api/analytics/states` - State-wise data
- `GET /api/analytics/forecast` - Predictions

### AI Features
- `POST /api/aadhaar-sense/anomalies` - AI anomaly detection
- `POST /api/aadhaar-sense/suggestions` - AI recommendations
- `POST /api/doc-verify` - Document verification
- `POST /api/service-gap/analyze` - Service gap analysis
- `POST /api/chat` - AI chat

### Reports & Alerts
- `POST /api/reports/generate` - Generate reports
- `GET /api/alerts/history` - Alert history
- `POST /api/alerts/configure` - Configure alerts

---

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch
```

---

## 🚀 Deployment

### Build for production
```bash
npm run build
npm start
```

### Environment Variables for Production
Ensure all environment variables are set in your deployment platform.

---

## 📄 License

This project is licensed under the MIT License.

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

## 📞 Support

For support, please open an issue on GitHub or contact the development team.

---

<p align="center">
  Made with ❤️ by the Nimbly Team
</p>
