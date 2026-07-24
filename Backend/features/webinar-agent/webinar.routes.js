const express    = require("express");
const router     = express.Router();
const controller = require("./webinar.controller");
const { requireAuth, attachUserIfPresent } = require("../../middleware/security/auth.middleware");
const { controledAcces } = require("../../middleware/authorize.middleware.js");

const adminOnly = controledAcces("Admin");

// Public — no auth required, but a logged-in admin is identified (if present)
// so draft webinars can still be previewed before publishing.
router.get("/public/active", controller.getActive);
router.get("/public/:id",    attachUserIfPresent, controller.getPublic);

// Admin-only
router.get(   "/",                   requireAuth, adminOnly, controller.list);
router.post(  "/",                   requireAuth, adminOnly, controller.create);
router.get(   "/:id",                requireAuth, adminOnly, controller.get);
router.patch( "/:id",                requireAuth, adminOnly, controller.update);
router.delete("/:id",                requireAuth, adminOnly, controller.remove);
router.patch( "/:id/verify",         requireAuth, adminOnly, controller.verify);
router.post(  "/:id/send-link",      requireAuth, adminOnly, controller.sendLinkReminder);
router.post(  "/:id/invite",         requireAuth, adminOnly, controller.invite);
router.get(   "/:id/submissions",    requireAuth, adminOnly, controller.listSubmissions);

module.exports = router;
