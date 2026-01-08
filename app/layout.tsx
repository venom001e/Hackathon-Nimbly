import { Inter, Urbanist, Poppins } from "next/font/google";
import "./globals.css";
import { Metadata } from "next";
import LenisScroll from "@/components/lenis";
import { AuthProvider } from "@/contexts/AuthContext";
import LayoutWrapper from "@/components/LayoutWrapper";

const inter = Inter({
    variable: "--font-sans",
    subsets: ["latin"],
    display: "swap",
    preload: true,
});

const urbanist = Urbanist({
    variable: "--font-urbanist",
    subsets: ["latin"],
    display: "swap",
    preload: true,
});

const poppins = Poppins({
    variable: "--font-poppins",
    subsets: ["latin"],
    weight: ["400", "500", "600", "700"],
    display: "swap",
    preload: true,
});

export const metadata: Metadata = {
    title: {
        default: "Nimbly",
        template: "%s | Nimbly",
    },
    description:
        "Comprehensive analytics platform for Nimbly enrolment data. Real-time insights, trend analysis, anomaly detection, and AI-powered forecasting for informed policy decisions.",
    keywords: [
        "Nimbly",
        "Analytics",
        "Enrolment Data",
        "Government Analytics",
        "India Digital Identity",
        "Data Visualization",
        "AI Insights",
    ],
    authors: [{ name: "Nimbly Analytics Team" }],
    creator: "Nimbly",
    applicationName: "Nimbly Analytics",
    appleWebApp: {
        title: "Nimbly Analytics",
        capable: true,
        statusBarStyle: "default",
    },
    openGraph: {
        title: "Nimbly Enrolment Analytics Dashboard",
        description:
            "Real-time analytics platform for Nimbly enrolment data. AI-powered insights for policy makers.",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Nimbly Enrolment Analytics Dashboard",
        description:
            "Comprehensive analytics for Nimbly enrolment data with AI-powered insights.",
    },
};
export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={`${inter.variable} ${urbanist.variable} ${poppins.variable}`}>
                <AuthProvider>
                    <LenisScroll />
                    <LayoutWrapper>
                        {children}
                    </LayoutWrapper>
                </AuthProvider>
            </body>
        </html>
    );
}
