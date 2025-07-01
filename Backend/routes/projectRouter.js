const express = require("express");
const router = express.Router();
const projectController = require("../controllers/projectContoller");

// Importez les middlewares
const { requireAuthUser } = require('../middleware/authMiddleware');
const { controledAcces } = require('../middleware/controledAcces');
const authLogMiddleware = require("../middleware/SystemeLogs/LogMiddleware")


router.use(requireAuthUser,controledAcces('Candidat'), authLogMiddleware("Project"));

// Créer un projet
router.post("/addProject", projectController.createProject); 

// Récupérer tous les projets
router.get("/getAllProjects", projectController.getAllProjects); 

// Récupérer tous les projets de l'utilisateur connecté
router.get("/getMyProjects", projectController.getMyProjects); 

// Récupérer nombre des projets
router.get("/getNumberProjects", projectController.getNumberProjects); 

// Récupérer un projet par ID
router.get("/getProjectById/:id", projectController.getProjectById); 

// Mettre à jour un projet
router.put("/updateProject/:id", projectController.updateProject); 

// Supprimer un projet
router.delete("/deleteProject/:id", projectController.deleteProject); 

// Générer des questions pour un projet
router.get("/generateQuestions/:id/:assessmentType", projectController.generateProjectQuestions);

// Récupérer le nombre de projets de l'utilisateur connecté
router.get("/getNumberProjects", projectController.getNumberProjects);

module.exports = router;
