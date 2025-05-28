const express = require('express');
const router = express.Router();
const gameController = require('../controllers/gameController');

// POST /api/game/create - Create a new game
router.post('/create', gameController.createGame);

// GET /api/game/:gameId - Get game state
router.get('/:gameId', gameController.getGameState);

// POST /api/game/:gameId/draw - Draw a card
router.post('/:gameId/draw', gameController.drawCard);

// POST /api/game/:gameId/discard - Discard a card
router.post('/:gameId/discard', gameController.discardCard);

// POST /api/game/:gameId/meld - Form a meld
router.post('/:gameId/meld', gameController.formMeld);

// POST /api/game/:gameId/declare - Declare the game
router.post('/:gameId/declare', gameController.declareGame);

// GET /api/game/:gameId/suggest - Get AI suggestion
router.get('/:gameId/suggest', gameController.getSuggestion);

// GET /api/game/:gameId/analysis - Get post-game analysis
router.get('/:gameId/analysis', gameController.getGameAnalysis);

module.exports = router; 