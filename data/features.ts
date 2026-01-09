import { 
    BarChart3Icon, TrendingUpIcon, AlertTriangleIcon, BrainCircuitIcon, 
    MapPinIcon, UsersIcon, ScanIcon, MapIcon, FileTextIcon, 
    MessageSquareIcon, TrophyIcon, SparklesIcon
} from "lucide-react";
import { IFeature } from "../types";

// Main AI Features (Left section - sticky scrollable)
export const features: IFeature[] = [
    {
        title: "AadhaarSense",
        description:
            "Pattern analysis system that looks at trends in enrolment data and suggests where to focus resources based on statistical analysis.",
        icon: BrainCircuitIcon,
        cardBg: "bg-purple-50",
        iconBg: "bg-purple-500",
        href: "/analytics/aadhaar-sense"
    },
    {
        title: "DocScan",
        description:
            "Document quality checker using Gemini Vision API. Analyzes document images and gives quality scores with OCR text extraction.",
        icon: ScanIcon,
        cardBg: "bg-red-50",
        iconBg: "bg-red-500",
        href: "/analytics/doc-scan"
    },
    {
        title: "Service Gap Analysis",
        description:
            "Find areas that need more enrolment centers. Shows heat maps and suggests where to place new centers based on population data.",
        icon: MapIcon,
        cardBg: "bg-amber-50",
        iconBg: "bg-amber-500",
        href: "/analytics/service-gap"
    },
    {
        title: "Trend Analysis",
        description:
            "Statistical analysis of enrolment trends over time. Shows growth rates, seasonal patterns, and confidence intervals for predictions.",
        icon: TrendingUpIcon,
        cardBg: "bg-green-50",
        iconBg: "bg-green-500",
        href: "/analytics/predictions"
    },
    {
        title: "Geographic View",
        description:
            "State-wise data visualization with drill-down to districts. Shows age distribution and comparisons across different regions.",
        icon: MapPinIcon,
        cardBg: "bg-blue-50",
        iconBg: "bg-blue-500",
        href: "/analytics/geographic"
    },
    {
        title: "Demographics Dashboard",
        description:
            "Comprehensive age group analysis with doughnut charts, daily trends, state-wise stacked bars, and growth percentage calculations from real CSV data.",
        icon: UsersIcon,
        cardBg: "bg-cyan-50",
        iconBg: "bg-cyan-500",
        href: "/analytics/demographics"
    },
];

// Additional Features (Second section)
export const additionalFeatures: IFeature[] = [
    {
        title: "AadhaarConnect",
        description:
            "Prototype citizen engagement platform with achievements, leaderboards, and rewards to encourage Aadhaar enrolment and updates across communities.",
        icon: TrophyIcon,
        cardBg: "bg-yellow-50",
        iconBg: "bg-yellow-500",
        href: "/analytics/aadhaar-connect"
    },
    {
        title: "AI Chat Assistant",
        description:
            "AI-assisted chatbot powered by Gemini AI to answer queries about Aadhaar EnrolmentAnalytics, provide decision-support insights, and help navigate dashboard features.",
        icon: MessageSquareIcon,
        cardBg: "bg-indigo-50",
        iconBg: "bg-indigo-500",
        href: "/chat"
    },
    {
        title: "Report Generator",
        description:
            "Generate comprehensive PDF/Excel reports with customizable date ranges, state filters, and detailed analytics summaries for decision-support documentation.",
        icon: FileTextIcon,
        cardBg: "bg-slate-50",
        iconBg: "bg-slate-500",
        href: "/reports"
    },
    {
        title: "Analytics Dashboard",
        description:
            "Central analytics hub with near real-time metrics, trend charts, advisory alerts, and quick access to all features - processing 10L+ records with batch insights.",
        icon: BarChart3Icon,
        cardBg: "bg-orange-50",
        iconBg: "bg-orange-500",
        href: "/analytics"
    },
    {
        title: "Advisory Alerts",
        description:
            "Configurable notification system that monitors enrolment patterns and provides advisory notifications about anomalies, threshold breaches, and critical events.",
        icon: AlertTriangleIcon,
        cardBg: "bg-rose-50",
        iconBg: "bg-rose-500",
        href: "/analytics/alerts"
    },
    {
        title: "Data Upload",
        description:
            "Secure CSV data ingestion with validation, progress tracking, and automatic processing for seamless integration of new enrolment records.",
        icon: SparklesIcon,
        cardBg: "bg-teal-50",
        iconBg: "bg-teal-500",
        href: "/upload"
    },
];
