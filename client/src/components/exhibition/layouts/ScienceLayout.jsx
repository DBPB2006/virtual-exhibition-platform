import React from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '@/components/common/Navbar';
import { ArrowLeft } from 'lucide-react';
import PurchaseButton from '../PurchaseButton';

// Renders the exhibition detail view for the 'Science & Technology' category, featuring futuristic cyber-aesthetic styling
const ScienceLayout = ({ exhibition, isOwner, hasAccess }) => (
    <div className="min-h-screen bg-[#020617] text-slate-300 font-sans relative overflow-hidden">
        <div className="fixed inset-0 bg-[linear-gradient(rgba(6,182,212,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.05)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
        <Navbar />

        <div className="pt-32 pb-20 px-6 md:px-12 max-w-7xl mx-auto relative z-10">
            <Link to="/exhibitions/science-technology" className="inline-flex items-center gap-2 text-xs font-mono text-cyan-500 hover:text-cyan-400 mb-12">
                <ArrowLeft className="w-3 h-3" /> RETURN_TO_LAB
            </Link>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 border border-slate-800 bg-[#0B1120]/80 backdrop-blur-md">

                {/* Sidebar Data */}
                <div className="lg:col-span-3 border-r border-slate-800 p-6 flex flex-col gap-6 font-mono text-xs">
                    <div>
                        <span className="text-slate-500 block mb-1">PROJECT_ID</span>
                        <span className="text-white text-lg">{exhibition._id.slice(-6).toUpperCase()}</span>
                    </div>
                    <div>
                        <span className="text-slate-500 block mb-1">CLASSIFICATION</span>
                        <span className="text-cyan-400">{exhibition.category.toUpperCase()}</span>
                    </div>
                    <div>
                        <span className="text-slate-500 block mb-1">STATUS</span>
                        <span className="flex items-center gap-2 text-emerald-400">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> ACTIVE
                        </span>
                    </div>
                </div>

                {/* Main Content */}
                <div className="lg:col-span-9 p-8">
                    <h1 className="font-sans font-bold text-4xl md:text-5xl text-white mb-6 uppercase tracking-tight">
                        {exhibition.title}
                    </h1>

                    <div className="relative aspect-video mb-8 border border-slate-700 overflow-hidden group bg-slate-900/50">
                        <div className="absolute inset-0 bg-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                        <div className="absolute top-0 left-0 w-full h-[1px] bg-cyan-400 animate-[scan_3s_linear_infinite] shadow-[0_0_15px_rgba(6,182,212,0.8)]" />
                        {exhibition.coverImage ? (
                            <img src={exhibition.coverImage} alt="Analysis" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center font-mono text-cyan-900/50 text-xs">
                                // NO_VISUAL_FEED //
                            </div>
                        )}
                    </div>

                    <div className="prose prose-invert prose-slate max-w-none font-mono text-sm leading-relaxed border-l-2 border-cyan-900 pl-6">
                        {exhibition.description}
                    </div>

                    <PurchaseButton
                        isForSale={exhibition.isForSale}
                        price={exhibition.price}
                        referencePrice={exhibition.referencePrice}
                        referenceCurrency={exhibition.referenceCurrency}
                        theme="science"
                        label="Register for Science Fair"
                        exhibitionId={exhibition._id}
                        isOwner={isOwner}
                        hasAccess={hasAccess}
                    />
                </div>
            </div>
        </div>
    </div>
);

export default ScienceLayout;
