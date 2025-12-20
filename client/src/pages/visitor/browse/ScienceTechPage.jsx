import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '@/components/common/Navbar';
import { Spinner } from '@/components/ui/spinner';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowLeft, Cpu, Database } from 'lucide-react';
import { useExhibitionData } from '@/hooks/useExhibitionData';

gsap.registerPlugin(ScrollTrigger);

const CATEGORY_MATCHERS = ["Science", "Technology", "Science & Technology"];

// Renders a specialized card for Science & Technology exhibitions with futuristic/cyberpunk aesthetics
const TechCard = ({ exhibition, index }) => {
    return (
        <Link to={`/exhibitions/${exhibition.id}`} className="block group relative h-full">
            <div className="relative h-full bg-[#0F172A] border border-slate-800 hover:border-cyan-500/50 transition-colors duration-500 flex flex-col overflow-hidden">

                {/* Header Strip with "Code" feel */}
                <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800 bg-[#1E293B]">
                    <span className="font-mono text-[10px] text-cyan-400">ID: {exhibition.id.slice(-6).toUpperCase()}</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                </div>

                {/* Image Area with "Scanner" Overlay */}
                <div className="relative w-full aspect-video overflow-hidden border-b border-slate-800 group">
                    <div className="absolute inset-0 bg-cyan-900/20 mix-blend-overlay z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    {exhibition.coverImage ? (
                        <img
                            src={exhibition.coverImage}
                            alt={exhibition.title}
                            className="w-full h-full object-cover grayscale transition-all duration-700 ease-out group-hover:grayscale-0 group-hover:scale-105"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center font-mono text-cyan-900/50 text-xs">
                            NO_DATA
                        </div>
                    )}

                    {/* Animated "Scan" line on hover */}
                    <div className="absolute top-0 left-0 w-full h-[2px] bg-cyan-400 opacity-0 group-hover:opacity-100 group-hover:animate-[scan_2s_linear_infinite] z-20 shadow-[0_0_10px_rgba(34,211,238,0.5)]" />
                </div>

                {/* Content: "Data Grid" Layout */}
                <div className="p-5 flex flex-col flex-grow relative">
                    {/* Background Grid Pattern */}
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />

                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-3">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-slate-300 border border-slate-700">
                                {exhibition.theme}
                            </span>
                            {exhibition.isForSale && (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-950 text-emerald-400 border border-emerald-900">
                                    Science Fair Entry
                                </span>
                            )}
                        </div>

                        <h3 className="font-sans text-xl font-bold text-slate-100 mb-2 leading-tight group-hover:text-cyan-400 transition-colors">
                            {exhibition.title}
                        </h3>

                        <div className="mt-auto pt-4 border-t border-slate-800/50 flex items-center justify-between font-mono text-xs text-slate-500">
                            <span className="flex items-center gap-1 hover:text-slate-300 transition-colors">
                                <Database className="w-3 h-3" /> {exhibition.startDate}
                            </span>
                            <span className="flex items-center gap-1 hover:text-slate-300 transition-colors">
                                <Cpu className="w-3 h-3" /> {exhibition.exhibitor}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
};

