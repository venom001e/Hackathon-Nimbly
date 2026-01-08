"use client";
import { MenuIcon, XIcon, SparklesIcon, ChevronDownIcon, BrainCircuitIcon, TrophyIcon, MapPinIcon, UsersIcon, TrendingUpIcon, FileTextIcon, LayoutDashboardIcon, HomeIcon, MapIcon, ScanIcon, LogOutIcon, UserCircleIcon } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";

// Organized navigation structure with dropdowns
const navItems = [
    {
        name: "Home",
        href: "/",
        icon: HomeIcon
    },
    {
        name: "Dashboard",
        href: "/analytics",
        icon: LayoutDashboardIcon
    },
    {
        name: "AI Tools",
        icon: BrainCircuitIcon,
        dropdown: [
            { name: "NimblySense", href: "/analytics/aadhaar-sense", icon: BrainCircuitIcon, desc: "AI Anomaly Detection" },
            { name: "NimblyConnect", href: "/analytics/aadhaar-connect", icon: TrophyIcon, desc: "Gamified Platform" },
            { name: "Service Gap", href: "/analytics/service-gap", icon: MapIcon, desc: "Underserved Area Finder" },
            { name: "DocScan AI", href: "/analytics/doc-scan", icon: ScanIcon, desc: "Fake Document Detection" },
            { name: "Predictions", href: "/analytics/predictions", icon: TrendingUpIcon, desc: "Forecasting & Trends" },
        ]
    },
    {
        name: "Analytics",
        icon: MapPinIcon,
        dropdown: [
            { name: "Geographic", href: "/analytics/geographic", icon: MapPinIcon, desc: "Region-wise Analysis" },
            { name: "Demographics", href: "/analytics/demographics", icon: UsersIcon, desc: "Age & Gender Data" },
        ]
    },
    {
        name: "Reports",
        href: "/reports",
        icon: FileTextIcon
    }
];

