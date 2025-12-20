const express = require('express');
const router = express.Router();
const exhibitorController = require('../controllers/exhibitorController');
const requireAuthentication = require('../middlewares/requireAuthentication');
const enforceRoleAccess = require('../middlewares/enforceRoleAccess');

// Retrieves sales data for the authenticated exhibitor

router.get('/sales', requireAuthentication, enforceRoleAccess(['exhibitor']), exhibitorController.fetchExhibitorSalesData);

module.exports = router;
