const User = require('../models/User');

const optionalAuthentication = async (req, res, next) => {
    if (req.session && req.session.user) {
        try {
            // Refreshes the user data from the database if a session exists
            const user = await User.findById(req.session.user.id || req.session.user._id);

            if (user && user.isActive) {
                req.user = user;
            }
        } catch (err) {
            console.error("Optional Auth Middleware DB Error:", err);
            // Proceed as guest on error
        }
    }
    next();
};

module.exports = optionalAuthentication;
