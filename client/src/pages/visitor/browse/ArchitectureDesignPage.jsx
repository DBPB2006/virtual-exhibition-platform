import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '@/components/common/Navbar';
import { Spinner } from '@/components/ui/spinner';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowLeft, Ruler, Layers, PenTool, LayoutTemplate } from 'lucide-react';
import api from '@/api/axios';

gsap.registerPlugin(ScrollTrigger);

const CATEGORY_MATCHERS = ["Architecture", "Design", "Architecture & Design"];

// Renders a specialized card for Architecture & Design exhibitions with blueprint-style aesthetics
const DesignCard = ({ exhibition, index }) => {
    return (
        <Link to={`/exhibitions/${exhibition.id}`} className="block group relative h-full">
            <div className="bg-white border text-black relative h-full hover:shadow-xl transition-shadow duration-500 flex flex-col">

                {/* Technical Header */}
                <div className="flex justify-between items-center px-4 py-2 border-b border-gray-200 bg-gray-50">
                    <span className="font-mono text-[9px] uppercase tracking-widest text-gray-400">FIG. {index + 1}</span>
                    <span className="font-mono text-[9px] uppercase tracking-widest text-blue-600 font-bold">{exhibition.theme}</span>
                </div>

                {/* Image Area */}
                <div className="relative aspect-square overflow-hidden border-b border-gray-200 bg-gray-100 group">
                    {exhibition.coverImage ? (
                        <img
                            src={exhibition.coverImage}
                            alt={exhibition.title}
                            className="w-full h-full object-cover grayscale transition-all duration-700 ease-in-out group-hover:grayscale-0 group-hover:scale-105"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <span className="font-mono text-[9px] uppercase tracking-widest text-gray-400 border border-dashed border-gray-300 px-2 py-1">Missing Schematic</span>
                        </div>
                    )}

                    {/* Blueprint Overlay on Hover */}
                    <div className="absolute inset-0 bg-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none mix-blend-multiply" />

                    {/* Measurement Lines (Decorative) */}
                    <div className="absolute top-4 left-4 border-l border-t border-blue-600 w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="absolute bottom-4 right-4 border-r border-b border-blue-600 w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>

                {/* Content */}
                <div className="p-6 flex flex-col flex-grow bg-white relative z-10">
                    <h3 className="font-sans text-xl font-medium tracking-tight mb-2 group-hover:text-blue-600 transition-colors">
                        {exhibition.title}
                    </h3>
                    <p className="font-mono text-xs text-gray-500 line-clamp-2 mb-4 leading-relaxed">
                        {exhibition.description}
                    </p>

                    <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
                        <div className="flex flex-col">
                            <span className="font-mono text-[9px] text-gray-400 uppercase tracking-wider">Project Date</span>
                            <span className="font-sans text-sm font-medium">{exhibition.startDate}</span>
                        </div>
                        <ArrowLeft className="w-4 h-4 text-gray-300 rotate-180 group-hover:translate-x-1 group-hover:text-blue-600 transition-all" />
                    </div>
                </div>
            </div>
        </Link>
    );
};

