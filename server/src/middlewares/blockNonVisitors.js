// Middleware to restrict access, forbidding admin and exhibitor roles from accessing visitor-only routes
const blockNonVisitors = (req, res, next) => {
    if (req.session && req.session.user) {
        const { role } = req.session.user;
        if (role === 'admin' || role === 'exhibitor') {
            return res.status(403).json({ message: "Access forbidden for non-visitors." });
        }
    }
    next();
};

module.exports = blockNonVisitors;
