'use client';

import AnimatedContent from "@/components/animated-content";
import SectionTitle from "@/components/section-title";
import { TargetIcon, UsersIcon, MapPinIcon, AlertTriangleIcon, CheckCircle2Icon, ArrowRightIcon, SparklesIcon } from "lucide-react";
import Link from "next/link";

const useCases = [
    {
        icon: UsersIcon,
        title: "Policy Planning",
        description: "Analyze enrolment patterns to plan resource allocation and identify underserved areas.",
        features: ["Demographic analysis", "Geographic coverage maps", "Trend forecasting", "Resource optimization"],
        gradient: "from-orange-500 to-amber-500",
        bgGradient: "from-orange-50 to-amber-50",
        borderColor: "border-orange-200",
        iconBg: "bg-gradient-to-br from-orange-500 to-amber-500"
    },
    {
        icon: MapPinIcon,
        title: "District Administration",
        description: "Monitor district-level performance and track progress against enrolment targets.",
        features: ["Analytics dashboards", "Performance benchmarks", "Comparative analysis", "Progress tracking"],
        gradient: "from-blue-500 to-cyan-500",
        bgGradient: "from-blue-50 to-cyan-50",
        borderColor: "border-blue-200",
        iconBg: "bg-gradient-to-br from-blue-500 to-cyan-500"
    },
    {
        icon: AlertTriangleIcon,
        title: "Quality Assessment",
        description: "Identify anomalies and suspicious patterns in enrolment data for further investigation.",
        features: ["Pattern identification", "Statistical analysis", "Advisory notifications", "Investigation support"],
        gradient: "from-rose-500 to-pink-500",
        bgGradient: "from-rose-50 to-pink-50",
        borderColor: "border-rose-200",
        iconBg: "bg-gradient-to-br from-rose-500 to-pink-500"
    }
];

export default function PricingSection() {
    return (
        <section id="pricing" className="relative px-4 sm:px-6 md:px-16 lg:px-24 xl:px-32 py-16 sm:py-24 overflow-hidden">
            {/* Background Elements */}
            <div className="absolute inset-0 bg-gradient-to-b from-slate-50 via-white to-orange-50/30" />
            <div className="absolute top-0 left-1/4 w-64 h-64 sm:w-96 sm:h-96 bg-orange-200/20 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-64 h-64 sm:w-96 sm:h-96 bg-blue-200/20 rounded-full blur-3xl" />
            
            <div className="relative z-10 max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12 sm:mb-16">
                    <AnimatedContent>
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-orange-200 shadow-sm mb-4 sm:mb-6">
                            <SparklesIcon className="w-4 h-4 text-orange-500" />
                            <span className="text-sm font-medium text-gray-700">Powerful Use Cases</span>
                        </div>
                    </AnimatedContent>
                    <SectionTitle
                        icon={TargetIcon}
                        title="Use Cases"
                        subtitle="How different stakeholders leverage the Nimbly EnrolmentAnalytics Dashboard for data-driven decisions."
                    />
                </div>
                
                {/* Use Case Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                    {useCases.map((useCase, index) => (
                        <AnimatedContent 
                            delay={index * 0.15} 
                            key={index}
                        >
                            <div className={`group relative h-full p-6 sm:p-8 bg-gradient-to-br ${useCase.bgGradient} rounded-3xl border ${useCase.borderColor} hover:shadow-2xl hover:shadow-orange-500/10 transition-all duration-500 hover:-translate-y-2`}>
                                {/* Decorative corner */}
                                <div className={`absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br ${useCase.gradient} opacity-5 rounded-bl-full`} />
                                
                                {/* Icon */}
                                <div className={`relative w-12 h-12 sm:w-16 sm:h-16 ${useCase.iconBg} rounded-2xl flex items-center justify-center shadow-lg mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300`}>
                                    <useCase.icon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                                </div>
                                
                                {/* Content */}
                                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-3">{useCase.title}</h3>
                                <p className="text-gray-600 leading-relaxed mb-4 sm:mb-6 text-sm sm:text-base">
                                    {useCase.description}
                                </p>
                                
                                {/* Features */}
                                <div className="space-y-2 sm:space-y-3">
                                    {useCase.features.map((feature, i) => (
                                        <div key={i} className="flex items-center gap-2 sm:gap-3 group/item">
                                            <div className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full ${useCase.iconBg} flex items-center justify-center flex-shrink-0`}>
                                                <CheckCircle2Icon className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" />
                                            </div>
                                            <p className="text-gray-700 text-xs sm:text-sm font-medium group-hover/item:text-gray-900 transition-colors">{feature}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </AnimatedContent>
                    ))}
                </div>

                {/* CTA Section */}
                <AnimatedContent delay={0.4}>
                    <div className="mt-16 sm:mt-20 relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-amber-500 rounded-3xl blur-xl opacity-20" />
                        <div className="relative bg-gradient-to-r from-orange-500 via-orange-600 to-amber-500 rounded-3xl p-8 sm:p-10 md:p-14 text-center overflow-hidden">
                            {/* Decorative elements */}
                            <div className="absolute top-0 left-0 w-48 h-48 sm:w-64 sm:h-64 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2" />
                            <div className="absolute bottom-0 right-0 w-32 h-32 sm:w-48 sm:h-48 bg-white/10 rounded-full translate-x-1/4 translate-y-1/4" />
                            
                            <div className="relative z-10">
                                <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-3 sm:mb-4">
                                    Ready to explore the analytics?
                                </h3>
                                <p className="text-orange-100 mb-6 sm:mb-8 max-w-xl mx-auto text-sm sm:text-base">
                                    Start making data-driven decisions with our comprehensive Aadhaar analytics platform.
                                </p>
                                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                                    <Link 
                                        href="/analytics"
                                        className="group inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-white text-orange-600 font-semibold rounded-full shadow-xl hover:shadow-2xl transition-all hover:scale-105 text-sm sm:text-base"
                                    >
                                        Open Dashboard
                                        <ArrowRightIcon className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                    <Link 
                                        href="/chat"
                                        className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-white/20 backdrop-blur-sm text-white font-semibold rounded-full border border-white/30 hover:bg-white/30 transition-all text-sm sm:text-base"
                                    >
                                        <SparklesIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                                        Try AI Assistant
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </AnimatedContent>
            </div>
        </section>
    )
}
