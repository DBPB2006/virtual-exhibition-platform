import React from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '@/components/common/Navbar'; // Assuming forceDark prop works
import PurchaseButton from '../PurchaseButton';

// Renders the exhibition detail view for the 'Architecture & Design' category, featuring blueprint-inspired styling
const ArchLayout = ({ exhibition, isOwner, hasAccess }) => (
    <div className="min-h-screen bg-[#F0F2F5] text-slate-900 font-sans relative">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(37,99,235,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(37,99,235,0.05)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none fixed" />
        <Navbar forceDark={true} />

        <div className="pt-32 pb-24 px-8 md:px-16 max-w-8xl mx-auto relative z-10">
            <div className="bg-white border-2 border-slate-900 shadow-[8px_8px_0px_#2563EB] p-8 md:p-12">

                <header className="flex justify-between items-start border-b-2 border-slate-900 pb-8 mb-8">
                    <div>
                        <Link to="/exhibitions/architecture-design" className="text-blue-600 hover:underline font-mono text-xs uppercase mb-4 block">
                            ← Return to Index
                        </Link>
                        <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tight text-slate-900">
                            {exhibition.title}
                        </h1>
                    </div>
                    <div className="hidden md:block text-right font-mono text-xs text-slate-500">
                        <div className="mb-1">SPECIFICATION #812</div>
                        <div className="text-blue-600 font-bold">APPROVED FOR REVIEW</div>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    <div className="bg-blue-50 border border-blue-100 p-8 relative min-h-[300px]">
                        {/* Blueprint decorative lines */}
                        <div className="absolute top-4 left-4 w-4 h-4 border-l-2 border-t-2 border-blue-300" />
                        <div className="absolute bottom-4 right-4 w-4 h-4 border-r-2 border-b-2 border-blue-300" />

                        {exhibition.coverImage ? (
                            <img src={exhibition.coverImage} className="w-full h-auto mix-blend-multiply filter contrast-125 grayscale" alt="Blueprint" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center border-2 border-dashed border-blue-200/50 text-blue-300 font-mono text-xs uppercase tracking-widest">
                                Blueprint Missing
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col justify-center">
                        <h3 className="font-mono text-xs uppercase tracking-widest text-slate-400 mb-4">Project Brief</h3>
                        <p className="text-lg leading-relaxed text-slate-700 mb-8 whitespace-pre-line">
                            {exhibition.description}
                        </p>

                        <div className="grid grid-cols-2 gap-4 mb-8 font-mono text-xs border-y border-slate-100 py-6">
                            <div>
                                <span className="block text-slate-400 uppercase">Principal Architect</span>
                                <span className="font-bold">{exhibition.createdBy?.name || "Studio Team"}</span>
                            </div>
                            <div>
                                <span className="block text-slate-400 uppercase">Scale</span>
                                <span className="font-bold">1:100</span>
                            </div>
                        </div>

                        <PurchaseButton
                            isForSale={exhibition.isForSale}
                            price={exhibition.price}
                            referencePrice={exhibition.referencePrice}
                            referenceCurrency={exhibition.referenceCurrency}
                            theme="blueprint"
                            label="Commission Project"
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

export default ArchLayout;
