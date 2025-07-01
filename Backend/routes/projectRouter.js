const express = require("express");
const router = express.Router();
const projectController = require("../controllers/projectContoller");
const { requireAuthUser } = require('../middleware/authMiddleware');
const authLogMiddleware = require("../middleware/SystemeLogs/LogMiddleware")

router.post("/addProject",requireAuthUser, authLogMiddleware("Project"), projectController.createProject); // Créer un projet
router.get("/getAllProjects",requireAuthUser, authLogMiddleware("Project"), projectController.getAllProjects); // Récupérer tous les projets
router.get("/getProjectById/:id",requireAuthUser, authLogMiddleware("Project"), projectController.getProjectById); // Récupérer un projet par ID
router.put("/updateProject/:id",requireAuthUser, authLogMiddleware("Project"), projectController.updateProject); // Mettre à jour un projet
router.delete("/deleteProject/:id",requireAuthUser, authLogMiddleware("Project"), projectController.deleteProject); // Supprimer un projet

module.exports = router;
