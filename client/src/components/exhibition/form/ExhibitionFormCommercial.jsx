import React from 'react';

// Renders the commercial settings for an exhibition, enabling price and sale status configuration
const ExhibitionFormCommercial = ({ formData, handleChange }) => {
    return (
        <div className="space-y-8 border-t border-neutral-200 pt-8">
            <div className="flex items-center gap-4">
                <input
                    type="checkbox"
                    id="isOnSale"
                    name="isOnSale"
                    checked={formData.isOnSale}
                    onChange={handleChange}
                    className="w-5 h-5 accent-black my-4"
                />
                <label htmlFor="isOnSale" className="text-sm font-bold uppercase tracking-widest cursor-pointer select-none">
                    Available for Acquisition?
                </label>
            </div>

            {/* Conditional Price Fields */}
            {formData.isOnSale && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in slide-in-from-top-2 duration-300">
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-widest mb-3">Price (₹) *</label>
                        <input
                            type="number"
                            name="price"
                            value={formData.price}
                            onChange={handleChange}
                            placeholder="0"
                            className="w-full border-b border-neutral-200 py-4 font-light focus:outline-none focus:border-black transition-colors bg-transparent placeholder:text-neutral-200 font-mono"
                            required={formData.isOnSale}
                            min="0"
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default ExhibitionFormCommercial;
