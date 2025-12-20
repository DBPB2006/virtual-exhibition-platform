import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { Play, Music, Image as ImageIcon, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Renders a curated list of preset exhibition samples, showcasing different media types like video, audio, and images
const PRESETS = [
    {
        id: 'p1',
        type: 'video',
        title: 'Cinematic Void',
        artist: 'System',
        category: 'Motion',
        thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=3328&auto=format&fit=crop',
        description: 'Experience the flow of time through curated motion artifacts.',
        icon: Play
    },
    {
        id: 'p2',
        type: 'audio',
        title: 'Sonic Landscapes',
        artist: 'Echo',
        category: 'Auditory',
        thumbnail: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?q=80&w=3570&auto=format&fit=crop',
        description: 'Immersive soundscapes that transcend physical boundaries.',
        icon: Music
    },
    {
        id: 'p3',
        type: 'image',
        title: 'Visual Essence',
        artist: 'Lens',
        category: 'Photography',
        thumbnail: 'https://images.unsplash.com/photo-1493863641943-9b68992a8d07?q=80&w=3558&auto=format&fit=crop',
        description: 'High-fidelity visual captures of fleeting moments.',
        icon: ImageIcon
    }
];

const HomePresets = () => {
    const sectionRef = useRef(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.fromTo('.preset-card',
                { y: 50, opacity: 0 },
                {
                    y: 0,
                    opacity: 1,
                    duration: 0.8,
                    stagger: 0.2,
                    ease: 'power3.out',
                    scrollTrigger: {
                        trigger: sectionRef.current,
                        start: 'top 80%',
                    }
                }
            );
        }, sectionRef);

        return () => ctx.revert();
    }, []);

    return (
        <section id="presets" ref={sectionRef} className="py-24 bg-neutral-950 text-white relative overflow-hidden">
            {/* Background Texture */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 mix-blend-overlay pointer-events-none" />

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
                    <div>
                        <h2 className="text-sm font-mono text-[#D4AF37] uppercase tracking-widest mb-4">Curated Samples</h2>
                        <h3 className="text-4xl md:text-5xl font-serif tracking-tight leading-none">
                            Experience the Mediums
                        </h3>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {PRESETS.map((preset) => (
                        <div key={preset.id} className="preset-card group relative cursor-pointer">
                            <div className="relative aspect-[4/5] overflow-hidden grayscale group-hover:grayscale-0 transition-all duration-700 ease-out border border-white/10 group-hover:border-[#D4AF37]/50">
                                <img
                                    src={preset.thumbnail}
                                    alt={preset.title}
                                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-1000"
                                />

                                {/* Overlay */}
                                <div className="absolute inset-0 bg-black/60 group-hover:bg-black/30 transition-colors duration-500" />

                                {/* Icon Badge */}
                                <div className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 group-hover:bg-[#D4AF37] group-hover:text-black group-hover:border-transparent transition-all duration-300">
                                    <preset.icon className="w-4 h-4" />
                                </div>

                                {/* Content */}
                                <div className="absolute bottom-0 left-0 w-full p-8 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                                    <div className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                                        <span className="w-1 h-1 rounded-full bg-[#D4AF37]" />
                                        {preset.category}
                                    </div>
                                    <h4 className="text-2xl font-sans font-light mb-2">{preset.title}</h4>
                                    <p className="text-sm text-neutral-400 font-light leading-relaxed mb-6 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100 line-clamp-2">
                                        {preset.description}
                                    </p>

                                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#D4AF37] opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-200">
                                        Preview <ArrowRight className="w-3 h-3" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default HomePresets;
