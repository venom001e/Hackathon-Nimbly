import AnimatedContent from "@/components/animated-content";
import CustomIcon from "@/components/custom-icon";
import { SparkleIcon, BarChart3Icon, ZapIcon, BrainCircuitIcon, TrendingUpIcon } from "lucide-react";
import Link from "next/link";

export default function HeroSection() {
    return (
        <section className="bg-gradient-to-br from-slate-50 via-orange-50/30 to-slate-100 px-4 md:px-16 lg:px-24 xl:px-32 relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-[url('/assets/hero-gradient-bg.png')] bg-cover bg-center opacity-50" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(251,146,60,0.1),transparent_50%)]" />
            
            <div className="max-w-7xl mx-auto flex flex-col items-center justify-center min-h-screen py-20 relative z-10">
                {/* Badge */}
                <AnimatedContent reverse distance={30} className="flex items-center gap-3 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm border border-orange-100">
                    <div className="flex items-center gap-1 text-orange-600">
                        <ZapIcon className="w-4 h-4" />
                        <span className="text-sm font-medium">Hackathon 2026</span>
                    </div>
                    <div className="h-4 w-px bg-gray-300" />
                    <span className="text-sm text-gray-600">Analytics Dashboard</span>
                </AnimatedContent>

                {/* Main Heading */}
                <AnimatedContent distance={30} delay={0.1} className="relative mt-8">
                    <h1 className="text-center max-w-5xl leading-tight">
                        <span className="block font-poppins text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-extrabold text-gray-900 tracking-tight">
                            Nimbly Analytics
                        </span>
                        <span className="block font-poppins text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-extrabold mt-2 md:mt-3 bg-gradient-to-r from-orange-500 via-orange-600 to-amber-500 bg-clip-text text-transparent tracking-tight">
                            Dashboard
                        </span>
                    </h1>
                    <div className="absolute -top-3 md:-top-5 right-0 md:right-10 hidden md:block">
                        <CustomIcon icon={SparkleIcon} dir="right" />
                    </div>
                </AnimatedContent>

                {/* Subtitle */}
                <AnimatedContent distance={30} delay={0.2}>
                    <p className="text-center text-base md:text-lg text-gray-600 max-w-2xl mt-4 md:mt-6 leading-relaxed px-4">
                        Analytics dashboard for aadhaar enrolment data with trend analysis, 
                        pattern detection, and insights for better decision making.
                    </p>
                </AnimatedContent>

                {/* CTA Buttons */}
                <AnimatedContent className="flex flex-col sm:flex-row items-center gap-3 md:gap-4 mt-6 md:mt-8 px-4">
                    <Link 
                        href="/analytics" 
                        className="group flex items-center gap-2 py-3 px-6 md:px-8 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-medium rounded-full shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 transition-all hover:scale-105 w-full sm:w-auto justify-center"
                    >
                        <BarChart3Icon className="w-5 h-5" />
                        View Dashboard
                        <TrendingUpIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                    <Link 
                        href="/chat" 
                        className="flex items-center gap-2 py-3 px-6 md:px-8 bg-white text-gray-700 font-medium rounded-full border border-gray-200 hover:border-orange-200 hover:bg-orange-50 transition-all w-full sm:w-auto justify-center"
                    >
                        <BrainCircuitIcon className="w-5 h-5 text-orange-500" />
                        AI Assistant
                    </Link>
                </AnimatedContent>

                {/* Stats */}
                <AnimatedContent delay={0.3} className="mt-12 md:mt-16 w-full max-w-4xl px-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 lg:gap-8">
                        <StatCard value="10L+" label="Total Records" />
                        <StatCard value="28+" label="Regions" />
                        <StatCard value="700+" label="Data Points" />
                        <StatCard value="12" label="AI Features" />
                    </div>
                </AnimatedContent>

                {/* Trust Indicators */}
                <AnimatedContent delay={0.4} className="mt-8 md:mt-12 flex flex-wrap items-center justify-center gap-4 md:gap-6 text-gray-400 px-4">
                    <div className="flex items-center gap-2">
                        <ZapIcon className="w-4 h-4 md:w-5 md:h-5" />
                        <span className="text-xs md:text-sm">Lightning Fast</span>
                    </div>
                    <div className="h-4 w-px bg-gray-300 hidden sm:block" />
                    <div className="flex items-center gap-2">
                        <BarChart3Icon className="w-4 h-4 md:w-5 md:h-5" />
                        <span className="text-xs md:text-sm">Analytics Support</span>
                    </div>
                    <div className="h-4 w-px bg-gray-300 hidden sm:block" />
                    <div className="flex items-center gap-2">
                        <BrainCircuitIcon className="w-4 h-4 md:w-5 md:h-5" />
                        <span className="text-xs md:text-sm">AI-Powered Insights</span>
                    </div>
                </AnimatedContent>
            </div>
        </section>
    );
}

function StatCard({ value, label }: { value: string; label: string }) {
    return (
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 md:p-6 text-center border border-white shadow-sm">
            <div className="text-2xl md:text-3xl font-bold text-gray-900">{value}</div>
            <div className="text-sm text-gray-500 mt-1">{label}</div>
        </div>
    );
}
