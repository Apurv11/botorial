"""
Python implementation for the /suggest API endpoint
Handles Rummy game move suggestions using AWS Bedrock Agent
"""

from fastapi import FastAPI, HTTPException, Path
from pydantic import BaseModel, Field
from typing import Dict, Any, Optional, List
import boto3
import json
import logging
import os
from datetime import datetime
import uuid

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Botorial Rummy Suggest API",
    description="AI-powered move suggestions for Rummy game using AWS Bedrock Agent",
    version="1.0.0"
)

# Pydantic models for request/response
class Card(BaseModel):
    id: str
    rank: str
    suit: str
    value: int

class GameState(BaseModel):
    gameId: str
    playerHand: List[Card]
    openDeck: List[Card]
    closedDeckCount: int
    jokerCard: Card
    currentPlayer: str
    gameStatus: str
    playerMelds: List[List[Card]] = []

class SuggestionResponse(BaseModel):
    success: bool
    suggestion: Optional[str] = None
    timestamp: str
    error: Optional[str] = None
    source: str = "bedrock-agent"

class ErrorResponse(BaseModel):
    success: bool = False
    error: str
    timestamp: str

# AWS Bedrock Agent Service
class BedrockAgentService:
    def __init__(self):
        self.use_real_bedrock = os.getenv('USE_BEDROCK', 'true').lower() == 'true'
        self.session_id = self.generate_session_id()
        self.is_demo = True  # Start in demo mode, will be set to False if Bedrock initializes successfully
        
        if self.use_real_bedrock:
            self.initialize_bedrock_agent()
        else:
            logger.info("🎯 Mock Bedrock Service initialized - perfect for demos!")
    
    def initialize_bedrock_agent(self):
        try:
            self.client = boto3.client(
                'bedrock-agent-runtime',
                region_name=os.getenv('AWS_REGION', 'us-east-1'),
                aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
                aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY'),
                aws_session_token=os.getenv('AWS_SESSION_TOKEN')
            )
            
            # Use the same default values as the Node.js implementation
            self.agent_id = os.getenv('BEDROCK_AGENT_ID', 'AJBHXXILZN')
            self.agent_alias_id = os.getenv('BEDROCK_AGENT_ALIAS_ID', 'AVKP1ITZAA')
            
            logger.info("✅ Bedrock Agent Runtime client initialized successfully")
            logger.info(f"🔧 Using Agent ID: {self.agent_id}")
            logger.info(f"🔧 Using Agent Alias ID: {self.agent_alias_id}")
            
            # Only set demo to False if we have valid credentials
            if os.getenv('AWS_ACCESS_KEY_ID') and os.getenv('AWS_SECRET_ACCESS_KEY'):
                self.is_demo = False
            else:
                logger.warning("⚠️ AWS credentials not found, falling back to mock mode")
                
        except Exception as error:
            logger.error(f"❌ Bedrock Agent initialization failed: {error}")
            self.is_demo = True
    
    def generate_session_id(self):
        return f"session-{int(datetime.now().timestamp())}-{str(uuid.uuid4())[:8]}"
    
    async def invoke_bedrock_agent(self, prompt: str, session_id: Optional[str] = None):
        if self.is_demo or not hasattr(self, 'client'):
            return self.get_mock_response(prompt)
        
        try:
            logger.info(f"🤖 Invoking Bedrock Agent: {self.agent_id}")
            
            response = self.client.invoke_agent(
                agentId=self.agent_id,
                agentAliasId=self.agent_alias_id,
                sessionId=session_id or self.session_id,
                inputText=prompt
            )
            
            completion = ""
            if 'completion' in response:
                for event in response['completion']:
                    if 'chunk' in event:
                        chunk = event['chunk']
                        if 'bytes' in chunk:
                            completion += chunk['bytes'].decode('utf-8')
            
            return {
                "success": True,
                "message": completion,
                "sessionId": session_id or self.session_id,
                "source": "bedrock-agent"
            }
            
        except Exception as error:
            logger.error(f"Bedrock Agent service error: {error}")
            
            # Check for specific error types
            error_message = str(error)
            if "ResourceNotFoundException" in error_message:
                logger.error(f"❌ Agent ID '{self.agent_id}' not found. Please check your BEDROCK_AGENT_ID environment variable.")
                fallback_message = f"Agent ID '{self.agent_id}' not found. Falling back to mock responses."
            elif "AccessDeniedException" in error_message:
                logger.error("❌ Access denied. Please check your AWS credentials and permissions.")
                fallback_message = "Access denied to Bedrock Agent. Falling back to mock responses."
            else:
                fallback_message = "Bedrock Agent error. Falling back to mock responses."
            
            # Fall back to mock response instead of returning error
            logger.info(f"🎯 {fallback_message}")
            return self.get_mock_response(prompt, fallback_reason=fallback_message)
    
    async def get_game_suggestion(self, player_hand: List[Card], open_deck: List[Card], game_state: Dict[str, Any]):
        hand_description = self.format_hand_for_ai(player_hand)
        discard_description = (
            f"Top discard: {open_deck[-1].rank} of {open_deck[-1].suit}" 
            if open_deck else "Empty discard pile"
        )
        
        prompt = f"""Analyze this Rummy hand and suggest the best move:

Current Hand: {hand_description}
{discard_description}

Provide a strategic suggestion for:
1. Whether to draw from closed deck or pick from discard pile
2. Which card to discard and why
3. Any possible melds to form
4. Overall strategy assessment"""

        system_prompt = """You are a Rummy game AI assistant. Analyze the hand and provide tactical suggestions. Be specific about card choices and explain the reasoning behind each suggestion."""
        
        full_prompt = f"{system_prompt}\n\nUser: {prompt}"
        
        return await self.invoke_bedrock_agent(full_prompt)
    
    def format_hand_for_ai(self, hand: List[Card]) -> str:
        if not hand:
            return "Empty hand"
        return ", ".join([f"{card.rank}{card.suit[0]}" for card in hand])
    
    def get_mock_response(self, message: str, fallback_reason: str = None):
        mock_responses = [
            "🤖 Bedrock Strategy: Draw from closed deck to avoid revealing your strategy. Consider forming sequences with middle cards.",
            "🎯 AI Suggestion: Your hand shows potential for a hearts sequence. Pick the 6♥ if available, discard the King♠.",
            "💡 Bedrock Analysis: Form the 7-8-9 of spades sequence first. Discard face cards unless they complete sets.",
            "🎲 Strategic Advice: Focus on forming pure sequences first (mandatory for declaration). Middle cards (5-9) offer more flexibility than edge cards.",
            "🃏 Tactical Response: Use jokers wisely for high-value sets. Track opponent's picks/discards to predict their hand."
        ]
        
        import random
        random_response = random.choice(mock_responses)
        
        # Add fallback reason if provided
        if fallback_reason:
            random_response = f"[Mock Mode - {fallback_reason}] {random_response}"
        
        return {
            "success": True,
            "message": random_response,
            "usage": {"input_tokens": 25, "output_tokens": 50},
            "source": "bedrock-mock"
        }

