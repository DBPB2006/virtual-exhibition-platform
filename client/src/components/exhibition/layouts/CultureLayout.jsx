import React from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '@/components/common/Navbar';
import { ArrowLeft } from 'lucide-react';
import PurchaseButton from '../PurchaseButton';

// Renders the exhibition detail view for the 'Culture & Heritage' category, featuring earthy tones and texture overlays
const CultureLayout = ({ exhibition, isOwner, hasAccess }) => (
    <div className="min-h-screen bg-[#1C1917] text-[#D6D3D1] font-sans relative">
        <Navbar forceDark={false} />

        {/* Background Texture */}
        <div className="absolute inset-0 opacity-20 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/black-scales.png')]" />

        <div className="relative z-10 pt-32 pb-24 px-8 md:px-16 max-w-7xl mx-auto">
            <Link to="/exhibitions/culture-heritage" className="inline-flex items-center gap-2 text-xs font-serif italic text-orange-400 hover:text-orange-300 mb-12">
                <ArrowLeft className="w-3 h-3" /> Cultural Archives
            </Link>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

                {/* Image Section */}
                <div className="relative group">
                    <div className="absolute -inset-4 bg-gradient-to-tr from-orange-900/20 to-stone-800/20 blur-xl opacity-70 group-hover:opacity-100 transition-opacity duration-700" />
                    <div className="relative bg-[#292524] p-2 border border-[#44403C] shadow-2xl">
                        <div className="aspect-[3/4] overflow-hidden grayscale-[20%] group-hover:grayscale-0 transition-all duration-700">
                            {exhibition.coverImage ? (
                                <img src={exhibition.coverImage} alt={exhibition.title} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-[#1C1917] text-[#57534E] font-serif italic">
                                    [ Artifact Visual Missing ]
                                </div>
                            )}
                        </div>
                    </div>
                    {/* Decorative Corner Borders */}
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-orange-700/50 -translate-x-2 -translate-y-2" />
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-orange-700/50 translate-x-2 translate-y-2" />
                </div>

                {/* Content Section */}
                <div>
                    <div className="flex items-center gap-4 mb-6">
                        <span className="px-3 py-1 border border-orange-900/50 text-orange-500 text-[10px] uppercase tracking-widest bg-orange-900/10 rounded-full">
                            HERITAGE PRESERVATION
                        </span>
                        <span className="text-stone-500 text-xs font-mono uppercase">
                            Ref: {exhibition._id.slice(-6).toUpperCase()}
                        </span>
                    </div>

                    <h1 className="font-serif text-5xl md:text-7xl text-[#FAFAF9] leading-tight mb-8">
                        {exhibition.title}
                    </h1>

                    <div className="h-px w-24 bg-orange-800/50 mb-8" />

                    <p className="font-sans text-lg leading-relaxed text-[#A8A29E] mb-10 font-light">
                        {exhibition.description}
                    </p>

                    <div className="bg-[#292524]/50 border border-[#44403C] p-8 rounded-lg">
                        <div className="flex justify-between items-end mb-6">
                            <div>
                                <span className="block text-xs uppercase text-stone-500 mb-1">Curated By</span>
                                <span className="text-white font-serif italic">{exhibition.createdBy?.name || "Global Curator"}</span>
                            </div>
                            <div className="text-right">
                                <span className="block text-xs uppercase text-stone-500 mb-1">Era / Date</span>
                                <span className="text-white font-mono">{new Date(exhibition.createdAt).getFullYear()}</span>
                            </div>
                        </div>

                        <PurchaseButton
                            isForSale={exhibition.isForSale}
                            price={exhibition.price}
                            referencePrice={exhibition.referencePrice}
                            referenceCurrency={exhibition.referenceCurrency}
                            theme="historic" // Reuse historic button style but modified if needed, or pass new theme
                            label="Acquire Heritage Piece"
                            exhibitionId={exhibition._id}
                            isOwner={isOwner}
                            hasAccess={hasAccess}
                        />
                    </div>
                </div>
            </div>
        </div>
    </div>
);

export default CultureLayout;
