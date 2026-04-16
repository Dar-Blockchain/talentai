/**
 * CV Analysis Routes
 *
 * Endpoints for CV analysis CRUD operations
 */
const express = require("express");
const router = express.Router();
const CVAnalysisController = require("../controllers/cvAnalysis.controller");

// ===== CRUD Operations =====

// POST /cv-analysis
// Description: Create a new CV analysis record
router.post("/", CVAnalysisController.createCVAnalysis);

// GET /cv-analysis
// Description: Get all CV analyses with pagination and filtering
router.get("/", CVAnalysisController.getAllCVAnalyses);

// GET /cv-analysis/stats
// Description: Get CV analysis statistics
router.get("/stats", CVAnalysisController.getCVAnalysisStats);

// GET /cv-analysis/search
// Description: Search CV analyses
router.get("/search", CVAnalysisController.searchCVAnalyses);

// GET /cv-analysis/:id
// Description: Get a specific CV analysis by ID
router.get("/:id", CVAnalysisController.getCVAnalysisById);

// PUT /cv-analysis/:id
// Description: Update a(n) CV analysis by ID
router.put("/:id", CVAnalysisController.updateCVAnalysis);

// DELETE /cv-analysis/:id
// Description: Delete a(n) CV analysis by ID
router.delete("/:id", CVAnalysisController.deleteCVAnalysis);

// ===== Filter Operations =====

// GET /cv-analysis/user/:userId
// Description: Get all CV analyses for a specific user
router.get("/user/:userId", CVAnalysisController.getCVAnalysesByUserId);

// GET /cv-analysis/company/:companyId
// Description: Get all CV analyses for a specific company
router.get("/company/:companyId", CVAnalysisController.getCVAnalysesByCompanyId);

// GET /cv-analysis/seniority/:seniority
// Description: Get CV analyses filtered by seniority level
router.get("/seniority/:seniority", CVAnalysisController.getCVAnalysesBySeniority);

module.exports = router;
