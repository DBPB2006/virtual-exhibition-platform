import React, { useState, useEffect, useRef } from 'react';
import { Navbar } from '@/components/common/Navbar';
import { Spinner } from '@/components/ui/spinner';
import CategoryCard from '@/components/CategoryCard';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Grouping and Descriptions Configuration
const CATEGORY_CONFIG = {
    "Art & Fashion": {
        matcher: ["Art", "Fashion", "Art & Fashion"],
        description: "Explore the intersection of contemporary artistry and timeless style through our curated collections."
    },
    "Historic & Antique": {
        matcher: ["Historic", "Antique", "Historic & Antique"],
        description: "Journey through time with artifacts and exhibitions that preserve the stories of the past."
    },
    "Science & Technology": {
        matcher: ["Science", "Technology", "Science & Technology"],
        description: "Discover the innovations shaping our future and the scientific principles behind them."
    },
    "Culture & Heritage": {
        matcher: ["Culture", "Heritage", "Culture & Heritage"],
        description: "Immerse yourself in the rich tapestry of global traditions, customs, and shared histories."
    },
    "Photography & Media": {
        matcher: ["Photography", "Media", "Photography & Media"],
        description: "Experience the world through the lens of visionary photographers and digital creators."
    },
    "Architecture & Design": {
        matcher: ["Architecture", "Design", "Architecture & Design"],
        description: "Appreciate the structural beauty and functional elegance of iconic architectural marvels."
    }
};

// Renders the categories overview page, displaying curated collections grouped by category with animations
const CategoriesOverview = () => {
    const [exhibitions, setExhibitions] = useState([]);
    const [loading, setLoading] = useState(true);
    const containerRef = useRef(null);
    const headerRef = useRef(null);

    // Fetch Data
    useEffect(() => {
        const fetchExhibitions = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/exhibitions`);

                if (response.ok) {
                    const data = await response.json();
                    setExhibitions(data);
                }
            } catch (error) {
                console.error("Failed to fetch exhibitions", error);
            } finally {
                setLoading(false);
            }
        };

        fetchExhibitions();
    }, []);

    // Animations
    useEffect(() => {
        if (!loading) {
            const ctx = gsap.context(() => {
                // Header Animation: Staggered reveal for impact
                const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

                tl.fromTo('.hero-title-line',
                    { y: 100, opacity: 0 },
                    { y: 0, opacity: 1, duration: 1.2, stagger: 0.15 }
                )
                    .fromTo('.hero-subtitle',
                        { y: 20, opacity: 0 },
                        { y: 0, opacity: 1, duration: 1 },
                        "-=0.6"
                    )
                    .fromTo('.category-card',
                        { y: 60, opacity: 0 },
                        {
                            y: 0,
                            opacity: 1,
                            duration: 1,
                            stagger: 0.1,
                            ease: 'power4.out'
                        },
                        "-=0.4"
                    );

                // ScrollTrigger for Mission Section
                gsap.fromTo('.mission-section',
                    { y: 50, opacity: 0 },
                    {
                        y: 0,
                        opacity: 1,
                        duration: 1,
                        ease: 'power2.out',
                        scrollTrigger: {
                            trigger: '.mission-section',
                            start: 'top 80%',
                        }
                    }
                );

                // ScrollTrigger for Newsletter Section
                gsap.fromTo('.newsletter-section',
                    { y: 50, opacity: 0 },
                    {
                        y: 0,
                        opacity: 1,
                        duration: 1,
                        ease: 'power2.out',
                        scrollTrigger: {
                            trigger: '.newsletter-section',
                            start: 'top 85%',
                        }
                    }
                );

            }, containerRef);

            return () => ctx.revert();
        }
    }, [loading]);

    // Data Processing
    const getCategoryData = (key) => {
        const config = CATEGORY_CONFIG[key];
        const matchers = config.matcher;

        // Filter exhibitions belonging to this group
        const groupExhibitions = exhibitions.filter(exh => matchers.includes(exh.category));

        return {
            description: config.description,
            exhibitions: groupExhibitions,
            count: groupExhibitions.length
        };
    };

    return (
        <div className="min-h-screen bg-white text-black font-sans" ref={containerRef}>
            {loading && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-white">
                    <Spinner className="w-8 h-8 text-black" />
                </div>
            )}
            <Navbar forceDark={true} />

            <main className="pt-40 pb-32 px-6 max-w-[1400px] mx-auto">
                {/* Hero Section - Premium & Impactful */}
                <header ref={headerRef} className="mb-24 lg:mb-32">
                    <div className="overflow-hidden">
                        <h1 className="hero-title-line text-6xl md:text-8xl lg:text-9xl font-light tracking-tighter leading-none mb-2">
                            Curated
                        </h1>
                    </div>
                    <div className="overflow-hidden">
                        <h1 className="hero-title-line text-6xl md:text-8xl lg:text-9xl font-light tracking-tighter leading-none mb-8 text-neutral-400">
                            Collections.
                        </h1>
                    </div>

                    <p className="hero-subtitle text-lg md:text-xl text-neutral-500 max-w-xl leading-relaxed font-light mt-8">
                        Explore our selection of virtual exhibitions. From classical heritage to modern digital art, discover the categories that define our platform.
                    </p>
                </header>

                {/* Grid - Spacious and Clean */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12 lg:gap-y-16 mb-40">
                    {Object.keys(CATEGORY_CONFIG).map((categoryName) => {
                        const { description, exhibitions, count } = getCategoryData(categoryName);
                        return (
                            <div key={categoryName} className="category-card opacity-0">
                                <CategoryCard
                                    category={categoryName}
                                    description={description}
                                    exhibitions={exhibitions}
                                    count={count}
                                />
                            </div>
                        );
                    })}
                </div>

                {/* New Content: Curatorial Mission Statement */}
                <section className="mission-section mb-40 border-t border-gray-100 pt-24 opacity-0 max-w-4xl mx-auto text-center">
                    <span className="text-xs font-bold tracking-[0.2em] text-neutral-400 uppercase mb-8 block">
                        Our Philosophy
                    </span>
                    <h2 className="text-3xl md:text-5xl font-light leading-tight mb-8">
                        "We believe that art is not just seen, but experienced. Our mission is to bridge the gap between the physical and digital, preserving culture for future generations."
                    </h2>
                    <p className="text-neutral-500 max-w-lg mx-auto leading-relaxed">
                        Through immersive virtual environments, we bring the world's most significant collections to a global audience, free from geographical boundaries.
                    </p>
                </section>

                {/* New Content: Newsletter / Engagement */}
                <section className="newsletter-section bg-neutral-900 text-white p-12 md:p-24 opacity-0 rounded-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

                    <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
                        <div>
                            <h3 className="text-4xl font-light mb-4 tracking-tight">Stay Inspired.</h3>
                            <p className="text-neutral-400 max-w-sm">
                                Join our community of collectors, artists, and enthusiasts. Receive weekly curations directly to your inbox.
                            </p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <input
                                type="email"
                                placeholder="Enter your email"
                                className="bg-white/10 border border-white/20 p-4 text-white placeholder:text-white/30 outline-none focus:border-white transition-colors flex-1"
                            />
                            <button className="bg-white text-black px-8 py-4 font-semibold hover:bg-neutral-200 transition-colors tracking-wide uppercase text-sm">
                                Subscribe
                            </button>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default CategoriesOverview;
