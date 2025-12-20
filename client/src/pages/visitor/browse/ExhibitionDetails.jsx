import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Spinner } from '@/components/ui/spinner';
import api from '@/api/axios';

// Import Layouts
import ArtFashionLayout from '@/components/exhibition/layouts/ArtFashionLayout';
import HistoricLayout from '@/components/exhibition/layouts/HistoricLayout';
import ScienceLayout from '@/components/exhibition/layouts/ScienceLayout';
import PhotoLayout from '@/components/exhibition/layouts/PhotoLayout';
import ArchLayout from '@/components/exhibition/layouts/ArchLayout';
import CultureLayout from '@/components/exhibition/layouts/CultureLayout';
import OwnerControls from '@/components/exhibition/OwnerControls';

// Routes specific exhibition data to the appropriate category-specific layout component based on the exhibition's type
const ExhibitionDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [exhibition, setExhibition] = useState(null);
    const [access, setAccess] = useState(null); // { hasAccess: false, isFree: false }
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const { user } = useSelector((state) => state.auth);

    useEffect(() => {
        const fetchExhibition = async () => {
            try {
                const response = await api.get(`/api/exhibitions/${id}`);
                setExhibition(response.data);

                // Check access status via backend source of truth
                try {
                    const accessRes = await api.get(`/api/exhibitions/${id}/access`);
                    setAccess(accessRes.data);
                } catch (accessErr) {
                }

            } catch (err) {
                console.error("Error fetching exhibition:", err);
                if (err.response?.status === 403) {
                    setError("Access Denied: Drafts are private.");
                } else {
                    setError("Exhibition not found.");
                }
            } finally {
                setLoading(false);
            }
        };
        fetchExhibition();
    }, [id]);

    // REDIRECT LOGIC
    useEffect(() => {
        // 1. Free -> Auto Redirect
        if (access?.hasAccess && access?.isFree) {
            navigate(`/exhibitions/view/${id}`, { replace: true });
        }
        // 2. Paid & Purchased -> Show "View" (Handled in render, no forced redirect to keep UX clean)
    }, [access, id, navigate]);

    const handleStatusToggle = async () => {
        if (!exhibition) return;
        const newStatus = exhibition.status === 'published' ? 'draft' : 'published';
        try {
            const res = await api.put(`/api/exhibitions/${id}`,
                { status: newStatus }
            );
            setExhibition(res.data);
        } catch (err) {
            console.error("Status toggle error", err);
            if (err.response?.status === 401) {
                alert("Session expired. Please login again.");
                navigate('/login');
            } else {
                alert("Failed to update status");
            }
        }
    };

    const handleDelete = async () => {
        if (!window.confirm("Are you sure you want to delete this exhibition? This cannot be undone.")) return;
        try {
            await api.delete(`/api/exhibitions/${id}`);
            navigate('/dashboard/exhibitor'); // Go back to dashboard
        } catch (err) {
            console.error("Delete error", err);
            alert("Failed to delete exhibition");
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-black">
            <Spinner className="w-8 h-8 text-white" />
        </div>
    );

    if (error || !exhibition) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white">
            <h1 className="text-2xl font-bold mb-4">{error || "Exhibition Not Found"}</h1>
            <Link to="/" className="text-neutral-400 hover:text-white underline">Return Home</Link>
        </div>
    );

    // Check Ownership
    const isOwner = user && exhibition.createdBy && (user.id === exhibition.createdBy._id || user.id === exhibition.createdBy);

    // Determine Layout based on Category
    const category = exhibition.category || "";
    let LayoutComponent = ArtFashionLayout;

    if (category === "Art & Fashion") LayoutComponent = ArtFashionLayout;
    else if (category === "Historic & Antique") LayoutComponent = HistoricLayout;
    else if (category === "Science & Technology") LayoutComponent = ScienceLayout;
    else if (category === "Photography & Media") LayoutComponent = PhotoLayout;
    else if (category === "Architecture & Design") LayoutComponent = ArchLayout;
    else if (category === "Culture & Heritage") LayoutComponent = CultureLayout;

    return (
        <>
            <LayoutComponent
                exhibition={exhibition}
                isOwner={isOwner}
                hasAccess={access?.hasAccess}
                isFree={access?.isFree}
                isExpired={access?.isExpired}
            />
            {isOwner && (
                <OwnerControls
                    status={exhibition.status}
                    onToggleStatus={handleStatusToggle}
                    onDelete={handleDelete}
                    category={category}
                />
            )}
        </>
    );
};

export default ExhibitionDetails;
