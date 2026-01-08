const express = require("express");
const router = express.Router();
const CompanyMembershipController = require("../controllers/ProfileControllers/CompanyMembershipController");
const { requireAuthUser } = require("../middleware/authMiddleware");
const authLogMiddleware = require("../middleware/SystemeLogs/LogMiddleware");

// ========== MIDDLEWARE: Authentication + Logging ==========
// All routes below require an authenticated user and are logged
router.use(requireAuthUser, authLogMiddleware("memberships"));

// Get all memberships for a company owned by the user
router.get("/memberships", CompanyMembershipController.getMembershipsByCompany);

// Delete a membership
router.delete("/:membershipId", CompanyMembershipController.deleteMembership);

// Update membership role
router.patch("/:membershipId/role", CompanyMembershipController.updateMembershipRole);

module.exports = router;