const express = require("express");
const router = express.Router();
const skillsInterviewAssessment = require("./skill-interview.controller");

// Import middlewares
const { requireAuth } = require("../../../middleware/security/auth.middleware");
const authLogMiddleware = require("../../../middleware/security/request-log.middleware");

// ========== AUTHENTICATED ROUTES ==========
router.use(requireAuth, authLogMiddleware("SkillInterviewAssessment"));

/**
 * @openapi
 * /skill-interview-assessments/my:
 *   get:
 *     tags: [Skill Interview Assessments]
 *     summary: Get current user's skill interview assessments
 *     responses:
 *       200:
 *         description: List of assessments
 */
router.get("/my", skillsInterviewAssessment.getMy);

/**
 * @openapi
 * /skill-interview-assessments/{id}:
 *   get:
 *     tags: [Skill Interview Assessments]
 *     summary: Get a skill interview assessment by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Assessment details
 *       404:
 *         description: Not found
 */
router.get("/:id", skillsInterviewAssessment.getById);

module.exports = router;
