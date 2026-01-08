import { 
    BarChart3Icon, TrendingUpIcon, AlertTriangleIcon, BrainCircuitIcon, 
    MapPinIcon, UsersIcon, ScanIcon, MapIcon, FileTextIcon, 
    MessageSquareIcon, TrophyIcon, SparklesIcon
} from "lucide-react";
import { IFeature } from "../types";

// Main AI Features (Left section - sticky scrollable)
export const features: IFeature[] = [
    {
        title: "AadhaarSense AI",
        description:
            "AI-powered anomaly detection system that identifies unusual patterns, predicts crisis zones, and provides intelligent resource allocation suggestions using real enrolment data.",
        icon: BrainCircuitIcon,
        cardBg: "bg-purple-50",
        iconBg: "bg-purple-500",
        href: "/analytics/aadhaar-sense"
    },
    {
        title: "DocScan AI",
        description:
            "Advanced document verification system using Gemini Vision API to detect fake/tampered Aadhaar documents with fraud scoring, OCR extraction, and security analysis.",
        icon: ScanIcon,
        cardBg: "bg-red-50",
        iconBg: "bg-red-500",
        href: "/analytics/doc-scan"
    },
    {
        title: "Service Gap Identifier",
        description:
            "Identify underserved areas with interactive heat maps, priority rankings, and AI recommendations for optimal enrolment center placement across India.",
        icon: MapIcon,
        cardBg: "bg-amber-50",
        iconBg: "bg-amber-500",
        href: "/analytics/service-gap"
    },
    {
        title: "Predictive Analytics",
        description:
            "AI-powered forecasting using exponential smoothing to predict future enrolment trends with confidence bands, growth rates, and seasonal pattern detection.",
        icon: TrendingUpIcon,
        cardBg: "bg-green-50",
        iconBg: "bg-green-500",
        href: "/analytics/predictions"
    },
    {
        title: "Geographic Analysis",
        description:
            "Interactive state-wise heatmap with drill-down to district level, age distribution analysis, and comparative insights across all 28+ states and UTs.",
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
            "Gamified citizen engagement platform with achievements, leaderboards, and rewards to encourage Nimbly enrolment and updates across communities.",
        icon: TrophyIcon,
        cardBg: "bg-yellow-50",
        iconBg: "bg-yellow-500",
        href: "/analytics/aadhaar-connect"
    },
    {
        title: "AI Chat Assistant",
        description:
            "Intelligent chatbot powered by Gemini AI to answer queries about Nimbly EnrolmentAnalytics, provide insights, and help navigate the dashboard features.",
        icon: MessageSquareIcon,
        cardBg: "bg-indigo-50",
        iconBg: "bg-indigo-500",
        href: "/chat"
    },
    {
        title: "Report Generator",
        description:
            "Generate comprehensive PDF/Excel reports with customizable date ranges, state filters, and detailed analytics summaries for official documentation.",
        icon: FileTextIcon,
        cardBg: "bg-slate-50",
        iconBg: "bg-slate-500",
        href: "/reports"
    },
    {
        title: "Real-time Dashboard",
        description:
            "Central analytics hub with live metrics, trend charts, anomaly alerts, and quick access to all features - processing 10L+ records with instant insights.",
        icon: BarChart3Icon,
        cardBg: "bg-orange-50",
        iconBg: "bg-orange-500",
        href: "/analytics"
    },
    {
        title: "Smart Alerts",
        description:
            "Configurable alert system that monitors enrolment patterns and notifies administrators about anomalies, threshold breaches, and critical events.",
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
