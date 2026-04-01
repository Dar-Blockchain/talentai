const express = require("express");
const router = express.Router();
const departmentController = require("../controllers/department.controller");
const { requireAuthUser } = require("../middleware/auth.middleware");
const { controledAcces } = require("../middleware/authorize.middleware.js");
const authLogMiddleware = require("../middleware/security/request-log.middleware.js");
const resolveCompanyActor = require("../middleware/resolve-company-actor.middleware");

// all routes require authenticated company user
router.use(requireAuthUser,resolveCompanyActor, controledAcces(['Company', 'Employee']), authLogMiddleware("Department"));

// CRUD
router.post("/", departmentController.createDepartment);
// GET /departments?search=name&page=1&limit=20 — list company departments with optional name search and pagination
router.get("/", departmentController.getCompanyDepartments);
router.get("/:id", departmentController.getDepartment);
router.put("/:id", departmentController.updateDepartment);
router.delete("/:id", departmentController.deleteDepartment);

module.exports = router;
