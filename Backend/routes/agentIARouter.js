const {
  createAgent,
  createToken,
  createTalentAIToken,
  mintTokenToUser,
} = require("../controllers/agentIAController");
const express = require("express");
const authLogMiddleware = require("../middleware/SystemeLogs/LogMiddleware")

const router = express.Router();

router.post("/create-agent",authLogMiddleware("agent"), createAgent);
// router.post('/create-token', createToken);
router.post("/create-talentai-token",authLogMiddleware("agent"), createTalentAIToken);
router.post("/mint-tokens",authLogMiddleware("agent"), mintTokenToUser);

module.exports = router;
