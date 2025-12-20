import React from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '@/components/common/Navbar';
import { ArrowLeft, Box } from 'lucide-react';
import { motion } from 'framer-motion';
import PurchaseButton from '../PurchaseButton';

// Renders the exhibition detail view for the 'Historic & Antique' category, featuring gold accents and classical styling
const HistoricLayout = ({ exhibition, isOwner, hasAccess }) => (
    <div className="min-h-screen bg-[#080808] text-[#EFE6D8] font-sans relative overflow-hidden selection:bg-[#D4AF37] selection:text-black">
        <div className="absolute inset-0 pointer-events-none z-0">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(20,20,30,0.4)_0%,transparent_70%)] opacity-50" />
        </div>
        <Navbar forceDark={true} />

        <div className="relative z-10 pt-32 pb-24 px-6 md:px-24">
            <Link to="/exhibitions/historic-antique" className="inline-flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.2em] text-[#888] hover:text-[#D4AF37] mb-12 transition-colors">
                <ArrowLeft className="w-3 h-3" /> Return to Vault
            </Link>

            <div className="flex flex-col lg:flex-row gap-16 lg:gap-32 items-start">

                {/* Visual Section - Shared Element */}
                <div className="w-full lg:w-5/12 perspective-1000">
                    <motion.div
                        layoutId={`exhibit-image-${exhibition._id}`}
                        className="relative aspect-[3/4] md:aspect-[4/5] bg-[#121212] border border-[#333333] shadow-2xl overflow-hidden group"
                        transition={{ duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
                    >
                        {/* Border Beam */}
                        <div className="absolute -inset-[1px] bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent opacity-50 blur-sm animate-border-flow pointer-events-none" />

                        {exhibition.coverImage ? (
                            <img src={exhibition.coverImage} alt={exhibition.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-1000" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-[#333]">
                                <Box className="w-12 h-12 opacity-20" />
                            </div>
                        )}
                        <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                            <div className="px-3 py-1 bg-black/60 backdrop-blur-md border border-[#333] text-[9px] font-mono text-[#D4AF37] uppercase tracking-widest rounded-full">
                                Exhibit {exhibition._id.slice(-4)}
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Narrative Section */}
                <div className="flex-1 pt-8">
                    <div className="flex items-center gap-4 mb-8">
                        <span className="h-[1px] w-12 bg-[#333]" />
                        <span className="font-mono text-[10px] text-[#555] uppercase tracking-[0.3em]">
                            Global Archive // {new Date(exhibition.createdAt).getFullYear()}
                        </span>
                    </div>

                    <h1 className="font-serif text-5xl md:text-8xl text-[#EFE6D8] leading-[0.9] mb-12 tracking-tight">
                        {exhibition.title}
                    </h1>

                    <div className="font-sans text-lg md:text-xl leading-relaxed text-[#888] font-light max-w-2xl mb-16 border-l border-[#333] pl-8">
                        {exhibition.description}
                    </div>

                    <div className="grid grid-cols-2 gap-12 border-t border-[#333] pt-8 mb-16 max-w-lg">
                        <div>
                            <span className="block font-mono text-[9px] text-[#444] uppercase tracking-widest mb-2">Curator</span>
                            <span className="font-serif text-[#bbb] text-lg italic">{exhibition.createdBy?.name || "Unknown"}</span>
                        </div>
                        <div>
                            <span className="block font-mono text-[9px] text-[#444] uppercase tracking-widest mb-2">Status</span>
                            <span className={`font-mono text-xs ${exhibition.isForSale ? "text-[#D4AF37]" : "text-[#444]"}`}>
                                {exhibition.isForSale ? "Available for Acquisition" : "Archival Only"}
                            </span>
                        </div>
                    </div>

                    <PurchaseButton
                        isForSale={exhibition.isForSale}
                        price={exhibition.price}
                        referencePrice={exhibition.referencePrice}
                        referenceCurrency={exhibition.referenceCurrency}
                        theme="historic"
                        label="Request Accession"
                        exhibitionId={exhibition._id}
                        isOwner={isOwner}
                        hasAccess={hasAccess}
                    />
                </div>
            </div>
        </div>
    </div>
);

export default HistoricLayout;
