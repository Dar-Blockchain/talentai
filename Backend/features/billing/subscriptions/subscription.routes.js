const express = require("express");
const router = express.Router();
const subscriptionController = require("./subscription.controller");
const { requireAuth } = require("../../../middleware/security/auth.middleware");
const authLogMiddleware = require("../../../middleware/security/request-log.middleware.js");

router.get("/active",   requireAuth, authLogMiddleware("subscription"), subscriptionController.getActiveSubscription);
router.get("/combined", requireAuth, authLogMiddleware("subscription"), subscriptionController.getCombinedActiveDetails);
router.get("/",         requireAuth, authLogMiddleware("subscription"), subscriptionController.getCompanySubscriptions);

router.get("/:subscriptionId/details",           requireAuth, authLogMiddleware("subscription"), subscriptionController.getSubscriptionDetails);
router.get("/:companyProfileId/check-limit/:limitType", requireAuth, authLogMiddleware("subscription"), subscriptionController.checkLimit);

router.post("/:subscriptionId/cancel",           requireAuth, authLogMiddleware("subscription"), subscriptionController.cancelSubscription);
router.post("/:subscriptionId/enable-auto-renew", requireAuth, authLogMiddleware("subscription"), subscriptionController.enableAutoRenew);

module.exports = router;
