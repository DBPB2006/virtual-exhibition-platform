import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '@/components/common/Navbar';
import { Spinner } from '@/components/ui/spinner';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowLeft, Camera, Film, Eye, Aperture } from 'lucide-react';
import api from '@/api/axios';

gsap.registerPlugin(ScrollTrigger);

const CATEGORY_MATCHERS = ["Photography", "Media", "Photography & Media"];

// Renders a specialized card for Photography & Media exhibitions with contact-sheet/darkroom aesthetics
const MediaCard = ({ exhibition, index }) => {
    return (
        <Link to={`/exhibitions/${exhibition.id}`} className="block group relative h-full">
            {/* Contact Sheet Frame */}
            <div className="bg-black p-4 pb-12 shadow-2xl relative transition-transform duration-500 ease-out group-hover:scale-[1.02]">

                {/* Film Perforations Decoration */}
                <div className="absolute top-0 bottom-0 left-1 flex flex-col justify-between py-2 opacity-20">
                    {[...Array(8)].map((_, i) => <div key={i} className="w-1.5 h-1.5 bg-white rounded-sm" />)}
                </div>
                <div className="absolute top-0 bottom-0 right-1 flex flex-col justify-between py-2 opacity-20">
                    {[...Array(8)].map((_, i) => <div key={i} className="w-1.5 h-1.5 bg-white rounded-sm" />)}
                </div>

                {/* Main Image Container */}
                <div className="aspect-[4/5] bg-[#111] overflow-hidden relative mx-2">
                    <div className="absolute inset-0 bg-red-600/0 mix-blend-color group-hover:bg-red-600/10 transition-colors duration-500 z-10" />
                    {exhibition.coverImage ? (
                        <img
                            src={exhibition.coverImage}
                            alt={exhibition.title}
                            className="w-full h-full object-cover transition-all duration-700 ease-in-out group-hover:contrast-125"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center font-mono text-[10px] text-neutral-700 uppercase tracking-widest border border-neutral-900 m-4">
                            No Exposure
                        </div>
                    )}

                    {/* Hover Overlay Info */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
                        <div className="bg-black/80 backdrop-blur-sm px-6 py-3 border border-white/20">
                            <span className="font-mono text-xs text-white uppercase tracking-widest">View Negative</span>
                        </div>
                    </div>
                </div>

                {/* Metadata Strip */}
                <div className="mt-4 px-2 flex justify-between items-end border-t border-neutral-800 pt-3">
                    <div>
                        <h3 className="font-sans font-medium text-white text-lg leading-none mb-1 group-hover:text-red-500 transition-colors">
                            {exhibition.title}
                        </h3>
                        <p className="font-mono text-[10px] text-neutral-500 uppercase tracking-wider">
                            {exhibition.exhibitor} — {exhibition.startDate}
                        </p>
                    </div>
                    <div className="text-neutral-600">
                        {exhibition.theme === 'Photography' ? <Camera className="w-4 h-4" /> : <Film className="w-4 h-4" />}
                    </div>
                </div>

                {/* Simulated Film Number */}
                <span className="absolute bottom-2 right-4 font-mono text-[10px] text-neutral-700 font-bold opacity-50">
                    {index + 1}A
                </span>
            </div>
        </Link>
    );
};

// Renders the Photography & Media category page, featuring a darkroom-themed grid layout with filtering for still and motion media
const PhotoMediaPage = () => {
    const [exhibitions, setExhibitions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterMode, setFilterMode] = useState('ALL'); // ALL, STILL, MOTION

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
                        exhibitor: item.createdBy?.name || "Unknown Artist",
                        price: item.price || 0
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
        if (filterMode === 'STILL') return item.theme === 'Photography';
        if (filterMode === 'MOTION') return item.theme === 'Media';
        return true;
    });

    // Animations
    useEffect(() => {
        if (!loading) {
            gsap.fromTo('.reveal-text',
                { y: 50, opacity: 0 },
                { y: 0, opacity: 1, duration: 1, ease: 'power3.out', stagger: 0.1 }
            );

            gsap.fromTo('.media-card',
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out', stagger: 0.1, scrollTrigger: { trigger: '.grid-container', start: 'top 80%' } }
            );
        }
    }, [loading, filterMode]);

    return (
        <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-red-600 selection:text-white relative">
            {loading && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#050505]">
                    <Spinner className="w-8 h-8 text-white" />
                </div>
            )}
            <Navbar /> {/* Default works for dark bg */}

            {/* --- HEADER --- */}
            <header className="pt-32 pb-24 px-6 md:px-12 lg:px-24">
                <div className="max-w-7xl mx-auto flex flex-col items-center text-center">
                    <Link to="/categories" className="reveal-text inline-flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.3em] text-neutral-500 hover:text-white transition-colors mb-8">
                        <ArrowLeft className="w-3 h-3" /> Darkroom Index
                    </Link>

                    <h1 className="reveal-text font-serif text-7xl md:text-9xl leading-none tracking-tighter mix-blend-exclusion mb-6">
                        Through <br /> <span className="italic font-light opacity-80">The Lens</span>
                    </h1>

                    <p className="reveal-text max-w-lg text-neutral-400 font-mono text-xs md:text-sm leading-relaxed mb-12">
                        Capturing moments in light and time. <br />
                        A collection of still photography and moving media.
                    </p>

                    {/* Filter Tabs */}
                    <div className="reveal-text inline-flex p-1 bg-neutral-900 rounded-full border border-neutral-800">
                        {['ALL', 'STILL', 'MOTION'].map((mode) => (
                            <button
                                key={mode}
                                onClick={() => setFilterMode(mode)}
                                className={`px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all duration-300 ${filterMode === mode ? "bg-white text-black" : "text-neutral-500 hover:text-white"}`}
                            >
                                {mode}
                            </button>
                        ))}
                    </div>
                </div>
            </header>

            {/* --- GALLERY --- */}
            <main className="px-4 md:px-12 pb-32 bg-[#050505]">
                <div className="max-w-8xl mx-auto grid-container">
                    {displayedExhibitions.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                            {displayedExhibitions.map((exh, index) => (
                                <div key={exh.id} className="media-card">
                                    <MediaCard exhibition={exh} index={index} />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="h-96 flex flex-col items-center justify-center border border-dashed border-neutral-800 rounded-xl">
                            <Aperture className="w-8 h-8 text-neutral-800 mb-4 animate-spin-slow" />
                            <p className="font-mono text-neutral-600 text-xs uppercase">No Exposures Found</p>
                        </div>
                    )}
                </div>
            </main>

            {/* Footer Mark */}
            <footer className="py-12 text-center border-t border-neutral-900">
                <p className="font-mono text-[10px] text-neutral-700 uppercase tracking-widest">
                    VIRTUAL GALLERY / DARKROOM
                </p>
            </footer>
        </div>
    );
};

export default PhotoMediaPage;
