import React from 'react';
import { Link } from 'react-router-dom';

import { useDispatch } from 'react-redux';
import { logoutUser } from '@/features/auth/authSlice';
import { LogOut, LayoutDashboard, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Logo from '@/assets/virtual_exhibit_logo.png';
import OriginalLogo from '@/assets/original_logo.jpg';

// Renders the top navigation bar for the Admin Dashboard, including dashboard links and logout functionality
export const AdminNavbar = ({ forceDark }) => {
    const dispatch = useDispatch();

    const handleLogout = () => {
        dispatch(logoutUser());
    };

    return (
        <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-black border-b border-white/10 text-white`}>
            <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">

                {/* Logo */}
                <Link to="/" className="text-2xl font-serif font-bold text-white tracking-tighter flex items-center gap-3">
                    <div className="w-8 h-8 relative group">
                        <img src={Logo} alt="Logo" className="absolute inset-0 w-full h-full object-contain transition-opacity duration-300 group-hover:opacity-0" />
                        <img src={OriginalLogo} alt="Original Logo" className="absolute inset-0 w-full h-full object-contain transition-opacity duration-300 opacity-0 group-hover:opacity-100" />
                    </div>
                    <span>VIRTUAL<span className="text-neutral-400">.ADMIN</span></span>
                </Link>

                {/* Actions */}
                <div className="flex items-center gap-6">
                    <Link to="/dashboard/admin" className="text-sm font-medium text-neutral-400 hover:text-white transition-colors flex items-center gap-2">
                        <LayoutDashboard className="w-4 h-4" /> Dashboard
                    </Link>

                    <div className="h-6 w-px bg-white/20" />

                    <Button
                        onClick={handleLogout}
                        variant="ghost"
                        className="text-neutral-400 hover:text-white hover:bg-white/10 gap-2"
                    >
                        <LogOut className="w-4 h-4" /> Logout
                    </Button>
                </div>
            </div>
        </nav>
    );
};
