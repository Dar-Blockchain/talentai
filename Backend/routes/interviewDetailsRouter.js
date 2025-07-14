const express = require("express");
const router = express.Router();
const interviewDetailsController = require("../controllers/interviewDetailsController");

// Importez les middlewares
const { controledAcces } = require('../middleware/controledAcces'); 
const authLogMiddleware = require("../middleware/SystemeLogs/LogMiddleware")
const { requireAuthUser } = require("../middleware/authMiddleware");


router.use(requireAuthUser,controledAcces('Candidat'), authLogMiddleware("InterviewDetails"));


router.get("/", interviewDetailsController.getAll);

router.get("/getInterviewDetailsById/:id", interviewDetailsController.getInterviewDetailsById);


module.exports = router;
