'use client';

import { useEffect, useRef } from 'react';
import Lenis from 'lenis';

export default function LenisScroll() {
    const lenisRef = useRef<Lenis | null>(null);
    const rafIdRef = useRef<number | null>(null);

    useEffect(() => {
        // Check for reduced motion preference
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        
        if (prefersReducedMotion) return;

        lenisRef.current = new Lenis({
            duration: 1.0, // Slightly faster for snappier feel
            smoothWheel: true,
            wheelMultiplier: 1.2, // More responsive scrolling
            touchMultiplier: 2,
            anchors: {
                offset: -100,
            },
        });

        const raf = (time: number) => {
            lenisRef.current?.raf(time);
            rafIdRef.current = requestAnimationFrame(raf);
        };

        rafIdRef.current = requestAnimationFrame(raf);

        return () => {
            if (rafIdRef.current) {
                cancelAnimationFrame(rafIdRef.current);
            }
            lenisRef.current?.destroy();
        };
    }, []);

    return null;
}