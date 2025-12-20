import React from 'react';

// Renders the core metadata fields for an exhibition, including title, category, status, dates, and description
const ExhibitionFormCore = ({ formData, handleChange }) => {
    return (
        <div className="space-y-8">
            <div>
                <label className="block text-xs font-bold uppercase tracking-widest mb-3">Title *</label>
                <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="e.g. The Modernist Perspective"
                    className="w-full text-2xl font-light border-b border-neutral-200 py-4 focus:outline-none focus:border-black transition-colors bg-transparent placeholder:text-neutral-200"
                    required
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                    <label className="block text-xs font-bold uppercase tracking-widest mb-3">Category *</label>
                    <div className="relative">
                        <select
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            className="w-full appearance-none rounded-none border-b border-neutral-200 py-4 font-light focus:outline-none focus:border-black transition-colors bg-transparent cursor-pointer"
                            required
                        >
                            <option value="" disabled>Select Category</option>
                            <option value="Art & Fashion">Art & Fashion</option>
                            <option value="Historic & Antique">Historic & Antique</option>
                            <option value="Science & Technology">Science & Technology</option>
                            <option value="Culture & Heritage">Culture & Heritage</option>
                            <option value="Photography & Media">Photography & Media</option>
                            <option value="Architecture & Design">Architecture & Design</option>
                        </select>
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-300">
                            ▼
                        </div>
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-bold uppercase tracking-widest mb-3">Status</label>
                    <div className="relative">
                        <select
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                            className="w-full appearance-none rounded-none border-b border-neutral-200 py-4 font-light focus:outline-none focus:border-black transition-colors bg-transparent cursor-pointer"
                        >
                            <option value="draft">Draft (Private)</option>
                            <option value="published">Published (Public)</option>
                        </select>
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-300">
                            ▼
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                    <label className="block text-xs font-bold uppercase tracking-widest mb-3">Start Date *</label>
                    <input
                        type="date"
                        name="startDate"
                        value={formData.startDate}
                        onChange={handleChange}
                        className="w-full border-b border-neutral-200 py-4 font-light focus:outline-none focus:border-black transition-colors bg-transparent placeholder:text-neutral-300"
                        required
                    />
                </div>

                <div>
                    <label className="block text-xs font-bold uppercase tracking-widest mb-3">End Date *</label>
                    <input
                        type="date"
                        name="endDate"
                        value={formData.endDate}
                        onChange={handleChange}
                        className="w-full border-b border-neutral-200 py-4 font-light focus:outline-none focus:border-black transition-colors bg-transparent placeholder:text-neutral-300"
                        required
                    />
                </div>
            </div>

            <div>
                <label className="block text-xs font-bold uppercase tracking-widest mb-3">Description *</label>
                <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={6}
                    placeholder="Describe the concept and significance of this exhibition..."
                    className="w-full border border-neutral-200 p-6 font-light focus:outline-none focus:border-black transition-colors bg-transparent resize-none placeholder:text-neutral-200"
                    required
                />
            </div>
        </div>
    );
};

export default ExhibitionFormCore;
