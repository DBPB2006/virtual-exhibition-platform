const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Exhibition = require('../models/Exhibition');
const Order = require('../models/Order');
const ContactRequest = require('../models/ContactRequest');
const requireAuthentication = require('../middlewares/requireAuthentication');
const enforceRoleAccess = require('../middlewares/enforceRoleAccess');

// Middleware: Enforces valid authentication and 'admin' role privileges for all subsequent routes
router.use(requireAuthentication);
router.use(enforceRoleAccess(['admin']));

// Provides statistical overview for the admin dashboard including user, exhibition, and order metrics



router.get('/stats', async (req, res) => {
    try {
        const [userCount, exhibitCount, orderCount, revenueData] = await Promise.all([
            User.countDocuments({ isDeleted: false }),
            Exhibition.countDocuments(),
            Order.countDocuments(),
            Order.aggregate([
                { $group: { _id: null, total: { $sum: "$amount" } } } // Assuming Order has 'amount' field
            ])
        ]);

        const revenue = revenueData.length > 0 ? revenueData[0].total : 0;

        res.json({
            users: userCount,
            exhibitions: exhibitCount,
            orders: orderCount,
            revenue: revenue
        });
    } catch (error) {
        console.error("Admin Stats Error:", error);
        res.status(500).json({ message: "Server error fetching stats" });
    }
});

// Retrieves a list of all users in the system for administrative oversight

router.get('/users', async (req, res) => {
    try {
        // Exclude password, verified by Google ID etc.
        const users = await User.find({ isDeleted: false })
            .select('-password -__v')
            .sort({ createdAt: -1 });
        res.json(users);
    } catch (error) {
        console.error("Admin Users Error:", error);
        res.status(500).json({ message: "Server error fetching users" });
    }
});

// Updates a user's role, specifically allowing promotion/demotion between visitor and exhibitor

router.patch('/users/:id/role', async (req, res) => {
    try {
        const { role } = req.body;
        const validRoles = ['visitor', 'exhibitor'];

        if (!['visitor', 'exhibitor', 'admin'].includes(role)) {
            return res.status(400).json({ message: "Invalid role" });
        }

        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: "User not found" });

        // Rule: Admin role cannot be changed (Target protection)
        if (user.role === 'admin') {
            return res.status(403).json({ message: "Cannot modify role of an administrator." });
        }

        user.role = role;
        await user.save();


        res.json({ message: "Role updated. User must re-login." });
    } catch (error) {
        console.error("Admin Role Update Error:", error);
        res.status(500).json({ message: "Server error updating role" });
    }
});

// Modifies a user's active status, effectively blocking or unblocking their access

router.patch('/users/:id/status', async (req, res) => {
    try {
        const { isActive } = req.body; // Expecting { isActive: true/false }

        if (typeof isActive !== 'boolean') {
            return res.status(400).json({ message: "Invalid status. Provide 'isActive' (boolean)." });
        }

        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: "User not found" });

        if (user.role === 'admin') {
            return res.status(403).json({ message: "Cannot deactivate an administrator." });
        }

        user.isActive = isActive;
        user.isBlocked = !isActive; // Sync legacy field
        await user.save();

        const statusMsg = isActive ? "activated" : "deactivated";
        res.json({ message: `User ${statusMsg}`, user });
    } catch (error) {
        console.error("Admin Status Error:", error);
        res.status(500).json({ message: "Server error updating status" });
    }
});

// Soft-deletes a user account, preserving data integrity while revoking access

router.delete('/users/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: "User not found" });

        if (user.role === 'admin') {
            return res.status(403).json({ message: "Cannot delete an administrator." });
        }

        user.isDeleted = true;
        user.isActive = false; // Ensure they can't login
        await user.save();

        res.json({ message: "User account deleted" });
    } catch (error) {
        console.error("Admin Delete User Error:", error);
        res.status(500).json({ message: "Server error deleting user" });
    }
});

// Fetches exhibitions with optional status filtering for moderation queues

