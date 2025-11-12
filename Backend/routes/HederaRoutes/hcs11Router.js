const express = require('express');
const router = express.Router();
const hcs11Controller = require('../../controllers/HederaControllers/hcs11Controller');
const { requireAuthUser } = require('../../middleware/authMiddleware');

// Apply auth middleware to all HCS-11 routes
router.use(requireAuthUser);

/**
 * @swagger
 * tags:
 *   name: HCS-11
 *   description: HCS-11 AI Agent Profile management endpoints
 */

/**
 * Create HCS-11 AI Agent Profile (without inscribing to Hedera)
 */
router.post('/create-profile', hcs11Controller.createProfile);

/**
 * Create and inscribe HCS-11 AI Agent Profile to Hedera network
 */
router.post('/create-and-inscribe', hcs11Controller.createAndInscribeProfile);

/**
 * Validate HCS-11 profile data before creation
 */
router.post('/validate', hcs11Controller.validateProfile);

/**
 * Get HCS-11 service status and configuration
 */
router.get('/status', hcs11Controller.getServiceStatus);

/**
 * Create company agent with Hedera account and HCS-11 profile
 */
router.post('/create-company-agent', hcs11Controller.createCompanyAgent);

module.exports = router;