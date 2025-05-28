const rummyGameLogic = require('../services/rummyGameLogic');
const claudeService = require('../services/claudeService');
const statisticsService = require('../services/statisticsService');

// In-memory game storage (in production, this would be in a database)
const activeGames = new Map();

class GameController {
  constructor() {
    this.games = new Map();
    console.log('Game controller initialized with statistics service');

    // Bind 'this' for all methods used as route handlers or in callbacks
    this.createGame = this.createGame.bind(this);
    this.getGameState = this.getGameState.bind(this);
    this.drawCard = this.drawCard.bind(this);
    this.discardCard = this.discardCard.bind(this);
    this.formMeld = this.formMeld.bind(this);
    this.declareGame = this.declareGame.bind(this);
    this.getSuggestion = this.getSuggestion.bind(this);
    this.getGameAnalysis = this.getGameAnalysis.bind(this);
    this.makeBotMove = this.makeBotMove.bind(this); // Crucial for setTimeout
  }

  // Create a new game
  async createGame(req, res) {
    try {
      const { playerName = 'Player' } = req.body;
      
      // Initialize new game
      const gameState = rummyGameLogic.initializeGame();
      const gameId = `game_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      gameState.gameId = gameId;
      gameState.playerName = playerName;
      
      // Store game in memory
      activeGames.set(gameId, gameState);
      
      // Calculate initial hand scores
      const playerScore = rummyGameLogic.calculateHandScore(
        gameState.playerHand, 
        gameState.playerMelds, 
        gameState.jokerCard
      );
      
      console.log(`Created new game ${gameId} for player ${playerName}`);
      
      res.json({
        success: true,
        gameId: gameId,
        gameState: {
          gameId,
          playerHand: gameState.playerHand,
          openDeck: gameState.openDeck,
          closedDeckCount: gameState.closedDeck.length,
          jokerCard: gameState.jokerCard,
          currentPlayer: gameState.currentPlayer,
          gameStatus: gameState.gameStatus,
          playerScore: playerScore,
          playerMelds: gameState.playerMelds
        }
      });

    } catch (error) {
      console.error('Create game error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create new game'
      });
    }
  }

  // Get current game state
  async getGameState(req, res) {
    try {
      const { gameId } = req.params;
      const gameState = activeGames.get(gameId);
      
      if (!gameState) {
        return res.status(404).json({
          success: false,
          error: 'Game not found'
        });
      }
      
      const playerScore = rummyGameLogic.calculateHandScore(
        gameState.playerHand, 
        gameState.playerMelds, 
        gameState.jokerCard
      );
      
      res.json({
        success: true,
        gameState: {
          gameId,
          playerHand: gameState.playerHand,
          openDeck: gameState.openDeck,
          closedDeckCount: gameState.closedDeck.length,
          jokerCard: gameState.jokerCard,
          currentPlayer: gameState.currentPlayer,
          gameStatus: gameState.gameStatus,
          playerScore: playerScore,
          playerMelds: gameState.playerMelds,
          lastMove: gameState.lastMove
        }
      });

    } catch (error) {
      console.error('Get game state error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get game state'
      });
    }
  }

  // Draw a card from either closed or open deck
  async drawCard(req, res) {
    try {
      const { gameId } = req.params;
      const { source } = req.body; // 'closed' or 'open'
      
      const gameState = activeGames.get(gameId);
      if (!gameState) {
        return res.status(404).json({
          success: false,
          error: 'Game not found'
        });
      }
      
      if (gameState.currentPlayer !== 'player') {
        return res.status(400).json({
          success: false,
          error: 'Not your turn'
        });
      }
      
      let drawnCard;
      
      if (source === 'closed') {
        drawnCard = rummyGameLogic.drawFromClosedDeck(gameState);
      } else if (source === 'open') {
        drawnCard = rummyGameLogic.drawFromOpenDeck(gameState);
      } else {
        return res.status(400).json({
          success: false,
          error: 'Invalid draw source. Must be "closed" or "open"'
        });
      }
      
      // Add card to player's hand
      gameState.playerHand.push(drawnCard);
      
      // Add move to history
      rummyGameLogic.addToHistory(gameState, {
        player: 'player',
        action: 'draw',
        source: source,
        card: drawnCard
      });
      
      // Update game state
      activeGames.set(gameId, gameState);
      
      const playerScore = rummyGameLogic.calculateHandScore(
        gameState.playerHand, 
        gameState.playerMelds, 
        gameState.jokerCard
      );
      
      res.json({
        success: true,
        drawnCard: drawnCard,
        gameState: {
          gameId,
          playerHand: gameState.playerHand,
          openDeck: gameState.openDeck,
          closedDeckCount: gameState.closedDeck.length,
          jokerCard: gameState.jokerCard,
          currentPlayer: gameState.currentPlayer,
          gameStatus: gameState.gameStatus,
          playerScore: playerScore,
          playerMelds: gameState.playerMelds
        }
      });

    } catch (error) {
      console.error('Draw card error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to draw card'
      });
    }
  }

  // Discard a card
  async discardCard(req, res) {
    try {
      const { gameId } = req.params;
      const { cardIndex } = req.body;
      
      const gameState = activeGames.get(gameId);
      if (!gameState) {
        return res.status(404).json({
          success: false,
          error: 'Game not found'
        });
      }
      
      if (gameState.currentPlayer !== 'player') {
        return res.status(400).json({
          success: false,
          error: 'Not your turn'
        });
      }

      // Validate cardIndex
      if (cardIndex === undefined || cardIndex < 0 || cardIndex >= gameState.playerHand.length) {
        return res.status(400).json({
          success: false,
          error: 'Invalid card index'
        });
      }
      
      // Remove the card from player's hand using index
      const discardedCard = gameState.playerHand.splice(cardIndex, 1)[0];
      
      // Add card to open deck
      rummyGameLogic.discardCard(gameState, discardedCard);
      
      // Add move to history
      rummyGameLogic.addToHistory(gameState, {
        player: 'player',
        action: 'discard',
        card: discardedCard
      });
      
      // Switch turn to bot
      rummyGameLogic.switchTurn(gameState);
      
      // Update game state
      activeGames.set(gameId, gameState);
      
      const playerScore = rummyGameLogic.calculateHandScore(
        gameState.playerHand, 
        gameState.playerMelds, 
        gameState.jokerCard
      );
      
      // Trigger bot move with explicit binding for setTimeout to ensure 'this' context
      setTimeout(this.makeBotMove.bind(this, gameId), 1000);
      
      res.json({
        success: true,
        discardedCard: discardedCard,
        gameState: {
          gameId,
          playerHand: gameState.playerHand,
          openDeck: gameState.openDeck,
          closedDeckCount: gameState.closedDeck.length,
          jokerCard: gameState.jokerCard,
          currentPlayer: gameState.currentPlayer,
          gameStatus: gameState.gameStatus,
          playerScore: playerScore,
          playerMelds: gameState.playerMelds
        }
      });

    } catch (error) {
      console.error('Discard card error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to discard card'
      });
    }
  }

  // Form a meld (set or sequence)
  async formMeld(req, res) {
    try {
      const { gameId } = req.params;
      const { cardIds } = req.body;
      
      const gameState = activeGames.get(gameId);
      if (!gameState) {
        return res.status(404).json({
          success: false,
          error: 'Game not found'
        });
      }
      
      // Find the cards in player's hand
      const meldCards = cardIds.map(cardId => {
        return gameState.playerHand.find(card => card.id === cardId);
      }).filter(card => card !== undefined);
      
      if (meldCards.length !== cardIds.length) {
        return res.status(400).json({
          success: false,
          error: 'Some cards not found in hand'
        });
      }
      
      // Validate the meld
      const isValidSeq = rummyGameLogic.isValidSequence(meldCards, gameState.jokerCard);
      const isValidSet = rummyGameLogic.isValidSet(meldCards, gameState.jokerCard);
      
      if (!isValidSeq.valid && !isValidSet.valid) {
        return res.status(400).json({
          success: false,
          error: 'Invalid meld. Cards do not form a valid set or sequence.'
        });
      }
      
      // Add to player's melds
      gameState.playerMelds.push(meldCards);
      
      // Add move to history
      rummyGameLogic.addToHistory(gameState, {
        player: 'player',
        action: 'meld',
        cards: meldCards,
        meldType: isValidSeq.valid ? 'sequence' : 'set'
      });
      
      // Update game state
      activeGames.set(gameId, gameState);
      
      const playerScore = rummyGameLogic.calculateHandScore(
        gameState.playerHand, 
        gameState.playerMelds, 
        gameState.jokerCard
      );
      
      res.json({
        success: true,
        meld: meldCards,
        meldType: isValidSeq.valid ? 'sequence' : 'set',
        gameState: {
          gameId,
          playerHand: gameState.playerHand,
          openDeck: gameState.openDeck,
          closedDeckCount: gameState.closedDeck.length,
          jokerCard: gameState.jokerCard,
          currentPlayer: gameState.currentPlayer,
          gameStatus: gameState.gameStatus,
          playerScore: playerScore,
          playerMelds: gameState.playerMelds
        }
      });

    } catch (error) {
      console.error('Form meld error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to form meld'
      });
    }
  }

  // Declare the game
  async declareGame(req, res) {
    try {
      const { gameId } = req.params;
      
      const gameState = activeGames.get(gameId);
      if (!gameState) {
        return res.status(404).json({
          success: false,
          error: 'Game not found'
        });
      }
      
      if (gameState.currentPlayer !== 'player') {
        return res.status(400).json({
          success: false,
          error: 'Not your turn'
        });
      }
      
      // Check if player can declare
      const canDeclare = rummyGameLogic.canDeclareGame(
        gameState.playerHand, 
        gameState.playerMelds, 
        gameState.jokerCard
      );
      
      if (!canDeclare.valid) {
        return res.status(400).json({
          success: false,
          error: canDeclare.reason || 'Cannot declare with current hand and melds.'
        });
      }

      // Game declared successfully
      gameState.status = 'completed';
      gameState.winner = 'player';
      gameState.endTime = Date.now();
      
      // Update statistics
      statisticsService.updateStatistics(gameState);
      
      gameState.history.push({
        action: 'declare',
        player: 'player',
        timestamp: Date.now()
      });

      res.json({
        success: true,
        message: 'Game declared successfully!',
        gameState: {
          ...gameState,
          playerHand: gameState.playerHand,
          playerMelds: gameState.playerMelds,
          playerScore: rummyGameLogic.calculateHandScore(gameState.playerHand, gameState.playerMelds, gameState.jokerCard),
          botHandCount: gameState.botHand.length,
          botMelds: gameState.botMelds,
          botScore: rummyGameLogic.calculateHandScore(gameState.botHand, gameState.botMelds, gameState.jokerCard),
          gameId: gameState.gameId,
          openDeck: gameState.openDeck,
          closedDeckCount: gameState.closedDeck.length,
          jokerCard: gameState.jokerCard,
          currentPlayer: gameState.currentPlayer,
          gameStatus: gameState.status,
          winner: gameState.winner
        },
        statistics: statisticsService.getStatistics().statistics
      });

    } catch (error) {
      console.error('Error declaring game:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to declare game'
      });
    }
  }

  // Get AI suggestion for next move
  async getSuggestion(req, res) {
    try {
      const { gameId } = req.params;
      
      const gameState = activeGames.get(gameId);
      if (!gameState) {
        return res.status(404).json({
          success: false,
          error: 'Game not found'
        });
      }
      
      // Get suggestion from Claude
      const suggestion = await claudeService.getGameSuggestion(
        gameState.playerHand,
        gameState.openDeck,
        {
          jokerCard: gameState.jokerCard,
          playerMelds: gameState.playerMelds,
          gameStatus: gameState.gameStatus
        }
      );
      
      if (!suggestion.success) {
        return res.status(500).json({
          success: false,
          error: 'Failed to get AI suggestion',
          message: suggestion.message
        });
      }
      
      res.json({
        success: true,
        suggestion: suggestion.message,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Get suggestion error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get suggestion'
      });
    }
  }

  // Get post-game analysis
  async getGameAnalysis(req, res) {
    try {
      const { gameId } = req.params;
      
      const gameState = activeGames.get(gameId);
      if (!gameState) {
        return res.status(404).json({
          success: false,
          error: 'Game not found'
        });
      }
      
      if (gameState.gameStatus !== 'completed') {
        return res.status(400).json({
          success: false,
          error: 'Game is not completed yet'
        });
      }
      
      // Extract player and bot moves from history
      const playerMoves = gameState.gameHistory.filter(move => move.player === 'player');
      const botMoves = gameState.gameHistory.filter(move => move.player === 'bot');
      
      // Get analysis from Claude
      const analysis = await claudeService.analyzeGame(
        gameState.gameHistory,
        playerMoves,
        botMoves
      );
      
      if (!analysis.success) {
        return res.status(500).json({
          success: false,
          error: 'Failed to get game analysis',
          message: analysis.message
        });
      }
      
      res.json({
        success: true,
        analysis: analysis.message,
        gameStats: {
          duration: gameState.endedAt - gameState.createdAt,
          totalMoves: gameState.gameHistory.length,
          playerMoves: playerMoves.length,
          botMoves: botMoves.length,
          winner: gameState.winner
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Get game analysis error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get game analysis'
      });
    }
  }

  // Simple bot move logic (can be enhanced later)
  async makeBotMove(gameId) {
    try {
      const gameState = activeGames.get(gameId);
      if (!gameState || gameState.currentPlayer !== 'bot') {
        return;
      }
      
      // Simple bot logic: draw from closed deck and discard highest value card
      const drawnCard = rummyGameLogic.drawFromClosedDeck(gameState);
      gameState.botHand.push(drawnCard);
      
      // Find highest value card to discard
      let highestCard = gameState.botHand[0];
      for (let card of gameState.botHand) {
        if (card.value > highestCard.value) {
          highestCard = card;
        }
      }
      
      // Remove from bot hand and discard
      const cardIndex = gameState.botHand.findIndex(card => card.id === highestCard.id);
      const discardedCard = gameState.botHand.splice(cardIndex, 1)[0];
      rummyGameLogic.discardCard(gameState, discardedCard);
      
      // Add moves to history
      rummyGameLogic.addToHistory(gameState, {
        player: 'bot',
        action: 'draw',
        source: 'closed',
        card: drawnCard
      });
      
      rummyGameLogic.addToHistory(gameState, {
        player: 'bot',
        action: 'discard',
        card: discardedCard
      });
      
      // Switch turn back to player
      rummyGameLogic.switchTurn(gameState);
      
      // Update game state
      activeGames.set(gameId, gameState);
      
      console.log(`Bot made move in game ${gameId}: drew card and discarded ${discardedCard.rank} of ${discardedCard.suit}`);
      
    } catch (error) {
      console.error('Bot move error:', error);
    }
  }
}

module.exports = new GameController(); 