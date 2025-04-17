const { createAgent, createToken } = require('../controllers/agentIAController');
const express = require('express');

const router = express.Router();

router.post('/create-agent', createAgent);
router.post('/create-token', createToken);

module.exports = router; 