# Initialize the Bedrock service
bedrock_service = BedrockAgentService()

# In-memory game storage (in production, use a proper database)
active_games: Dict[str, GameState] = {}

@app.get(
    "/suggest/{game_id}",
    response_model=SuggestionResponse,
    responses={
        404: {"model": ErrorResponse, "description": "Game not found"},
        500: {"model": ErrorResponse, "description": "Internal server error"}
    },
    summary="Get AI suggestion for next move",
    description="Returns an AI-powered suggestion for the player's next move based on current game state"
)
async def get_suggestion(
    game_id: str = Path(..., description="Unique identifier for the game", example="game_1234567890_abc123")
):
    """
    Get AI-powered move suggestion for a Rummy game.
    
    This endpoint analyzes the current game state and provides strategic advice including:
    - Whether to draw from closed deck or open deck
    - Which card to discard and reasoning
    - Possible melds to form
    - Overall strategy assessment
    
    Args:
        game_id: The unique identifier for the game
        
    Returns:
        SuggestionResponse: Contains the AI suggestion and metadata
        
    Raises:
        HTTPException: 404 if game not found, 500 for server errors
    """
    try:
        # Retrieve game state
        if game_id not in active_games:
            raise HTTPException(
                status_code=404,
                detail={
                    "success": False,
                    "error": "Game not found",
                    "timestamp": datetime.now().isoformat()
                }
            )
        
        game_state = active_games[game_id]
        
        # Get suggestion from Bedrock Agent (with automatic fallback to mock)
        suggestion_result = await bedrock_service.get_game_suggestion(
            game_state.playerHand,
            game_state.openDeck,
            {
                "jokerCard": game_state.jokerCard,
                "playerMelds": game_state.playerMelds,
                "gameStatus": game_state.gameStatus
            }
        )
        
        # The service now always returns success=True with fallback to mock responses
        return SuggestionResponse(
            success=True,
            suggestion=suggestion_result["message"],
            timestamp=datetime.now().isoformat(),
            source=suggestion_result.get("source", "bedrock-agent")
        )
        
    except HTTPException:
        raise
    except Exception as error:
        logger.error(f"Get suggestion error: {error}")
        raise HTTPException(
            status_code=500,
            detail={
                "success": False,
                "error": "Failed to get suggestion",
                "timestamp": datetime.now().isoformat()
            }
        )

# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "Botorial Suggest API",
        "timestamp": datetime.now().isoformat(),
        "bedrock_enabled": not bedrock_service.is_demo,
        "agent_id": getattr(bedrock_service, 'agent_id', 'Not configured'),
        "agent_alias_id": getattr(bedrock_service, 'agent_alias_id', 'Not configured')
    }

# Utility endpoint to add a game for testing
@app.post("/test/add-game")
async def add_test_game(game_state: GameState):
    """Add a game state for testing purposes"""
    active_games[game_state.gameId] = game_state
    return {
        "success": True,
        "message": f"Game {game_state.gameId} added successfully",
        "timestamp": datetime.now().isoformat()
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 