import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from '@/features/auth/authSlice';
import { Spinner } from '@/components/ui/spinner';
import { motion } from 'framer-motion';
import { User, Mail, Calendar, LogOut, Shield, Crown, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ProfileField = ({ label, value, icon: Icon }) => (
    <div className="flex items-center gap-4 py-4 border-b border-neutral-100 last:border-0">
        <div className="w-10 h-10 rounded-full bg-neutral-50 flex items-center justify-center text-neutral-400">
            <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1">
            <div className="text-xs uppercase tracking-widest text-neutral-400 font-medium mb-0.5">{label}</div>
            <div className="text-neutral-900 font-medium">{value}</div>
        </div>
    </div>
);

// Renders the user profile page, allowing users to view details and access role-specific dashboards
const Profile = () => {
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);
    // const [loading, setLoading] = useState(false); // Can hook into redux loading state if needed

    const dispatch = useDispatch();

    const handleLogout = async () => {
        await dispatch(logoutUser());
        navigate('/');
    };

    if (!user) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <Spinner className="w-8 h-8 text-black" />
            </div>
        );
    }

    const roleLabel = user.role === 'admin' ? 'Administrator' : user.role === 'exhibitor' ? 'Exhibitor' : 'Visitor';
    const RoleIcon = user.role === 'admin' ? Shield : user.role === 'exhibitor' ? Crown : User;

    return (
        <div className="font-sans selection:bg-black selection:text-white">

            <div className="max-w-4xl">

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-16 text-center md:text-left"
                >
                    <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-4">
                        My Account
                    </h1>
                    <p className="text-neutral-500 text-lg">Manage your personal information and preferences.</p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">

                    {/* Left Column: Avatar & Quick Actions */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="md:col-span-1"
                    >
                        <div className="bg-neutral-50 border border-neutral-100 rounded-2xl p-8 flex flex-col items-center text-center">
                            <div className="w-32 h-32 rounded-full bg-white border-4 border-white shadow-xl mb-6 flex items-center justify-center text-5xl font-light text-neutral-300 overflow-hidden">
                                {user.picture ? (
                                    <img src={user.picture} alt={user.name} className="w-full h-full object-cover" />
                                ) : (
                                    user.name.charAt(0).toUpperCase()
                                )}
                            </div>

                            <h2 className="text-2xl font-bold mb-1">{user.name}</h2>
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-black text-white text-xs font-bold uppercase tracking-wider rounded-full mb-6">
                                <RoleIcon className="w-3 h-3" /> {roleLabel}
                            </span>

                            <Button
                                onClick={handleLogout}
                                variant="outline"
                                className="w-full border-neutral-200 hover:bg-white hover:border-red-200 hover:text-red-600 transition-colors"
                            >
                                <LogOut className="w-4 h-4 mr-2" /> Sign Out
                            </Button>
                        </div>
                    </motion.div>

                    {/* Right Column: Details & Settings */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="md:col-span-2"
                    >
                        <div className="mb-12">
                            <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
                                <span className="w-8 h-[1px] bg-black"></span>
                                Profile Details
                            </h3>
                            <div className="bg-white">
                                <ProfileField label="Full Name" value={user.name} icon={User} />
                                <ProfileField label="Email Address" value={user.email} icon={Mail} />
                                <ProfileField label="Member Since" value={user.createdAt ? new Date(user.createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' }) : "Recently Joining"} icon={Calendar} />
                            </div>
                        </div>

                        {/* Contextual Actions based on role */}
                        {user.role === 'admin' && (
                            <div>
                                <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
                                    <span className="w-8 h-[1px] bg-black"></span>
                                    Admin Access
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <Button
                                        onClick={() => navigate('/dashboard/admin')}
                                        className="h-auto py-4 flex flex-col items-center justify-center gap-2 bg-black text-white hover:bg-neutral-800"
                                    >
                                        <Shield className="w-6 h-6" />
                                        <span>Open Admin Console</span>
                                    </Button>
                                </div>
                            </div>
                        )}

                        {user.role === 'exhibitor' && (
                            <div>
                                <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
                                    <span className="w-8 h-[1px] bg-black"></span>
                                    Exhibitor Tools
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <Button
                                        onClick={() => navigate('/dashboard/exhibitor')}
                                        className="h-auto py-4 flex flex-col items-center justify-center gap-2 bg-black text-white hover:bg-neutral-800"
                                    >
                                        <Crown className="w-6 h-6" />
                                        <span>Open Exhibitor Dashboard</span>
                                    </Button>
                                    <Button
                                        onClick={() => navigate('/dashboard/exhibitor/create')}
                                        variant="outline"
                                        className="h-auto py-4 flex flex-col items-center justify-center gap-2 border-neutral-200 hover:bg-neutral-50"
                                    >
                                        <span>Create New Exhibition</span>
                                    </Button>
                                </div>
                            </div>
                        )}

                    </motion.div>

                </div>
            </div>
        </div>
    );
};

export default Profile;
