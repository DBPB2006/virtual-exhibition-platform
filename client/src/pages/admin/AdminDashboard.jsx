import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import api from '@/api/axios';
import { Spinner } from '@/components/ui/spinner';
import gsap from 'gsap';
import {
    Users,
    LayoutGrid,
    ShoppingBag,
    TrendingUp,
    ArrowUpRight
} from 'lucide-react';

// Renders the main dashboard for administrators, displaying system-wide statistics (users, exhibitions, revenue) and providing navigation to management sections
const AdminDashboard = () => {
    const { user } = useSelector((state) => state.auth);
    const [stats, setStats] = useState({ users: 0, exhibitions: 0, orders: 0, revenue: 0 });
    const [loading, setLoading] = useState(true);
    const containerRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await api.get('/api/admin/stats');
                setStats(res.data);
            } catch (err) {
                console.error("Fetch Stats Error", err);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    // GSAP Animations (Strict Minimalist Entrances)
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

    // Format currency
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount);
    };

    return (
        <div ref={containerRef}>
            <div className="">

                {/* 1. Header Section: Pure Text, No Cards */}
                <header className="mb-24 flex flex-col md:flex-row justify-between items-end gap-12 border-b border-black/10 pb-12">
                    <div>
                        <div className="overflow-hidden">
                            <h1 className="editorial-title text-9xl font-light tracking-tighter leading-none -ml-1">
                                Admin.
                            </h1>
                        </div>
                        <div className="mt-6 flex items-center gap-6 meta-data text-sm font-mono uppercase tracking-widest text-neutral-500">
                            <span>{user?.name || "Administrator"}</span>
                            <span className="w-1 h-1 bg-neutral-300 rounded-full" />
                            <span>System Overview</span>
                        </div>
                    </div>

                    <div className="meta-data flex gap-4">
                        <button
                            onClick={() => navigate('/dashboard/admin/users')}
                            className="px-6 py-4 bg-white border border-black text-black text-xs font-bold uppercase tracking-widest hover:bg-neutral-50 transition-colors flex items-center gap-3"
                        >
                            <Users className="w-4 h-4" /> Manage Users
                        </button>
                    </div>
                </header>

                {/* 2. Metrics Strip: Simple Numbers */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-32">
                    <div className="meta-data">
                        <span className="block text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-2">Total Users</span>
                        <span className="text-4xl font-light tracking-tight">{String(stats.users).padStart(2, '0')}</span>
                    </div>
                    <div className="meta-data">
                        <span className="block text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-2">Exhibitions</span>
                        <span className="text-4xl font-light tracking-tight">{String(stats.exhibitions).padStart(2, '0')}</span>
                    </div>
                    <div className="meta-data">
                        <span className="block text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-2">Orders</span>
                        <span className="text-4xl font-light tracking-tight">{String(stats.orders).padStart(2, '0')}</span>
                    </div>
                    <div className="meta-data">
                        <span className="block text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-2">Revenue</span>
                        <span className="text-4xl font-light tracking-tight">{formatCurrency(stats.revenue)}</span>
                    </div>
                </div>

                {/* 3. Quick Actions / Context Links (Text-based, no cards) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 border-t border-black/10 pt-12">
                    <div className="meta-data group cursor-pointer" onClick={() => navigate('/dashboard/admin/users')}>
                        <h3 className="text-xl font-light mb-2 group-hover:underline underline-offset-4">Users</h3>
                        <p className="text-sm text-neutral-400 font-mono">Manage accounts & roles</p>
                    </div>
                    <div className="meta-data group cursor-pointer" onClick={() => navigate('/dashboard/admin/exhibitions')}>
                        <h3 className="text-xl font-light mb-2 group-hover:underline underline-offset-4">Gallery</h3>
                        <p className="text-sm text-neutral-400 font-mono">Moderate exhibitions</p>
                    </div>
                    <div className="meta-data group cursor-pointer" onClick={() => navigate('/dashboard/admin/orders')}>
                        <h3 className="text-xl font-light mb-2 group-hover:underline underline-offset-4">Commerce</h3>
                        <p className="text-sm text-neutral-400 font-mono">Track transactions</p>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default AdminDashboard;
