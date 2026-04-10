/**
 * Account Routes
 * Routes for managing Company accounts and their employees
 *
 * Middleware: requireAuthUser (all endpoints are protected)
 */

const express = require("express");
const router = express.Router();
const CompanyInvitationController = require("../controllers/ProfileControllers/CompanyInvitation.controller");
const { requireAuthUser } = require("../middleware/security/auth.middleware");
const authLogMiddleware = require("../middleware/security/request-log.middleware");
const resolveCompanyActor = require("../middleware/resolve-company-actor.middleware");

// ========== PUBLIC ROUTES (NO AUTHENTICATION REQUIRED) ==========
/**
 * POST /respondInvitation/:invitationId
 * Accept or reject an invitation (body: { action: 'accept'|'reject', firstName, lastName })
 * No authentication required - creates account for invited user
 */
router.post(
  "/respondInvitation/:invitationId",
  CompanyInvitationController.respondInvitation,
);

/**
 * GET /details/:invitationId
 * Get invitation details by ID
 */
router.get(
  "/details/:invitationId",
  CompanyInvitationController.getInvitationDetails,
);

// ========== PROTECTED ROUTES (AUTHENTICATION REQUIRED) ==========
// All routes below require an authenticated user and are logged
router.use(requireAuthUser, authLogMiddleware("sentInvitation"));

/**
 * POST /sentInvitation
 * Add a new employee to a Company account
 */
router.post(
  "/sentInvitation",
  resolveCompanyActor,
  CompanyInvitationController.sentInvitation,
);

/**
 * POST /resendInvitation/:invitationId
 * Resend an invitation (regenerate token and reset expiration)
 */
router.post(
  "/resendInvitation/:invitationId",
  resolveCompanyActor,
  CompanyInvitationController.resendInvitation,
);

/**
 * DELETE /deleteInvitation/:invitationId
 * Delete/revoke an invitation
 */
router.delete(
  "/deleteInvitation/:invitationId",
  CompanyInvitationController.deleteInvitation,
);

/**
 * GET /myInvitations
 * Get all invitations for companies owned by current user
 */
router.get(
  "/myInvitations",
  resolveCompanyActor,
  CompanyInvitationController.getCompanyInvitations,
);

/**
 * GET /byDepartment/:departmentId
 * Get all pending invitations for a specific department
 */
router.get(
  "/byDepartment/:departmentId",
  CompanyInvitationController.getInvitationsByDepartment,
);

module.exports = router;
