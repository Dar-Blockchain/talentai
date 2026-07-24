const express = require("express");
const router = express.Router();
const companySettingsController = require("./company-settings.controller");
const { requireAuth } = require("../../middleware/security/auth.middleware");

router.use(requireAuth);

/**
 * @openapi
 * /company-settings:
 *   get:
 *     tags: [Company Settings]
 *     summary: Get the authenticated company's cost-comparison settings
 *     responses:
 *       200:
 *         description: Company settings
 */
router.get("/", companySettingsController.getSettings);

/**
 * @openapi
 * /company-settings:
 *   patch:
 *     tags: [Company Settings]
 *     summary: Update the authenticated company's cost-comparison settings
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               manualCostPerCandidate: { type: number, example: 20 }
 *               interviewDurationMinutes: { type: number, example: 40 }
 *     responses:
 *       200:
 *         description: Updated settings
 *       403:
 *         description: Only company accounts may edit these settings
 */
router.patch("/", companySettingsController.updateSettings);

module.exports = router;
