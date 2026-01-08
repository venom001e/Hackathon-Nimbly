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
                <div className="max-w-7xl mx-auto px-4 md:px-16 lg:px-24 xl:px-32">
                    {/* Top Section - Logo & Social */}
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-12 gap-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20 overflow-hidden">
                                <Image src="/apple-icon.png" alt="Nimbly" width={40} height={40} />
                            </div>
                            <div>
                                <div className="font-bold text-lg">Nimbly</div>
                                <div className="text-xs text-gray-400">© 2026 Nimbly Analytics</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <a href="#" className="w-9 h-9 rounded-full border border-gray-700 flex items-center justify-center text-gray-400 hover:text-orange-400 hover:border-orange-400 transition-colors">
                                <FacebookIcon className="w-4 h-4" />
                            </a>
                            <a href="#" className="w-9 h-9 rounded-full border border-gray-700 flex items-center justify-center text-gray-400 hover:text-orange-400 hover:border-orange-400 transition-colors">
                                <LinkedinIcon className="w-4 h-4" />
                            </a>
                            <a href="#" className="w-9 h-9 rounded-full border border-gray-700 flex items-center justify-center text-gray-400 hover:text-orange-400 hover:border-orange-400 transition-colors">
                                <InstagramIcon className="w-4 h-4" />
                            </a>
                            <a href="#" className="w-9 h-9 rounded-full border border-gray-700 flex items-center justify-center text-gray-400 hover:text-orange-400 hover:border-orange-400 transition-colors">
                                <TwitterIcon className="w-4 h-4" />
                            </a>
                        </div>
                    </div>

                    {/* Links Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
                        {/* Analytics */}
                        <div>
                            <h4 className="text-orange-400 font-semibold mb-4 text-sm">Analytics</h4>
                            <ul className="space-y-2.5">
                                <li><Link href="/analytics" className="text-gray-400 hover:text-white text-sm transition-colors">Dashboard</Link></li>
                                <li><Link href="/analytics/geographic" className="text-gray-400 hover:text-white text-sm transition-colors">Geographic</Link></li>
                                <li><Link href="/analytics/demographics" className="text-gray-400 hover:text-white text-sm transition-colors">Demographics</Link></li>
                                <li><Link href="/analytics/predictions" className="text-gray-400 hover:text-white text-sm transition-colors">Predictions</Link></li>
                            </ul>
                        </div>

                        {/* Features */}
                        <div>
                            <h4 className="text-orange-400 font-semibold mb-4 text-sm">Features</h4>
                            <ul className="space-y-2.5">
                                <li><Link href="/chat" className="text-gray-400 hover:text-white text-sm transition-colors">AI Assistant</Link></li>
                                <li><Link href="/reports" className="text-gray-400 hover:text-white text-sm transition-colors">Reports</Link></li>
                                <li><Link href="/upload" className="text-gray-400 hover:text-white text-sm transition-colors">Data Upload</Link></li>
                                <li><Link href="/analytics/alerts" className="text-gray-400 hover:text-white text-sm transition-colors">Smart Alerts</Link></li>
                            </ul>
                        </div>

                        {/* AI Tools */}
                        <div>
                            <h4 className="text-orange-400 font-semibold mb-4 text-sm">AI Tools</h4>
                            <ul className="space-y-2.5">
                                <li><Link href="/analytics/aadhaar-sense" className="text-gray-400 hover:text-white text-sm transition-colors">NimblySense</Link></li>
                                <li><Link href="/analytics/aadhaar-connect" className="text-gray-400 hover:text-white text-sm transition-colors">NimblyConnect</Link></li>
                                <li><Link href="/analytics/service-gap" className="text-gray-400 hover:text-white text-sm transition-colors">Service Gap</Link></li>
                                <li><Link href="/analytics/doc-scan" className="text-gray-400 hover:text-white text-sm transition-colors">DocScan AI</Link></li>
                            </ul>
                        </div>

                        {/* Resources */}
                        <div>
                            <h4 className="text-orange-400 font-semibold mb-4 text-sm">Resources</h4>
                            <ul className="space-y-2.5">
                                <li><a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Documentation</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">API Docs</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Data Dictionary</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Changelog</a></li>
                            </ul>
                        </div>

                        {/* Support */}
                        <div>
                            <h4 className="text-orange-400 font-semibold mb-4 text-sm">Support</h4>
                            <ul className="space-y-2.5">
                                <li><a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Help Center</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">FAQs</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Status Page</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Contact Us</a></li>
                            </ul>
                        </div>

                        {/* Legal */}
                        <div>
                            <h4 className="text-orange-400 font-semibold mb-4 text-sm">Legal</h4>
                            <ul className="space-y-2.5">
                                <li><a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Terms of Service</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Privacy Policy</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Cookie Policy</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Accessibility</a></li>
                            </ul>
                        </div>
                    </div>

                    {/* Bottom Bar */}
                    <div className="border-t border-gray-800 mt-10 pt-6 text-center">
                        <p className="text-gray-500 text-sm">
                            Built with ❤️ for Hackathon 2026
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
}