// Renders the Architecture & Design category page, featuring a grid layout with technical/blueprint styling and structural filtering
const ArchitectureDesignPage = () => {
    const [exhibitions, setExhibitions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterMode, setFilterMode] = useState('ALL'); // ALL, STRUCTURE, OBJECT

    // Fetch Data
    useEffect(() => {
        const fetchExhibitions = async () => {
            setLoading(true);
            try {
                const response = await api.get('/api/exhibitions');

                if (response.data) {
                    const filtered = response.data.filter(item => CATEGORY_MATCHERS.includes(item.category));
                    const transformed = filtered.map(item => ({
                        ...item,
                        id: item._id,
                        theme: item.category,
                        coverImage: item.coverImage && item.coverImage.startsWith('http') ? item.coverImage : "", // No Fallback
                        startDate: item.createdAt ? new Date(item.createdAt).getFullYear() : "2024",
                        exhibitor: item.createdBy?.name || "Studio",
                    }));
                    setExhibitions(transformed);
                }
            } catch (err) {
                console.error("Fetch error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchExhibitions();
    }, []);

    // Filter Logic
    const displayedExhibitions = exhibitions.filter(item => {
        if (filterMode === 'ALL') return true;
        if (filterMode === 'STRUCTURE') return item.theme === 'Architecture';
        if (filterMode === 'OBJECT') return item.theme === 'Design';
        return true;
    });

    // Animations
    useEffect(() => {
        if (!loading) {
            gsap.fromTo('.blueprint-reveal',
                { y: 30, opacity: 0 },
                { y: 0, opacity: 1, duration: 1, ease: 'power3.out', stagger: 0.1 }
            );

            gsap.fromTo('.design-card',
                { opacity: 0, scale: 0.95 },
                { opacity: 1, scale: 1, duration: 0.8, ease: 'power2.out', stagger: 0.1, scrollTrigger: { trigger: '.grid-container', start: 'top 85%' } }
            );
        }
    }, [loading, filterMode]);

    return (
        <div className="min-h-screen bg-[#F0F2F5] text-slate-900 font-sans selection:bg-blue-600 selection:text-white relative">
            {/* Grid Background */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.03)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none fixed" />

            {loading && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#F0F2F5]">
                    <Spinner className="w-8 h-8 text-blue-600" />
                </div>
            )}
            <Navbar forceDark={true} />

            {/* --- HEADER --- */}
            <header className="pt-32 pb-20 px-6 md:px-12 lg:px-24 border-b border-gray-200 relative bg-white/50 backdrop-blur-sm">
                <div className="max-w-7xl mx-auto">
                    <Link to="/categories" className="blueprint-reveal inline-flex items-center gap-2 text-xs font-mono uppercase tracking-[0.2em] text-gray-500 hover:text-blue-600 transition-colors mb-6">
                        <ArrowLeft className="w-3 h-3" /> Layout Index
                    </Link>

                    <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12">
                        <div className="blueprint-reveal max-w-3xl">
                            <h1 className="font-heading font-black text-6xl md:text-8xl tracking-tight text-slate-900 leading-[0.85] mb-6">
                                FORM <span className="text-blue-600">&&</span> <br />
                                FUNCTION<span className="text-blue-600">.</span>
                            </h1>
                            <p className="font-mono text-xs md:text-sm text-gray-500 max-w-lg leading-relaxed border-l-2 border-blue-600 pl-4">
                                Celebrating the intersection of spatial design, <br />
                                structural engineering, and aesthetic utility.
                            </p>
                        </div>

                        {/* Controls */}
                        <div className="blueprint-reveal flex flex-col items-end gap-2">
                            <span className="font-mono text-[9px] uppercase tracking-widest text-gray-400">View Control</span>
                            <div className="flex bg-white p-1 rounded border border-gray-200 shadow-sm">
                                {['ALL', 'STRUCTURE', 'OBJECT'].map((mode) => (
                                    <button
                                        key={mode}
                                        onClick={() => setFilterMode(mode)}
                                        className={`px-4 py-2 rounded text-[10px] font-bold uppercase tracking-widest transition-all duration-300 ${filterMode === mode ? "bg-blue-600 text-white shadow-md" : "text-gray-400 hover:text-slate-900 hover:bg-gray-50"}`}
                                    >
                                        {mode}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* --- GALLERY --- */}
            <main className="px-6 md:px-12 lg:px-24 py-16">
                <div className="max-w-8xl mx-auto grid-container">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {displayedExhibitions.length > 0 ? displayedExhibitions.map((exh, index) => (
                            <div key={exh.id} className="design-card">
                                <DesignCard exhibition={exh} index={index} />
                            </div>
                        )) : (
                            <div className="col-span-full h-64 flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-lg">
                                <Ruler className="w-8 h-8 text-gray-300 mb-2" />
                                <p className="font-mono text-gray-400 text-xs">NO BLUEPRINTS FOUND</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ArchitectureDesignPage;
