import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/common/Navbar';
import { Spinner } from '@/components/ui/spinner';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';
import { useExhibitionData } from '@/hooks/useExhibitionData';

gsap.registerPlugin(ScrollTrigger);

// --- AVANT-GARDE CONFIG ---
const CATEGORY_MATCHERS = ["Art", "Fashion", "Art & Fashion"];

const THEME = {
    bg: "bg-[#080808]", // Deep Onyx
    text: "text-neutral-200", // Soft White
    accent: "text-white", // Pure White
    accentBg: "bg-white",
    border: "border-neutral-800",
    muted: "text-neutral-500"
};

// Renders a specialized card for Art & Fashion exhibitions with high-fashion/avant-garde aesthetics
const AvantGardeCard = ({ exhibition }) => {
    return (
        <Link to={`/exhibitions/${exhibition.id}`} className="block w-full h-full relative group">
            {/* Image Container */}
            <div className="relative w-full h-[60vh] md:h-[70vh] overflow-hidden bg-[#0A0A0A]">
                {/* Image */}
                {/* Image */}
                {exhibition.coverImage ? (
                    <div className="w-full h-full transition-transform duration-[1.5s] ease-[0.16, 1, 0.3, 1] group-hover:scale-105">
                        <img
                            src={exhibition.coverImage}
                            alt={exhibition.title}
                            className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 ease-out opacity-80 group-hover:opacity-100"
                        />
                    </div>
                ) : (
                    /* Plain Background Fallback */
                    <div className="w-full h-full bg-[#111] border-b border-neutral-900" />
                )}

                {/* Cinematic Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-700" />

                {/* Hover Flash */}
                <div className="absolute inset-0 bg-white mix-blend-overlay opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
            </div>

            {/* Brutalist Content Layer - Overlapping/Floating */}
            <div className="absolute bottom-0 left-0 w-full p-6 md:p-10 flex flex-col items-start z-20 mix-blend-difference text-white">

                {/* Meta Header */}
                <div className="w-full flex justify-between items-end border-b border-white/40 pb-4 mb-4">
                    <span className="font-mono text-xs uppercase tracking-[0.2em] text-neutral-300">
                        {exhibition.exhibitor}
                    </span>
                    <span className="font-mono text-xs uppercase tracking-[0.2em] text-neutral-300">
                        {exhibition.startDate}
                    </span>
                </div>

                {/* Massive Title */}
                <h2 className="font-sans font-black text-5xl md:text-7xl lg:text-8xl uppercase leading-[0.8] tracking-tighter mb-6 origin-left transition-transform duration-500 group-hover:translate-x-4">
                    {exhibition.title}
                </h2>

                {/* Price Tag (If Sale) */}
                {exhibition.isForSale && (
                    <div className="absolute top-6 right-6 bg-white text-black px-4 py-2 font-mono text-xs font-bold uppercase tracking-widest hover:bg-neutral-200 transition-colors">
                        {exhibition.price > 0 ? `₹${exhibition.price.toLocaleString()}` : "Inquire"}
                    </div>
                )}
            </div>

            {/* Custom Cursor Hint (Visual only, implemented via CSS usually but mocked here with layout) */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full border border-white/30 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 scale-50 group-hover:scale-100 pointer-events-none z-30">
                <span className="font-mono text-[10px] uppercase tracking-widest text-white">View</span>
            </div>
        </Link>
    );
};

// Renders the Art & Fashion category page, featuring a split layout (manifesto sidebar + infinite feed) and high-impact visual design
const ArtFashionPage = () => {
    const navigate = useNavigate();
    const { exhibitions, loading } = useExhibitionData(CATEGORY_MATCHERS);
    const [showOnSale, setShowOnSale] = useState(false);

    const containerRef = useRef(null);
    const scrollContainerRef = useRef(null);

    // Animations: Aggressive, Snap
    useEffect(() => {
        if (!loading && exhibitions.length > 0) {
            const ctx = gsap.context(() => {
                // Title Reveal
                gsap.fromTo('.brutalist-title span',
                    { y: 100, opacity: 0, skewY: 10 },
                    { y: 0, opacity: 1, skewY: 0, duration: 1.2, stagger: 0.1, ease: 'power4.out' }
                );

                // Line Grow
                gsap.fromTo('.accent-line',
                    { scaleX: 0 },
                    { scaleX: 1, duration: 1.5, ease: 'expo.out', delay: 0.5 }
                );

                // Feed Reveal
                gsap.fromTo('.exh-item',
                    { y: 100, opacity: 0 },
                    { y: 0, opacity: 1, duration: 1, stagger: 0.2, ease: 'power3.out', delay: 0.8 }
                );
            }, containerRef);
            return () => ctx.revert();
        }
    }, [loading, exhibitions]);

    // Filter Logic
    const displayedExhibitions = exhibitions.filter(item => showOnSale ? item.isForSale : true);

    return (
        <div ref={containerRef} className="min-h-screen bg-[#080808] text-neutral-200 font-sans selection:bg-white selection:text-black">
            {loading && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#080808]">
                    <Spinner className="w-8 h-8 text-white" />
                </div>
            )}
            <Navbar />

            {/* Split Layout */}
            <div className="flex flex-col lg:flex-row min-h-screen">

                {/* --- LEFT: STICKY MANIFESTO --- */}
                <aside className="w-full lg:w-5/12 lg:h-screen lg:sticky lg:top-0 p-8 pt-32 lg:p-16 flex flex-col justify-between border-r border-[#1a1a1a] z-20 relative">

                    {/* Top: Nav */}
                    <div className="mb-12 relative z-50">
                        <button
                            onClick={() => navigate(-1)}
                            className="group inline-flex items-center gap-2 text-xs font-mono uppercase tracking-[0.3em] text-neutral-500 hover:text-white transition-colors cursor-pointer"
                        >
                            <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" /> Back
                        </button>
                    </div>

                    {/* Middle: Title */}
                    <div className="relative z-10 mb-12">
                        <div className="brutalist-title flex flex-col font-black tracking-tighter text-7xl md:text-8xl lg:text-9xl leading-[0.8] mb-8">
                            <span className="block text-white">ART</span>
                            <span className="block text-neutral-800">&</span>
                            <span className="block text-white font-serif italic font-light tracking-normal">FASHION</span>
                        </div>

                        <div className="accent-line w-24 h-1 bg-white origin-left mb-8" />

                        <p className="font-mono text-xs md:text-sm text-neutral-500 max-w-xs leading-loose uppercase tracking-widest border-l border-neutral-800 pl-6">
                            Constructed realities. <br />
                            Curated for the modern ego. <br />
                            Viewing {displayedExhibitions.length} Artifacts.
                        </p>
                    </div>

                    {/* Bottom: Filter Tag */}
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setShowOnSale(!showOnSale)}
                            className={`group relative px-6 py-3 border border-neutral-800 hover:border-white transition-all duration-300 flex items-center gap-3 overflow-hidden ${showOnSale ? "bg-white" : "bg-transparent"}`}
                        >
                            <div className={`w-2 h-2 rounded-full transition-colors duration-300 ${showOnSale ? "bg-black" : "bg-neutral-600 group-hover:bg-white"}`} />
                            <span className={`font-mono text-xs font-bold uppercase tracking-widest transition-colors duration-300 ${showOnSale ? "text-black" : "text-neutral-500 group-hover:text-white"}`}>
                                {showOnSale ? "Acquisition Mode: ON" : "Filter: For Sale"}
                            </span>
                        </button>
                    </div>
                </aside>

                {/* --- RIGHT: INFINITE FEED --- */}
                <main ref={scrollContainerRef} className="w-full lg:w-7/12 bg-[#080808] relative z-0">
                    {/* Background Noise/Grid */}
                    <div className="fixed inset-0 opacity-[0.02] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay" />

                    <div className="p-4 pt-12 lg:p-12 lg:pt-32 pb-32 min-h-screen">
                        {displayedExhibitions.length > 0 ? (
                            <div className="grid grid-cols-1 gap-y-32">
                                {displayedExhibitions.map((exh, index) => (
                                    <div key={exh.id} className="exh-item group w-full relative">
                                        {/* Sticky Index Number (Desktop) */}
                                        <div className="hidden lg:block absolute -left-12 top-0 text-neutral-700 font-black text-9xl opacity-100 select-none -translate-x-full">
                                            {index + 1 < 10 ? `0${index + 1}` : index + 1}
                                        </div>

                                        {/* Card Wrapper - Using Bespoke Card */}
                                        <div className="w-full">
                                            <AvantGardeCard exhibition={exh} />
                                        </div>

                                        {/* External Link Overlay (decorative) */}
                                        <div className="absolute top-4 right-4 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                                            <ArrowUpRight className="w-12 h-12 text-white" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="h-[50vh] flex flex-col items-center justify-center border border-dashed border-neutral-800">
                                <span className="font-mono text-neutral-600 text-xs uppercase tracking-widest mb-4">Void Empty</span>
                                <button onClick={() => setShowOnSale(false)} className="text-white underline hover:text-neutral-400 transition-colors text-xs font-bold uppercase tracking-widest">
                                    Reset Protocol
                                </button>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default ArtFashionPage;
