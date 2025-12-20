import React, { useEffect, useState, useRef } from 'react';
import api from '@/api/axios';
import { Spinner } from '@/components/ui/spinner';
import { Link } from 'react-router-dom';
import { ArrowLeft, ShoppingBag } from 'lucide-react';
import gsap from 'gsap';

// Displays a list of all purchase orders, allowing administrators to track revenue and transaction history
const AdminOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const containerRef = useRef(null);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const res = await api.get('/api/admin/orders');
                setOrders(res.data);
            } catch (err) {
                console.error("Fetch Orders Error", err);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
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
                    .fromTo('.table-row-item',
                        { y: 20, opacity: 0 },
                        { y: 0, opacity: 1, duration: 0.5, stagger: 0.05 },
                        "-=0.5"
                    );

            }, containerRef);
            return () => ctx.revert();
        }
    }, [loading]);

    if (loading) return <div className="h-screen flex items-center justify-center"><Spinner /></div>;

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
                <Link to="/dashboard/admin" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-neutral-400 hover:text-black mb-12 transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back
                </Link>

                {/* Header */}
                <header className="mb-24 flex flex-col md:flex-row justify-between items-end gap-12 border-b border-black/10 pb-12">
                    <div>
                        <div className="overflow-hidden">
                            <h1 className="editorial-title text-9xl font-light tracking-tighter leading-none -ml-1">
                                Orders.
                            </h1>
                        </div>
                        <div className="mt-6 flex items-center gap-6 meta-data text-sm font-mono uppercase tracking-widest text-neutral-500">
                            <span>TRANSACTION LEDGER</span>
                            <span className="w-1 h-1 bg-neutral-300 rounded-full" />
                            <span>NET VOLUME: {orders.length}</span>
                        </div>
                    </div>
                </header>

                {/* Minimalist Table */}
                <div className="w-full">
                    <div className="flex border-b border-black text-xs font-bold uppercase tracking-widest pb-4 mb-4">
                        <div className="w-1/4">Order ID</div>
                        <div className="w-1/4">Customer</div>
                        <div className="w-1/4">Date</div>
                        <div className="w-1/4 text-right">Amount</div>
                    </div>

                    <div className="space-y-0">
                        {orders.length === 0 ? (
                            <div className="text-center py-12 text-neutral-400 font-mono text-sm">
                                NO RECORDS FOUND
                            </div>
                        ) : (
                            orders.map(order => (
                                <div key={order._id} className="table-row-item flex items-center py-6 border-b border-neutral-100 hover:bg-neutral-50 transition-colors -mx-4 px-4">
                                    <div className="w-1/4 font-mono text-sm text-neutral-400">
                                        #{order._id.slice(-6).toUpperCase()}
                                    </div>
                                    <div className="w-1/4">
                                        <div className="font-medium text-lg font-light leading-none mb-1">{order.user?.name || "Guest"}</div>
                                        <div className="text-xs text-neutral-400 font-mono lowercase">{order.user?.email}</div>
                                    </div>
                                    <div className="w-1/4 font-mono text-sm text-neutral-500">
                                        {new Date(order.createdAt).toLocaleDateString()}
                                    </div>
                                    <div className="w-1/4 text-right font-mono text-lg text-black">
                                        {formatCurrency(order.amount)}
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

export default AdminOrders;
