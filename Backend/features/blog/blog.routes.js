const express = require("express");
const router = express.Router();
const controller = require("./blog.controller");
const { requireAuth } = require("../../middleware/security/auth.middleware");
const { controledAcces } = require("../../middleware/authorize.middleware.js");
const uploadfile = require("../../middleware/file-upload.middleware");

const adminOnly = controledAcces("Admin");

// Public — no auth required
router.get("/public", controller.listPublic);
router.get("/public/:slug", controller.getPublicBySlug);

// Admin-only
router.get("/preview/:slug", requireAuth, adminOnly, controller.previewBySlug);
router.get("/", requireAuth, adminOnly, controller.list);
router.post("/", requireAuth, adminOnly, controller.create);
router.post("/upload-image", requireAuth, adminOnly, uploadfile.single("image"), controller.uploadImage);
router.get("/:id", requireAuth, adminOnly, controller.get);
router.patch("/:id", requireAuth, adminOnly, controller.update);
router.delete("/:id", requireAuth, adminOnly, controller.remove);
router.patch("/:id/publish", requireAuth, adminOnly, controller.publish);
router.patch("/:id/unpublish", requireAuth, adminOnly, controller.unpublish);

module.exports = router;
