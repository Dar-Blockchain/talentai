const express = require("express");
const router = express.Router();
const departmentController = require("../controllers/department.controller");
const { requireAuth } = require("../middleware/security/auth.middleware");
const { controledAcces } = require("../middleware/authorize.middleware.js");
const authLogMiddleware = require("../middleware/security/request-log.middleware.js");
const resolveCompanyActor = require("../middleware/resolve-company-actor.middleware");

// all routes require authenticated company user
router.use(requireAuth, controledAcces(['Company', 'Employee']), authLogMiddleware("Department"));

/**
 * @openapi
 * /departments:
 *   post:
 *     tags: [Departments]
 *     summary: Create a department
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name: { type: string }
 *               description: { type: string }
 *     responses:
 *       201:
 *         description: Department created
 *   get:
 *     tags: [Departments]
 *     summary: List company departments (with optional search and pagination)
 *     parameters:
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200:
 *         description: List of departments
 */
router.post("/", departmentController.createDepartment);
router.get("/", departmentController.getCompanyDepartments);

/**
 * @openapi
 * /departments/stats:
 *   get:
 *     tags: [Departments]
 *     summary: Department statistics (member counts, etc.)
 *     responses:
 *       200:
 *         description: Department stats
 */
router.get("/stats", departmentController.getDepartmentStats);

/**
 * @openapi
 * /departments/{id}:
 *   get:
 *     tags: [Departments]
 *     summary: Get a department by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Department details
 *       404:
 *         description: Not found
 *   put:
 *     tags: [Departments]
 *     summary: Update a department
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               description: { type: string }
 *     responses:
 *       200:
 *         description: Department updated
 *   delete:
 *     tags: [Departments]
 *     summary: Delete a department
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Department deleted
 */
router.get("/:id", departmentController.getDepartment);
router.put("/:id", departmentController.updateDepartment);
router.delete("/:id", departmentController.deleteDepartment);

module.exports = router;
