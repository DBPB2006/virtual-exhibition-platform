const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const requireAuthentication = require('../middlewares/requireAuthentication');

// Fetches the current user's profile information

router.get('/me', requireAuthentication, userController.fetchUserProfile);

// Retrieves the current user's purchase history

router.get('/purchases', requireAuthentication, userController.fetchUserPurchaseHistory);

// Update user profile
const upload = require('../middlewares/uploadMiddleware');
router.put('/me', requireAuthentication, upload.single('profilePicture'), userController.updateUserProfile);

module.exports = router;
