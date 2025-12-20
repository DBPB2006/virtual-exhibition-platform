import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ArrowRight, User, Bell, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Logo from '@/assets/virtual_exhibit_logo.png';
import OriginalLogo from '@/assets/original_logo.jpg';

// Renders the responsive navigation bar for Exhibitors, handling scroll effects, mobile menu, and dashboard links
export function ExhibitorNavbar({ forceDark = false }) {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const navLinks = [
        { name: "Dashboard", path: "/dashboard/exhibitor" },
        { name: "My Exhibitions", path: "/dashboard/exhibitor/inventory" },
        { name: "Create New", path: "/dashboard/exhibitor/create" },
    ];

    const shouldUseDark = isScrolled || forceDark;
    const textColorClass = shouldUseDark ? "text-neutral-900" : "text-white";
    const borderColorClass = shouldUseDark ? "border-black" : "border-white/30";

    return (
        <>
            <motion.nav
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 group hover:bg-neutral-950 ${isScrolled
                    ? "bg-white/80 backdrop-blur-md border-b border-gray-100 py-4 hover:border-neutral-950"
                    : "bg-transparent py-6"
                    }`}
            >
                <div className="container mx-auto px-6 md:px-12 flex items-center justify-between">
                    <Link to="/" className="z-50 relative flex items-center gap-3 group">
                        <div className="w-10 h-10 relative">
                            <img src={Logo} alt="Logo" className="absolute inset-0 w-full h-full object-contain transition-opacity duration-300 group-hover:opacity-0" />
                            <img src={OriginalLogo} alt="Original Logo" className="absolute inset-0 w-full h-full object-contain transition-opacity duration-300 opacity-0 group-hover:opacity-100" />
                        </div>
                        <span className={`font-heading text-xl font-bold tracking-tight transition-colors duration-300 flex items-center gap-1 group-hover:text-white ${textColorClass}`}>
                            VIRTUAL
                            <span className="font-light opacity-70 group-hover:text-gray-400 group-hover:opacity-100 transition-all duration-300">
                                EXHIBIT
                            </span>
                            <span className={`ml-2 text-[10px] uppercase tracking-widest border border-current px-2 py-0.5 rounded-full opacity-50 ${textColorClass}`}>
                                Exhibitor
                            </span>
                        </span>
                    </Link>

                    <div className="hidden md:flex items-center gap-8">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                to={link.path}
                                className={`relative text-sm font-medium tracking-wide transition-colors group-hover:text-gray-300 hover:!text-white ${shouldUseDark ? "text-black" : "text-white/90"}`}
                            >
                                {link.name}
                                <span className={`absolute -bottom-1 left-0 w-0 h-[1px] transition-all duration-300 hover:w-full group-hover:bg-white ${shouldUseDark ? "bg-neutral-900" : "bg-white"}`} />
                            </Link>
                        ))}
                    </div>

                    <div className="hidden md:flex items-center gap-6">
                        <Link to="/dashboard/exhibitor/create">
                            <Button className={`gap-2 bg-white text-black hover:bg-neutral-200 transition-colors border-none`}>
                                <PlusCircle className="w-4 h-4" /> Create
                            </Button>
                        </Link>

                        <div className={`h-6 w-[1px] ${borderColorClass} border-r group-hover:border-white/30`} />

                        <Link
                            to="/notifications"
                            className={`relative flex items-center justify-center w-8 h-8 rounded-full border border-current transition-all duration-300 hover:bg-white hover:text-black group-hover:text-white ${textColorClass}`}
                        >
                            <Bell className="w-4 h-4" />
                        </Link>

                        <Link to="/profile" className="flex items-center gap-2 group/profile text-current">
                            <div className={`w-8 h-8 rounded-full border border-current flex items-center justify-center transition-all duration-300 group-hover/profile:bg-white group-hover/profile:text-black group-hover:text-white ${textColorClass}`}>
                                <User className="w-4 h-4" />
                            </div>
                        </Link>
                    </div>

                    <button
                        onClick={() => setIsMenuOpen(true)}
                        className={`md:hidden z-50 p-2 rounded-full transition-colors duration-300 hover:bg-white/10 group-hover:text-white ${textColorClass}`}
                    >
                        <Menu className="w-6 h-6" strokeWidth={1.5} />
                    </button>
                </div>
            </motion.nav>

            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.4 }}
                        className="fixed inset-0 z-[60] bg-white flex flex-col"
                    >
                        <div className="flex items-center justify-between px-6 py-6 border-b border-gray-100">
                            <span className="font-heading text-xl font-bold tracking-tight">MENU</span>
                            <button onClick={() => setIsMenuOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                <X className="w-6 h-6" strokeWidth={1.5} />
                            </button>
                        </div>

                        <div className="flex-1 flex flex-col justify-center px-8 gap-8">
                            {navLinks.map((link, i) => (
                                <motion.div
                                    key={link.name}
                                    initial={{ y: 50, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.1 + (i * 0.1), duration: 0.5, ease: "easeOut" }}
                                >
                                    <Link to={link.path} onClick={() => setIsMenuOpen(false)} className="flex items-center justify-between group">
                                        <span className="text-4xl md:text-5xl font-light tracking-tight text-gray-400 group-hover:text-black transition-colors duration-300">
                                            {link.name}
                                        </span>
                                        <ArrowRight className="w-6 h-6 -rotate-45 group-hover:rotate-0 transition-transform duration-300 opacity-0 group-hover:opacity-100" />
                                    </Link>
                                </motion.div>
                            ))}
                        </div>

                        <div className="p-8 border-t border-gray-100 bg-gray-50 flex gap-4">
                            <Link to="/notifications" onClick={() => setIsMenuOpen(false)} className="flex-1">
                                <Button variant="outline" className="w-full py-6 text-lg">Notifications</Button>
                            </Link>
                            <Link to="/profile" onClick={() => setIsMenuOpen(false)} className="flex-1">
                                <Button className="w-full bg-black text-white hover:bg-gray-800 py-6 text-lg">My Profile</Button>
                            </Link>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
