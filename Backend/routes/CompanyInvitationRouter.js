/**
 * Account Routes
 * Routes for managing Company accounts and their employees
 *
 * Middleware: requireAuthUser (all endpoints are protected)
 */

const express = require("express");
const router = express.Router();
const CompanyInvitationController = require("../controllers/ProfileControllers/CompanyInvitationController");
const { requireAuthUser } = require("../middleware/authMiddleware");
const authLogMiddleware = require("../middleware/SystemeLogs/LogMiddleware");

// ========== MIDDLEWARE: Authentication + Logging ==========
// All routes below require an authenticated user and are logged
router.use(requireAuthUser, authLogMiddleware("sentInvitation"));

/**
 * POST /sentInvitation
 * Add a new employee to a Company account
 */
router.post("/sentInvitation", CompanyInvitationController.sentInvitation);

/**
 * POST /resendInvitation/:invitationId
 * Resend an invitation (regenerate token and reset expiration)
 */
router.post("/resendInvitation/:invitationId", CompanyInvitationController.resendInvitation);

/**
 * DELETE /deleteInvitation/:invitationId
 * Delete/revoke an invitation
 */
router.delete("/deleteInvitation/:invitationId", CompanyInvitationController.deleteInvitation);

/**
 * POST /respondInvitation/:invitationId
 * Accept or reject an invitation (body: { action: 'accept'|'reject' })
 */
router.post("/respondInvitation/:invitationId", CompanyInvitationController.respondInvitation);

/**
 * GET /invitations
 * Get all invitations for companies owned by current user
 */
router.get("/myInvitations", CompanyInvitationController.getCompanyInvitations);

module.exports = router;