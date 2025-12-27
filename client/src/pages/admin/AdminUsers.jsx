import React, { useEffect, useState, useRef } from 'react';
import api from '@/api/axios';
import { Spinner } from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowLeft, Ban, CheckCircle, Trash2, Shield, User as UserIcon, ShieldAlert, ArrowRight, Check } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import gsap from 'gsap';

// Provides an interface for managing users, allowing administrators to update roles, change statuses, or delete accounts
const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [searchParams] = useSearchParams();
    const filter = searchParams.get('filter');
    const containerRef = useRef(null);

    const fetchUsers = async () => {
        try {
            const res = await api.get('/api/admin/users');
            setUsers(res.data);
        } catch (err) {
            console.error("Fetch Users Error", err);
        } finally {
            setLoading(false);
        }
    };

    const fetchRequests = async () => {
        try {
            const res = await api.get('/api/admin/requests');
            setRequests(res.data);
        } catch (err) {
            console.error("Fetch Requests Error", err);
        }
    };

    useEffect(() => {
        Promise.all([fetchUsers(), fetchRequests()]);
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

    const handleApproveExhibitor = async (id) => {
        if (!window.confirm("Approve this exhibitor account? They will be able to log in immediately.")) return;
        try {
            await api.patch(`/api/admin/users/${id}/approve`);
            setUsers(prev => prev.map(u => u._id === id ? { ...u, status: 'active' } : u));
            alert("Exhibitor approved.");
        } catch (err) {
            console.error(err);
            alert("Failed to approve. " + (err.response?.data?.message || ""));
        }
    };

    const handleUpdateRole = async (id, newRole) => {
        if (!window.confirm(`Are you sure you want to change this user's role to ${newRole}? They will be required to re-login.`)) return;
        try {
            await api.patch(`/api/admin/users/${id}/role`, { role: newRole });
            // Optimistic update
            setUsers(prev => prev.map(u => u._id === id ? { ...u, role: newRole } : u));
            alert("Role updated. User must re-login.");
        } catch (err) {
            console.error(err);
            alert("Failed to update role. " + (err.response?.data?.message || ""));
        }
    };

    const handleToggleStatus = async (id, currentIsActive) => {
        // currentIsActive is the CURRENT state, so we want to toggle to !currentIsActive
        const newIsActive = !currentIsActive;
        const action = newIsActive ? "Activate" : "Deactivate";

        if (!window.confirm(`${action} this user?`)) return;

        try {
            // Backend expects { isActive: boolean }
            await api.patch(`/api/admin/users/${id}/status`, { isActive: newIsActive });

            setUsers(prev => prev.map(u => u._id === id ? {
                ...u,
                isActive: newIsActive,
                isBlocked: !newIsActive // Sync legacy prop for UI if needed
            } : u));

        } catch (err) {
            console.error(err);
            alert("Failed to update status. " + (err.response?.data?.message || ""));
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Permanently delete this user? This cannot be undone.")) return;
        try {
            await api.delete(`/api/admin/users/${id}`);
            setUsers(prev => prev.filter(u => u._id !== id));
        } catch (err) {
            alert("Failed to delete user");
        }
    };

    const handleProcessRequest = async (id, status) => {
        try {
            const res = await api.patch(`/api/admin/requests/${id}/process`, { status });
            alert(res.data.message);
            // Remove from list
            setRequests(prev => prev.filter(r => r._id !== id));
            // Refresh users to see role update if approved
            if (status === 'approved') fetchUsers();
        } catch (err) {
            console.error(err);
            alert("Failed to process request");
        }
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase());

        if (filter === 'pending') {
            return matchesSearch && user.role === 'exhibitor' && user.status === 'pending';
        }

        return matchesSearch;
    });

    if (loading) return <div className="h-screen flex items-center justify-center"><Spinner /></div>;

    const exhibitorsCount = users.filter(u => u.role === 'exhibitor').length;
    const adminsCount = users.filter(u => u.role === 'admin').length;

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
                                Users.
                            </h1>
                        </div>
                        <div className="mt-6 flex items-center gap-6 meta-data text-sm font-mono uppercase tracking-widest text-neutral-500">
                            <span>TOTAL: {users.length}</span>
                            <span className="w-1 h-1 bg-neutral-300 rounded-full" />
                            <span>EXHIBITORS: {exhibitorsCount}</span>
                            <span className="w-1 h-1 bg-neutral-300 rounded-full" />
                            <span>ADMINS: {adminsCount}</span>
                        </div>
                    </div>

                    <div className="meta-data w-full md:w-auto">
                        <input
                            type="text"
                            placeholder="SEARCH DATABASE..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full md:w-64 bg-transparent border-b border-black py-2 text-xl font-light focus:outline-none placeholder:text-neutral-300"
                        />
                    </div>
                </header>

                {/* Pending Requests Section */}
                {requests.length > 0 && (
                    <div className="mb-24">
                        <h2 className="text-sm font-bold uppercase tracking-widest mb-8 flex items-center gap-2">
                            <ShieldAlert className="w-4 h-4 text-orange-500" />
                            Pending Exhibitor Requests ({requests.length})
                        </h2>
                        <div className="w-full bg-neutral-50 rounded-lg p-6 border border-neutral-100">
                            {requests.map(req => (
                                <div key={req._id} className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-black/5 pb-6 mb-6 last:border-0 last:pb-0 last:mb-0 gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-1">
                                            <h3 className="text-lg font-bold">{req.name}</h3>
                                            <span className="text-[10px] bg-black text-white px-2 py-1 uppercase tracking-widest">{req.subject}</span>
                                        </div>
                                        <p className="text-neutral-500 font-mono text-xs mb-2">{req.email}</p>
                                        <p className="text-sm text-neutral-700 italic border-l-2 border-neutral-300 pl-3">{req.message}</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => handleProcessRequest(req._id, 'approved')}
                                            className="bg-black text-white px-6 py-2 text-[10px] font-bold uppercase tracking-widest hover:bg-neutral-800 transition-colors"
                                        >
                                            Approve
                                        </button>
                                        <button
                                            onClick={() => handleProcessRequest(req._id, 'rejected')}
                                            className="border border-black text-black px-6 py-2 text-[10px] font-bold uppercase tracking-widest hover:bg-neutral-100 transition-colors"
                                        >
                                            Reject
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Minimalist Table */}
                <div className="w-full">
                    <div className="flex border-b border-black text-xs font-bold uppercase tracking-widest pb-4 mb-4">
                        <div className="w-1/3">User Identity</div>
                        <div className="w-1/6">Role</div>
                        <div className="w-1/6">Status</div>
                        <div className="w-1/3 text-right">Actions</div>
                    </div>

                    <div className="space-y-0">
                        {filteredUsers.length === 0 ? (
                            <div className="text-center py-12 text-neutral-400 font-mono text-sm">
                                NO MATCHES FOUND
                            </div>
                        ) : (
                            filteredUsers.map(user => {
                                // Backend ensures isActive is source of truth, isBlocked is legacy/sync
                                // If user.isActive is defined, use it. Else fallback to !isBlocked.
                                const isActive = user.isActive !== undefined ? user.isActive : !user.isBlocked;
                                const isExhibitor = user.role === 'exhibitor';
                                const isAdmin = user.role === 'admin';

                                return (
                                    <div key={user._id} className="table-row-item flex items-center py-6 border-b border-neutral-100 hover:bg-neutral-50 transition-colors -mx-4 px-4 group">
                                        <div className="w-1/3">
                                            <h3 className="text-xl font-light leading-none mb-1">{user.name}</h3>
                                            <span className="text-xs font-mono text-neutral-400 lowercase">{user.email}</span>
                                        </div>
                                        <div className="w-1/6">
                                            <span className={`text-[10px] uppercase font-bold tracking-widest ${isAdmin ? 'text-black' : 'text-neutral-500'}`}>
                                                {user.role}
                                            </span>
                                        </div>
                                        <div className="w-1/6">
                                            {user.status === 'pending' ? (
                                                <span className="text-[10px] uppercase font-bold tracking-widest text-yellow-600 animate-pulse">
                                                    PENDING
                                                </span>
                                            ) : (
                                                <span className={`text-[10px] uppercase font-bold tracking-widest ${isActive ? 'text-green-600' : 'text-red-600 line-through'}`}>
                                                    {isActive ? 'ACTIVE' : 'DISABLED'}
                                                </span>
                                            )}
                                        </div>
                                        <div className="w-1/3 flex justify-end gap-4 opacity-10 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                            {!isAdmin && (
                                                <>
                                                    {user.status === 'pending' && user.role === 'exhibitor' ? (
                                                        <button
                                                            onClick={() => handleApproveExhibitor(user._id)}
                                                            className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-green-600 hover:text-green-500 hover:underline"
                                                        >
                                                            <Check className="w-3 h-3" /> Approve
                                                        </button>
                                                    ) : (
                                                        <>
                                                            <button
                                                                onClick={() => handleUpdateRole(user._id, isExhibitor ? 'visitor' : 'exhibitor')}
                                                                className="text-[10px] font-bold uppercase tracking-widest hover:underline"
                                                            >
                                                                {isExhibitor ? 'Demote' : 'Promote'}
                                                            </button>
                                                            <button
                                                                onClick={() => handleToggleStatus(user._id, isActive)}
                                                                className={`text-[10px] font-bold uppercase tracking-widest hover:underline ${!isActive ? 'text-black' : 'text-neutral-500'}`}
                                                            >
                                                                {isActive ? 'Disable' : 'Enable'}
                                                            </button>
                                                        </>
                                                    )}
                                                    <button
                                                        onClick={() => handleDelete(user._id)}
                                                        className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 hover:text-black hover:underline"
                                                    >
                                                        Delete
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default AdminUsers;
