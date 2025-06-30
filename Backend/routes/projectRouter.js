const express = require("express");
const router = express.Router();
const projectController = require("../controllers/project.controller");

router.post("/addProject", projectController.createProject); // Créer un projet
router.get("/getAllProjects", projectController.getAllProjects); // Récupérer tous les projets
router.get("/getProjectById/:id", projectController.getProjectById); // Récupérer un projet par ID
router.put("/updateProject/:id", projectController.updateProject); // Mettre à jour un projet
router.delete("/deleteProject/:id", projectController.deleteProject); // Supprimer un projet

module.exports = router;
