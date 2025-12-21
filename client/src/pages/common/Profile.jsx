import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser, setCredentials } from '@/features/auth/authSlice';
import { Spinner } from '@/components/ui/spinner';
import { motion } from 'framer-motion';
import { User, Mail, Calendar, LogOut, Shield, Crown, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import api from '@/api/axios';

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
    const dispatch = useDispatch();

    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({
        name: '',
        profilePicture: null,
        preview: ''
    });
    const [saving, setSaving] = useState(false);

    // Initialize form when editing starts
    const startEditing = () => {
        setEditForm({
            name: user.name,
            profilePicture: null,
            preview: user.picture || ''
        });
        setIsEditing(true);
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setEditForm(prev => ({
                ...prev,
                profilePicture: file,
                preview: URL.createObjectURL(file)
            }));
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const formData = new FormData();
            formData.append('name', editForm.name);
            if (editForm.profilePicture) {
                formData.append('profilePicture', editForm.profilePicture);
            }

            const res = await api.put('/api/users/me', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            // Update Redux
            dispatch(setCredentials({ user: res.data.user }));
            setIsEditing(false);
        } catch (err) {
            console.error("Profile Update Error", err);
            alert("Failed to update profile.");
        } finally {
            setSaving(false);
        }
    };

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

                            {/* Avatar Display / Edit */}
                            {isEditing ? (
                                <div className="mb-6 flex flex-col items-center gap-4">
                                    <label className="relative cursor-pointer group">
                                        <div className="w-32 h-32 rounded-full bg-white border-4 border-white shadow-xl overflow-hidden">
                                            {editForm.preview ? (
                                                <img src={editForm.preview} alt="Profile" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full bg-neutral-100 flex items-center justify-center text-neutral-300 text-4xl">
                                                    {user.name.charAt(0)}
                                                </div>
                                            )}
                                            {/* Overlay */}
                                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <span className="text-white text-xs uppercase font-bold tracking-widest">Change</span>
                                            </div>
                                        </div>
                                        <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                                    </label>
                                </div>
                            ) : (
                                <div className="w-32 h-32 rounded-full bg-white border-4 border-white shadow-xl mb-6 flex items-center justify-center text-5xl font-light text-neutral-300 overflow-hidden">
                                    {user.picture ? (
                                        <img src={user.picture} alt={user.name} className="w-full h-full object-cover" />
                                    ) : (
                                        user.name.charAt(0).toUpperCase()
                                    )}
                                </div>
                            )}

                            {isEditing ? (
                                <div className="w-full space-y-2 mb-6">
                                    <input
                                        type="text"
                                        value={editForm.name}
                                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                        className="w-full text-center font-bold text-xl border-b border-neutral-300 pb-1 focus:outline-none focus:border-black bg-transparent"
                                        placeholder="Your Name"
                                    />
                                </div>
                            ) : (
                                <h2 className="text-2xl font-bold mb-1">{user.name}</h2>
                            )}

                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-black text-white text-xs font-bold uppercase tracking-wider rounded-full mb-6">
                                <RoleIcon className="w-3 h-3" /> {roleLabel}
                            </span>

                            {isEditing ? (
                                <div className="flex gap-2 w-full">
                                    <Button onClick={() => setIsEditing(false)} variant="outline" className="flex-1 text-xs" disabled={saving}>Cancel</Button>
                                    <Button onClick={handleSave} className="flex-1 text-xs" disabled={saving}>
                                        {saving ? <Spinner className="w-3 h-3" /> : "Save"}
                                    </Button>
                                </div>
                            ) : (
                                <div className="w-full space-y-3">
                                    <Button
                                        onClick={startEditing}
                                        className="w-full bg-neutral-900 text-white hover:bg-black"
                                    >
                                        Edit Profile
                                    </Button>
                                    <Button
                                        onClick={handleLogout}
                                        variant="outline"
                                        className="w-full border-neutral-200 hover:bg-white hover:border-red-200 hover:text-red-600 transition-colors"
                                    >
                                        <LogOut className="w-4 h-4 mr-2" /> Sign Out
                                    </Button>
                                </div>
                            )}
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
