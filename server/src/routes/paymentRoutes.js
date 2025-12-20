const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const requireAuthentication = require('../middlewares/requireAuthentication');

// Ensures all payment-related requests are authenticated

router.post('/create-order', requireAuthentication, paymentController.initiatePurchaseOrder);
// Verifies payment status after provider callback or completion
router.post('/verify-payment', requireAuthentication, paymentController.confirmPaymentStatus);

module.exports = router;
