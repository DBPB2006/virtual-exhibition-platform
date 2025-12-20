import React from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '@/components/common/Navbar';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import PurchaseButton from '../PurchaseButton';

// Renders the exhibition detail view for the 'Art & Fashion' category, featuring high-contrast editorial styling
const ArtFashionLayout = ({ exhibition, isOwner, hasAccess }) => (
    <div className="min-h-screen bg-neutral-950 text-neutral-200 font-sans selection:bg-white selection:text-black">
        <Navbar />
        <div className="pt-32 pb-20 px-6 md:px-12 max-w-7xl mx-auto">
            <Link to="/exhibitions/art-fashion" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-neutral-500 hover:text-white mb-12">
                <ArrowLeft className="w-4 h-4" /> Editorial Index
            </Link>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
                {/* Visual */}
                <motion.div
                    initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}
                    className="relative group lg:sticky lg:top-32"
                >
                    <div className="aspect-[3/4] overflow-hidden grayscale group-hover:grayscale-0 transition-all duration-1000 bg-neutral-900 border border-neutral-800">
                        {exhibition.coverImage ? (
                            <img src={exhibition.coverImage} alt={exhibition.title} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-neutral-700 font-mono text-xs uppercase tracking-widest">
                                No Visual Data
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* Narrative */}
                <motion.div
                    initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.2 }}
                    className="flex flex-col"
                >
                    <span className="font-mono text-xs text-neutral-500 mb-4">{exhibition.category} // SEASON 2024</span>
                    <h1 className="font-heading text-6xl md:text-8xl leading-[0.85] font-black text-white mb-8 tracking-tighter uppercase break-words">
                        {exhibition.title}
                    </h1>

                    <div className="flex items-center gap-4 text-xs font-mono uppercase tracking-widest text-neutral-400 border-y border-neutral-800 py-6 mb-8">
                        <span>By {exhibition.createdBy?.name || "The Artist"}</span>
                        <span>•</span>
                        <span>{new Date(exhibition.createdAt).getFullYear() || "2024"}</span>
                    </div>

                    <p className="text-lg md:text-xl leading-relaxed text-neutral-300 font-light mb-12">
                        {exhibition.description}
                    </p>

                    <PurchaseButton
                        isForSale={exhibition.isForSale}
                        price={exhibition.price} // This is priceINR
                        referencePrice={exhibition.referencePrice}
                        referenceCurrency={exhibition.referenceCurrency}
                        theme="art"
                        label="Acquire Work"
                        exhibitionId={exhibition._id}
                        isOwner={isOwner}
                        hasAccess={hasAccess}
                    />
                </motion.div>
            </div>
        </div>
    </div>
);

export default ArtFashionLayout;
