// LangChain Claude Service with AWS Bedrock
// For real AWS integration, set environment variables in .env file

const USE_REAL_LANGCHAIN = process.env.NODE_ENV === 'production' || process.env.USE_LANGCHAIN === 'true';

let ChatBedrock, HumanMessage, SystemMessage;

if (USE_REAL_LANGCHAIN) {
  try {
    ({ ChatBedrock } = require('@langchain/aws'));
    ({ HumanMessage, SystemMessage } = require('@langchain/core/messages'));
    console.log('🚀 LangChain AWS Bedrock initialized - real Claude AI ready!');
  } catch (error) {
    console.log('⚠️ LangChain modules not available, falling back to mock service');
    console.log('To enable: Set USE_LANGCHAIN=true in .env and configure AWS credentials');
  }
}

class ClaudeService {
  constructor() {
    this.isDemo = !USE_REAL_LANGCHAIN;
    
    if (USE_REAL_LANGCHAIN && ChatBedrock) {
      this.initializeLangChain();
    } else {
      console.log('🎯 Mock Claude Service initialized - perfect for hackathon demos!');
      console.log('💡 To enable LangChain: Set USE_LANGCHAIN=true in backend/.env');
    }
  }

  initializeLangChain() {
    try {
      this.model = new ChatBedrock({
        model: process.env.CLAUDE_MODEL_ID || 'anthropic.claude-3-sonnet-20240229-v1:0',
        region: process.env.AWS_REGION || 'us-east-1',
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        },
        maxTokens: 2000,
        temperature: 0.7,
      });
      console.log('✅ LangChain ChatBedrock model initialized successfully');
    } catch (error) {
      console.error('❌ LangChain initialization failed:', error.message);
      this.isDemo = true;
    }
  }

  async sendMessage(message, systemPrompt = null, maxTokens = 2000) {
    if (this.isDemo || !this.model) {
      return this.getMockResponse(message, 'chat');
    }

    try {
      const messages = [];
      
      if (systemPrompt) {
        messages.push(new SystemMessage(systemPrompt));
      }
      
      messages.push(new HumanMessage(message));

      const response = await this.model.invoke(messages);
      
      return {
        success: true,
        message: response.content,
        usage: response.usage_metadata || { input_tokens: 50, output_tokens: 100 },
        source: 'langchain-bedrock'
      };
    } catch (error) {
      console.error('LangChain Claude service error:', error);
      return {
        success: false,
        error: error.message,
        message: 'Sorry, I encountered an error processing your request with LangChain. Please try again.',
        source: 'langchain-error'
      };
    }
  }

  async getRummyAdvice(message) {
    const systemPrompt = `You are an expert Rummy game strategist and teacher. Provide clear, actionable advice about 13-card Indian Rummy. Focus on:
    - Pure sequence formation (mandatory)
    - Sets and impure sequences
    - Card retention strategies
    - Joker usage
    - Opponent analysis
    
    Be concise but comprehensive in your advice.`;

    if (this.isDemo || !this.model) {
      return this.getMockResponse(message, 'rummy');
    }

    return await this.sendMessage(message, systemPrompt);
  }

  async getGameSuggestion(playerHand, discardPile, gameState) {
    const handDescription = this.formatHandForAI(playerHand);
    const discardDescription = discardPile && discardPile.length > 0 
      ? `Top discard: ${discardPile[discardPile.length - 1].rank} of ${discardPile[discardPile.length - 1].suit}` 
      : 'Empty discard pile';
    
    const prompt = `Analyze this Rummy hand and suggest the best move:

    Current Hand: ${handDescription}
    ${discardDescription}
    
    Provide a strategic suggestion for:
    1. Whether to draw from closed deck or pick from discard pile
    2. Which card to discard and why
    3. Any possible melds to form
    4. Overall strategy assessment`;

    const systemPrompt = `You are a Rummy game AI assistant. Analyze the hand and provide tactical suggestions. Be specific about card choices and explain the reasoning behind each suggestion.`;

    if (this.isDemo || !this.model) {
      return this.getMockResponse(prompt, 'suggestion');
    }

    return await this.sendMessage(prompt, systemPrompt);
  }

  async analyzeGame(gameHistory, playerMoves, botMoves) {
    const prompt = `Analyze this completed Rummy game:

    Game Summary:
    - Player moves: ${playerMoves && playerMoves.join ? playerMoves.join(', ') : 'Not available'}
    - Bot moves: ${botMoves && botMoves.join ? botMoves.join(', ') : 'Not available'}
    - Game duration: ${gameHistory && gameHistory.length ? gameHistory.length : 0} turns
    
    Provide a comprehensive post-game analysis including:
    1. Player's strategic strengths and weaknesses
    2. Missed opportunities
    3. Key decision points
    4. Suggestions for improvement
    5. Overall performance rating`;

    const systemPrompt = `You are a professional Rummy coach providing post-game analysis. Be constructive, specific, and educational in your feedback.`;

    if (this.isDemo || !this.model) {
      return this.getMockResponse(prompt, 'analysis');
    }

    return await this.sendMessage(prompt, systemPrompt, 3000);
  }

  formatHandForAI(hand) {
    if (!hand || !Array.isArray(hand)) return 'Empty hand';
    return hand.map(card => `${card.rank}${card.suit.charAt(0)}`).join(', ');
  }

  getMockResponse(message, type) {
    const responses = {
      chat: [
        "🎯 LangChain Demo: I'm ready to help with Rummy strategies! Ask me about pure sequences, sets, or game tactics.",
        "🚀 Hackathon Mode: This showcases LangChain integration. For real AI, configure AWS Bedrock credentials.",
        "💡 Mock LangChain: I would analyze your Rummy question using advanced Claude AI reasoning through LangChain."
      ],
      rummy: [
        `🎲 LangChain Rummy Expert: "${message}" - Focus on forming pure sequences first (mandatory for declaration). Middle cards (5-9) offer more flexibility than edge cards.`,
        `🃏 Strategic Advice: "${message}" - Use jokers wisely for high-value sets. Track opponent's picks/discards to predict their hand.`,
        `🎯 Tactical Response: "${message}" - Prioritize pure sequences, then sets, then impure sequences. Discard high-value unmatched cards.`
      ],
      suggestion: [
        "🤖 LangChain Strategy: Draw from closed deck to avoid revealing your strategy. Consider forming sequences with middle cards.",
        "🎯 AI Suggestion: Your hand shows potential for a hearts sequence. Pick the 6♥ if available, discard the King♠.",
        "💡 LangChain Analysis: Form the 7-8-9 of spades sequence first. Discard face cards unless they complete sets."
      ],
      analysis: [
        `🏆 LangChain Game Analysis:
        
        Performance: Strategic gameplay demonstrated
        Strengths: Good sequence formation, efficient melding
        Improvements: Better discard pile awareness, card counting
        
        Key Insights: You formed pure sequences early (excellent!), but missed opportunities to block opponent's sequences.
        
        Next Game: Focus on tracking opponent discards and defensive play.
        
        Rating: 7.5/10 - Strong foundational strategy with room for tactical refinement.`
      ]
    };

    const typeResponses = responses[type] || responses.chat;
    const randomResponse = typeResponses[Math.floor(Math.random() * typeResponses.length)];
    
    return {
      success: true,
      message: randomResponse,
      usage: { input_tokens: 25, output_tokens: 50 },
      source: 'langchain-mock'
    };
  }
}

module.exports = new ClaudeService(); 