const express = require('express');
const router = express.Router();
const scraperController = require('../controllers/scraper-controller');

// Start login and check if MFA is required
router.post('/start-login', scraperController.startLogin);

// Submit MFA code from frontend
router.post('/submit-mfa', scraperController.submitMfaCode);

router.get('/scrape', scraperController.scrapeHardcodedTicket);

module.exports = router;
