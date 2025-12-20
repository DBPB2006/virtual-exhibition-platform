import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { ArrowLeft, Save } from 'lucide-react';
import api from '@/api/axios';
import gsap from 'gsap';

// Import Form Components
import ExhibitionFormCore from '@/components/exhibition/form/ExhibitionFormCore';
import ExhibitionFormMedia from '@/components/exhibition/form/ExhibitionFormMedia';
import ExhibitionFormCommercial from '@/components/exhibition/form/ExhibitionFormCommercial';

// Renders the exhibition creation form, handling multi-step data entry (core details, media, commercial settings) and submission
const CreateExhibition = () => {
    const navigate = useNavigate();
    const { user, token } = useSelector((state) => state.auth);
    const formRef = useRef(null);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Form State
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: '',
        startDate: '',
        endDate: '',
        status: 'draft',
        price: '',
        currency: 'INR',
        isOnSale: false
    });

    // Media State
    const [mediaFiles, setMediaFiles] = useState([]);
    const [mediaPreviews, setMediaPreviews] = useState([]);

    useEffect(() => {
        // Animation
        gsap.fromTo(formRef.current,
            { y: 50, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out', delay: 0.2 }
        );
    }, []);

    // Handlers
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleMediaChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            setMediaFiles(prev => [...prev, ...files]);
            const newPreviews = files.map(file => URL.createObjectURL(file));
            setMediaPreviews(prev => [...prev, ...newPreviews]);
        }
    };

    const removeMedia = (index) => {
        setMediaFiles(prev => prev.filter((_, i) => i !== index));
        setMediaPreviews(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // Date Validation
        const today = new Date().setHours(0, 0, 0, 0);
        const start = new Date(formData.startDate).setHours(0, 0, 0, 0);
        const end = new Date(formData.endDate).setHours(0, 0, 0, 0);

        if (start < today) {
            setError("Start date cannot be in the past.");
            setLoading(false);
            return;
        }

        if (end < start) {
            setError("End date cannot be before start date.");
            setLoading(false);
            return;
        }

        try {
            const data = new FormData();
            Object.keys(formData).forEach(key => {
                data.append(key, formData[key]);
            });

            mediaFiles.forEach(file => {
                data.append('mediaFiles', file);
            });

            await api.post('/api/exhibitions', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            navigate('/dashboard/exhibitor');
        } catch (err) {
            console.error("Creation failed", err);
            setError(err.response?.data?.message || "Failed to create exhibition. Please try again.");
            setLoading(false);
        }
    };

    return (
        <div>

            <div className="max-w-4xl mx-auto">
                <Link to="/dashboard/exhibitor" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-neutral-400 hover:text-black mb-12 transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Cancel & Return
                </Link>

                <div ref={formRef}>
                    <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-4">New Exhibition</h1>
                    <p className="text-neutral-500 font-mono text-sm uppercase tracking-wide mb-12">
                        Initialize a new conceptual space.
                    </p>

                    {error && (
                        <div className="bg-red-50 text-red-600 p-4 mb-8 text-sm font-mono border-l-2 border-red-500">
                            ERROR: {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-12">
                        {/* Section 1: Core Details */}
                        <ExhibitionFormCore formData={formData} handleChange={handleChange} />

                        {/* Section 2: Visual Media */}
                        <ExhibitionFormMedia
                            mediaPreviews={mediaPreviews}
                            mediaFiles={mediaFiles}
                            handleMediaChange={handleMediaChange}
                            removeMedia={removeMedia}
                            isUploading={loading}
                        />

                        {/* Section 3: Commercial & Visibility */}
                        <ExhibitionFormCommercial formData={formData} handleChange={handleChange} />

                        {/* Action Bar */}
                        <div className="flex items-center justify-end gap-6 pt-12 border-t border-black">
                            {loading ? (
                                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest animate-pulse">
                                    <Spinner className="w-4 h-4" /> Processing Artifact...
                                </div>
                            ) : (
                                <>
                                    <span className="text-xs font-mono text-neutral-400 uppercase">
                                        Status: {formData.status.toUpperCase()}
                                    </span>
                                    <Button
                                        type="submit"
                                        className="rounded-none bg-black text-white hover:bg-neutral-800 px-12 py-6 text-sm font-bold uppercase tracking-widest"
                                    >
                                        <Save className="w-4 h-4 mr-2" /> Save Exhibition
                                    </Button>
                                </>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CreateExhibition;
