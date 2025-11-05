/**
 * Routes d'outils Hedera (création de token, topics, messages, soldes, etc.)
 *
 * Middlewares globaux appliqués:
 * - requireAuthUser: nécessite un utilisateur authentifié
 * - LogMiddleware("HederaTools"): journalise l'utilisation des outils
 */
const express = require("express");
const router = express.Router();
const hederaToolsController = require("../controllers/hederaToolsController");

// Import des middlewares
const { requireAuthUser } = require('../middleware/authMiddleware');
const authLogMiddleware = require("../middleware/SystemeLogs/LogMiddleware");

// Auth requis + journalisation
router.use(requireAuthUser);
//router.use(requireAuthUser, authLogMiddleware("HederaTools"));

// Routes Hedera Tools - Appels directs sans LLM

/**
 * @route POST /hedera-tools/create-token
 * @desc Crée un token fongible via Hedera Agent Kit
 * @access Privé
 */
router.post("/create-token", hederaToolsController.createFungibleToken);

/**
 * @route POST /hedera-tools/create-topic
 * @desc Crée un topic de consensus via Hedera Agent Kit
 * @access Privé
 */
router.post("/create-topic", hederaToolsController.createTopic);

/**
 * @route POST /hedera-tools/submit-message
 * @desc Envoie un message sur un topic de consensus
 * @access Privé
 */
router.post("/submit-message", hederaToolsController.submitTopicMessage);

/**
 * @route GET /hedera-tools/balance
 * @desc Récupère le solde HBAR pour un compte donné
 * @access Privé
 */
router.get("/balance", hederaToolsController.getHbarBalance);

/**
 * @route GET /hedera-tools/my-balance
 * @desc Récupère le solde HBAR du compte configuré courant
 * @access Privé
 */
router.get("/my-balance", hederaToolsController.getMyBalance);

/**
 * @route GET /hedera-tools/tools
 * @desc Informations sur les outils disponibles Hedera Agent Kit
 * @access Privé
 */
router.get("/tools", hederaToolsController.getAvailableTools);

/**
 * @route POST /hedera-tools/create-evaluation-topic
 * @desc Crée un topic d'évaluation pour le pipeline candidat (via credentials d'agent)
 * @access Privé
 */
router.post("/create-evaluation-topic", hederaToolsController.createEvaluationTopic);

/**
 * @route POST /hedera-tools/submit-evaluation-message
 * @desc Soumet un message d'évaluation HCS-11 à un topic existant
 * @access Privé
 */
router.post("/submit-evaluation-message", hederaToolsController.submitEvaluationMessage);

/**
 * @route POST /hedera-tools/send-validation-message
 * @desc Envoie un message de validation HCS-11 vers un topic d'évaluation
 * @access Privé
 */
router.post("/send-validation-message", hederaToolsController.sendValidationMessage);

/**
 * @route GET /hedera-tools/evaluation-topic/:topicId
 * @desc Détails et messages d'un topic d'évaluation
 * @access Privé
 */
router.get("/evaluation-topic/:topicId", hederaToolsController.getEvaluationTopic);

/**
 * @route GET /hedera-tools/evaluation-topics
 * @desc Liste tous les topics d'évaluation (filtres: company, postId, status)
 * @access Privé
 */
router.get("/evaluation-topics", hederaToolsController.getEvaluationTopics);

module.exports = router;