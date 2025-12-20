// Middleware factory to enforce strict Role-Based Access Control (RBAC) for protected routes
const enforceRoleAccess = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.user || !allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Access denied: Insufficient permissions' });
        }
        next();
    };
};

module.exports = enforceRoleAccess;
