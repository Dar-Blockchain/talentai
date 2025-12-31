/**
 * Account Routes
 * Routes for managing Company accounts and their employees
 *
 * Middleware: requireAuthUser (all endpoints are protected)
 */

const express = require("express");
const router = express.Router();
const accountController = require("../controllers/ProfileControllers/SharedAccountController");
const { requireAuthUser } = require("../middleware/authMiddleware");
const authLogMiddleware = require("../middleware/SystemeLogs/LogMiddleware");

// ========== MIDDLEWARE: Authentication + Logging ==========
// All routes below require an authenticated user and are logged
router.use(requireAuthUser, authLogMiddleware("Account"));

// ========== ACCOUNT MANAGEMENT ==========

/**
 * POST /accounts/create
 * Create a new Company account using the current authenticated user as owner
 */
router.post("/", accountController.createCompany);

/**
 * POST /accounts/employees
 * Add a new employee to a Company account
 */
router.post("/employees", accountController.addEmployee);

/**
 * GET /accounts/me/employees
 * Retrieve the list of all employees for companies owned by current user
 */
router.get("/myEmployees", accountController.listMyEmployees);

/**
 * GET /accounts/:accountId/employees
 * Retrieve the list of all employees for a given account
 */
router.get("/:accountId/employees", accountController.listEmployees);


/**
 * PUT /accounts/:accountId/employees/:userId/role
 * Update an employee's role within a Company account
 */
router.put("/:accountId/employees/:userId/role", accountController.updateRole);

module.exports = router;
