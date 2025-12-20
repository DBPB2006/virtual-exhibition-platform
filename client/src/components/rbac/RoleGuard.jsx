import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Loader from '../common/Loader';

// Enforces strict role-based access control, allowing only specified roles to access the enclosed components
const RoleGuard = ({ children, allowedRoles }) => {
    const { user, loading } = useSelector((state) => state.auth);

    if (loading) {
        return <Loader />;
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (!allowedRoles.includes(user.role)) {
        // Redirect based on their actual role to avoid stuck loops
        if (user.role === 'exhibitor') return <Navigate to="/dashboard/exhibitor" replace />;
        if (user.role === 'admin') return <Navigate to="/dashboard/admin" replace />;
        return <Navigate to="/" replace />; // Visitor fallback
    }

    return children;
};

export default RoleGuard;
