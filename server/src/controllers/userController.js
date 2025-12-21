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
            picture: userProfile.picture,
            createdAt: userProfile.createdAt
        });
    } catch (error) {
        console.error(`[ERROR][UserController] Fetch Profile: ${error.message}`);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Updates the authenticated user's profile details
exports.updateUserProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { name } = req.body;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (name) user.name = name;

        // Handle Profile Picture Upload
        if (req.file) {
            const protocol = req.protocol;
            const host = req.get('host');
            user.picture = `${protocol}://${host}/uploads/${req.file.filename}`;
        }

        await user.save();

        // Update Session if using session store
        if (req.session && req.session.user) {
            req.session.user.name = user.name;
            req.session.user.picture = user.picture;
            req.session.save();
        }

        res.json({
            message: "Profile updated successfully",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                picture: user.picture,
                createdAt: user.createdAt
            }
        });

    } catch (error) {
        console.error(`[ERROR][UserController] Update Profile: ${error.message}`);
        res.status(500).json({ message: 'Server error updating profile' });
    }
};
