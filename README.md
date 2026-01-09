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

## Getting Started

```bash
git clone https://github.com/venom001e/Nimbly-.git
cd nimbly
npm install
npm run dev
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
