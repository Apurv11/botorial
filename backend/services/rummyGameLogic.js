class RummyGameLogic {
  constructor() {
    this.suits = ['hearts', 'diamonds', 'clubs', 'spades'];
    this.ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
    this.jokers = ['red_joker', 'black_joker'];
  }

  // Create a new deck with 52 cards + 2 jokers
  createDeck() {
    const deck = [];
    
    // Add regular cards
    for (let suit of this.suits) {
      for (let rank of this.ranks) {
        deck.push({
          suit: suit,
          rank: rank,
          value: this.getCardValue(rank),
          isJoker: false,
          id: `${rank}_${suit}`
        });
      }
    }
    
    // Add printed jokers
    for (let joker of this.jokers) {
      deck.push({
        suit: 'joker',
        rank: joker,
        value: 0,
        isJoker: true,
        id: joker
      });
    }
    
    return deck;
  }

  // Get point value of a card for scoring
  getCardValue(rank) {
    if (rank === 'A') return 1;
    if (['J', 'Q', 'K'].includes(rank)) return 10;
    return parseInt(rank) || 10;
  }

  // Fisher-Yates shuffle algorithm
  shuffleDeck(deck) {
    const shuffled = [...deck];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  // Initialize a new game
  initializeGame() {
    const deck = this.createDeck();
    const shuffledDeck = this.shuffleDeck(deck);
    
    // Deal 13 cards to each player (user and bot)
    const playerHand = shuffledDeck.splice(0, 13);
    const botHand = shuffledDeck.splice(0, 13);
    
    // Initialize open deck with one card from remaining deck
    const openDeck = [shuffledDeck.pop()];
    
    // Remaining cards form the closed deck
    const closedDeck = shuffledDeck;
    
    // Determine random joker from the deck (wild card)
    const jokerCard = this.determineJoker(closedDeck);
    
    return {
      playerHand,
      botHand,
      openDeck,
      closedDeck,
      jokerCard,
      currentPlayer: 'player', // player goes first
      gameStatus: 'active',
      playerMelds: [],
      botMelds: [],
      gameHistory: [],
      createdAt: new Date(),
      lastMove: null
    };
  }

  // Determine the joker card for the game
  determineJoker(deck) {
    if (deck.length > 0) {
      const randomIndex = Math.floor(Math.random() * deck.length);
      return deck[randomIndex];
    }
    return null;
  }

  // Draw card from closed deck (stock pile)
  drawFromClosedDeck(gameState) {
    if (gameState.closedDeck.length === 0) {
      // If closed deck is empty, shuffle open deck (except last card) back into closed deck
      if (gameState.openDeck.length > 1) {
        const lastDiscard = gameState.openDeck.pop();
        const cardsToShuffle = [...gameState.openDeck];
        gameState.closedDeck = this.shuffleDeck(cardsToShuffle);
        gameState.openDeck = [lastDiscard];
      } else {
        throw new Error('No cards left to draw');
      }
    }
    
    return gameState.closedDeck.pop();
  }

  // Draw card from open deck (discard pile)
  drawFromOpenDeck(gameState) {
    if (gameState.openDeck.length === 0) {
      throw new Error('Open deck is empty');
    }
    
    return gameState.openDeck.pop();
  }

  // Discard a card to the open deck
  discardCard(gameState, card) {
    gameState.openDeck.push(card);
    return gameState;
  }

  // Check if a card is a joker (either printed joker or wild joker)
  isJoker(card, jokerCard) {
    if (card.isJoker) return true; // Printed joker
    if (jokerCard && card.rank === jokerCard.rank && card.suit !== 'joker') {
      return true; // Wild joker
    }
    return false;
  }

  // Validate if cards form a valid sequence
  isValidSequence(cards, jokerCard) {
    if (cards.length < 3) return false;
    
    // Sort cards by rank value for sequence checking
    const sortedCards = cards.sort((a, b) => {
      if (this.isJoker(a, jokerCard)) return 1;
      if (this.isJoker(b, jokerCard)) return 1;
      return this.getSequenceValue(a.rank) - this.getSequenceValue(b.rank);
    });
    
    // Check if it's a pure sequence (no jokers)
    const hasJoker = sortedCards.some(card => this.isJoker(card, jokerCard));
    const sameSuit = sortedCards.every(card => 
      this.isJoker(card, jokerCard) || card.suit === sortedCards[0].suit
    );
    
    if (!sameSuit) return false;
    
    // Check consecutive ranks
    let expectedRank = this.getSequenceValue(sortedCards[0].rank);
    for (let i = 1; i < sortedCards.length; i++) {
      if (this.isJoker(sortedCards[i], jokerCard)) {
        expectedRank++;
        continue;
      }
      
      const currentRank = this.getSequenceValue(sortedCards[i].rank);
      if (currentRank !== expectedRank + 1) {
        return false;
      }
      expectedRank = currentRank;
    }
    
    return { valid: true, pure: !hasJoker };
  }

  // Get sequence value for rank ordering
  getSequenceValue(rank) {
    if (rank === 'A') return 1;
    if (rank === 'J') return 11;
    if (rank === 'Q') return 12;
    if (rank === 'K') return 13;
    return parseInt(rank) || 0;
  }

  // Validate if cards form a valid set
  isValidSet(cards, jokerCard) {
    if (cards.length < 3 || cards.length > 4) return false;
    
    const nonJokerCards = cards.filter(card => !this.isJoker(card, jokerCard));
    const jokerCount = cards.length - nonJokerCards.length;
    
    // All non-joker cards must have the same rank
    if (nonJokerCards.length > 0) {
      const firstRank = nonJokerCards[0].rank;
      if (!nonJokerCards.every(card => card.rank === firstRank)) {
        return false;
      }
      
      // All non-joker cards must have different suits
      const suits = nonJokerCards.map(card => card.suit);
      if (new Set(suits).size !== nonJokerCards.length) {
        return false;
      }
    }
    
    return { valid: true, pure: jokerCount === 0 };
  }

  // Calculate hand score (points for unmelded cards)
  calculateHandScore(hand, melds, jokerCard) {
    const meldedCards = melds.flat();
    const unmeldedCards = hand.filter(card => 
      !meldedCards.some(meldCard => meldCard.id === card.id)
    );
    
    return unmeldedCards.reduce((score, card) => {
      if (this.isJoker(card, jokerCard)) return score; // Jokers have 0 points
      return score + card.value;
    }, 0);
  }

  // Check if a hand can declare (valid declaration)
  canDeclare(hand, melds, jokerCard) {
    const meldedCards = melds.flat();
    const unmeldedCards = hand.filter(card => 
      !meldedCards.some(meldCard => meldCard.id === card.id)
    );
    
    // Must have at least one pure sequence
    const hasPureSequence = melds.some(meld => {
      const sequenceResult = this.isValidSequence(meld, jokerCard);
      return sequenceResult.valid && sequenceResult.pure;
    });
    
    // All cards must be in valid melds
    const allCardsInMelds = unmeldedCards.length === 0;
    
    // Must have at least 2 sequences (one must be pure)
    const sequences = melds.filter(meld => this.isValidSequence(meld, jokerCard).valid);
    const hasMinimumSequences = sequences.length >= 2;
    
    return hasPureSequence && allCardsInMelds && hasMinimumSequences;
  }

  // Switch turn between player and bot
  switchTurn(gameState) {
    gameState.currentPlayer = gameState.currentPlayer === 'player' ? 'bot' : 'player';
    return gameState;
  }

  // Add move to game history
  addToHistory(gameState, move) {
    gameState.gameHistory.push({
      ...move,
      timestamp: new Date(),
      // REMOVED: gameState: JSON.parse(JSON.stringify(gameState)) // This was causing heap out of memory
      // Optionally, log only essential parts of the state if needed, e.g.:
      // playerHandCount: gameState.playerHand.length,
      // botHandCount: gameState.botHand.length,
      // openDeckTopCard: gameState.openDeck.length > 0 ? gameState.openDeck[gameState.openDeck.length -1] : null
    });
    gameState.lastMove = move;
    return gameState;
  }

  // Get available moves for AI suggestions
  getAvailableMoves(hand, gameState) {
    const moves = [];
    
    // Drawing options
    moves.push({ type: 'draw', source: 'closed' });
    if (gameState.openDeck.length > 0) {
      moves.push({ type: 'draw', source: 'open', card: gameState.openDeck[gameState.openDeck.length - 1] });
    }
    
    // Discard options (all cards in hand)
    hand.forEach(card => {
      moves.push({ type: 'discard', card: card });
    });
    
    // Possible melds
    const possibleMelds = this.findPossibleMelds(hand, gameState.jokerCard);
    possibleMelds.forEach(meld => {
      moves.push({ type: 'meld', cards: meld });
    });
    
    return moves;
  }

  // Find possible melds in a hand
  findPossibleMelds(hand, jokerCard) {
    const melds = [];
    
    // Find all possible sets and sequences
    // This is a simplified version - a more complex algorithm would be needed for optimal play
    
    // Group cards by rank for sets
    const rankGroups = {};
    hand.forEach(card => {
      if (!this.isJoker(card, jokerCard)) {
        if (!rankGroups[card.rank]) rankGroups[card.rank] = [];
        rankGroups[card.rank].push(card);
      }
    });
    
    // Find sets
    Object.values(rankGroups).forEach(group => {
      if (group.length >= 3) {
        melds.push(group.slice(0, Math.min(4, group.length)));
      }
    });
    
    // Find sequences (simplified - would need more complex logic for optimal detection)
    this.suits.forEach(suit => {
      const suitCards = hand.filter(card => card.suit === suit && !this.isJoker(card, jokerCard))
        .sort((a, b) => this.getSequenceValue(a.rank) - this.getSequenceValue(b.rank));
      
      for (let i = 0; i < suitCards.length - 2; i++) {
        const sequence = [suitCards[i]];
        let expectedNext = this.getSequenceValue(suitCards[i].rank) + 1;
        
        for (let j = i + 1; j < suitCards.length; j++) {
          if (this.getSequenceValue(suitCards[j].rank) === expectedNext) {
            sequence.push(suitCards[j]);
            expectedNext++;
          }
        }
        
        if (sequence.length >= 3) {
          melds.push(sequence);
        }
      }
    });
    
    return melds;
  }
}

module.exports = new RummyGameLogic(); 