router.get('/exhibitions', async (req, res) => {
    try {
        const { status } = req.query;
        let query = {};

        if (status) {
            query.verificationStatus = status;
        }

        const exhibitions = await Exhibition.find(query)
            .populate('createdBy', 'name email')
            .sort({ createdAt: -1 });

        res.json(exhibitions);
    } catch (error) {
        console.error("Admin Fetch Exhibits Error:", error);
        res.status(500).json({ message: "Server error fetching exhibitions" });
    }
});



// Processes exhibition verification, updating status to approved or rejected based on admin review

router.patch('/exhibits/:id/verify', async (req, res) => {
    try {
        const { status, notes } = req.body;
        const { id } = req.params;

        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({ message: "Invalid status. Must be 'approved' or 'rejected'." });
        }

        const exhibition = await Exhibition.findById(id);
        if (!exhibition) {
            return res.status(404).json({ message: "Exhibition not found" });
        }

        exhibition.verificationStatus = status;
        exhibition.verifiedBy = req.user.id;

        if (status === 'approved') {
            exhibition.status = 'published'; // Auto-publish on approval for simplicity/flow
        } else if (status === 'rejected') {
            exhibition.status = 'draft'; // Revert to draft if rejected?
        }

        await exhibition.save();

        res.json({ message: `Exhibition ${status}`, exhibition });

    } catch (error) {
        console.error("Admin Verify Error:", error);
        res.status(500).json({ message: "Server error" });
    }
});


// Retrieves all orders for financial and transactional oversight

router.get('/orders', async (req, res) => {
    try {
        const orders = await Order.find()
            .populate('user', 'name email')
            .sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        console.error("Admin Orders Error:", error);
        res.status(500).json({ message: "Server error fetching orders" });
    }
});

// Retrieves pending exhibitor requests
router.get('/requests', async (req, res) => {
    try {
        const requests = await ContactRequest.find({
            subject: 'Exhibitor Access Request',
            status: 'pending'
        }).sort({ createdAt: -1 });
        res.json(requests);
    } catch (error) {
        console.error("Admin Requests Error:", error);
        res.status(500).json({ message: "Server error fetching requests" });
    }
});

// Processes a contact/exhibitor request
router.patch('/requests/:id/process', async (req, res) => {
    try {
        const { status } = req.body; // 'approved' or 'rejected'
        const { id } = req.params;

        const request = await ContactRequest.findById(id);
        if (!request) return res.status(404).json({ message: "Request not found" });

        request.status = status;
        request.processedBy = req.user.id;
        request.processedAt = Date.now();
        await request.save();

        let message = `Request ${status}`;

        // If approved and it's an exhibitor request, upgrade the user
        if (status === 'approved' && request.subject === 'Exhibitor Access Request') {
            const user = await User.findOne({ email: request.email });
            if (user) {
                user.role = 'exhibitor';
                await user.save();
                message += " and user upgraded to Exhibitor";
            } else {
                message += " but user account not found for this email";
            }
        }

        res.json({ message });
    } catch (error) {
        console.error("Admin Process Request Error:", error);
        res.status(500).json({ message: "Server error processing request" });
    }
});

// Retrieves pending exhibitor users
router.get('/pending-exhibitors', async (req, res) => {
    try {
        const pendingUsers = await User.find({ role: 'exhibitor', status: 'pending', isDeleted: false })
            .select('-password -__v')
            .sort({ createdAt: -1 });
        res.json(pendingUsers);
    } catch (error) {
        console.error("Admin Pending Exhibitors Error:", error);
        res.status(500).json({ message: "Server error fetching pending exhibitors" });
    }
});

// Approves a pending exhibitor
router.patch('/users/:id/approve', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: "User not found" });

        if (user.role !== 'exhibitor' || user.status !== 'pending') {
            return res.status(400).json({ message: "User is not a pending exhibitor" });
        }

        user.status = 'active';
        await user.save();

        res.json({ message: "Exhibitor approved successfully", user });
    } catch (error) {
        console.error("Admin Approve Exhibitor Error:", error);
        res.status(500).json({ message: "Server error approving exhibitor" });
    }
});

module.exports = router;
