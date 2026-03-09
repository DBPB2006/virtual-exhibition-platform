// Manages user authentication processes including registration, login, and session handling
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const upload = require('../middlewares/uploadMiddleware');

// Wrapper: makes profile picture upload non-fatal.
// If Cloudinary is down/misconfigured, registration still works — just without a photo.
const uploadOptional = (req, res, next) => {
    upload.single('profilePicture')(req, res, (err) => {
        if (err) {
            console.warn('[WARN][AuthRoute] Profile picture upload failed, continuing without it:', err.message);
            req.file = null; // Ensure controller sees no file gracefully
        }
        next(); // Always proceed to controller
    });
};

router.post('/register', uploadOptional, authController.registerNewUser);
router.post('/login', authController.authenticateUser);
router.post('/google/register', authController.googleRegister);
router.post('/google/login', authController.googleLogin);
router.post('/logout', authController.terminateSession);
router.get('/check-auth', authController.verifySessionStatus);

module.exports = router;
