// Manages user authentication processes including registration, login, and session handling
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/register', authController.registerNewUser);
router.post('/login', authController.authenticateUser);
router.post('/google/register', authController.googleRegister);
router.post('/google/login', authController.googleLogin);
router.post('/logout', authController.terminateSession);
router.get('/check-auth', authController.verifySessionStatus);

module.exports = router;
