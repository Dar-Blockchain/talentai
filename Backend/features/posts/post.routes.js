const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const { requireAuth } = require("../../middleware/security/auth.middleware");
const { verifyApiKey, checkScope } = require("../../middleware/security/api-key.middleware");
const postController = require("./post.controller");
const authLogMiddleware = require("../../middleware/security/request-log.middleware.js");
const { controledAcces } = require('../../middleware/authorize.middleware.js');
const resolveCompanyActor = require("../../middleware/resolve-company-actor.middleware");

const upload = multer({
  dest: path.join(__dirname, "../../uploads/temp/"),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedExtensions = [".json", ".csv", ".txt"];
    const fileExtension = path.extname(file.originalname).toLowerCase();
    if (allowedExtensions.includes(fileExtension)) {
      cb(null, true);
    } else {
      cb(new Error("Unsupported file format. Allowed: JSON, CSV, TXT"));
    }
  },
});

router.get("/search", postController.getAllPostsWithSearch);
router.get("/details/:id", postController.getPostDetailsPublic);
router.get("/public-stats", postController.getPublicStats);

router.use(requireAuth, authLogMiddleware("Post"));

router.post("/generate-job-post", upload.single("file"), controledAcces('Company'), resolveCompanyActor, postController.generateJobPost);
router.post("/save-post", checkScope(['write:posts']), resolveCompanyActor, postController.createPost);
router.get("/my-posts", resolveCompanyActor, postController.getUserPosts);
router.get("/metrics", resolveCompanyActor, postController.getPostMetrics);
router.get("/kpi/status-by-post", postController.getPostsStatusKPI);
router.put("/updatePost/:id", checkScope(['write:posts']), resolveCompanyActor, postController.updatePost);
router.patch("/updatePostStatus/:id", checkScope(['write:posts']), resolveCompanyActor, postController.updatePostStatus);
router.delete("/deletePost/:id", checkScope(['delete:posts']), resolveCompanyActor, postController.deletePost);
router.get("/adsPost", postController.getPostsByUserTopSkills);
router.get("/interview-config/:jobId", resolveCompanyActor, postController.getJobInterviewConfig);

module.exports = router;
