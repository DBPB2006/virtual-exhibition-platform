import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Navbar } from '@/components/common/Navbar';
import HeroSection from '@/components/HeroSection';
import HomePresets from '@/components/home/HomePresets';
import SectionHeader from '@/components/SectionHeader';
import { ExhibitionCard } from '@/components/common/ExhibitionCard';
import { RestrictedExhibitionCard } from '@/components/common/RestrictedExhibitionCard';
import { Spinner } from '@/components/ui/spinner';
import { ThemeProvider } from '@/components/ThemeProvider';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Backend Atomic Categories
const CATEGORY_GROUPS = {
    "Art & Fashion": ["Art", "Fashion"],
    "Historic & Antique": ["Historic", "Antique"],
    "Science & Technology": ["Science", "Technology"],
    "Culture & Heritage": ["Culture", "Heritage"],
    "Photography & Media": ["Photography", "Media"],
    "Architecture & Design": ["Architecture", "Design"]
};

// Frontend Categories
const CATEGORIES = Object.keys(CATEGORY_GROUPS);

const getCategorySlug = (category) => {
    return category.toLowerCase().replace(/\s+&\s+/g, '-').replace(/\s+/g, '-');
};

// Renders the main landing page, featuring hero content, presets, and exhibition categories with filtering and scroll animations
const Home = () => {
    const navigate = useNavigate();
    const [exhibitions, setExhibitions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showOnSale, setShowOnSale] = useState(false);
    const mainRef = useRef(null);

    // Fetch Exhibitions from Backend
    useEffect(() => {
        const fetchExhibitions = async () => {
            try {
                // Remove artificial delay for smoother transitions
                const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
                const response = await fetch(`${apiUrl}/api/exhibitions`);

                if (!response.ok) {
                    throw new Error('Failed to fetch exhibitions');
                }
                const data = await response.json();
                setExhibitions(data);
            } catch (err) {
                console.error("Error loading exhibitions:", err);
                setError("Unable to load exhibitions. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        fetchExhibitions();
    }, []);

    // Scroll Animations
    useEffect(() => {
        if (!loading && !error) {
            const ctx = gsap.context(() => {
                const sections = document.querySelectorAll('section');
                sections.forEach((section) => {
                    gsap.fromTo(section,
                        { y: 50, opacity: 0 },
                        {
                            y: 0,
                            opacity: 1,
                            duration: 1,
                            ease: 'power3.out',
                            scrollTrigger: {
                                trigger: section,
                                start: 'top 80%',
                                toggleActions: 'play none none reverse'
                            }
                        }
                    );
                });
            }, mainRef);

            return () => ctx.revert();
        }
    }, [loading, error]);

    const scrollToSection = (id) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    const getFilteredExhibitions = (categorySection) => {
        const targetCategories = CATEGORY_GROUPS[categorySection] || [];

        return exhibitions.filter(item => {
            // 1. Category Match
            const matchesCategory = targetCategories.includes(item.category);

            // 2. On Sale Match
            // Schema uses 'isForSale', toggle checks if we should only show items for sale.
            const matchesSale = showOnSale ? item.isForSale : true;

            return matchesCategory && matchesSale;
        }).slice(0, 3).map(item => ({
            ...item,
            id: item._id, // Fix: Ensure 'id' exists for unique key and Link
            theme: item.category, // Map backend 'category' to 'theme' for Card usage

            // 3. Image URL Handling
            coverImage: item.coverImage
                ? (item.coverImage.startsWith('http') ? item.coverImage : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${item.coverImage}`)
                : "", // No Fallback

            // 4. Date formatting
            startDate: item.createdAt ? new Date(item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : "New",
            endDate: "Ongoing",
            exhibitor: "Virtual Gallery"
        }));
    };

    return (
        <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
            <div className="min-h-screen bg-white text-black font-sans selection:bg-black selection:text-white">
                {loading && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white">
                        <Spinner className="w-8 h-8 text-black" />
                    </div>
                )}
                <Navbar />

                <main ref={mainRef}>
                    <HeroSection />

                    {/* Featured Presets */}
                    <HomePresets />

                    {/* 5. Category Scroll Buttons */}
                    <div className="py-12 bg-gray-50 border-b border-gray-100">
                        <div className="max-w-7xl mx-auto px-6 flex flex-wrap justify-center gap-4">
                            {CATEGORIES.map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => scrollToSection(cat.toLowerCase())}
                                    className="px-8 py-3 rounded-full text-sm font-semibold tracking-wide border border-gray-300 bg-white text-neutral-900 transition-all duration-300 hover:bg-neutral-900 hover:text-white hover:border-neutral-900 hover:shadow-lg hover:-translate-y-0.5 active:scale-95"
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* 6. Global Toggle (Filter) */}
                    <div className="py-8 bg-white flex justify-center items-center gap-4">
                        <span className={`text-sm tracking-widest uppercase font-semibold transition-colors duration-300 ${!showOnSale ? "text-neutral-900" : "text-gray-400"}`}>
                            Show All
                        </span>

                        {/* Custom Toggle Switch */}
                        <button
                            onClick={() => setShowOnSale(!showOnSale)}
                            className={`w-14 h-8 rounded-full p-1 relative transition-colors duration-300 focus:outline-none ${showOnSale ? "bg-neutral-900" : "bg-gray-200"}`}
                        >
                            <div className={`w-6 h-6 rounded-full bg-white shadow-md transform transition-transform duration-300 ${showOnSale ? "translate-x-6" : "translate-x-0"}`} />
                        </button>

                        <span className={`text-sm tracking-widest uppercase font-semibold transition-colors duration-300 ${showOnSale ? "text-neutral-900" : "text-gray-400"}`}>
                            On Sale Only
                        </span>
                    </div>

                    {/* EXCLUSIVE ACCESS SECTION */}
                    <section className="py-12 bg-neutral-50 border-y border-neutral-100 mb-12">
                        <div className="max-w-7xl mx-auto px-6">
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h2 className="text-sm font-bold uppercase tracking-widest text-[#D4AF37] mb-2">Member Access</h2>
                                    <h3 className="text-2xl font-serif">Exclusive Collections</h3>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {exhibitions
                                    .filter(e => e.isForSale || e.price > 0) // Simple filter for 'Premium' content
                                    .slice(0, 3)
                                    .map((exhibition) => (
                                        <RestrictedExhibitionCard
                                            key={exhibition._id}
                                            exhibition={{
                                                ...exhibition,
                                                id: exhibition._id,
                                                coverImage: exhibition.coverImage && exhibition.coverImage.startsWith('http')
                                                    ? exhibition.coverImage
                                                    : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${exhibition.coverImage}`
                                            }}
                                        />
                                    ))}
                            </div>
                        </div>
                    </section>

                    {/* Category Sections */}
                    <div className="space-y-12 pb-24">
                        {CATEGORIES.map((category) => {
                            const items = getFilteredExhibitions(category);
                            if (items.length === 0) return null; // Hide empty sections if filtered out

                            return (
                                <section
                                    key={category}
                                    id={category.toLowerCase()}
                                    className="pt-12 px-6 mx-auto max-w-7xl scroll-mt-32"
                                >
                                    <SectionHeader
                                        title={category}
                                        linkText={`View ${category}`}
                                        onLinkClick={() => navigate(`/exhibitions/${getCategorySlug(category)}`)}
                                    />

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
                                        {items.map((exhibition, index) => (
                                            <ExhibitionCard
                                                key={exhibition.id}
                                                exhibition={exhibition}
                                                index={index}
                                            />
                                        ))}
                                    </div>
                                </section>
                            );
                        })}
                    </div>
                </main>

                {/* Simple Footer */}
                <footer className="bg-gray-50 py-12 px-6 border-t border-gray-200">
                    <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
                        <p>© 2024 VIRTUALEXHIBIT. All rights reserved.</p>
                        <div className="flex gap-6 mt-4 md:mt-0">
                            <a href="#" className="hover:text-black">Privacy</a>
                            <a href="#" className="hover:text-black">Terms</a>
                        </div>
                    </div>
                </footer>
            </div>
        </ThemeProvider>
    );
};

export default Home;
