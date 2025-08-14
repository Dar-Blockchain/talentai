const express = require("express");
const router = express.Router();
const projectController = require("../controllers/projectContoller");

// Importez les middlewares
const { requireAuthUser } = require('../middleware/authMiddleware');
const { controledAcces } = require('../middleware/controledAcces');
const authLogMiddleware = require("../middleware/SystemeLogs/LogMiddleware")

// ---- routes NOT PROTECTED with auth middleware ----
router.get('/memberTokenData/:token', projectController.decodeMemberToken);

router.use(requireAuthUser ,authLogMiddleware("Project"));

//---- routes PROTECTED with auth middleware ---
router.post("/addProject", projectController.createProject); 

router.get("/:projectId/export-pdf", projectController.exportProjectPdf);

//activate Team Member
router.post("/activate", projectController.activateTeamMember);

//activate Team Member
router.post("/resendTeamInvitation", projectController.resendTeamInvitation);

//add Member To Team Team 
router.post("/addMemberToTeam", projectController.addMemberToTeam);

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

router.post("/analyzeAnswers/:id/:assessmentType", projectController.analyzeAnswers);

// Récupérer le nombre de projets de l'utilisateur connecté
router.get("/getNumberProjects", projectController.getNumberProjects);

// Get all available project tracks
router.get("/tracks", projectController.getProjectTracks);

// Get all available project Stats
router.get("/ProjectStats", projectController.getProjectStats);

// Get all available project By tracks
router.get("/getProjectTracks", projectController.getProjectsByTrack);

// Get all available project Created Per Day
router.get("/getProjectsCreatedPerDay", projectController.getProjectsCreatedPerDay);

// Get all available project Count By Status
router.get("/getProjectsCountByStatus", projectController.getProjectsCountByStatus);

router.get('/teamMemberProjects', projectController.getTeamMemberProjects);
router.get('/leaderProjects', projectController.getLeaderProjects);



module.exports = router;