export default function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const userMenuRef = useRef<HTMLDivElement>(null);
    
    const { user, isAuthenticated, logout } = useAuth();

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setOpenDropdown(null);
            }
            if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
                setShowUserMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleDropdown = (name: string) => {
        setOpenDropdown(openDropdown === name ? null : name);
    };

    return (
        <>
            {/* Sticky Header with Glass Effect */}
            <header className={`fixed w-full top-0 left-0 z-50 transition-all duration-500 ${
                scrolled ? 'px-4 pt-2' : 'px-0 pt-0'
            }`}>
                <nav className={`w-full px-4 md:px-8 lg:px-16 xl:px-24 transition-all duration-500 ${
                    scrolled 
                        ? 'py-3 bg-white/70 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] border border-white/30 rounded-2xl mx-auto max-w-[calc(100%-2rem)]' 
                        : 'py-4 bg-white/50 backdrop-blur-md shadow-[0_4px_24px_rgba(0,0,0,0.04)] border-b border-white/30 rounded-none'
                }`}
                style={{
                    WebkitBackdropFilter: scrolled ? 'blur(20px) saturate(180%)' : 'blur(12px) saturate(150%)',
                    backdropFilter: scrolled ? 'blur(20px) saturate(180%)' : 'blur(12px) saturate(150%)',
                }}>
                    <div className="max-w-7xl mx-auto flex items-center justify-between">
                        {/* Logo */}
                        <Link href="/" className="flex items-center gap-3 group">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow overflow-hidden">
                                <Image src="/apple-icon.png" alt="Nimbly" width={40} height={40} />
                            </div>
                            <div>
                                <div className="font-bold text-lg text-gray-900">Nimbly</div>
                                <div className="text-[10px] text-gray-500 font-medium tracking-wide">Analytics Dashboard</div>
                            </div>
                        </Link>

                        {/* Desktop Navigation with Dropdowns */}
                        <div className="hidden md:flex items-center gap-1" ref={dropdownRef}>
                            {navItems.map((item) => (
                                <div key={item.name} className="relative">
                                    {item.dropdown ? (
                                        // Dropdown Menu
                                        <>
                                            <button
                                                onClick={() => toggleDropdown(item.name)}
                                                className={`flex items-center gap-1.5 py-2 px-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                                                    openDropdown === item.name 
                                                        ? 'text-orange-600 bg-orange-50' 
                                                        : 'text-gray-700 hover:text-orange-600 hover:bg-orange-50'
                                                }`}
                                            >
                                                <item.icon className="w-4 h-4" />
                                                {item.name}
                                                <ChevronDownIcon className={`w-3.5 h-3.5 transition-transform duration-200 ${
                                                    openDropdown === item.name ? 'rotate-180' : ''
                                                }`} />
                                            </button>
                                            
                                            {/* Dropdown Panel */}
                                            <div className={`absolute top-full left-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden transition-all duration-200 ${
                                                openDropdown === item.name 
                                                    ? 'opacity-100 visible translate-y-0' 
                                                    : 'opacity-0 invisible -translate-y-2'
                                            }`}>
                                                <div className="p-2">
                                                    {item.dropdown.map((subItem) => (
                                                        <Link
                                                            key={subItem.name}
                                                            href={subItem.href}
                                                            onClick={() => setOpenDropdown(null)}
                                                            className="flex items-start gap-3 p-3 rounded-lg hover:bg-orange-50 transition-colors group"
                                                        >
                                                            <div className="p-2 bg-orange-100 rounded-lg group-hover:bg-orange-200 transition-colors">
                                                                <subItem.icon className="w-4 h-4 text-orange-600" />
                                                            </div>
                                                            <div>
                                                                <p className="font-medium text-gray-900 text-sm">{subItem.name}</p>
                                                                <p className="text-xs text-gray-500">{subItem.desc}</p>
                                                            </div>
                                                        </Link>
                                                    ))}
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        // Regular Link
                                        <Link 
                                            href={item.href!}
                                            className="flex items-center gap-1.5 py-2 px-3 text-sm font-medium text-gray-700 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all duration-200"
                                        >
                                            <item.icon className="w-4 h-4" />
                                            {item.name}
                                        </Link>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Right Section */}
                        <div className="flex items-center gap-3">
                            {isAuthenticated && user ? (
                                // User Menu
                                <div className="relative" ref={userMenuRef}>
                                    <button
                                        onClick={() => setShowUserMenu(!showUserMenu)}
                                        className="flex items-center gap-2 py-2 px-3 bg-orange-50 hover:bg-orange-100 rounded-xl transition-colors"
                                    >
                                        <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                                            <span className="text-white text-sm font-bold">
                                                {user.name.charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                        <div className="hidden sm:block text-left">
                                            <p className="text-sm font-medium text-gray-900">{user.name}</p>
                                            <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                                        </div>
                                        <ChevronDownIcon className={`w-4 h-4 text-gray-500 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
                                    </button>
                                    
                                    {/* User Dropdown */}
                                    <div className={`absolute top-full right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden transition-all duration-200 ${
                                        showUserMenu ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-2'
                                    }`}>
                                        <div className="p-3 border-b border-gray-100">
                                            <p className="font-medium text-gray-900">{user.name}</p>
                                            <p className="text-xs text-gray-500">{user.email}</p>
                                            <span className="inline-block mt-1 text-xs px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full capitalize">
                                                {user.role}
                                            </span>
                                        </div>
                                        <div className="p-2">
                                            <Link
                                                href="/analytics"
                                                onClick={() => setShowUserMenu(false)}
                                                className="flex items-center gap-2 p-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                                            >
                                                <LayoutDashboardIcon className="w-4 h-4" />
                                                Dashboard
                                            </Link>
                                            <button
                                                onClick={() => {
                                                    logout();
                                                    setShowUserMenu(false);
                                                }}
                                                className="w-full flex items-center gap-2 p-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                <LogOutIcon className="w-4 h-4" />
                                                Sign Out
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                // Login Button
                                <Link 
                                    href="/login" 
                                    className="hidden md:flex items-center gap-2 py-2.5 px-5 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-sm font-semibold rounded-full shadow-md hover:shadow-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-200"
                                >
                                    <UserCircleIcon className="w-4 h-4" />
                                    Sign In
                                </Link>
                            )}

                            {/* Mobile Menu Button */}
                            <button 
                                className="md:hidden p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors" 
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                            >
                                <MenuIcon className="w-5 h-5 text-gray-700" />
                            </button>
                        </div>
                    </div>
                </nav>
            </header>

            {/* Spacer for fixed header */}
            <div className="h-[72px]"></div>

            {/* Mobile Menu Overlay */}
            <div 
                className={`fixed inset-0 bg-black/20 backdrop-blur-sm z-50 transition-opacity duration-300 md:hidden ${
                    isMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
                onClick={() => setIsMenuOpen(false)}
            />

            {/* Mobile Menu */}
            <div className={`fixed top-0 right-0 z-50 w-full max-w-sm h-full bg-white shadow-2xl transition-transform duration-500 ease-out md:hidden ${
                isMenuOpen ? "translate-x-0" : "translate-x-full"
            }`}>
                <div className="flex items-center justify-between p-5 border-b border-gray-100">
                    <Link href="/" className="flex items-center gap-2" onClick={() => setIsMenuOpen(false)}>
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20 overflow-hidden">
                            <Image src="/apple-icon.png" alt="Nimbly" width={40} height={40} />
                        </div>
                        <span className="font-urbanist font-bold text-gray-900">Nimbly</span>
                    </Link>
                    <button 
                        className="p-2.5 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors" 
                        onClick={() => setIsMenuOpen(false)}
                    >
                        <XIcon className="w-5 h-5 text-gray-700" />
                    </button>
                </div>
                
                <div className="flex flex-col p-5 gap-1 overflow-y-auto max-h-[calc(100vh-100px)]">
                    {navItems.map((item) => (
                        <div key={item.name}>
                            {item.dropdown ? (
                                // Mobile Dropdown
                                <div className="mb-2">
                                    <button
                                        onClick={() => toggleDropdown(item.name)}
                                        className="w-full flex items-center justify-between py-3 px-4 text-gray-700 hover:bg-orange-50 rounded-xl transition-all font-medium"
                                    >
                                        <span className="flex items-center gap-3">
                                            <item.icon className="w-5 h-5 text-orange-500" />
                                            {item.name}
                                        </span>
                                        <ChevronDownIcon className={`w-4 h-4 transition-transform duration-200 ${
                                            openDropdown === item.name ? 'rotate-180' : ''
                                        }`} />
                                    </button>
                                    
                                    <div className={`overflow-hidden transition-all duration-300 ${
                                        openDropdown === item.name ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                                    }`}>
                                        <div className="pl-4 py-2 space-y-1">
                                            {item.dropdown.map((subItem) => (
                                                <Link
                                                    key={subItem.name}
                                                    href={subItem.href}
                                                    onClick={() => setIsMenuOpen(false)}
                                                    className="flex items-center gap-3 py-2.5 px-4 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all text-sm"
                                                >
                                                    <subItem.icon className="w-4 h-4" />
                                                    <div>
                                                        <p className="font-medium">{subItem.name}</p>
                                                        <p className="text-xs text-gray-400">{subItem.desc}</p>
                                                    </div>
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                // Mobile Regular Link
                                <Link 
                                    href={item.href!}
                                    className="flex items-center gap-3 py-3 px-4 text-gray-700 hover:bg-orange-50 hover:text-orange-600 rounded-xl transition-all font-medium"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    <item.icon className="w-5 h-5 text-orange-500" />
                                    {item.name}
                                </Link>
                            )}
                        </div>
                    ))}
                    
                    <div className="pt-4 mt-4 border-t border-gray-100">
                        {isAuthenticated && user ? (
                            <div className="space-y-3">
                                <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-xl">
                                    <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                                        <span className="text-white font-bold">
                                            {user.name.charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900">{user.name}</p>
                                        <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => {
                                        logout();
                                        setIsMenuOpen(false);
                                    }}
                                    className="w-full flex items-center justify-center gap-2 py-3 px-6 bg-red-50 text-red-600 font-semibold rounded-xl hover:bg-red-100 transition-all"
                                >
                                    <LogOutIcon className="w-4 h-4" />
                                    Sign Out
                                </button>
                            </div>
                        ) : (
                            <Link 
                                href="/login" 
                                className="flex items-center justify-center gap-2 py-3.5 px-6 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-xl shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 transition-all"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                <UserCircleIcon className="w-4 h-4" />
                                Sign In
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
