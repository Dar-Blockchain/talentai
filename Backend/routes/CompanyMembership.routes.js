const express = require("express");
const router = express.Router();
const CompanyMembershipController = require("../controllers/ProfileControllers/CompanyMembership.controller");
const { requireAuthUser } = require("../middleware/auth.middleware");
const authLogMiddleware = require("../middleware/security/request-log.middleware");
const resolveCompanyActor = require("../middleware/resolve-company-actor.middleware");
const { controledAcces } = require("../middleware/authorize.middleware.js");

// ========== MIDDLEWARE: Authentication + Logging ==========
// All routes below require an authenticated user and are logged
router.use(requireAuthUser,  controledAcces("Company"), authLogMiddleware("memberships"));

// Get statistics for a company's memberships (counts by role/status)
router.get(
  "/memberships/stats",
  resolveCompanyActor,
  CompanyMembershipController.getMembershipStats,
);

// Get all memberships for a company owned by the user
router.get("/memberships", resolveCompanyActor, CompanyMembershipController.getMembershipsByCompany);

// Get all memberships for a specific department in the current company
router.get(
  "/memberships/department/:departmentId",
  resolveCompanyActor,
  CompanyMembershipController.getMembershipsByDepartment,
);

// Delete a membership
router.delete("/:membershipId", resolveCompanyActor, CompanyMembershipController.deleteMembership);
// Update membership (role and/or department)
router.patch("/:membershipId", resolveCompanyActor, CompanyMembershipController.updateMembership);
// Update membership role
router.patch("/:membershipId/role", CompanyMembershipController.updateMembershipRole);
// Update membership department (assign or unassign)
router.patch("/:membershipId/department", resolveCompanyActor, CompanyMembershipController.updateMembershipDepartment);
module.exports = router;

