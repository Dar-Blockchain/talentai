const express = require("express");
const router = express.Router();
const linkedinPostController = require("../controllers/linkedinPostController");


// Importez les middlewares
const { requireAuthUser } = require("../middleware/authMiddleware");
const { controledAcces } = require('../middleware/controledAcces'); 
const authLogMiddleware = require("../middleware/SystemeLogs/LogMiddleware")


router.use(requireAuthUser,controledAcces('Company'), authLogMiddleware("LinkedinPost"));


router.post("/generate-job-post", linkedinPostController.generateJobPost);

module.exports = router;
