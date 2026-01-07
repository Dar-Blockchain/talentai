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
router.use(requireAuthUser, authLogMiddleware("Account"));

// ========== ACCOUNT MANAGEMENT ==========

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
 * GET /myEmployees
 * Retrieve the list of all employees for companies owned by current user
 */
router.get("/myEmployees", CompanyInvitationController.listMyEmployees);

/**
 * GET /accounts/:accountId/employees
 * Retrieve the list of all employees for a given account
 */
router.get("/:accountId/employees", CompanyInvitationController.listEmployees);


/**
 * PUT /accounts/:accountId/employees/:userId/role
 * Update an employee's role within a Company account
 */
router.put("/:OrganizationId/employees/:userId/role", CompanyInvitationController.updateRole);
/**
 * DELETE /accounts/:OrganizationId/employees/:userId
 * Retirer un employé d'un compte
 */
router.delete('/:OrganizationId/employees/:userId', CompanyInvitationController.removeEmployee);

module.exports = router;
