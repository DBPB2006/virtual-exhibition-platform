// Manages user authentication processes including registration, login, and session handling
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const upload = require('../middlewares/uploadMiddleware');

// Wrapper: makes profile picture upload non-fatal during registration.
// Logs the FULL error so Cloudinary failures are visible in server logs.
const uploadOptional = (req, res, next) => {
    upload.single('profilePicture')(req, res, (err) => {
        if (err) {
            // Log full error so we can diagnose Cloudinary failures
            console.error('[ERROR][AuthRoute] Profile picture upload failed:', err);
        }
        next(); // Always proceed to controller even if upload fails
    });
};

router.post('/register', uploadOptional, authController.registerNewUser);
router.post('/login', authController.authenticateUser);
router.post('/google/register', authController.googleRegister);
router.post('/google/login', authController.googleLogin);
router.post('/logout', authController.terminateSession);
router.get('/check-auth', authController.verifySessionStatus);

module.exports = router;
