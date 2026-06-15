const express    = require("express");
const router     = express.Router();
const controller = require("./feedback.controller");

const { requireAuth }    = require("../../middleware/security/auth.middleware");
const authLogMiddleware  = require("../../middleware/security/request-log.middleware");

router.use(requireAuth, authLogMiddleware("Feedback"));

/**
 * @openapi
 * /feedbacks/:
 *   post:
 *     tags: [Feedbacks]
 *     summary: Submit user feedback
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [rating]
 *             properties:
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *                 example: 4
 *               comment:
 *                 type: string
 *                 maxLength: 1000
 *                 example: "Great experience overall."
 *               interviewId:
 *                 type: string
 *                 description: MongoDB ObjectId of the related interview (optional)
 *                 example: "664f1a2b3c4d5e6f7a8b9c0d"
 *     responses:
 *       201:
 *         description: Feedback recorded
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 userId:
 *                   type: string
 *                 rating:
 *                   type: integer
 *                 comment:
 *                   type: string
 *                 interviewId:
 *                   type: string
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post("/", controller.create);

module.exports = router;
