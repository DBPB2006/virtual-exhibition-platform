import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import Logo from '../../assets/loader_new.jpg';

// Displays a full-screen animated loading screen with a progress indicator and logo
const Loader = ({ isLoading }) => {
    const containerRef = useRef(null);
    const contentRef = useRef(null);
    const lineRef = useRef(null);
    const topPanelRef = useRef(null);
    const bottomPanelRef = useRef(null);
    const counterRef = useRef({ val: 0 });
    const [progress, setProgress] = useState(0);
    const [shouldExit, setShouldExit] = useState(false);
    const [isUnmounted, setIsUnmounted] = useState(false);

    // Initial counter animation to 90% - runs once on mount
    useEffect(() => {
        let ctx = gsap.context(() => {
            gsap.fromTo(counterRef.current,
                { val: 0 },
                {
                    val: 90,
                    duration: 3.5, // slightly longer to emphasize the slowdown
                    ease: 'power3.out', // pronounced slowdown near the end
                    onUpdate: () => {
                        setProgress(Math.floor(counterRef.current.val));
                    }
                }
            );
        });

        return () => ctx.revert();
    }, []);

    // Complete loader from current progress -> 100% when backend is ready
    useEffect(() => {
        if (!isLoading) {
            let ctx = gsap.context(() => {
                const remainingProgress = 100 - counterRef.current.val;
                const dynamicDuration = Math.max(0.5, (remainingProgress / 100) * 1.5);

                gsap.to(counterRef.current, {
                    val: 100,
                    duration: dynamicDuration,
                    ease: 'power2.inOut',
                    onUpdate: () => {
                        setProgress(Math.floor(counterRef.current.val));
                    },
                    onComplete: () => {
                        setShouldExit(true); // Trigger exit animation once we reach 100%
                    }
                });
            });

            return () => ctx.revert();
        }
    }, [isLoading]);

    // Dynamic text based on progress and backend state
    let statusText = 'Connecting to server...';
    if (!isLoading) {
        statusText = 'Ready!';
    } else if (progress >= 85) {
        statusText = 'Waiting for response...';
    } else if (progress > 30) {
        statusText = 'Loading assets...';
    }

    // Exit animation - runs only when shouldExit is triggered
    useEffect(() => {
        if (!shouldExit || isUnmounted) return;

        let ctx = gsap.context(() => {
            const tl = gsap.timeline({
                onComplete: () => {
                    setIsUnmounted(true);
                }
            });

            // 1. Fade out content
            tl.to(contentRef.current, {
                opacity: 0,
                scale: 0.9,
                duration: 0.5,
                ease: 'power2.inOut'
            })
                // 2. Grow the line from center (Horizontally)
                .to(lineRef.current, {
                    width: '100%',
                    opacity: 1,
                    duration: 0.8,
                    ease: 'power3.inOut'
                })
                // 3. Open the "zipper" (panels slide apart vertically)
                .to([topPanelRef.current, bottomPanelRef.current], {
                    yPercent: (i) => i === 0 ? -100 : 100,
                    duration: 1.0,
                    ease: 'power4.inOut',
                    stagger: 0
                })
                // 4. Fade out line simultaneously or just after
                .to(lineRef.current, {
                    opacity: 0,
                    duration: 0.3
                }, "-=0.8");
        });

        return () => ctx.revert();
    }, [shouldExit, isUnmounted]);

    if (isUnmounted) return null;

    return (
        <div
            ref={containerRef}
            className="fixed inset-0 z-[9999] flex items-center justify-center pointer-events-none"
        >
            {/* Top Panel Background */}
            <div
                ref={topPanelRef}
                className="absolute top-0 left-0 w-full h-1/2 bg-black pointer-events-auto"
            />

            {/* Bottom Panel Background */}
            <div
                ref={bottomPanelRef}
                className="absolute bottom-0 left-0 w-full h-1/2 bg-black pointer-events-auto"
            />

            {/* Central Line (Horizontal) */}
            <div
                ref={lineRef}
                className="absolute top-1/2 left-1/2 h-[2px] bg-white -translate-x-1/2 -translate-y-1/2 z-20"
                style={{ width: '0%' }}
            />

            {/* Content Content - Centered */}
            <div ref={contentRef} className="relative z-30 flex flex-col items-center gap-6 pointer-events-auto">
                <div className="relative w-32 h-32 md:w-48 md:h-48 overflow-hidden rounded-full border-2 border-white/10 p-2 bg-black">
                    <img
                        src={Logo}
                        alt="Virtual Exhibit Logo"
                        className="w-full h-full object-contain rounded-full"
                    />
                </div>

                <div className="flex flex-col items-center gap-2 text-white">
                    <span className="font-heading text-4xl md:text-6xl font-bold tracking-tighter">
                        VIRTUAL EXHIBIT
                    </span>
                    <div className="flex flex-col items-center gap-1 mt-4">
                        <div className="flex items-center gap-4 w-full justify-center">
                            <div className="h-[1px] w-12 bg-white/20">
                                <div
                                    className="h-full bg-white transition-all duration-100 ease-linear"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                            <span className="text-sm font-light tracking-widest w-10 text-right font-mono">
                                {progress}%
                            </span>
                        </div>
                        <span className="text-[10px] uppercase font-mono tracking-widest text-white/50 animate-pulse mt-1">
                            {statusText}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Loader;
