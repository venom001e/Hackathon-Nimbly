'use client';

import CountUp from "@/components/count-number";
import AnimatedContent from "@/components/animated-content";
import { UsersIcon, MapIcon, CpuIcon, CheckCircleIcon } from "lucide-react";

const stats = [
    {
        icon: UsersIcon,
        value: 10,
        suffix: "L+",
        label: "Total Records Processed",
        iconBg: "from-blue-500 to-blue-600",
        textColor: "from-blue-600 to-blue-500"
    },
    {
        icon: MapIcon,
        value: 28,
        suffix: "+",
        label: "Regions Covered",
        iconBg: "from-emerald-500 to-teal-500",
        textColor: "from-emerald-600 to-teal-500"
    },
    {
        icon: CpuIcon,
        value: 12,
        suffix: "",
        label: "AI-Powered Features",
        iconBg: "from-purple-500 to-violet-500",
        textColor: "from-purple-600 to-violet-500"
    },
    {
        icon: CheckCircleIcon,
        value: 99,
        suffix: "%",
        label: "Data Processing Accuracy",
        iconBg: "from-orange-500 to-amber-500",
        textColor: "from-orange-600 to-amber-500"
    }
];

export default function StatsSection() {
    return (
        <section className="py-20 px-4 md:px-16 lg:px-24 xl:px-32 bg-gradient-to-b from-slate-50 to-white">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <AnimatedContent className="text-center mb-12">
                    <p className="text-orange-500 font-medium mb-2">Platform Statistics</p>
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                        Powering Smart Analytics
                    </h2>
                </AnimatedContent>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {stats.map((stat, index) => (
                        <AnimatedContent key={index} delay={index * 0.1}>
                            <div className="bg-white rounded-2xl p-6 md:p-8 border border-gray-100 shadow-sm hover:shadow-xl hover:border-gray-200 transition-all hover:-translate-y-1">
                                {/* Icon */}
                                <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${stat.iconBg} flex items-center justify-center mb-4 shadow-lg`}>
                                    <stat.icon className="w-6 h-6 text-white" />
                                </div>
                                
                                {/* Value */}
                                <h3 className={`text-3xl md:text-4xl font-bold bg-gradient-to-r ${stat.textColor} bg-clip-text text-transparent mb-1`}>
                                    <CountUp from={0} to={stat.value} />{stat.suffix}
                                </h3>
                                
                                {/* Label */}
                                <p className="text-gray-600 text-sm">{stat.label}</p>
                            </div>
                        </AnimatedContent>
                    ))}
                </div>
            </div>
        </section>
    )
}
