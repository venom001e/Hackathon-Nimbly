'use client';

import AnimatedContent from "@/components/animated-content";
import SectionTitle from "@/components/section-title";
import { faqs } from "@/data/faqs";
import { ChevronDownIcon, HelpCircleIcon, MessageCircleIcon, SparklesIcon, HeadphonesIcon, MailIcon, PhoneIcon, ArrowRightIcon } from "lucide-react";
import Link from "next/link";

export default function FaqSection() {
    return (
        <section className="relative py-24 overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 bg-gradient-to-b from-slate-50 via-white to-orange-50/30" />
            <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-orange-200/20 rounded-full blur-3xl" />
            <div className="absolute top-1/4 right-0 w-72 h-72 bg-amber-200/20 rounded-full blur-3xl" />
            
            <div className="relative z-10 px-4 md:px-16 lg:px-24 xl:px-32">
                {/* Header */}
                <div className="text-center mb-16 max-w-7xl mx-auto">
                    <AnimatedContent>
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-orange-200 shadow-sm mb-6">
                            <HelpCircleIcon className="w-4 h-4 text-orange-500" />
                            <span className="text-sm font-medium text-gray-700">Got Questions?</span>
                        </div>
                    </AnimatedContent>
                    <SectionTitle
                        icon={HelpCircleIcon}
                        title="Frequently Asked Questions"
                        subtitle="Everything you need to know about the Nimbly EnrolmentAnalytics Dashboard and how to get started."
                    />
                </div>

                {/* Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 max-w-7xl mx-auto">
                    {/* FAQ Accordion */}
                    <div className="lg:col-span-3 space-y-4">
                        {faqs.map((faq, index) => (
                            <AnimatedContent key={index} delay={index * 0.1}>
                                <details 
                                    className="group bg-white rounded-2xl border border-gray-200 hover:border-orange-300 hover:shadow-lg hover:shadow-orange-500/5 transition-all duration-300 overflow-hidden" 
                                    open={index === 0}
                                >
                                    <summary className="flex items-center justify-between p-6 select-none cursor-pointer">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center flex-shrink-0 group-open:from-orange-500 group-open:to-amber-500 transition-all">
                                                <span className="text-sm font-bold text-orange-600 group-open:text-white transition-colors">
                                                    {String(index + 1).padStart(2, '0')}
                                                </span>
                                            </div>
                                            <h3 className="font-semibold text-gray-900 pr-4">{faq.question}</h3>
                                        </div>
                                        <div className="w-8 h-8 rounded-full bg-gray-100 group-open:bg-orange-500 flex items-center justify-center flex-shrink-0 transition-all">
                                            <ChevronDownIcon size={18} className="text-gray-500 group-open:text-white group-open:rotate-180 transition-all" />
                                        </div>
                                    </summary>
                                    <div className="px-6 pb-6 pl-20">
                                        <p className="text-gray-600 leading-relaxed">
                                            {faq.answer}
                                        </p>
                                    </div>
                                </details>
                            </AnimatedContent>
                        ))}
                    </div>

                    {/* Help Cards */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* AI Assistant Card */}
                        <AnimatedContent delay={0.2}>
                            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-orange-500 via-orange-600 to-amber-500 p-8 shadow-2xl shadow-orange-500/30">
                                {/* Decorative elements */}
                                <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                                <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
                                
                                <div className="relative z-10">
                                    <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-6">
                                        <SparklesIcon className="w-7 h-7 text-white" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-white mb-3">
                                        Need Help?
                                    </h3>
                                    <p className="text-orange-100 mb-6 leading-relaxed">
                                        Ask our AI Assistant for instant answers about Aadhaar analytics and get personalized guidance.
                                    </p>
                                    <Link
                                        href="/chat"
                                        className="group inline-flex items-center gap-2 bg-white hover:bg-gray-50 px-6 py-3 rounded-full font-semibold text-orange-600 transition-all hover:scale-105 shadow-lg"
                                    >
                                        <MessageCircleIcon className="w-5 h-5" />
                                        Chat with AI
                                        <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                </div>
                            </div>
                        </AnimatedContent>

                        {/* Contact Support Card */}
                        <AnimatedContent delay={0.3}>
                            <div className="relative overflow-hidden rounded-3xl bg-white border border-gray-200 p-8 hover:shadow-xl transition-shadow">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-gray-100 to-transparent rounded-bl-full" />
                                
                                <div className="relative z-10">
                                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center mb-6">
                                        <HeadphonesIcon className="w-7 h-7 text-gray-700" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                                        Contact Support
                                    </h3>
                                    <p className="text-gray-600 mb-6 leading-relaxed">
                                        For technical issues or data queries, reach out to our support team.
                                    </p>
                                    <div className="space-y-4">
                                        <a href="mailto:hello@nimbly.dev" className="flex items-center gap-3 text-gray-700 hover:text-orange-600 transition-colors group">
                                            <div className="w-10 h-10 rounded-xl bg-orange-50 group-hover:bg-orange-100 flex items-center justify-center transition-colors">
                                                <MailIcon className="w-5 h-5 text-orange-500" />
                                            </div>
                                            <span className="font-medium">hello@nimbly.dev</span>
                                        </a>
                                        <a href="tel:+919876543210" className="flex items-center gap-3 text-gray-700 hover:text-orange-600 transition-colors group">
                                            <div className="w-10 h-10 rounded-xl bg-orange-50 group-hover:bg-orange-100 flex items-center justify-center transition-colors">
                                                <PhoneIcon className="w-5 h-5 text-orange-500" />
                                            </div>
                                            <span className="font-medium">+91 9719942680</span>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </AnimatedContent>
                    </div>
                </div>
            </div>
        </section>
    )
}