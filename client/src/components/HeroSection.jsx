import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { Button } from '@/components/ui/button';

// Renders the main landing page hero section with animated text and call-to-action buttons
const HeroSection = () => {
    const containerRef = useRef(null);
    const textRef = useRef(null);
    const ctaRef = useRef(null);

    useEffect(() => {
        const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

        tl.fromTo(
            textRef.current.children,
            { y: 50, opacity: 0 },
            { y: 0, opacity: 1, duration: 1, stagger: 0.2, delay: 0.5 }
        ).fromTo(
            ctaRef.current.children,
            { y: 20, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.8, stagger: 0.1 },
            '-=0.5'
        );
    }, []);

    return (
        <div ref={containerRef} className="relative min-h-[90vh] flex items-center px-6 overflow-hidden bg-neutral-900">
            {/* Background Image & Overlay */}
            <div className="absolute inset-0 z-0">
                <img
                    src="https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?q=80&w=2672&auto=format&fit=crop"
                    alt="Hero Background"
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.style.display = 'none'; }}
                />
                <div className="absolute inset-0 bg-neutral-900/60" /> {/* Dark translucent tone */}
            </div>

            <div className="relative z-10 mx-auto w-full max-w-7xl pt-20">
                <div ref={textRef} className="max-w-4xl space-y-6">
                    <span className="inline-block text-xs font-semibold tracking-[0.2em] text-gray-300 uppercase">
                        Curated Digital Experiences
                    </span>
                    <h1 className="text-6xl md:text-8xl font-light tracking-tight text-white leading-[1.1]">
                        Experience Art <br /> Beyond Boundaries.
                    </h1>
                    <p className="max-w-xl text-lg text-gray-200 leading-relaxed pl-1">
                        Discover immersive virtual exhibitions from top creators and museums around the world.
                        Step into the future of gallery viewing.
                    </p>
                </div>

                <div ref={ctaRef} className="mt-12 flex flex-wrap gap-4 pl-1">
                    <Button
                        size="lg"
                        onClick={() => window.location.href = '/categories'}
                        className="px-8 py-6 text-sm tracking-wide bg-white text-neutral-900 hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                    >
                        START EXPLORING
                    </Button>
                    <Button
                        size="lg"
                        onClick={() => document.getElementById('presets')?.scrollIntoView({ behavior: 'smooth' })}
                        className="px-8 py-6 text-sm tracking-wide bg-transparent text-white border border-white/30 hover:bg-white hover:text-neutral-900 hover:border-white transition-all duration-300 shadow-sm hover:shadow-lg hover:-translate-y-0.5"
                    >
                        VIEW FEATURED
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default HeroSection;
