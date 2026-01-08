import AnimatedContent from "@/components/animated-content";
import SectionTitle from "@/components/section-title";
import { testimonials } from "@/data/testimonials";
import { MessageSquareQuoteIcon, StarIcon, QuoteIcon, ShieldCheckIcon } from "lucide-react";

export default function TestimonialSection() {
    return (
        <section id="testimonials" className="relative px-4 md:px-16 lg:px-24 xl:px-32 py-24 overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 bg-gradient-to-b from-orange-50/50 via-white to-slate-50" />
            <div className="absolute top-1/2 left-0 w-72 h-72 bg-orange-200/30 rounded-full blur-3xl -translate-y-1/2" />
            <div className="absolute top-1/2 right-0 w-72 h-72 bg-amber-200/30 rounded-full blur-3xl -translate-y-1/2" />
            
            <div className="relative z-10 max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center mb-16">
                    <AnimatedContent>
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-orange-200 shadow-sm mb-6">
                            <ShieldCheckIcon className="w-4 h-4 text-orange-500" />
                            <span className="text-sm font-medium text-gray-700">User Reviews</span>
                        </div>
                    </AnimatedContent>
                    <SectionTitle
                        icon={MessageSquareQuoteIcon}
                        title="Loved by Users"
                        subtitle="Teams and analysts rely on Nimbly for smarter data-driven decisions."
                    />
                </div>

                {/* Testimonials Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {testimonials.map((testimonial, index) => (
                        <AnimatedContent 
                            delay={index * 0.15} 
                            key={index}
                        >
                            <div className={`group relative h-full rounded-3xl transition-all duration-500 hover:-translate-y-2 ${
                                index === 1 
                                    ? 'bg-gradient-to-br from-orange-500 via-orange-600 to-amber-500 p-[2px] shadow-2xl shadow-orange-500/30' 
                                    : 'bg-gradient-to-br from-gray-200 to-gray-100 p-[1px] hover:shadow-xl'
                            }`}>
                                <div className={`relative h-full rounded-[22px] p-8 ${
                                    index === 1 
                                        ? 'bg-gradient-to-br from-orange-500 via-orange-600 to-amber-500' 
                                        : 'bg-white'
                                }`}>
                                    {/* Quote Icon */}
                                    <div className={`absolute top-6 right-6 ${index === 1 ? 'text-white/20' : 'text-orange-100'}`}>
                                        <QuoteIcon className="w-12 h-12" />
                                    </div>
                                    
                                    {/* Stars */}
                                    <div className="flex items-center gap-1 mb-6">
                                        {Array(testimonial.rating).fill(0).map((_, i) => (
                                            <StarIcon key={i} className={`w-5 h-5 ${
                                                index === 1 
                                                    ? 'text-amber-300 fill-amber-300' 
                                                    : 'fill-orange-400 text-orange-400'
                                            }`} />
                                        ))}
                                    </div>
                                    
                                    {/* Quote */}
                                    <p className={`text-base leading-relaxed mb-8 ${
                                        index === 1 ? 'text-white' : 'text-gray-600'
                                    }`}>
                                        "{testimonial.quote}"
                                    </p>
                                    
                                    {/* Author */}
                                    <div className={`flex items-center gap-4 pt-6 border-t ${
                                        index === 1 ? 'border-white/20' : 'border-gray-100'
                                    }`}>
                                        <div className="relative">
                                            <img 
                                                className={`w-14 h-14 rounded-full object-cover ring-4 ${
                                                    index === 1 ? 'ring-white/30' : 'ring-orange-100'
                                                }`} 
                                                src={testimonial.image} 
                                                alt={testimonial.name} 
                                            />
                                            <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center ${
                                                index === 1 ? 'bg-white' : 'bg-orange-500'
                                            }`}>
                                                <ShieldCheckIcon className={`w-3 h-3 ${
                                                    index === 1 ? 'text-orange-500' : 'text-white'
                                                }`} />
                                            </div>
                                        </div>
                                        <div>
                                            <p className={`font-bold text-lg ${
                                                index === 1 ? 'text-white' : 'text-gray-900'
                                            }`}>{testimonial.name}</p>
                                            <p className={`text-sm ${
                                                index === 1 ? 'text-orange-100' : 'text-gray-500'
                                            }`}>{testimonial.handle}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </AnimatedContent>
                    ))}
                </div>
            </div>
        </section>
    )
}