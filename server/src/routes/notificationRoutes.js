const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const requireAuthentication = require('../middlewares/requireAuthentication');

// Enforces authentication for all notification routes

router.use(requireAuthentication);

// Retrieves notifications for the logged-in user

router.get('/', notificationController.fetchUserNotifications);

// Marks a specific notification as read

router.patch('/:id/read', notificationController.markNotificationRead);

module.exports = router;
