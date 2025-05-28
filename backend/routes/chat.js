const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');

// POST /api/chat - Send message to Claude and get response
router.post('/', chatController.sendMessage);

// GET /api/chat/history - Get chat history for a session (optional)
router.get('/history/:sessionId?', chatController.getChatHistory);

module.exports = router; 