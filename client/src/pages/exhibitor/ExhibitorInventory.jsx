import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Navbar } from '@/components/common/Navbar';
import api from '@/api/axios';
import { Spinner } from '@/components/ui/spinner';
import gsap from 'gsap';
import { Search } from 'lucide-react';

// Provides a comprehensive list of exhibitions for management, allowing sorting, status toggling, and deletion
const ExhibitorInventory = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [exhibitions, setExhibitions] = useState([]);
    const containerRef = useRef(null);

    // Initial Data Fetch
    useEffect(() => {
        const initInventory = async () => {
            try {
                // Fetch Exhibitions
                const exhibitRes = await api.get('/api/exhibitions/my');
                setExhibitions(exhibitRes.data);
            } catch (err) {
                console.error("Inventory Init Error", err);
            } finally {
                setLoading(false);
            }
        };

        initInventory();
    }, [navigate]);

    // GSAP Animations
    useEffect(() => {
        if (!loading) {
            const ctx = gsap.context(() => {
                gsap.fromTo('.editorial-title',
                    { y: 50, opacity: 0 },
                    { y: 0, opacity: 1, duration: 1, ease: 'power3.out' }
                );

                if (document.querySelectorAll('.category-group').length > 0) {
                    gsap.fromTo('.category-group',
                        { y: 30, opacity: 0 },
                        { y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: 'power3.out' },
                        "-=0.5"
                    );
                }
            }, containerRef);
            return () => ctx.revert();
        }
    }, [loading]);

    // TOGGLE STATUS HANDLER
    const handleStatusToggle = async (id, currentStatus) => {
        const newStatus = currentStatus === 'draft' ? 'published' : 'draft';
        const previousExhibitions = [...exhibitions];

        setExhibitions(prev => prev.map(ex =>
            ex._id === id ? { ...ex, status: newStatus } : ex
        ));

        try {
            await api.put(`/api/exhibitions/${id}`,
                { status: newStatus }
            );
        } catch (err) {
            console.error("Status toggle failed", err);
            setExhibitions(previousExhibitions); // Revert
            alert("Failed to update status.");
        }
    };

    // DELETE HANDLER
    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this exhibition? This cannot be undone.")) {
            return;
        }

        try {
            await api.delete(`/api/exhibitions/${id}`);
            setExhibitions(prev => prev.filter(ex => ex._id !== id));
        } catch (err) {
            console.error("Delete failed", err);
            alert("Failed to delete exhibition.");
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <Spinner className="w-8 h-8 text-black" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white text-black font-sans selection:bg-black selection:text-white" ref={containerRef}>
            <main className="pt-40 pb-32 px-6 max-w-[1400px] mx-auto">
                <header className="mb-16 flex justify-between items-end border-b border-black/10 pb-8">
                    <div>
                        <h1 className="editorial-title text-6xl md:text-8xl font-light tracking-tighter leading-none -ml-1 mb-4">
                            Inventory.
                        </h1>
                        <p className="text-neutral-500 font-mono uppercase tracking-widest text-sm">
                            Manage your collection
                        </p>
                    </div>
                </header>

                <div className="flex justify-between items-center mb-12">
                    <span className="text-sm font-bold uppercase tracking-widest text-neutral-400">
                        {exhibitions.length} Items Found
                    </span>
                    <div className="flex items-center gap-2 text-neutral-400 hover:text-black transition-colors cursor-pointer">
                        <Search className="w-4 h-4" />
                        <span className="text-xs font-bold uppercase tracking-widest">Filter</span>
                    </div>
                </div>

                <div className="space-y-24">
                    {exhibitions.length > 0 ? (
                        Object.entries(
                            exhibitions.reduce((groups, exhibition) => {
                                const category = exhibition.category || 'Uncategorized';
                                if (!groups[category]) {
                                    groups[category] = [];
                                }
                                groups[category].push(exhibition);
                                return groups;
                            }, {})
                        ).map(([category, categoryExhibitions]) => (
                            <div key={category} className="category-group">
                                <div className="border-b border-black md:border-none mb-6 md:mb-0">
                                    <h3 className="text-3xl font-light mb-6 text-neutral-900">{category}</h3>
                                </div>

                                <div className="border-t border-black">
                                    {categoryExhibitions.map((exhibition, index) => {
                                        const isPublished = exhibition.status === 'published';
                                        return (
                                            <div key={exhibition._id} className="table-row-item group border-b border-neutral-100 hover:border-black transition-colors duration-300">
                                                <Link
                                                    to={`/exhibitions/${exhibition._id}`}
                                                    className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center py-8"
                                                >
                                                    {/* Index */}
                                                    <div className="hidden md:block md:col-span-1 text-neutral-400 text-xs font-mono">
                                                        {String(index + 1).padStart(2, '0')}
                                                    </div>

                                                    {/* Status Indicator */}
                                                    <div className="md:col-span-1">
                                                        <span
                                                            className={`inline-block w-2 h-2 rounded-full ${isPublished ? 'bg-emerald-500' : 'bg-amber-500'}`}
                                                            title={isPublished ? 'Published' : 'Draft'}
                                                        />
                                                    </div>

                                                    {/* Title */}
                                                    <div className="md:col-span-4">
                                                        <h3 className="text-2xl font-light group-hover:pl-4 transition-all duration-300 truncate pr-4">
                                                            {exhibition.title}
                                                        </h3>
                                                    </div>

                                                    {/* Dates */}
                                                    <div className="hidden md:flex md:col-span-3 flex-col justify-center text-[10px] uppercase tracking-widest font-mono text-neutral-400 group-hover:text-black transition-colors">
                                                        <div>
                                                            <span className="text-neutral-300 mr-2">C:</span>
                                                            {new Date(exhibition.createdAt).toLocaleDateString()}
                                                        </div>
                                                        <div>
                                                            <span className="text-neutral-300 mr-2">M:</span>
                                                            {new Date(exhibition.updatedAt).toLocaleDateString()}
                                                        </div>
                                                    </div>

                                                    {/* Price */}
                                                    <div className="md:col-span-1 text-right text-sm font-mono text-neutral-400 group-hover:text-black transition-colors">
                                                        {exhibition.price ? `₹${exhibition.price.toLocaleString()}` : <span className="text-xs">Free</span>}
                                                    </div>

                                                    {/* Actions */}
                                                    <div className="md:col-span-2 flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                e.stopPropagation();
                                                                handleStatusToggle(exhibition._id, exhibition.status);
                                                            }}
                                                            className={`text-xs font-bold uppercase tracking-widest transition-colors ${isPublished ? 'text-neutral-400 hover:text-amber-600' : 'text-emerald-600 hover:text-emerald-800'}`}
                                                        >
                                                            {isPublished ? 'Unpub' : 'Pub'}
                                                        </button>
                                                        <span className="text-neutral-300">|</span>
                                                        <button
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                navigate(`/dashboard/exhibitor/edit/${exhibition._id}`);
                                                            }}
                                                            className="text-xs font-bold uppercase tracking-widest text-neutral-400 hover:text-black transition-colors"
                                                        >
                                                            Edit
                                                        </button>
                                                        <span className="text-neutral-300">|</span>
                                                        <button
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                e.stopPropagation();
                                                                handleDelete(exhibition._id);
                                                            }}
                                                            className="text-xs font-bold uppercase tracking-widest text-red-500 hover:text-red-700 transition-colors"
                                                        >
                                                            Del
                                                        </button>
                                                    </div>
                                                </Link>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="py-24 text-center text-neutral-400 font-light">
                            No exhibitions found.
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default ExhibitorInventory;
