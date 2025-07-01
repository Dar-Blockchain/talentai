const express = require("express");
const router = express.Router();
const projectController = require("../controllers/projectContoller");
const { requireAuthUser } = require('../middleware/authMiddleware');

router.post("/addProject",requireAuthUser, projectController.createProject); // Créer un projet
router.get("/getAllProjects",requireAuthUser, projectController.getAllProjects); // Récupérer tous les projets
router.get("/getProjectById/:id",requireAuthUser, projectController.getProjectById); // Récupérer un projet par ID
router.put("/updateProject/:id",requireAuthUser, projectController.updateProject); // Mettre à jour un projet
router.delete("/deleteProject/:id",requireAuthUser, projectController.deleteProject); // Supprimer un projet

module.exports = router;
