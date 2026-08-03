const express = require("express");
const router = express.Router();
const CompanyMembershipController = require("./company-membership.controller");
const { requireAuth } = require("../../middleware/security/auth.middleware.js");
const authLogMiddleware = require("../../middleware/security/request-log.middleware.js");
const resolveCompanyActor = require("../../middleware/resolve-company-actor.middleware.js");
const { controledAcces } = require("../../middleware/authorize.middleware.js");

// ========== MIDDLEWARE: Authentication + Logging ==========
router.use(requireAuth,controledAcces(['Company', 'Employee']), authLogMiddleware("memberships"));

/**
 * @openapi
 * /company-memberships/memberships/stats:
 *   get:
 *     tags: [Company Memberships]
 *     summary: Membership statistics (counts by role/status)
 *     responses:
 *       200:
 *         description: Membership stats
 */
router.get(
  "/memberships/stats",
  resolveCompanyActor,
  CompanyMembershipController.getMembershipStats,
);

/**
 * @openapi
 * /company-memberships/memberships:
 *   get:
 *     tags: [Company Memberships]
 *     summary: Get all memberships for the current company
 *     responses:
 *       200:
 *         description: List of memberships
 */
router.get("/memberships", resolveCompanyActor, CompanyMembershipController.getMembershipsByCompany);

/**
 * @openapi
 * /company-memberships/user/{userId}:
 *   get:
 *     tags: [Company Memberships]
 *     summary: Get membership by user ID
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Membership details
 */
router.get("/user/:userId", CompanyMembershipController.getMembershipByUserId);

/**
 * @openapi
 * /company-memberships/{membershipId}:
 *   delete:
 *     tags: [Company Memberships]
 *     summary: Remove a membership
 *     parameters:
 *       - in: path
 *         name: membershipId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Membership deleted
 *   patch:
 *     tags: [Company Memberships]
 *     summary: Update membership (role and/or department)
 *     parameters:
 *       - in: path
 *         name: membershipId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               role: { type: string }
 *               departmentId: { type: string }
 *     responses:
 *       200:
 *         description: Membership updated
 */
router.delete("/:membershipId", resolveCompanyActor, CompanyMembershipController.deleteMembership);
router.patch("/:membershipId", resolveCompanyActor, CompanyMembershipController.updateMembership);

module.exports = router;
