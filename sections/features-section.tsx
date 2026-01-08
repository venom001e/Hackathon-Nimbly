import SectionTitle from "@/components/section-title";
import { ArrowUpRightIcon, SparkleIcon, RocketIcon } from "lucide-react";
import { features, additionalFeatures } from "@/data/features";
import AnimatedContent from "@/components/animated-content";
import Link from "next/link";

export default function FeaturesSection() {
    return (
        <>
            {/* First Section - AI Tools */}
            <section id="features" className="px-4 md:px-16 lg:px-24 xl:px-32 bg-white">
                <div className="grid grid-cols-1 md:grid-cols-2 border-x md:divide-x border-gray-200 divide-gray-200 max-w-7xl mx-auto">
                    <div>
                        <div className="p-4 pt-16 md:p-16 flex flex-col items-start md:sticky md:top-26">
                            <SectionTitle
                                dir="left"
                                icon={SparkleIcon}
                                title="AI-Powered Tools"
                                subtitle="Advanced artificial intelligence features designed for intelligent data analysis, anomaly detection, and predictive insights."
                            />
                            <AnimatedContent className="p-6 bg-gradient-to-br from-orange-500 to-orange-600 w-full rounded-2xl mt-12 shadow-xl shadow-orange-500/20">
                                <p className="text-lg text-white font-medium">
                                    Powering data-driven decisions across 28+ regions with real-time analytics.
                                </p>
                                <p className="text-orange-100 text-sm mt-2">
                                    Real-time processing of 10L+ records with AI-powered insights.
                                </p>

                                <Link href="/analytics" className="bg-white hover:bg-gray-50 px-6 py-2.5 rounded-full mt-6 flex items-center gap-2 w-max font-medium text-gray-800 transition-all hover:scale-105" >
                                    View Live Dashboard
                                    <ArrowUpRightIcon size={18} />
                                </Link>
                            </AnimatedContent>
                        </div>
                    </div>
                    <div className="p-4 pt-16 md:p-16 space-y-6">
                        {features.map((feature, index) => (
                            <AnimatedContent key={index} className={`${feature.cardBg} flex flex-col items-start p-6 rounded-2xl w-full md:sticky md:top-26 border border-white/50 shadow-[0_4px_20px_rgba(255,255,255,0.8)] hover:shadow-[0_8px_30px_rgba(255,255,255,0.9)] transition-shadow`}>
                                <div className={`${feature.iconBg} p-3 text-white rounded-xl shadow-lg`}>
                                    <feature.icon className="w-5 h-5" />
                                </div>
                                <p className="text-lg font-semibold mt-4 text-gray-900">{feature.title}</p>
                                <p className="text-sm text-gray-600 mt-2 leading-relaxed">{feature.description}</p>
                                {feature.href && (
                                    <Link 
                                        href={feature.href} 
                                        className="mt-4 text-sm font-medium text-orange-600 hover:text-orange-700 flex items-center gap-1 group"
                                    >
                                        Explore Feature
                                        <ArrowUpRightIcon size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                                    </Link>
                                )}
                            </AnimatedContent>
                        ))}
                    </div>
                </div>
            </section>

            {/* Second Section - Additional Features (Swapped Layout) */}
            <section className="px-4 md:px-16 lg:px-24 xl:px-32 bg-white">
                <div className="grid grid-cols-1 md:grid-cols-2 border-x md:divide-x border-gray-200 divide-gray-200 max-w-7xl mx-auto">
                    <div className="p-4 pt-16 md:p-16 space-y-6 order-2 md:order-1">
                        {additionalFeatures.map((feature, index) => (
                            <AnimatedContent key={index} className={`${feature.cardBg} flex flex-col items-start p-6 rounded-2xl w-full md:sticky md:top-26 border border-white/50 shadow-[0_4px_20px_rgba(255,255,255,0.8)] hover:shadow-[0_8px_30px_rgba(255,255,255,0.9)] transition-shadow`}>
                                <div className={`${feature.iconBg} p-3 text-white rounded-xl shadow-lg`}>
                                    <feature.icon className="w-5 h-5" />
                                </div>
                                <p className="text-lg font-semibold mt-4 text-gray-900">{feature.title}</p>
                                <p className="text-sm text-gray-600 mt-2 leading-relaxed">{feature.description}</p>
                                {feature.href && (
                                    <Link 
                                        href={feature.href} 
                                        className="mt-4 text-sm font-medium text-orange-600 hover:text-orange-700 flex items-center gap-1 group"
                                    >
                                        Explore Feature
                                        <ArrowUpRightIcon size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                                    </Link>
                                )}
                            </AnimatedContent>
                        ))}
                    </div>
                    <div className="order-1 md:order-2">
                        <div className="p-4 pt-16 md:p-16 flex flex-col items-start md:sticky md:top-26">
                            <SectionTitle
                                dir="left"
                                icon={RocketIcon}
                                title="Platform Capabilities"
                                subtitle="Comprehensive analytics tools designed for large-scale data processing, real-time insights, and seamless reporting."
                            />
                            <AnimatedContent className="p-6 bg-gradient-to-br from-purple-500 to-purple-600 w-full rounded-2xl mt-12 shadow-xl shadow-purple-500/20">
                                <p className="text-lg text-white font-medium">
                                    Complete suite of tools for administrators and analysts.
                                </p>
                                <p className="text-purple-100 text-sm mt-2">
                                    From data upload to report generation - everything in one platform.
                                </p>

                                <Link href="/chat" className="bg-white hover:bg-gray-50 px-6 py-2.5 rounded-full mt-6 flex items-center gap-2 w-max font-medium text-gray-800 transition-all hover:scale-105" >
                                    Try AI Assistant
                                    <ArrowUpRightIcon size={18} />
                                </Link>
                            </AnimatedContent>
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}
