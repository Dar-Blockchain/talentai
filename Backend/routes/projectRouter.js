const express = require("express");
const router = express.Router();
const projectController = require("../controllers/projectContoller");

// Importez les middlewares
const { requireAuthUser } = require('../middleware/authMiddleware');
const { controledAcces } = require('../middleware/controledAcces');
const authLogMiddleware = require("../middleware/SystemeLogs/LogMiddleware")


router.use(requireAuthUser,controledAcces('Candidat'), authLogMiddleware("Project"));


router.post("/addProject", projectController.createProject); // Créer un projet
router.get("/getAllProjects", projectController.getAllProjects); // Récupérer tous les projets
router.get("/getMyProjects", projectController.getMyProjects); // Récupérer tous les projets
router.get("/getProjectById/:id", projectController.getProjectById); // Récupérer un projet par ID
router.put("/updateProject/:id", projectController.updateProject); // Mettre à jour un projet
router.delete("/deleteProject/:id", projectController.deleteProject); // Supprimer un projet
router.get("/generateQuestions/:id/:assessmentType", projectController.generateProjectQuestions);

module.exports = router;
