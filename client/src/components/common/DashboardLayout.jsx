import React, { useState } from 'react';
import { Navbar } from '@/components/common/Navbar';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard,
    Users,
    ShoppingBag,
    Palette,
    Settings,
    LogOut,
    Menu,
    X,
    ChevronRight,
    User,
    Shield
} from 'lucide-react';
import { useSelector } from 'react-redux';

const SidebarLink = ({ to, icon: Icon, label, exact = false }) => (
    <NavLink
        to={to}
        end={exact}
        className={({ isActive }) => `
            flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group
            ${isActive
                ? 'bg-black text-white shadow-lg shadow-neutral-900/10'
                : 'text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900'}
        `}
    >
        <Icon className="w-5 h-5" />
        <span className="font-medium text-sm tracking-wide">{label}</span>
        <ChevronRight className={`w-4 h-4 ml-auto transition-transform ${exact ? 'opacity-100' : 'opacity-0 -translate-x-2 group-hover:translate-x-0 group-hover:opacity-50'}`} />
    </NavLink>
);

// Provides the main layout structure for authenticated dashboards, featuring a responsive sidebar and role-based navigation
const DashboardLayout = () => {
    const { user } = useSelector(state => state.auth);
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const location = useLocation();

    // Generate navigation links dynamically based on the user's role
    const getLinks = () => {
        const links = [];

        // Common
        links.push({ to: '/profile', icon: User, label: 'Profile', exact: true });

        // Admin specific routes for platform oversight
        if (user?.role === 'admin') {
            links.push({ to: '/dashboard/admin', icon: LayoutDashboard, label: 'Overview', exact: true });
            links.push({ to: '/dashboard/admin/users', icon: Users, label: 'Users' });
            links.push({ to: '/dashboard/admin/exhibitions', icon: Palette, label: 'Exhibitions' });
            links.push({ to: '/dashboard/admin/orders', icon: ShoppingBag, label: 'Orders' });
        }

        // Exhibitor specific routes for managing exhibitions
        if (user?.role === 'exhibitor') {
            links.push({ to: '/dashboard/exhibitor', icon: LayoutDashboard, label: 'Dashboard', exact: true });
            links.push({ to: '/dashboard/exhibitor/create', icon: Palette, label: 'Create New' });
            links.push({ to: '/dashboard/exhibitor/inventory', icon: Palette, label: 'Inventory' });
            links.push({ to: '/dashboard/exhibitor/sales', icon: ShoppingBag, label: 'Sales' });
        }

        // Visitor Dashboard for personal collections and history
        if (user?.role === 'visitor') {
            links.push({ to: '/dashboard/visitor', icon: LayoutDashboard, label: 'Dashboard', exact: true });
        }

        return links;
    };

    const isAdmin = user?.role === 'admin';

    return (
        <div className={`min-h-screen font-sans flex flex-col ${isAdmin
            ? 'bg-white text-black selection:bg-black selection:text-white'
            : 'bg-neutral-50 text-neutral-900 selection:bg-black selection:text-white'
            }`}>
            <Navbar forceDark={true} />

            <div className="flex flex-1 pt-20 max-w-[1600px] mx-auto w-full">

                {/* Sidebar Navigation */}
                <aside className="hidden lg:block w-72 sticky top-20 h-[calc(100vh-80px)] overflow-y-auto border-r border-neutral-200 bg-white/50 backdrop-blur-xl p-6">
                    <div className="mb-8">
                        <h2 className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-4">Menu</h2>
                        <nav className="space-y-1">
                            {getLinks().map(link => (
                                <SidebarLink key={link.to} {...link} />
                            ))}
                        </nav>
                    </div>

                    <div className="mt-auto pt-8 border-t border-neutral-100">
                        <div className="flex items-center gap-3 px-4 py-3 bg-neutral-100 rounded-xl">
                            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-xs font-bold border border-neutral-200">
                                {user?.name?.charAt(0)}
                            </div>
                            <div className="overflow-hidden">
                                <p className="text-sm font-bold truncate">{user?.name}</p>
                                <p className="text-xs text-neutral-500 truncate capitalize">{user?.role}</p>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Mobile Trigger */}
                <div className="lg:hidden fixed bottom-6 right-6 z-50">
                    <button
                        onClick={() => setIsMobileOpen(true)}
                        className="bg-black text-white p-4 rounded-full shadow-2xl"
                    >
                        <Menu className="w-6 h-6" />
                    </button>
                </div>

                {/* Mobile Sidebar Overlay */}
                <AnimatePresence>
                    {isMobileOpen && (
                        <>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setIsMobileOpen(false)}
                                className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 lg:hidden"
                            />
                            <motion.aside
                                initial={{ x: '100%' }}
                                animate={{ x: 0 }}
                                exit={{ x: '100%' }}
                                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                                className="fixed inset-y-0 right-0 w-80 bg-white z-50 p-6 shadow-2xl lg:hidden flex flex-col"
                            >
                                <div className="flex justify-between items-center mb-8">
                                    <h2 className="text-lg font-bold">Navigation</h2>
                                    <button onClick={() => setIsMobileOpen(false)} className="p-2 hover:bg-neutral-100 rounded-full">
                                        <X className="w-6 h-6" />
                                    </button>
                                </div>
                                <nav className="space-y-1">
                                    {getLinks().map(link => (
                                        <div key={link.to} onClick={() => setIsMobileOpen(false)}>
                                            <SidebarLink {...link} />
                                        </div>
                                    ))}
                                </nav>
                            </motion.aside>
                        </>
                    )}
                </AnimatePresence>


                {/* Main Content */}
                <main className="flex-1 min-w-0">
                    <div className="p-6 lg:p-12 pb-24 max-w-7xl mx-auto">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
