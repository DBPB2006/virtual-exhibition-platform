import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '@/components/common/Navbar';
import { Spinner } from '@/components/ui/spinner';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowLeft, Hourglass, Landmark, Scroll } from 'lucide-react';
import api from '@/api/axios';

gsap.registerPlugin(ScrollTrigger);

const CATEGORY_MATCHERS = ["Historic", "Antique", "Historic & Antique"];

// Renders a specialized card for Historic & Antique exhibitions with vintage/archival aesthetics
const ArtifactCard = ({ exhibition, index }) => {
    return (
        <Link to={`/exhibitions/${exhibition.id}`} className="block group cursor-pointer relative h-full">
            <div className="relative h-full bg-[#2C1810] overflow-hidden transition-all duration-700 hover:shadow-2xl border border-[#5D4037] hover:border-[#D4AF37]">

                {/* Vintage Texture Overlay */}
                <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/aged-paper.png')] pointer-events-none" />

                {/* Image Area */}
                <div className="relative w-full aspect-[4/5] overflow-hidden p-4">
                    <div className="w-full h-full relative overflow-hidden border border-[#5D4037]/50 shadow-inner bg-black">
                        {exhibition.coverImage ? (
                            <img
                                src={exhibition.coverImage}
                                alt={exhibition.title}
                                className="w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-105 filter sepia-[0.3] group-hover:sepia-0"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-[#1A0F0A]">
                                <span className="text-[#8D6E63] text-xs font-serif italic">Artifact Archived</span>
                            </div>
                        )}
                        {/* Vignette */}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#2C1810] via-transparent to-transparent opacity-80" />
                    </div>

                    {/* Badge */}
                    <div className="absolute top-6 right-6 z-20">
                        <div className="px-3 py-1 bg-[#D4AF37] text-[#2C1810] text-[10px] font-serif font-bold uppercase tracking-widest border border-[#2C1810] shadow-md">
                            {exhibition.theme}
                        </div>
                    </div>
                </div>

                {/* Content Area */}
                <div className="px-8 pb-8 pt-2 relative z-20 text-center">
                    <h3 className="font-serif text-2xl text-[#E6D5B8] group-hover:text-[#D4AF37] transition-colors duration-500 mb-3 leading-tight">
                        {exhibition.title}
                    </h3>

                    <div className="w-12 h-[1px] bg-[#5D4037] mx-auto mb-4 group-hover:w-24 transition-all duration-500" />

                    <p className="font-mono text-[10px] text-[#A1887F] uppercase tracking-[0.2em] mb-4">
                        Curated by {exhibition.exhibitor}
                    </p>

                    <div className="flex items-center justify-center gap-4 text-[#8D6E63] text-xs font-serif italic">
                        <span>Est. {exhibition.startDate}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1 group-hover:text-[#D4AF37] transition-colors">
                            View Collection <Scroll className="w-3 h-3" />
                        </span>
                    </div>
                </div>
            </div>
        </Link>
    );
};

// Renders the Historic & Antique category page, featuring a wood-themed grid layout with filtering for historic and antique items
const HistoricAntiquePage = () => {
    const [exhibitions, setExhibitions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterMode, setFilterMode] = useState('ALL'); // ALL, HISTORIC, ANTIQUE

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
                        coverImage: item.coverImage && item.coverImage.startsWith('http') ? item.coverImage : "",
                        startDate: item.createdAt ? new Date(item.createdAt).getFullYear() : "Unknown Era",
                        exhibitor: item.createdBy?.name || "The Curator",
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
        if (filterMode === 'HISTORIC') return item.theme === 'Historic';
        if (filterMode === 'ANTIQUE') return item.theme === 'Antique';
        return true;
    });

    // Animations
    useEffect(() => {
        if (!loading) {
            gsap.fromTo('.history-reveal',
                { y: 30, opacity: 0 },
                { y: 0, opacity: 1, duration: 1.5, ease: 'power3.out', stagger: 0.15 }
            );

            gsap.fromTo('.artifact-card',
                { y: 60, opacity: 0 },
                { y: 0, opacity: 1, duration: 1, ease: 'power3.out', stagger: 0.1, delay: 0.8 }
            );
        }
    }, [loading, filterMode]);

    return (
        <div className="min-h-screen bg-[#1A0F0A] text-[#E6D5B8] font-serif selection:bg-[#D4AF37] selection:text-[#2C1810] relative">
            {loading && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1A0F0A]">
                    <Spinner className="w-8 h-8 text-[#D4AF37]" />
                </div>
            )}
            <Navbar forceDark={true} />

            {/* --- HERO HEADER --- */}
            <header className="relative pt-40 pb-32 px-6 md:px-12 lg:px-24 overflow-hidden border-b border-[#3E2723]">
                {/* Background Texture */}
                <div className="absolute inset-0 z-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')]" />

                <div className="max-w-7xl mx-auto relative z-10 flex flex-col md:flex-row justify-between items-end gap-12">
                    <div className="flex-1">
                        <Link to="/categories" className="history-reveal inline-flex items-center gap-2 text-xs font-mono uppercase tracking-[0.2em] text-[#8D6E63] hover:text-[#D4AF37] transition-colors mb-10">
                            <ArrowLeft className="w-3 h-3" /> The Archives
                        </Link>

                        <h1 className="history-reveal text-6xl md:text-8xl lg:text-9xl text-[#D4AF37] leading-[0.9] font-medium drop-shadow-lg mb-6">
                            Timeless <br /> <span className="text-[#E6D5B8] italic font-light">Treasures</span>
                        </h1>

                        <p className="history-reveal text-lg md:text-xl text-[#A1887F] leading-relaxed max-w-lg mt-8 border-l border-[#D4AF37] pl-6 font-light">
                            Step into the corridors of time. A curated assembly of relics, manuscripts, and oddities that whisper stories from civilizations past.
                        </p>
                    </div>

                    <div className="history-reveal flex flex-col items-end gap-6">
                        <div className="flex gap-2">
                            {['ALL', 'HISTORIC', 'ANTIQUE'].map((mode) => (
                                <button
                                    key={mode}
                                    onClick={() => setFilterMode(mode)}
                                    className={`px-8 py-3 border transition-all duration-500 font-mono text-xs uppercase tracking-[0.15em] ${filterMode === mode ? "bg-[#D4AF37] text-[#2C1810] border-[#D4AF37] shadow-[0_0_20px_rgba(212,175,55,0.3)]" : "bg-transparent text-[#8D6E63] border-[#3E2723] hover:border-[#D4AF37] hover:text-[#D4AF37]"}`}
                                >
                                    {mode}
                                </button>
                            ))}
                        </div>
                        <div className="text-[#5D4037] flex items-center gap-2 text-sm font-mono tracking-widest">
                            <Hourglass className="w-4 h-4" /> Preservation In Progress
                        </div>
                    </div>
                </div>
            </header>

            {/* --- EXHIBITION GRID --- */}
            <main className="px-6 md:px-12 lg:px-24 py-24 bg-[#140b07] relative">
                {/* Decorative Vertical Line */}
                <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-[#3E2723]/30 -translate-x-1/2 hidden md:block" />

                <div className="max-w-7xl mx-auto">
                    {displayedExhibitions.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-20">
                            {displayedExhibitions.map((exh, index) => (
                                <div key={exh.id} className={`artifact-card ${index % 2 !== 0 ? 'md:translate-y-12' : ''}`}>
                                    {/* Offset every other card for varied layout */}
                                    <ArtifactCard exhibition={exh} index={index} />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-40 border border-[#3E2723] border-dashed rounded-lg bg-[#1A0F0A]/50">
                            <Landmark className="w-16 h-16 text-[#3E2723] mb-6 opacity-50" />
                            <p className="font-serif text-[#8D6E63] text-xl italic mb-2">
                                The archives are currently sealed for this era.
                            </p>
                            <button onClick={() => setFilterMode('ALL')} className="mt-6 text-[#D4AF37] hover:text-white underline underline-offset-4 decoration-[#3E2723] transition-colors">
                                Return to Full Collection
                            </button>
                        </div>
                    )}
                </div>
            </main>

            {/* FOOTER */}
            <footer className="py-24 text-center border-t border-[#3E2723] bg-[#0D0705]">
                <div className="max-w-md mx-auto px-6">
                    <p className="font-serif text-2xl text-[#D4AF37] mb-6 tracking-wide">"History is a philosophy teaching by examples."</p>
                    <div className="w-8 h-8 border border-[#D4AF37] rotate-45 mx-auto mb-6 flex items-center justify-center">
                        <div className="w-4 h-4 bg-[#D4AF37]" />
                    </div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#5D4037]">Est. 2024 • Virtual Gallery Archive</p>
                </div>
            </footer>
        </div>
    );
};

export default HistoricAntiquePage;
