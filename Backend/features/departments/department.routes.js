const express              = require("express");
const router               = express.Router();
const controller           = require("./department.controller");
const { validateCreate, validateUpdate } = require("./department.validation");
const { requireAuth }      = require("../../middleware/security/auth.middleware");
const { controledAcces }   = require("../../middleware/authorize.middleware");
const authLogMiddleware    = require("../../middleware/security/request-log.middleware");
const resolveCompanyActor  = require("../../middleware/resolve-company-actor.middleware");

router.use(requireAuth, controledAcces(["Company", "Employee"]), authLogMiddleware("Department"), resolveCompanyActor);

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
 *               name:        { type: string }
 *               description: { type: string }
 *     responses:
 *       201: { description: Department created }
 *   get:
 *     tags: [Departments]
 *     summary: List company departments
 *     parameters:
 *       - { in: query, name: search, schema: { type: string } }
 *       - { in: query, name: page,   schema: { type: integer, default: 1 } }
 *       - { in: query, name: limit,  schema: { type: integer, default: 20 } }
 *     responses:
 *       200: { description: List of departments }
 */
router.post("/", validateCreate, controller.createDepartment);
router.get("/",                  controller.getCompanyDepartments);

/**
 * @openapi
 * /departments/stats:
 *   get:
 *     tags: [Departments]
 *     summary: Department statistics
 *     responses:
 *       200: { description: Department stats }
 */
router.get("/stats", controller.getDepartmentStats);

/**
 * @openapi
 * /departments/{id}:
 *   get:
 *     tags: [Departments]
 *     summary: Get a department by ID
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string } }
 *     responses:
 *       200: { description: Department details }
 *       404: { description: Not found }
 *   put:
 *     tags: [Departments]
 *     summary: Update a department
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string } }
 *     responses:
 *       200: { description: Department updated }
 *   delete:
 *     tags: [Departments]
 *     summary: Delete a department
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string } }
 *     responses:
 *       200: { description: Department deleted }
 */
router.get("/:id",    controller.getDepartment);
router.put("/:id",    validateUpdate, controller.updateDepartment);
router.delete("/:id", controller.deleteDepartment);

module.exports = router;
