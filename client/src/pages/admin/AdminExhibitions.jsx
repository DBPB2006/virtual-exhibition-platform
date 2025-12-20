import React, { useEffect, useState, useRef } from 'react';
import api from '@/api/axios';
import { Spinner } from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowLeft, Check, X, Eye, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';

// Filter Tabs
const TABS = [
    { id: 'all', label: 'All' },
    { id: 'pending', label: 'Pending' },
    { id: 'approved', label: 'Approved' },
    { id: 'rejected', label: 'Rejected' },
];

// Provides an interface for administrators to moderate exhibitions, enabling approval, rejection, and detailed inspection
const AdminExhibitions = () => {
    const [exhibitions, setExhibitions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('pending');
    const containerRef = useRef(null);

    const fetchExhibitions = async () => {
        try {
            const res = await api.get('/api/admin/exhibitions');
            setExhibitions(res.data);
        } catch (err) {
            console.error("Fetch Exhibitions Error", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchExhibitions();
    }, []);

    // GSAP Animations
    useEffect(() => {
        if (!loading) {
            const ctx = gsap.context(() => {
                const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

                tl.fromTo('.editorial-title',
                    { y: 100, opacity: 0 },
                    { y: 0, opacity: 1, duration: 1.2 }
                )
                    .fromTo('.meta-data',
                        { y: 20, opacity: 0 },
                        { y: 0, opacity: 1, duration: 1 },
                        "-=0.8"
                    )
                    .fromTo('.grid-item',
                        { y: 30, opacity: 0 },
                        { y: 0, opacity: 1, duration: 0.8, stagger: 0.05 },
                        "-=0.6"
                    );

            }, containerRef);
            return () => ctx.revert();
        }
    }, [loading]);

    const handleVerify = async (id, status) => {
        if (!window.confirm(`Mark this exhibition as ${status}?`)) return;
        try {
            await api.patch(`/api/admin/exhibits/${id}/verify`, { status });
            setExhibitions(prev => prev.map(ex => ex._id === id ? { ...ex, verificationStatus: status } : ex));
        } catch (err) {
            alert("Verification failed");
        }
    };
    const filteredList = exhibitions.filter(ex => {

        if (filter === 'all') return true;
        return ex.verificationStatus === filter;
    });

    if (loading) return <div className="h-screen flex items-center justify-center"><Spinner /></div>;

    return (
        <div ref={containerRef}>
            <div className="">
                <Link to="/dashboard/admin" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-neutral-400 hover:text-black mb-12 transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back
                </Link>

                {/* Header */}
                <header className="mb-24 flex flex-col md:flex-row justify-between items-end gap-12 border-b border-black/10 pb-12">
                    <div>
                        <div className="overflow-hidden">
                            <h1 className="editorial-title text-9xl font-light tracking-tighter leading-none -ml-1">
                                Gallery.
                            </h1>
                        </div>
                        <div className="mt-6 flex items-center gap-6 meta-data text-sm font-mono uppercase tracking-widest text-neutral-500">
                            <span>MODERATION QUEUE</span>
                            <span className="w-1 h-1 bg-neutral-300 rounded-full" />
                            <span>PENDING: {exhibitions.filter(e => e.verificationStatus === 'pending').length}</span>
                        </div>
                    </div>
                </header>

                {/* Filter Tabs - Minimalist */}
                <div className="flex gap-8 mb-12 meta-data">
                    {TABS.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setFilter(tab.id)}
                            className={`text-lg font-light tracking-tight transition-colors relative ${filter === tab.id ? "text-black underline underline-offset-8 decoration-1" : "text-neutral-400 hover:text-black"
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
                    <AnimatePresence mode="popLayout">
                        {filteredList.map(exhibit => (
                            <motion.div
                                key={exhibit._id}
                                layout
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="grid-item group flex flex-col"
                            >
                                {/* Simple Image Frame */}
                                <div className="aspect-[4/3] bg-neutral-100 overflow-hidden mb-6 relative">
                                    {exhibit.coverImage ? (
                                        <img src={exhibit.coverImage} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" alt="Cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-neutral-400 text-xs uppercase font-mono">No Image</div>
                                    )}
                                    {exhibit.verificationStatus === 'pending' && (
                                        <div className="absolute top-0 left-0 bg-black text-white px-3 py-1 text-[10px] font-bold uppercase tracking-widest">
                                            Review
                                        </div>
                                    )}
                                    <div className="absolute top-0 right-0 bg-white/90 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-neutral-500">
                                        {exhibit.category}
                                    </div>
                                </div>

                                {/* Minimal Text Details */}
                                <div className="flex-1 flex flex-col">
                                    <h3 className="text-2xl font-light leading-none mb-2">{exhibit.title}</h3>
                                    <p className="text-xs font-mono uppercase text-neutral-400 mb-6">By {exhibit.createdBy?.name || "Unknown"}</p>

                                    {/* Actions */}
                                    <div className="mt-auto border-t border-black/10 pt-4 flex items-center justify-between">
                                        {exhibit.verificationStatus === 'pending' ? (
                                            <div className="flex gap-4">
                                                <button
                                                    onClick={() => handleVerify(exhibit._id, 'approved')}
                                                    className="text-[10px] font-bold uppercase tracking-widest text-black hover:underline"
                                                >
                                                    Approve
                                                </button>
                                                <button
                                                    onClick={() => handleVerify(exhibit._id, 'rejected')}
                                                    className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 hover:text-black hover:underline"
                                                >
                                                    Reject
                                                </button>
                                            </div>
                                        ) : (
                                            <span className={`text-[10px] font-bold uppercase tracking-widest ${exhibit.verificationStatus === 'approved' ? 'text-black' : 'text-neutral-400 line-through'}`}>
                                                {exhibit.verificationStatus}
                                            </span>
                                        )}

                                        <Link to={`/exhibitions/${exhibit._id}`} target="_blank" className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 hover:text-black hover:underline">
                                            Inspect
                                        </Link>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                {filteredList.length === 0 && (
                    <div className="py-24 text-center text-neutral-300 font-light text-xl">
                        Empty Collection.
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminExhibitions;
