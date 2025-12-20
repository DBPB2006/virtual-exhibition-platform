import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import { Lock } from "lucide-react";

// Displays a locked/restricted view of an exhibition card for unauthorized users
export function RestrictedExhibitionCard({ exhibition }) {
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);

    const handleClick = () => {
        if (!user) {
            navigate('/login');
        } else {
            navigate(`/exhibitions/${exhibition.id}`);
        }
    };

    return (
        <div
            onClick={handleClick}
            className="group relative h-[450px] w-full cursor-pointer bg-neutral-900 overflow-hidden"
        >
            {/* Image Container */}
            <div className="absolute inset-0 w-full h-full">
                {exhibition.coverImage ? (
                    <motion.img
                        src={exhibition.coverImage}
                        alt={exhibition.title}
                        className="object-cover w-full h-full transition-transform duration-1000 ease-out group-hover:scale-105 opacity-80 group-hover:opacity-60"
                    />
                ) : (
                    <div className="w-full h-full bg-neutral-900" />
                )}

                {/* Heavy Overlay for "Restricted" feel */}
                <div className="absolute inset-0 bg-black/60 group-hover:bg-black/40 transition-colors duration-500" />
            </div>

            {/* Content */}
            <div className="absolute bottom-0 left-0 w-full p-8 z-10 text-white">
                <div className="flex items-center gap-2 mb-4">
                    <span className="px-3 py-1 bg-[#D4AF37] text-black text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                        <Lock className="w-3 h-3" /> Exclusive
                    </span>
                </div>

                <h3 className="font-serif text-3xl leading-none mb-2">
                    {exhibition.title}
                </h3>

                <p className="text-xs font-mono text-neutral-400 uppercase tracking-widest mb-12">
                    Members Only Access
                </p>

                {/* Hover Reveal Action */}
                <div className="absolute bottom-8 right-8 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-2 group-hover:translate-y-0 text-xs font-bold uppercase tracking-widest text-[#D4AF37]">
                    {user ? "Enter Vault" : "Login to Access"}
                </div>
            </div>
        </div>
    );
}
