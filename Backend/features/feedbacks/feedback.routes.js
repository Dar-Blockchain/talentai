const express    = require("express");
const router     = express.Router();
const controller = require("./feedback.controller");

const { requireAuth }    = require("../../middleware/security/auth.middleware");
const authLogMiddleware  = require("../../middleware/security/request-log.middleware");

router.use(requireAuth, authLogMiddleware("Feedback"));

router.post("/", controller.create);

module.exports = router;
