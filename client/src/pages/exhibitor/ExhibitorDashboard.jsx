import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import api from '@/api/axios';
import { Spinner } from '@/components/ui/spinner';
import gsap from 'gsap';
import {
    Plus,
    ArrowUpRight,
    Search
} from 'lucide-react';

// Displays the main exhibitor dashboard with high-level metrics (total, live, pending, drafts, value) and quick actions
const ExhibitorDashboard = () => {
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);
    const [loading, setLoading] = useState(true);
    const [exhibitions, setExhibitions] = useState([]);
    const containerRef = useRef(null);

    // Initial Data Fetch
    useEffect(() => {
        const initDashboard = async () => {
            try {
                // Fetch Exhibitions
                const exhibitRes = await api.get('/api/exhibitions/my');
                setExhibitions(exhibitRes.data);
            } catch (err) {
                console.error("Dashboard Init Error", err);
                if (err.response?.status === 401) {
                    navigate('/login');
                }
            } finally {
                setLoading(false);
            }
        };

        initDashboard();
    }, [navigate]);

    // GSAP Animations
    useEffect(() => {
        if (!loading) {
            const ctx = gsap.context(() => {
                // Header Animation
                const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

                tl.fromTo('.editorial-title',
                    { y: 100, opacity: 0 },
                    { y: 0, opacity: 1, duration: 1.2, stagger: 0.1 }
                )
                    .fromTo('.meta-data',
                        { y: 20, opacity: 0 },
                        { y: 0, opacity: 1, duration: 1 },
                        "-=0.8"
                    );

                if (document.querySelectorAll('.table-row-item').length > 0) {
                    tl.fromTo('.table-row-item',
                        { y: 30, opacity: 0 },
                        { y: 0, opacity: 1, duration: 0.8, stagger: 0.05 },
                        "-=0.6"
                    );
                }

            }, containerRef);

            return () => ctx.revert();
        }
    }, [loading]);

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <Spinner className="w-8 h-8 text-black" />
            </div>
        );
    }

    // Metric Calculations
    const totalExhibitions = exhibitions.length;
    // Live: Must be explicitly Published AND Approved
    const liveExhibitions = exhibitions.filter(e => e.status === 'published' && e.verificationStatus === 'approved');

    // Pending: Published BUT (Pending OR Undefined/Legacy)
    // Note: If verificationStatus is missing (legacy data), we treat it as Pending to be safe.
    const pendingExhibitions = exhibitions.filter(e => e.status === 'published' && (e.verificationStatus === 'pending' || !e.verificationStatus));

    // Drafts: Any exhibition in draft status (regardless of verification)
    const draftExhibitions = exhibitions.filter(e => e.status === 'draft');

    const totalValue = exhibitions
        .filter(e => e.isForSale && e.status === 'published')
        .reduce((sum, e) => sum + (e.price || 0), 0);

    // GLIMPSE HELPER
    const getGlimpse = (list) => {
        if (list.length === 0) return "—";
        return list.slice(0, 3).map(e => e.title).join(", ") + (list.length > 3 ? "..." : "");
    };

    return (
        <div ref={containerRef}>

            <div className="">

                {/* Header Section */}
                <header className="mb-24 flex flex-col md:flex-row justify-between items-end gap-12 border-b border-black/10 pb-12">
                    <div>
                        <div className="overflow-hidden">
                            <h1 className="editorial-title text-9xl font-light tracking-tighter leading-none -ml-1">
                                Studio.
                            </h1>
                        </div>
                        <div className="mt-6 flex items-center gap-6 meta-data text-sm font-mono uppercase tracking-widest text-neutral-500">
                            <span>{user?.name || "Exhibitor"}</span>
                            <span className="w-1 h-1 bg-neutral-300 rounded-full" />
                            <span>{new Date().toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</span>
                        </div>
                    </div>

                    <div className="meta-data flex gap-4">
                        <button
                            onClick={() => navigate('/dashboard/exhibitor/sales')}
                            className="px-6 py-4 bg-white border border-black text-black text-xs font-bold uppercase tracking-widest hover:bg-neutral-50 transition-colors flex items-center gap-3"
                        >
                            <ArrowUpRight className="w-4 h-4" /> View Sales
                        </button>
                        <button
                            onClick={() => navigate('/dashboard/exhibitor/create')}
                            className="px-8 py-4 bg-black text-white text-xs font-bold uppercase tracking-widest hover:bg-neutral-800 transition-colors flex items-center gap-3"
                        >
                            <Plus className="w-4 h-4" /> Create Exhibition
                        </button>
                    </div>
                </header>

                {/* Metrics Strip */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-12 mb-32">
                    <div className="meta-data">
                        <span className="block text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-2">Total</span>
                        <span className="text-4xl font-light tracking-tight">{String(totalExhibitions).padStart(2, '0')}</span>
                    </div>
                    <div className="meta-data">
                        <span className="block text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-2">Live</span>
                        <span className="text-4xl font-light tracking-tight">{String(liveExhibitions.length).padStart(2, '0')}</span>
                    </div>
                    <div className="meta-data">
                        <span className="block text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-2">Pending</span>
                        <span className="text-4xl font-light tracking-tight">{String(pendingExhibitions.length).padStart(2, '0')}</span>
                    </div>
                    <div className="meta-data">
                        <span className="block text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-2">Drafts</span>
                        <span className="text-4xl font-light tracking-tight">{String(draftExhibitions.length).padStart(2, '0')}</span>
                    </div>
                    <div className="meta-data">
                        <span className="block text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-2">Value</span>
                        <span className="text-4xl font-light tracking-tight">₹{totalValue.toLocaleString()}</span>
                    </div>
                </div>

                {/* Exhibition List */}
                <div className="w-full">
                    <div className="flex border-b border-black text-xs font-bold uppercase tracking-widest pb-4 mb-4">
                        <div className="w-1/3">Exhibition</div>
                        <div className="w-1/6">Status</div>
                        <div className="w-1/6">Price</div>
                        <div className="w-1/6 text-right">Created</div>
                    </div>

                    <div className="space-y-4">
                        {exhibitions.length === 0 ? (
                            <div className="text-center py-12 text-neutral-400 font-mono text-sm">
                                NO EXHIBITIONS FOUND
                            </div>
                        ) : (
                            exhibitions.map((ex) => (
                                <div key={ex._id} className="table-row-item flex items-center py-6 border-b border-neutral-100 hover:bg-neutral-50 transition-colors -mx-4 px-4">
                                    <div className="w-1/3 flex items-center gap-6">
                                        <div className="h-16 w-12 bg-neutral-100 overflow-hidden relative">
                                            {ex.coverImage && (
                                                <img src={ex.coverImage} alt="" className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all" />
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-light leading-none mb-1">{ex.title}</h3>
                                            <span className="text-[10px] font-mono text-neutral-400 uppercase">{ex.category}</span>
                                        </div>
                                    </div>
                                    <div className="w-1/6">
                                        <span
                                            className={`
                                                relative inline-flex items-center h-5 rounded-full px-2 text-[10px] uppercase font-bold tracking-widest
                                                ${ex.status === 'published' ? 'bg-black text-white' : 'bg-neutral-200 text-neutral-500'}
                                            `}
                                        >
                                            {ex.status === 'published' ? 'Live' : 'Draft'}
                                        </span>
                                    </div>
                                    <div className="w-1/6 font-mono text-sm text-neutral-600">
                                        {ex.isForSale ? `₹${(ex.price || 0).toLocaleString()}` : 'NSFS'}
                                    </div>
                                    <div className="w-1/6 text-right font-mono text-xs text-neutral-400">
                                        {new Date(ex.createdAt).toLocaleDateString()}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>


                </div>

            </div>
        </div>
    );
};

export default ExhibitorDashboard;
