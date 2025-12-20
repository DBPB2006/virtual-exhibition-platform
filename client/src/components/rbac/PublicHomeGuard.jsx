import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import Loader from '../common/Loader';

// Prevents authenticated users (admin/exhibitor) from accessing public-only home pages, redirecting them to their respective dashboards
const PublicHomeGuard = ({ children }) => {
    const { user, isAuthenticated, loading } = useSelector((state) => state.auth);

    if (loading) {
        return <Loader />;
    }

    if (isAuthenticated && user) {
        if (user.role === 'admin') {
            return <Navigate to="/dashboard/admin" replace />;
        }
        if (user.role === 'exhibitor') {
            return <Navigate to="/dashboard/exhibitor" replace />;
        }
    }

    return children;
};

export default PublicHomeGuard;
