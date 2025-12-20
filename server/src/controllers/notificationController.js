const Notification = require('../models/Notification');

// Fetches all notifications directed to the currently logged-in user

exports.fetchUserNotifications = async (req, res) => {
    try {
        const userId = req.user.id;
        const notifications = await Notification.find({ userId })
            .sort({ createdAt: -1 });

        res.json(notifications);
    } catch (error) {
        console.error(`[ERROR][NotificationController] Fetch Notifications: ${error.message}`);
        res.status(500).json({ message: 'Server error fetching notifications' });
    }
};

// Updates the read status of a specific notification for the user

exports.markNotificationRead = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const notification = await Notification.findOne({ _id: id, userId });

        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        notification.isRead = true;
        await notification.save();

        res.json(notification);
    } catch (error) {
        console.error(`[ERROR][NotificationController] Mark Read: ${error.message}`);
        res.status(500).json({ message: 'Server error updating notification' });
    }
};
