import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';

// Renders a dynamic button that handles access logic, allowing users to enter, purchase, or verify access to an exhibition
const PurchaseButton = ({ isForSale, price, theme, label = "Acquire This Piece", exhibitionId, referencePrice, referenceCurrency, isOwner, hasAccess }) => {

    // Theme Styles
    const styles = {
        'art': "bg-black text-white hover:bg-neutral-800 border-none",
        'historic': "bg-[#C5A059] text-white hover:bg-[#B08D55] font-serif tracking-wider",
        'science': "bg-emerald-500 text-black font-mono font-bold hover:bg-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.4)] border-none",
        'darkroom': "bg-red-600 text-black font-bold uppercase hover:bg-red-500 border-none",
        'blueprint': "bg-blue-600 text-white font-mono uppercase tracking-widest hover:bg-blue-700 border-none",
    };

    if (!isForSale || hasAccess) {
        return (
            <div className="mt-8">
                <Link to={`/exhibitions/view/${exhibitionId}`}>
                    <Button className={`w-full md:w-auto px-8 py-6 text-lg rounded-none ${styles[theme] || styles['art']}`}>
                        Enter Exhibition <ExternalLink className="ml-2 w-4 h-4" />
                    </Button>
                </Link>
                <div className="mt-2 text-xs opacity-60 uppercase tracking-widest flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    {isForSale ? "Access Granted • Live Room Open" : "Free Access • Live Room Open"}
                </div>
            </div>
        );
    }


    const formattedRef = referencePrice && referenceCurrency
        ? `${referenceCurrency} ${referencePrice.toLocaleString()}`
        : null;

    // Format Transaction Price
    const formattedINR = price > 0 ? `₹${price.toLocaleString()}` : "Price on Request";

    return (
        <div className="mt-8 p-6 border border-dashed border-gray-200/20 rounded-lg flex flex-col md:flex-row items-center justify-between gap-4 bg-white/5 backdrop-blur-sm">
            <div>
                <span className="block text-xs uppercase opacity-70 mb-1">Acquisition Cost</span>
                <div className="flex flex-col">
                    {formattedRef && (
                        <span className="text-2xl font-bold">{formattedRef}</span>
                    )}
                    <span className={`font-mono text-sm ${formattedRef ? 'opacity-60' : 'text-2xl font-bold'}`}>
                        {formattedRef ? `approx. ${formattedINR}` : formattedINR}
                    </span>
                    {formattedRef && <span className="text-[10px] uppercase opacity-50 mt-1">Charged in INR</span>}
                </div>
            </div>
            {isOwner ? (
                <div className="flex flex-col items-center">
                    <Link to={`/exhibitions/view/${exhibitionId}`}>
                        <Button className="px-8 py-6 text-lg rounded-none bg-emerald-600 text-white hover:bg-emerald-700">
                            Owner Access
                        </Button>
                    </Link>
                </div>
            ) : (
                <Link to={`/checkout/${exhibitionId}`}>
                    <Button className={`px-8 py-6 text-lg rounded-none ${styles[theme] || styles['art']}`}>
                        {label}
                    </Button>
                </Link>
            )}
        </div>
    );
};

export default PurchaseButton;
