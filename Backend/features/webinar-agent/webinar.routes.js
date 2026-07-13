const express    = require("express");
const router     = express.Router();
const controller = require("./webinar.controller");
const { requireAuth }    = require("../../middleware/security/auth.middleware");
const { controledAcces } = require("../../middleware/authorize.middleware.js");

const adminOnly = controledAcces("Admin");

// Public — no auth required
router.get("/public/active", controller.getActive);
router.get("/public/:id",    controller.getPublic);

// Admin-only
router.get(   "/",                   requireAuth, adminOnly, controller.list);
router.post(  "/",                   requireAuth, adminOnly, controller.create);
router.get(   "/:id",                requireAuth, adminOnly, controller.get);
router.patch( "/:id",                requireAuth, adminOnly, controller.update);
router.delete("/:id",                requireAuth, adminOnly, controller.remove);
router.patch( "/:id/verify",         requireAuth, adminOnly, controller.verify);
router.post(  "/:id/refresh-stats",  requireAuth, adminOnly, controller.refreshStats);
router.post(  "/:id/send-link",      requireAuth, adminOnly, controller.sendLinkReminder);
router.get(   "/:id/submissions",    requireAuth, adminOnly, controller.listSubmissions);

module.exports = router;
