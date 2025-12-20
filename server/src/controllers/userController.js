const User = require('../models/User');
const Order = require('../models/Order');

// Retrieves the purchase history for the authenticated user, including exhibition details

exports.fetchUserPurchaseHistory = async (req, res) => {
    try {
        const userId = req.user.id;
        const purchaseHistory = await Order.find({ userId })
            .populate('exhibitionId', 'title coverImage')
            .populate('exhibitorId', 'name')
            .sort({ createdAt: -1 });

        res.json(purchaseHistory);
    } catch (error) {
        console.error(`[ERROR][UserController] Fetch Purchases: ${error.message}`);
        res.status(500).json({ message: 'Server error fetching purchases' });
    }
};

// Fetches the profile details of the currently logged-in user, excluding sensitive data

exports.fetchUserProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const userProfile = await User.findById(userId).select('-password');

        if (!userProfile) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({
            id: userProfile._id,
            name: userProfile.name,
            email: userProfile.email,
            role: userProfile.role,
            createdAt: userProfile.createdAt
        });
    } catch (error) {
        console.error(`[ERROR][UserController] Fetch Profile: ${error.message}`);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