// Renders the Science & Technology category page, featuring a futuristic grid layout with filtering for science, tech, and science fair projects
const ScienceTechPage = () => {
    const { exhibitions, loading } = useExhibitionData(CATEGORY_MATCHERS);
    const [filterMode, setFilterMode] = useState('ALL'); // ALL, SCIENCE, TECH
    const [showScienceFair, setShowScienceFair] = useState(false);

    // Filter Logic
    const displayedExhibitions = exhibitions.filter(item => {
        // Science Fair Filter
        if (showScienceFair && !item.isForSale) return false;

        // Category Filter
        if (filterMode === 'ALL') return true;
        if (filterMode === 'SCIENCE') return item.theme === 'Science';
        if (filterMode === 'TECH') return item.theme === 'Technology';
        return true;
    });

    // Animations
    useEffect(() => {
        if (!loading) {
            gsap.fromTo('.interface-reveal',
                { y: 20, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.8, ease: 'power2.out', stagger: 0.1 }
            );

            gsap.fromTo('.tech-card',
                { opacity: 0, scale: 0.95 },
                { opacity: 1, scale: 1, duration: 0.6, ease: 'power2.out', stagger: 0.05, scrollTrigger: { trigger: '.grid-container', start: 'top 85%' } }
            );
        }
    }, [loading, filterMode, showScienceFair]);

    return (
        <div className="min-h-screen bg-[#020617] text-slate-200 font-sans selection:bg-cyan-500/30 selection:text-cyan-200 relative overflow-x-hidden">
            {/* Tech Grid Background */}
            <div className="fixed inset-0 bg-[linear-gradient(rgba(6,182,212,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.05)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
            <div className="fixed inset-0 bg-[radial-gradient(circle_800px_at_50%_-30%,#1e293b,transparent)] pointer-events-none opacity-50" />

            <div className="relative z-10">
                {loading && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#020617]">
                        <Spinner className="w-8 h-8 text-cyan-500" />
                    </div>
                )}
                <Navbar /> {/* Default is Scrolled-based which works well on dark bg */}

                {/* --- HEADER --- */}
                <header className="pt-32 pb-16 px-6 md:px-12 lg:px-24 border-b border-slate-800/50 backdrop-blur-sm bg-[#020617]/80 sticky top-0 z-40">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">

                            <div className="interface-reveal">
                                <Link to="/categories" className="inline-flex items-center gap-2 text-xs font-mono text-cyan-500 hover:text-cyan-400 transition-colors mb-4">
                                    <ArrowLeft className="w-3 h-3" /> SYSTEM_INDEX
                                </Link>
                                <h1 className="font-sans font-bold text-5xl md:text-6xl lg:text-7xl text-white tracking-tight mb-2">
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-500">I.N.N.O.V.A.T.I.O.N</span>
                                </h1>
                                <p className="font-mono text-xs md:text-sm text-slate-400 max-w-xl">
                                    &gt;&gt; Exploring the frontiers of human knowledge. <br />
                                    &gt;&gt; From microscopic biology to quantum computing.
                                </p>
                            </div>

                            {/* Control Panel */}
                            <div className="interface-reveal flex flex-col gap-2 items-end">
                                <div className="flex gap-2 p-1 bg-slate-900/50 rounded-lg border border-slate-800 backdrop-blur-md">
                                    {['ALL', 'SCIENCE', 'TECH'].map((mode) => (
                                        <button
                                            key={mode}
                                            onClick={() => setFilterMode(mode)}
                                            className={`px-4 py-2 rounded text-xs font-bold font-mono transition-all duration-300 ${filterMode === mode ? "bg-cyan-500 text-black shadow-[0_0_15px_rgba(6,182,212,0.4)]" : "text-slate-400 hover:text-white hover:bg-slate-800"}`}
                                        >
                                            {mode}
                                        </button>
                                    ))}
                                </div>

                                {/* Science Fair Toggle */}
                                <button
                                    onClick={() => setShowScienceFair(!showScienceFair)}
                                    className={`w-full px-4 py-2 rounded-lg text-xs font-bold font-mono transition-all duration-300 border ${showScienceFair ? "bg-emerald-500 text-black border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.4)]" : "bg-slate-900/50 text-emerald-500 border-emerald-900/50 hover:border-emerald-500/50"}`}
                                >
                                    {showScienceFair ? "MODE: SCIENCE FAIR ONLY" : "TOGGLE: SCIENCE FAIR"}
                                </button>
                            </div>
                        </div>
                    </div>
                </header>

                {/* --- MAIN GRID --- */}
                <main className="px-6 md:px-12 lg:px-24 py-12">
                    <div className="max-w-7xl mx-auto grid-container">
                        <div className="flex items-center justify-between mb-8 border-b border-slate-800 pb-2">
                            <span className="font-mono text-xs text-slate-500">
                                DATABASE_RESULTS: {displayedExhibitions.length}
                            </span>
                            <div className="flex gap-2 text-slate-600">
                                <span className={`w-2 h-2 rounded-full ${loading ? "bg-amber-500 animate-pulse" : "bg-emerald-500"}`} />
                                <span className="font-mono text-[10px] uppercase">
                                    {loading ? "SYNCING..." : "ONLINE"}
                                </span>
                            </div>
                        </div>

                        {displayedExhibitions.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {displayedExhibitions.map((exh, index) => (
                                    <div key={exh.id} className="tech-card h-full">
                                        <TechCard exhibition={exh} index={index} />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="h-64 flex flex-col items-center justify-center border border-dashed border-slate-800 bg-slate-900/20 rounded-lg">
                                <Database className="w-12 h-12 text-slate-700 mb-4" />
                                <span className="font-mono text-slate-500">NO DATA FOUND IN SECTOR</span>
                                <button onClick={() => setFilterMode('ALL')} className="mt-4 text-cyan-500 hover:text-cyan-400 font-mono text-xs underline">
                                    RESET_FILTERS
                                </button>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default ScienceTechPage;
