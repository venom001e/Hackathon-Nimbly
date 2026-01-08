import { LucideIcon } from "lucide-react";

export interface ILink {
    name: string;
    href: string;
};

export interface ICustomIcon {
    icon: LucideIcon;
    dir?: 'left' | 'right';
};

export interface ISectionTitle {
    icon: LucideIcon;
    title: string;
    subtitle: string;
    dir?: 'left' | 'center';
};

export interface IFeature {
    icon: LucideIcon;
    title: string;
    description: string;
    cardBg?: string;
    iconBg?: string;
    href?: string;
};

export interface IFaq {
    question: string;
    answer: string;
};

export interface ITeamMember {
    name: string;
    image: string;
    role: string;
};

export interface IPricingPlan {
    icon: LucideIcon;
    name: string;
    type?: 'enterprise' | 'popular';
    description: string;
    price: number;
    linkText: string;
    linkUrl: string;
    features: string[];
};

export interface ITestimonial {
    quote: string;
    name: string;
    handle: string;
    image: string;
    rating: 5 | 4 | 3 | 2 | 1;
};
// Analytics Types
export interface EnrolmentRecord {
    id: string;
    timestamp: Date;
    state: string;
    district: string;
    age_group: string;
    gender: string;
    enrolment_type: 'new' | 'update';
    biometric_quality: number;
    processing_time: number;
}

export interface TrendAnalysis {
    metric: string;
    time_period: string;
    trend_direction: 'increasing' | 'decreasing' | 'stable';
    confidence_score: number;
    seasonal_component?: SeasonalPattern;
    geographic_breakdown: Record<string, number>;
}

export interface SeasonalPattern {
    pattern_type: 'weekly' | 'monthly' | 'quarterly' | 'yearly';
    peak_periods: string[];
    low_periods: string[];
    amplitude: number;
}

export interface Anomaly {
    id: string;
    timestamp: Date;
    anomaly_type: string;
    severity: 'low' | 'medium' | 'high';
    affected_regions: string[];
    description: string;
    confidence_score: number;
    suggested_actions: string[];
}

export interface Forecast {
    metric: string;
    forecast_horizon: number;
    predicted_values: number[];
    confidence_intervals: Array<[number, number]>;
    model_used: string;
    accuracy_metrics: Record<string, number>;
}

export interface Insight {
    id: string;
    title: string;
    description: string;
    priority: number;
    category: string;
    supporting_data: Record<string, any>;
    recommendations: string[];
    impact_assessment: string;
}

export interface AIResponse {
    query: string;
    response_text: string;
    data_summary?: Record<string, any>;
    confidence_score: number;
    suggested_followup: string[];
    response_time: number;
}

export interface Report {
    id: string;
    title: string;
    report_type: 'daily' | 'weekly' | 'monthly';
    generated_at: Date;
    content: Record<string, any>;
    format: 'pdf' | 'excel' | 'email' | 'sms';
    recipients: string[];
    delivery_status: string;
}

export interface UploadStatus {
    upload_id: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    progress: number;
    error_message?: string;
    processed_records: number;
    total_records: number;
}

export interface ValidationResult {
    is_valid: boolean;
    errors: string[];
    warnings: string[];
    schema_compliance: boolean;
}

export interface AnalyticsMetrics {
    total_enrolments: number;
    daily_growth_rate: number;
    top_performing_states: Array<{state: string, count: number}>;
    anomaly_count: number;
    prediction_accuracy: number;
}