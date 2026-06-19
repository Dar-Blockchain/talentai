/**
 * Account Routes
 * Routes for managing Company accounts and their employees
 *
 * Middleware: requireAuthUser (all endpoints are protected)
 */

const express = require("express");
const router = express.Router();
const CompanyInvitationController = require("./company-invitation.controller");
const { requireAuth } = require("../../middleware/security/auth.middleware");
const authLogMiddleware = require("../../middleware/security/request-log.middleware");
const resolveCompanyActor = require("../../middleware/resolve-company-actor.middleware");

// ========== PUBLIC ROUTES (no auth required) ==========

/**
 * @openapi
 * /company-invitations/details/{invitationId}:
 *   get:
 *     tags: [Company Invitations]
 *     summary: Get invitation details (public — view before accepting)
 *     security: []
 *     parameters:
 *       - in: path
 *         name: invitationId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Invitation details
 *       404:
 *         description: Invitation not found
 */
router.get(
  "/details/:invitationId",
  CompanyInvitationController.getInvitationDetails,
);

/**
 * @openapi
 * /company-invitations/respondInvitation/{invitationId}:
 *   post:
 *     tags: [Company Invitations]
 *     summary: Accept or reject an invitation (public)
 *     security: []
 *     parameters:
 *       - in: path
 *         name: invitationId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [response]
 *             properties:
 *               response:
 *                 type: string
 *                 enum: [accepted, rejected]
 *     responses:
 *       200:
 *         description: Response recorded
 */
router.post(
  "/respondInvitation/:invitationId",
  CompanyInvitationController.respondInvitation,
);

// ========== AUTHENTICATED ROUTES ==========
router.use(requireAuth, authLogMiddleware("sentInvitation"));

/**
 * @openapi
 * /company-invitations/sentInvitation:
 *   post:
 *     tags: [Company Invitations]
 *     summary: Invite an employee to the company
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email: { type: string, format: email }
 *               role: { type: string }
 *               departmentId: { type: string }
 *     responses:
 *       201:
 *         description: Invitation sent
 */
router.post(
  "/sentInvitation",
  resolveCompanyActor,
  CompanyInvitationController.sentInvitation,
);

/**
 * @openapi
 * /company-invitations/resendInvitation/{invitationId}:
 *   post:
 *     tags: [Company Invitations]
 *     summary: Resend an invitation (regenerate token)
 *     parameters:
 *       - in: path
 *         name: invitationId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Invitation resent
 */
router.post(
  "/resendInvitation/:invitationId",
  resolveCompanyActor,
  CompanyInvitationController.resendInvitation,
);

/**
 * @openapi
 * /company-invitations/deleteInvitation/{invitationId}:
 *   delete:
 *     tags: [Company Invitations]
 *     summary: Revoke/delete an invitation
 *     parameters:
 *       - in: path
 *         name: invitationId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Invitation deleted
 */
router.delete(
  "/deleteInvitation/:invitationId",
  CompanyInvitationController.deleteInvitation,
);

/**
 * @openapi
 * /company-invitations/myInvitations:
 *   get:
 *     tags: [Company Invitations]
 *     summary: Get all invitations sent by current company
 *     responses:
 *       200:
 *         description: List of invitations
 */
router.get(
  "/myInvitations",
  resolveCompanyActor,
  CompanyInvitationController.getCompanyInvitations,
);

/**
 * @openapi
 * /company-invitations/byDepartment/{departmentId}:
 *   get:
 *     tags: [Company Invitations]
 *     summary: Get all pending invitations for a department
 *     parameters:
 *       - in: path
 *         name: departmentId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: List of invitations
 */
router.get(
  "/byDepartment/:departmentId",
  CompanyInvitationController.getInvitationsByDepartment,
);

module.exports = router;
