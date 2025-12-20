import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

// Automatically redirects users to their appropriate dashboard based on their role and authentication status
const DashboardRedirect = () => {
    const navigate = useNavigate();
    const { user, isAuthenticated, loading } = useSelector((state) => state.auth);

    useEffect(() => {
        if (loading) return;

        if (!isAuthenticated) {
            navigate('/login');
        } else if (user?.role === 'exhibitor') {
            navigate('/dashboard/exhibitor');
        } else if (user?.role === 'admin') {
            navigate('/dashboard/admin');
        } else {
            navigate('/dashboard/visitor');
        }
    }, [navigate, isAuthenticated, user]);

    return null; // Invisible component
};

export default DashboardRedirect;
