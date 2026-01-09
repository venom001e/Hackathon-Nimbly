import { FacebookIcon, LinkedinIcon, InstagramIcon, TwitterIcon } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function Footer() {
    return (
        <footer className="relative mt-20">
            {/* Wavy SVG Top Border */}
            <div className="absolute top-0 left-0 w-full overflow-hidden leading-none -translate-y-[99%]">
                <svg 
                    className="relative block w-full h-[80px]" 
                    viewBox="0 0 1200 120" 
                    preserveAspectRatio="none"
                >
                    <path 
                        d="M0,0 C150,90 350,0 500,50 C650,100 800,20 1000,80 C1100,100 1150,60 1200,80 L1200,120 L0,120 Z" 
                        className="fill-gray-900"
                    />
                </svg>
            </div>

            <div className="bg-gray-900 text-white pt-12 pb-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-16 xl:px-24">
                    {/* Top Section - Logo & Social */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 sm:mb-12 gap-4 sm:gap-6">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20 overflow-hidden">
                                <Image src="/apple-icon.png" alt="Nimbly" width={40} height={40} className="w-full h-full object-cover" />
                            </div>
                            <div>
                                <div className="font-bold text-base sm:text-lg">Nimbly</div>
                                <div className="text-xs text-gray-400">© 2026 Nimbly Analytics</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 sm:gap-3">
                            <a href="#" className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-gray-700 flex items-center justify-center text-gray-400 hover:text-orange-400 hover:border-orange-400 transition-colors">
                                <FacebookIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                            </a>
                            <a href="#" className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-gray-700 flex items-center justify-center text-gray-400 hover:text-orange-400 hover:border-orange-400 transition-colors">
                                <LinkedinIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                            </a>
                            <a href="#" className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-gray-700 flex items-center justify-center text-gray-400 hover:text-orange-400 hover:border-orange-400 transition-colors">
                                <InstagramIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                            </a>
                            <a href="#" className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-gray-700 flex items-center justify-center text-gray-400 hover:text-orange-400 hover:border-orange-400 transition-colors">
                                <TwitterIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                            </a>
                        </div>
                    </div>

                    {/* Links Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 sm:gap-8">
                        {/* Analytics */}
                        <div>
                            <h4 className="text-orange-400 font-semibold mb-3 sm:mb-4 text-sm">Analytics</h4>
                            <ul className="space-y-2 sm:space-y-2.5">
                                <li><Link href="/analytics" className="text-gray-400 hover:text-white text-sm transition-colors">Dashboard</Link></li>
                                <li><Link href="/analytics/geographic" className="text-gray-400 hover:text-white text-sm transition-colors">Geographic</Link></li>
                                <li><Link href="/analytics/demographics" className="text-gray-400 hover:text-white text-sm transition-colors">Demographics</Link></li>
                                <li><Link href="/analytics/predictions" className="text-gray-400 hover:text-white text-sm transition-colors">Predictions</Link></li>
                            </ul>
                        </div>

                        {/* Features */}
                        <div>
                            <h4 className="text-orange-400 font-semibold mb-3 sm:mb-4 text-sm">Features</h4>
                            <ul className="space-y-2 sm:space-y-2.5">
                                <li><Link href="/chat" className="text-gray-400 hover:text-white text-sm transition-colors">AI Assistant</Link></li>
                                <li><Link href="/reports" className="text-gray-400 hover:text-white text-sm transition-colors">Reports</Link></li>
                                <li><Link href="/upload" className="text-gray-400 hover:text-white text-sm transition-colors">Data Upload</Link></li>
                                <li><Link href="/analytics/alerts" className="text-gray-400 hover:text-white text-sm transition-colors">Smart Alerts</Link></li>
                            </ul>
                        </div>

                        {/* AI Tools */}
                        <div>
                            <h4 className="text-orange-400 font-semibold mb-3 sm:mb-4 text-sm">AI Tools</h4>
                            <ul className="space-y-2 sm:space-y-2.5">
                                <li><Link href="/analytics/aadhaar-sense" className="text-gray-400 hover:text-white text-sm transition-colors">NimblySense</Link></li>
                                <li><Link href="/analytics/aadhaar-connect" className="text-gray-400 hover:text-white text-sm transition-colors">NimblyConnect</Link></li>
                                <li><Link href="/analytics/service-gap" className="text-gray-400 hover:text-white text-sm transition-colors">Service Gap</Link></li>
                                <li><Link href="/analytics/doc-scan" className="text-gray-400 hover:text-white text-sm transition-colors">DocScan AI</Link></li>
                            </ul>
                        </div>

                        {/* Resources */}
                        <div>
                            <h4 className="text-orange-400 font-semibold mb-3 sm:mb-4 text-sm">Resources</h4>
                            <ul className="space-y-2 sm:space-y-2.5">
                                <li><a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Documentation</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">API Docs</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Data Dictionary</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Changelog</a></li>
                            </ul>
                        </div>

                        {/* Support */}
                        <div>
                            <h4 className="text-orange-400 font-semibold mb-3 sm:mb-4 text-sm">Support</h4>
                            <ul className="space-y-2 sm:space-y-2.5">
                                <li><a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Help Center</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">FAQs</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Status Page</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Contact Us</a></li>
                            </ul>
                        </div>

                        {/* Legal */}
                        <div>
                            <h4 className="text-orange-400 font-semibold mb-3 sm:mb-4 text-sm">Legal</h4>
                            <ul className="space-y-2 sm:space-y-2.5">
                                <li><a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Terms of Service</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Privacy Policy</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Cookie Policy</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Accessibility</a></li>
                            </ul>
                        </div>
                    </div>

                    {/* Bottom Bar */}
                    <div className="border-t border-gray-800 mt-8 sm:mt-10 pt-4 sm:pt-6 text-center">
                        <p className="text-gray-500 text-sm">
                            Built with ❤️ for Hackathon 2026
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
}
