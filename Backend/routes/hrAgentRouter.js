/**
 * Routes des agents RH (validation, profils HCS-11, diagnostics, outillage)
 *
 * Middlewares globaux appliqués:
 * - requireAuthUser: nécessite un utilisateur authentifié
 * - LogMiddleware("HRAgent"): journalise les actions sur les agents RH
 *
 * Remarque: bien que certaines routes soient destinées aux administrateurs,
 * la restriction de rôle n'est pas appliquée ici. À envisager si besoin:
 * `controledAcces('Admin')`.
 */
const express = require("express");
const router = express.Router();
const hrAgentController = require("../controllers/hrAgentController");

// Import middlewares
const { requireAuthUser } = require('../middleware/authMiddleware');
const authLogMiddleware = require("../middleware/SystemeLogs/LogMiddleware");

// Auth requis + journalisation
router.use(requireAuthUser, authLogMiddleware("HRAgent"));

/**
 * @route POST /hr-agents/initialize
 * @desc Initialise 6 agents de validation RH avec portefeuilles Hedera (opération unique)
 * @access Privé (Admin recommandé)
 */
router.post("/initialize", hrAgentController.initializeAgents);

/**
 * @route POST /hr-agents/initialize-single
 * @desc Initialize single HR agent with HCS-11 profile using data from request body
 * @access Private (Admin only)
 */
router.post("/initialize-single", hrAgentController.initializeSingleAgent);

/**
 * @route POST /hr-agents
 * @desc Crée un nouvel agent RH
 * @access Privé (Admin recommandé)
 */
router.post("/", hrAgentController.createAgent);

/**
 * @route GET /hr-agents/all
 * @desc Liste tous les agents RH
 * @access Privé
 */
router.get("/all", hrAgentController.getAllAgents);

/**
 * @route GET /hr-agents/company/:companyId
 * @desc Récupère les agents par entreprise (Company)
 * @access Privé
 */
router.get("/company", hrAgentController.getAgentsByCompany);

/**
 * @route GET /hr-agents/avatar/:avatarName
 * @desc Récupère un agent par nom d'avatar
 * @access Privé
 */
router.get("/avatar/:avatarName", hrAgentController.getAgentByAvatar);

/**
 * @route GET /hr-agents/role/:role
 * @desc Récupère les agents par rôle
 * @access Privé
 */
router.get("/role/:role", hrAgentController.getAgentsByRole);

/**
 * @route POST /hr-agents/send-validation-message
 * @desc Envoie un message de validation (Sinda → Coordinateur) via LangChain TogetherAI
 * @access Privé
 */
router.post("/send-validation-message", hrAgentController.sendValidationMessage);

/**
 * @route POST /hr-agents/submit-evaluation-message
 * @desc Déclenche une conversation automatisée entre deux agents (LangChain TogetherAI)
 * @access Privé
 */
router.post("/submit-evaluation-message", hrAgentController.submitEvaluationMessage);

/**
 * @route GET /hr-agents/diagnose/:coordinatorId
 * @desc Diagnostique les problèmes du coordinateur et vérifie le proof of reception
 * @access Privé
 */
router.get("/diagnose/:coordinatorId", hrAgentController.diagnoseCoordinator);

/**
 * @route POST /hr-agents/fix-proof-of-reception
 * @desc Envoie manuellement le proof of reception pour un coordinateur
 * @access Privé
 */
router.post("/fix-proof-of-reception", hrAgentController.fixProofOfReception);

/**
 * @route POST /hr-agents/fix-memo/:agentId
 * @desc Corrige le mémo HCS-11 pour résoudre les problèmes de validation de profil
 * @access Privé
 */
router.post("/fix-memo/:agentId", hrAgentController.fixAgentMemo);

/**
 * @route GET /hr-agents/check-all
 * @desc Vérifie la configuration de tous les agents et propose des recommandations
 * @access Privé
 */
router.get("/check-all", hrAgentController.checkAllAgents);

/**
 * @route GET /hr-agents/profile/:agentId
 * @desc Détails du profil HCS-11 et des topics de communication d'un agent
 * @access Privé
 */
router.get("/profile/:agentId", hrAgentController.getAgentProfile);

/**
 * @route POST /hr-agents/validate-hcs11/:agentId
 * @desc Valide la conformité HCS-11 du profil agent
 * @access Privé
 */
router.post("/validate-hcs11/:agentId", hrAgentController.validateAgentHCS11);

/**
 * @route PUT /hr-agents/update-profile/:agentId
 * @desc Met à jour le profil HCS-11 de l'agent
 * @access Privé
 */
router.put("/update-profile/:agentId", hrAgentController.updateAgentProfile);

/**
 * @route GET /hr-agents/verify-memo/:accountId
 * @desc Vérifie le mémo HCS-11 sur un compte Hedera
 * @access Privé
 */
router.get("/verify-memo/:accountId", hrAgentController.verifyAccountMemo);

/**
 * @route POST /hr-agents/update-all-memos
 * @desc Met à jour en masse les mémos HCS-11 de tous les agents actifs
 * @access Privé
 */
router.post("/update-all-memos", hrAgentController.updateAllAgentMemos);

/**
 * @route GET /hr-agents/test-langchain
 * @desc Teste la fonctionnalité de l'agent LangChain TogetherAI
 * @access Privé
 */
router.get("/test-langchain", hrAgentController.testLangChainAgent);

/**
 * @route GET /hr-agents/test-memo/:agentId
 * @desc Teste la création de mémo pour un agent spécifique
 * @access Privé
 */
router.get("/test-memo/:agentId", hrAgentController.testMemoCreation);

/**
 * @route GET /hr-agents/system-status
 * @desc Récupère l'état complet du système et les infos de migration
 * @access Privé
 */
router.get("/system-status", hrAgentController.systemStatus);

/**
 * @route POST /hr-agents/debug-memo/:agentId
 * @desc Débug et corrige le mémo HCS-11 pour un agent donné
 * @access Privé
 */
router.post("/debug-memo/:agentId", hrAgentController.debugAndFixMemo);

/**
 * @route GET /hr-agents/hcs11-profile/:agentId
 * @desc Récupère le profil HCS-11 d'un agent via le SDK Standards
 * @access Privé
 */
router.get("/hcs11-profile/:agentId", hrAgentController.getAgentHCS11Profile);

/**
 * @route POST /hr-agents/refresh-profiles/:agentId?
 * @desc Rafraîchit les profils des agents depuis Hedera (un ou tous)
 * @access Privé
 */
router.post("/refresh-profiles/:agentId?", hrAgentController.refreshAgentProfiles);

module.exports = router;