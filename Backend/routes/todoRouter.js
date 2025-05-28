const express = require('express');
const router = express.Router();
const todoController  = require('../controllers/todoController');

const { requireAuthUser } = require('../middleware/authMiddleware');
router.use(requireAuthUser);

router.post('/profile', todoController.generateTodoListForProfile);
router.get('/profile', todoController.getTodoListOfProfile);

module.exports = router; 