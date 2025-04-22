const { createAgent, createToken, createTalentAIToken, mintTokenToUser } = require('../controllers/agentIAController');
const express = require('express');

const router = express.Router();

router.post('/create-agent', createAgent);
// router.post('/create-token', createToken);
router.post('/create-talentai-token', createTalentAIToken);
router.post('/mint-tokens', mintTokenToUser);

module.exports = router; 
