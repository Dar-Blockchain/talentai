const express        = require("express");
const router         = express.Router();
const userController = require("./user.controller");
const { requireAuth } = require("../../middleware/security/auth.middleware");
const authLog        = require("../../middleware/security/request-log.middleware");

router.use(requireAuth, authLog("Users"));

router.put("/:userId", userController.updateUser);

module.exports = router;
