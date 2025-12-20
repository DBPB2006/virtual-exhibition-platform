import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '@/components/common/Navbar';
import { Spinner } from '@/components/ui/spinner';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowLeft, Globe, BookOpen, Landmark } from 'lucide-react';
import api from '@/api/axios';

gsap.registerPlugin(ScrollTrigger);

const CATEGORY_MATCHERS = ["Culture", "Heritage", "Culture & Heritage"];

// Renders a specialized card for Culture & Heritage exhibitions with traditional/classic aesthetics
const CultureCard = ({ exhibition, index }) => {
    return (
        <Link to={`/exhibitions/${exhibition.id}`} className="block group cursor-pointer relative h-full">
            <div className="relative h-full bg-[#1A1A1A] overflow-hidden transition-all duration-700 hover:shadow-2xl border border-neutral-800 hover:border-[#D4AF37]">

                {/* Decorative Pattern Overlay */}
                <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/black-linen.png')] pointer-events-none" />

                {/* Image Area */}
                <div className="relative w-full aspect-[3/4] overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10" />
                    {exhibition.coverImage ? (
                        <img
                            src={exhibition.coverImage}
                            alt={exhibition.title}
                            className="w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-110"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <span className="text-[#D4AF37]/30 text-xs font-serif italic">Image Unavailable</span>
                        </div>
                    )}

                    {/* Badge */}
                    <div className="absolute top-4 right-4 z-20">
                        <span className="px-3 py-1 bg-[#D4AF37] text-black text-[10px] font-bold uppercase tracking-widest">
                            {exhibition.theme}
                        </span>
                    </div>
                </div>

                {/* Content Area */}
                <div className="p-6 relative z-20 -mt-20">
                    <div className="bg-[#1A1A1A]/90 backdrop-blur-md p-6 border-t border-[#D4AF37]/30 min-h-[160px] flex flex-col justify-between group-hover:bg-[#D4AF37] group-hover:text-black transition-colors duration-500">
                        <div>
                            <h3 className="font-serif text-2xl text-[#E5E5E5] group-hover:text-black transition-colors duration-300 mb-2 line-clamp-2">
                                {exhibition.title}
                            </h3>
                            <p className="font-mono text-xs text-neutral-400 group-hover:text-black/70 uppercase tracking-wider mb-4">
                                {exhibition.exhibitor}
                            </p>
                        </div>

                        <div className="flex items-center justify-between border-t border-white/10 group-hover:border-black/20 pt-4">
                            <span className="font-mono text-xs group-hover:text-black/80">Est. {exhibition.startDate}</span>
                            <Globe className="w-4 h-4 text-[#D4AF37] group-hover:text-black transition-colors" />
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
};

// Renders the Culture & Heritage category page, featuring a rich, dark-themed grid layout with filtering for culture and heritage types
const CultureHeritagePage = () => {
    const [exhibitions, setExhibitions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterMode, setFilterMode] = useState('ALL'); // ALL, CULTURE, HERITAGE

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
                        startDate: item.createdAt ? new Date(item.createdAt).getFullYear() : "N/A",
                        exhibitor: item.createdBy?.name || "Global Curator",
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
        if (filterMode === 'CULTURE') return item.theme === 'Culture';
        if (filterMode === 'HERITAGE') return item.theme === 'Heritage';
        return true;
    });

    // Animations
    useEffect(() => {
        if (!loading) {
            gsap.fromTo('.culture-reveal',
                { y: 30, opacity: 0 },
                { y: 0, opacity: 1, duration: 1.2, ease: 'power3.out', stagger: 0.1 }
            );

            gsap.fromTo('.culture-card',
                { y: 50, opacity: 0 },
                { y: 0, opacity: 1, duration: 1, ease: 'power3.out', stagger: 0.1, delay: 0.5, scrollTrigger: { trigger: '.grid-container', start: 'top 85%' } }
            );
        }
    }, [loading, filterMode]);

    return (
        <div className="min-h-screen bg-[#121212] text-[#E5E5E5] font-sans selection:bg-[#D4AF37] selection:text-black relative">
            {loading && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#121212]">
                    <Spinner className="w-8 h-8 text-[#D4AF37]" />
                </div>
            )}
            <Navbar forceDark={true} />

            {/* --- HEADER --- */}
            <header className="pt-32 pb-20 px-6 md:px-12 lg:px-24 border-b border-neutral-800 relative overflow-hidden">
                {/* Background Element */}
                <div className="absolute top-0 right-0 w-1/2 h-full opacity-20 pointer-events-none">
                    <div className="w-full h-full bg-gradient-to-l from-[#D4AF37]/20 to-transparent" />
                </div>

                <div className="max-w-7xl mx-auto relative z-10">
                    <Link to="/categories" className="culture-reveal inline-flex items-center gap-2 text-xs font-mono uppercase tracking-[0.2em] text-neutral-500 hover:text-[#D4AF37] transition-colors mb-8">
                        <ArrowLeft className="w-3 h-3" /> Global Index
                    </Link>

                    <h1 className="culture-reveal font-serif text-6xl md:text-8xl lg:text-9xl text-[#E5E5E5] leading-none mb-6">
                        Roots <span className="text-[#D4AF37]">&</span> <br />
                        Rituals.
                    </h1>

                    <div className="culture-reveal flex flex-col md:flex-row gap-12 items-start md:items-end justify-between">
                        <p className="font-serif text-lg md:text-xl text-neutral-400 leading-relaxed max-w-lg border-l-2 border-[#D4AF37] pl-6">
                            A celebration of human identity. Uncover the traditions, customs, and shared histories that define who we are.
                        </p>

                        {/* Filter Controls */}
                        <div className="flex gap-4">
                            {['ALL', 'CULTURE', 'HERITAGE'].map((mode) => (
                                <button
                                    key={mode}
                                    onClick={() => setFilterMode(mode)}
                                    className={`px-6 py-2 border transition-all duration-300 font-mono text-xs uppercase tracking-widest ${filterMode === mode ? "bg-[#D4AF37] text-black border-[#D4AF37]" : "bg-transparent text-neutral-500 border-neutral-800 hover:border-[#D4AF37] hover:text-[#D4AF37]"}`}
                                >
                                    {mode}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </header>

            {/* --- GALLERY GRID --- */}
            <main className="px-6 md:px-12 lg:px-24 py-24 bg-[#0F0F0F]">
                <div className="max-w-7xl mx-auto grid-container">
                    {displayedExhibitions.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {displayedExhibitions.map((exh, index) => (
                                <div key={exh.id} className="culture-card h-full">
                                    <CultureCard exhibition={exh} index={index} />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-32 border border-dashed border-neutral-800">
                            <Landmark className="w-12 h-12 text-neutral-800 mb-4" />
                            <p className="font-serif text-neutral-600 italic">
                                No exhibitions found in this collection.
                            </p>
                            <button onClick={() => setFilterMode('ALL')} className="mt-4 text-[#D4AF37] underline font-serif hover:text-white">
                                Reset Filters
                            </button>
                        </div>
                    )}
                </div>
            </main>

            {/* Footer Signoff */}
            <footer className="py-24 text-center border-t border-neutral-800 bg-[#121212]">
                <div className="max-w-md mx-auto px-6">
                    <p className="font-serif text-xl text-[#D4AF37] italic mb-4">"Culture is the widening of the mind and of the spirit."</p>
                    <p className="font-mono text-xs uppercase tracking-widest text-neutral-600">Virtual Gallery / Global Archive</p>
                </div>
            </footer>
        </div>
    );
};

export default CultureHeritagePage;
