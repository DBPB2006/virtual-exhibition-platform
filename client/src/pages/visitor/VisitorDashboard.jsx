import React, { useState, useEffect } from 'react';
import api from '@/api/axios';
import { useSelector } from 'react-redux';
import { Spinner } from '@/components/ui/spinner';
import { Package, Calendar, CreditCard, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

// Renders the visitor's personal dashboard, displaying their purchased exhibition collection and order history
const VisitorDashboard = () => {
    const { user } = useSelector((state) => state.auth);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await api.get('/api/users/purchases');
                setOrders(response.data);
            } catch (err) {
                console.error("Error fetching purchases:", err);
                setError("Failed to load your collection.");
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchOrders();
        }
    }, [user]);

    if (loading) return (
        <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
            <Spinner className="w-8 h-8 text-black" />
        </div>
    );

    return (
        <div className="font-sans text-neutral-900">

            <div className="">
                <header className="mb-12">
                    <h1 className="text-4xl font-light mb-2">My Collection</h1>
                    <p className="text-neutral-500">Manage your acquisitions and exhibition tickets.</p>
                </header>

                {error && (
                    <div className="bg-red-50 text-red-600 p-4 rounded mb-8 border border-red-100">
                        {error}
                    </div>
                )}

                {orders.length === 0 ? (
                    <div className="text-center py-24 border-2 border-dashed border-neutral-200 rounded-lg">
                        <div className="flex justify-center mb-4 text-neutral-300">
                            <Package className="w-12 h-12" />
                        </div>
                        <h3 className="text-lg font-medium text-neutral-600 mb-2">No Acquisitions Yet</h3>
                        <p className="text-sm text-neutral-400 mb-6">Explore our curated exhibitions to start your collection.</p>
                        <Link to="/categories">
                            <button className="bg-black text-white px-6 py-3 text-sm font-bold uppercase tracking-widest hover:bg-neutral-800 transition-colors">
                                Browse Exhibitions
                            </button>
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6">
                        {orders.map((order) => (
                            <div key={order._id} className="bg-white p-6 border border-neutral-200 shadow-sm flex flex-col md:flex-row gap-6 items-start md:items-center group hover:border-neutral-300 transition-colors">
                                {/* Thumbnail */}
                                <div className="w-full md:w-32 aspect-square bg-neutral-100 shrink-0 overflow-hidden">
                                    {order.exhibitionId?.coverImage ? (
                                        <img
                                            src={order.exhibitionId.coverImage}
                                            alt={order.exhibitionId.title}
                                            className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-neutral-300 text-xs uppercase tracking-widest">
                                            No Img
                                        </div>
                                    )}
                                </div>

                                {/* Details */}
                                <div className="flex-1">
                                    <div className="flex flex-wrap items-center gap-3 text-xs font-mono uppercase tracking-widest text-neutral-400 mb-2">
                                        <span className="flex items-center gap-1">
                                            <Calendar className="w-3 h-3" />
                                            {new Date(order.createdAt).toLocaleDateString()}
                                        </span>
                                        <span className="w-1 h-1 bg-neutral-300 rounded-full" />
                                        <span>Order #{order._id.slice(-6).toUpperCase()}</span>
                                    </div>
                                    <Link to={`/exhibitions/view/${order.exhibitionId?._id}`} className="block">
                                        <h3 className="text-xl font-bold mb-1 hover:text-blue-600 transition-colors">
                                            {order.exhibitionId?.title || "Unknown Exhibition"}
                                        </h3>
                                    </Link>
                                    <p className="text-sm text-neutral-500 mb-2">
                                        by {order.exhibitorId?.name || "Unknown Exhibitor"}
                                    </p>
                                    <div className="inline-flex items-center gap-2 px-2 py-1 bg-emerald-50 text-emerald-700 text-[10px] uppercase font-bold tracking-wider rounded">
                                        <CreditCard className="w-3 h-3" /> PAID
                                    </div>
                                </div>

                                {/* Price & Actions */}
                                <div className="text-left md:text-right shrink-0">
                                    <div className="text-lg font-mono mb-4">
                                        {order.currency === 'INR' ? '₹' : order.currency} {order.amount.toLocaleString()}
                                    </div>
                                    <Link to={`/exhibitions/view/${order.exhibitionId?._id}`}>
                                        <button className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest hover:text-neutral-500 transition-colors">
                                            Enter Exhibit <ExternalLink className="w-4 h-4" />
                                        </button>
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default VisitorDashboard;
