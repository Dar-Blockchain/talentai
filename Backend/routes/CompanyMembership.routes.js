const express = require("express");
const router = express.Router();
const CompanyMembershipController = require("../controllers/ProfileControllers/CompanyMembership.controller");
const { requireAuthUser } = require("../middleware/authMiddleware");
const authLogMiddleware = require("../middleware/SystemeLogs/LogMiddleware");
const resolveCompanyActor = require("../middleware/resolveCompanyActor");

// ========== MIDDLEWARE: Authentication + Logging ==========
// All routes below require an authenticated user and are logged
router.use(requireAuthUser, authLogMiddleware("memberships"));

// Get all memberships for a company owned by the user
router.get("/memberships",resolveCompanyActor, CompanyMembershipController.getMembershipsByCompany);

// Delete a membership
router.delete("/:membershipId", resolveCompanyActor,CompanyMembershipController.deleteMembership);

// Update membership role
router.patch("/:membershipId/role", CompanyMembershipController.updateMembershipRole);

module.exports = router;