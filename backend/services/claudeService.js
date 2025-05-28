// AWS Bedrock Agent Runtime Service
// For real AWS integration, set environment variables in .env file

const USE_REAL_BEDROCK = true;

let BedrockAgentRuntimeClient, InvokeAgentCommand;

if (USE_REAL_BEDROCK) {
  try {
    ({ BedrockAgentRuntimeClient, InvokeAgentCommand } = require('@aws-sdk/client-bedrock-agent-runtime'));
    console.log('🚀 AWS Bedrock Agent Runtime initialized - real Claude AI ready!');
  } catch (error) {
    console.log('⚠️ AWS SDK modules not available, falling back to mock service');
    console.log('To enable: Set USE_BEDROCK=true in .env and configure AWS credentials');
  }
}

class ClaudeService {
  constructor() {
    this.isDemo = !USE_REAL_BEDROCK;
    this.sessionId = this.generateSessionId();
    
    if (USE_REAL_BEDROCK && BedrockAgentRuntimeClient) {
      this.initializeBedrockAgent();
    } else {
      console.log('🎯 Mock Claude Service initialized - perfect for hackathon demos!');
      console.log('💡 To enable Bedrock Agent: Set USE_BEDROCK=true in backend/.env');
    }
  }

  initializeBedrockAgent() {
    try {
      this.client = new BedrockAgentRuntimeClient({
        region: process.env.AWS_REGION || 'us-east-1',
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
          sessionToken: process.env.AWS_SESSION_TOKEN,
        },
      });
      
      this.agentId = "O0GNFE1XMV";
      this.agentAliasId = 'VZXFC1IILC';
      
      console.log('✅ Bedrock Agent Runtime client initialized successfully');
    } catch (error) {
      console.error('❌ Bedrock Agent initialization failed:', error.message);
      this.isDemo = true;
    }
  }

  generateSessionId() {
    return `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  async invokeBedrockAgent(prompt, sessionId = null) {
    if (this.isDemo || !this.client) {
      return this.getMockResponse(prompt, 'chat');
    }

    try {
      const command = new InvokeAgentCommand({
        agentId: this.agentId,
        agentAliasId: this.agentAliasId,
        sessionId: sessionId || this.sessionId,
        inputText: prompt,
      });

      let completion = "";
      console.log("this.agentId", this.agentId);
      const response = await this.client.send(command);

      if (response.completion === undefined) {
        throw new Error("Completion is undefined");
      }

      for await (const chunkEvent of response.completion) {
        const chunk = chunkEvent.chunk;
        if (chunk && chunk.bytes) {
          const decodedResponse = new TextDecoder("utf-8").decode(chunk.bytes);
          completion += decodedResponse;
        }
      }

      return {
        success: true,
        message: completion,
        sessionId: sessionId || this.sessionId,
        source: 'bedrock-agent'
      };
    } catch (error) {
      console.error('Bedrock Agent service error:', error);
      return {
        success: false,
        error: error.message,
        message: 'Sorry, I encountered an error processing your request with Bedrock Agent. Please try again.',
        source: 'bedrock-error'
      };
    }
  }

  async sendMessage(message, systemPrompt = null, maxTokens = 2000) {
    let fullPrompt = message;
    
    if (systemPrompt) {
      fullPrompt = `${systemPrompt}\n\nUser: ${message}`;
    }

    return await this.invokeBedrockAgent(fullPrompt);
  }

  async getRummyAdvice(message) {
    const systemPrompt = `You are an expert Rummy game strategist and teacher. Provide clear, actionable advice about 13-card Indian Rummy. Focus on:
    - Pure sequence formation (mandatory)
    - Sets and impure sequences
    - Card retention strategies
    - Joker usage
    - Opponent analysis
    
    Be concise but comprehensive in your advice.`;

    if (this.isDemo || !this.client) {
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

    const systemPrompt = `You are a Rummy game AI assistant. Analyze the hand and provide tactical suggestions. Be specific about card choices and explain the reasoning behind each suggestion. keep the word limit to 50 words`;

    // if (this.isDemo || !this.client) {
    //   return this.getMockResponse(prompt, 'suggestion');
    // }

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

    if (this.isDemo || !this.client) {
      return this.getMockResponse(prompt, 'analysis');
    }

    return await this.sendMessage(prompt, systemPrompt);
  }

  formatHandForAI(hand) {
    if (!hand || !Array.isArray(hand)) return 'Empty hand';
    return hand.map(card => `${card.rank}${card.suit.charAt(0)}`).join(', ');
  }

  getMockResponse(message, type) {
    const responses = {
      chat: [
        "🎯 Bedrock Agent Demo: I'm ready to help with Rummy strategies! Ask me about pure sequences, sets, or game tactics.",
        "🚀 Hackathon Mode: This showcases AWS Bedrock Agent integration. For real AI, configure AWS credentials.",
        "💡 Mock Bedrock Agent: I would analyze your Rummy question using advanced Claude AI reasoning through Bedrock Agent Runtime."
      ],
      rummy: [
        `🎲 Bedrock Rummy Expert: "${message}" - Focus on forming pure sequences first (mandatory for declaration). Middle cards (5-9) offer more flexibility than edge cards.`,
        `🃏 Strategic Advice: "${message}" - Use jokers wisely for high-value sets. Track opponent's picks/discards to predict their hand.`,
        `🎯 Tactical Response: "${message}" - Prioritize pure sequences, then sets, then impure sequences. Discard high-value unmatched cards.`
      ],
      suggestion: [
        "🤖 Bedrock Strategy: Draw from closed deck to avoid revealing your strategy. Consider forming sequences with middle cards.",
        "🎯 AI Suggestion: Your hand shows potential for a hearts sequence. Pick the 6♥ if available, discard the King♠.",
        "💡 Bedrock Analysis: Form the 7-8-9 of spades sequence first. Discard face cards unless they complete sets."
      ],
      analysis: [
        `🏆 Bedrock Game Analysis:
        
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
      source: 'bedrock-mock'
    };
  }
}

module.exports = new ClaudeService(); 