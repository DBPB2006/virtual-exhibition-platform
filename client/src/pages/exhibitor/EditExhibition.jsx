import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { ArrowLeft, Save, X, Upload } from 'lucide-react';
import api from '@/api/axios';
import gsap from 'gsap';

// Import Form Components
import ExhibitionFormCore from '@/components/exhibition/form/ExhibitionFormCore';
import ExhibitionFormMedia from '@/components/exhibition/form/ExhibitionFormMedia';
import ExhibitionFormCommercial from '@/components/exhibition/form/ExhibitionFormCommercial';

// Renders the exhibition editing form, establishing ownership and allowing updates to existing exhibition data
const EditExhibition = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, token } = useSelector((state) => state.auth);
    const formRef = useRef(null);

    const [loading, setLoading] = useState(true); // Initial fetch loading
    const [saving, setSaving] = useState(false); // Submission loading
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
    const [existingMedia, setExistingMedia] = useState([]); // URLs from backend

    useEffect(() => {
        const fetchExhibition = async () => {
            try {
                const res = await api.get(`/api/exhibitions/${id}`);
                const data = res.data;

                // Validate Ownership
                if (data.createdBy._id !== user?.id && data.createdBy !== user?.id) {
                    navigate('/dashboard/exhibitor');
                    return;
                }

                setFormData({
                    title: data.title || '',
                    description: data.description || '',
                    category: data.category || '',
                    startDate: data.startDate ? data.startDate.split('T')[0] : '', // Format for date input if needed
                    endDate: data.endDate ? data.endDate.split('T')[0] : '',
                    status: data.status || 'draft',
                    price: data.price || '',
                    currency: data.currency || 'INR',
                    isOnSale: data.isOnSale || false
                });

                // Handle existing media (assuming backend returns array of URLs)
                // For this implementation, we'll treat coverImage as one item if array not abundant
                if (data.coverImage) {
                    setExistingMedia([data.coverImage]);
                }

                setLoading(false);

                // Animation
                gsap.fromTo(formRef.current,
                    { y: 50, opacity: 0 },
                    { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out', delay: 0.1 }
                );

            } catch (err) {
                console.error("Fetch error", err);
                setError("Failed to load exhibition data.");
                setLoading(false);
            }
        };

        fetchExhibition();
    }, [id, token, user, navigate]);

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
        // Since we have existing and new media, logic depends on UI.
        // For simplicity reusing component, we only manage NEW uploads here for preview removal.
        // Existing media removal would require a separate handler if we wanted to delete from server.
        setMediaFiles(prev => prev.filter((_, i) => i !== index));
        setMediaPreviews(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError(null);

        try {
            const data = new FormData();
            Object.keys(formData).forEach(key => {
                data.append(key, formData[key]);
            });

            // Append new media
            mediaFiles.forEach(file => {
                data.append('media', file);
            });

            await api.put(`/api/exhibitions/${id}`, data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            navigate('/dashboard/exhibitor');
        } catch (err) {
            console.error("Update failed", err);
            setError(err.response?.data?.message || "Failed to update exhibition.");
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-white">
            <Spinner className="w-8 h-8 text-black" />
        </div>
    );

    return (
        <div>

            <div className="max-w-4xl mx-auto" ref={formRef}>
                <Link to="/dashboard/exhibitor" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-neutral-400 hover:text-black mb-12 transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Cancel & Return
                </Link>

                <div ref={formRef}>
                    <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-4">Edit Exhibition</h1>
                    <p className="text-neutral-500 font-mono text-sm uppercase tracking-wide mb-12">
                        Refine your conceptual space.
                    </p>

                    {error && (
                        <div className="bg-red-50 text-red-600 p-4 mb-8 text-sm font-mono border-l-2 border-red-500">
                            ERROR: {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-12">
                        {/* Section 1: Core Details */}
                        <ExhibitionFormCore formData={formData} handleChange={handleChange} />

                        {/* Section 2: Visual Media - Mixing Existing and New */}
                        <div className="space-y-4">
                            <h3 className="text-xs font-bold uppercase tracking-widest mb-4">Current Visuals</h3>
                            {existingMedia.length > 0 ? (
                                <div className="flex gap-4 mb-8">
                                    {existingMedia.map((src, i) => (
                                        <div key={i} className="w-32 h-32 border border-neutral-200">
                                            <img src={src} alt="Existing" className="w-full h-full object-cover" />
                                        </div>
                                    ))}
                                </div>
                            ) : <p className="text-sm text-neutral-400 italic mb-8">No visuals uploaded yet.</p>}

                            <ExhibitionFormMedia
                                mediaPreviews={mediaPreviews} // Only shows new uploads
                                mediaFiles={mediaFiles}
                                handleMediaChange={handleMediaChange}
                                removeMedia={removeMedia}
                                isUploading={saving}
                            />
                        </div>

                        {/* Section 3: Commercial Details */}
                        <ExhibitionFormCommercial formData={formData} handleChange={handleChange} />

                        {/* Action Bar */}
                        <div className="flex items-center justify-end gap-6 pt-12 border-t border-black">
                            {saving ? (
                                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest animate-pulse">
                                    <Spinner className="w-4 h-4" /> Updating Artifact...
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
                                        <Save className="w-4 h-4 mr-2" /> Update Exhibition
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

export default EditExhibition;
