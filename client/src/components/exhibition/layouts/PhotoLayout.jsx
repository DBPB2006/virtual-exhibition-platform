import React from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '@/components/common/Navbar';
import { ArrowLeft } from 'lucide-react';
import PurchaseButton from '../PurchaseButton';

// Renders the exhibition detail view for the 'Photography & Media' category, featuring a darkroom-inspired dark mode layout
const PhotoLayout = ({ exhibition, isOwner, hasAccess }) => (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-red-600">
        <Navbar />

        <div className="h-[80vh] w-full relative group">
            {/* Back Button Overlay */}
            <div className="absolute top-32 left-8 z-30">
                <Link to="/exhibitions/photography-media" className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-white/50 hover:text-white">
                    <ArrowLeft className="w-3 h-3" /> Darkroom
                </Link>
            </div>

            <div className="absolute inset-0 bg-[#000]">
                {exhibition.coverImage && (
                    <img src={exhibition.coverImage} className="w-full h-full object-contain opacity-50" alt="Full Frame" />
                )}
            </div>

            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/80 to-transparent pt-32 pb-12 px-8">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-end justify-between gap-8">
                    <div>
                        <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-4">{exhibition.title}</h1>
                        <div className="flex items-center gap-4 font-mono text-xs text-neutral-400">
                            <span className="bg-red-900/30 text-red-500 px-2 py-1 border border-red-900/50 rounded uppercase">Risk Factor: Low</span>
                            <span>ISO 400</span>
                            <span>f/2.8</span>
                        </div>
                    </div>
                    <div className="max-w-md text-sm text-neutral-400 font-mono leading-relaxed">
                        {exhibition.description}
                    </div>
                </div>
            </div>
        </div>

        <div className="bg-[#050505] py-24 px-8 border-t border-neutral-900">
            <div className="max-w-3xl mx-auto text-center">
                <PurchaseButton
                    isForSale={exhibition.isForSale}
                    price={exhibition.price}
                    referencePrice={exhibition.referencePrice}
                    referenceCurrency={exhibition.referenceCurrency}
                    theme="darkroom"
                    label="Acquire Print Rights"
                    exhibitionId={exhibition._id}
                    isOwner={isOwner}
                    hasAccess={hasAccess}
                />
            </div>
        </div>
    </div>
);

export default PhotoLayout;
