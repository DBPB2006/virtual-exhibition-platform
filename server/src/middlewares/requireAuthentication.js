const User = require('../models/User');

// Validates the user's session and active status, attaching the user object to the request
const requireAuthentication = async (req, res, next) => {
    if (req.session && req.session.user) {
        try {
            const user = await User.findById(req.session.user.id || req.session.user._id);

            if (!user) {
                req.session.destroy();
                return res.status(401).json({ message: 'User no longer exists' });
            }

            if (!user.isActive) {

                req.session.destroy();
                return res.status(403).json({ message: "Account disabled" });
            }

            req.user = user;
            next();
        } catch (err) {
            console.error("Auth Middleware DB Error:", err);
            res.status(500).json({ message: "Server Error during Auth" });
        }
    } else {
        res.status(401).json({ message: 'No session, authorization denied' });
    }
};

const Order = require('../models/Order');
const Exhibition = require('../models/Exhibition');

// Middleware specific for exhibition access control (Owner vs Visitor vs Paid)
requireAuthentication.canAccessExhibit = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user ? req.user.id : req.session.user.id;

        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const exhibit = await Exhibition.findById(id);

        if (!exhibit) {
            return res.status(404).json({ message: "Exhibition not found" });
        }

        if (exhibit.createdBy.toString() === userId) {
            return next();
        }

        if (!exhibit.isForSale) {
            return next();
        }

        const order = await Order.findOne({
            userId,
            exhibitionId: id,
            status: 'paid'
        });

        if (order) {
            return next();
        }

        return res.status(403).json({ message: 'Access denied. Please purchase the exhibition.' });

    } catch (error) {
        console.error("Access Middleware Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

module.exports = requireAuthentication;
