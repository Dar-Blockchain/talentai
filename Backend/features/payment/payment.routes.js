const express = require("express");
const router = express.Router();
const paymentController = require("./payment.controller");
const { requireAuth } = require("../../middleware/security/auth.middleware");
const authLogMiddleware = require("../../middleware/security/request-log.middleware.js");

router.post("/verify", paymentController.verifyPaymentStatus);

router.get(
  "/user/history",
  requireAuth,
  authLogMiddleware("payments"),
  paymentController.getUserPaymentHistory
);

module.exports = router;
