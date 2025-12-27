const express = require('express');
const router = express.Router();
const verificationController = require('../controllers/verificationController');

router.post('/send-code', verificationController.sendVerificationCode);
router.post('/verify-code', verificationController.verifyCode);

module.exports = router;
