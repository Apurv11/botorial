import json
import boto3
import os
import logging
from typing import Dict, Any, Optional
from datetime import datetime

# Configure logging
logger = logging.getLogger()
logger.setLevel(logging.INFO)

class BedrockAgentService:
    """Service class for interacting with AWS Bedrock Agent Runtime"""
    
    def __init__(self):
        self.client = boto3.client(
            'bedrock-agent-runtime',
            region_name=os.environ.get('AWS_REGION', 'us-east-1')
        )
        self.agent_id = os.environ.get('BEDROCK_AGENT_ID', 'AJBHXXILZN')
        self.agent_alias_id = os.environ.get('BEDROCK_AGENT_ALIAS_ID', 'AVKP1ITZAA')
    
    def generate_session_id(self) -> str:
        """Generate a unique session ID"""
        timestamp = int(datetime.now().timestamp() * 1000)
        return f"session-{timestamp}"
    
    async def invoke_agent(self, prompt: str, session_id: Optional[str] = None) -> Dict[str, Any]:
        """Invoke the Bedrock Agent with a prompt"""
        try:
            if not session_id:
                session_id = self.generate_session_id()
            
            response = self.client.invoke_agent(
                agentId=self.agent_id,
                agentAliasId=self.agent_alias_id,
                sessionId=session_id,
                inputText=prompt
            )
            
            # Process streaming response
            completion = ""
            if 'completion' in response:
                for event in response['completion']:
                    if 'chunk' in event:
                        chunk = event['chunk']
                        if 'bytes' in chunk:
                            chunk_text = chunk['bytes'].decode('utf-8')
                            completion += chunk_text
            
            return {
                'success': True,
                'message': completion,
                'session_id': session_id,
                'source': 'bedrock-agent'
            }
            
        except Exception as e:
            logger.error(f"Bedrock Agent error: {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'message': 'Sorry, I encountered an error processing your request. Please try again.',
                'source': 'bedrock-error'
            }

def format_hand_for_ai(hand: list) -> str:
    """Format hand cards for AI analysis"""
    if not hand or not isinstance(hand, list):
        return 'Empty hand'
    
    formatted_cards = []
    for card in hand:
        if isinstance(card, dict) and 'rank' in card and 'suit' in card:
            # Format as rank + first letter of suit (e.g., "AS" for Ace of Spades)
            suit_letter = card['suit'][0].upper() if card['suit'] else 'X'
            formatted_cards.append(f"{card['rank']}{suit_letter}")
        else:
            formatted_cards.append(str(card))
    
    return ', '.join(formatted_cards)

def create_rummy_suggestion_prompt(player_hand: list, discard_pile: list, game_state: dict) -> str:
    """Create a detailed prompt for Rummy game suggestion"""
    
    hand_description = format_hand_for_ai(player_hand)
    
    # Format discard pile
    discard_description = "Empty discard pile"
    if discard_pile and len(discard_pile) > 0:
        top_card = discard_pile[-1] if isinstance(discard_pile, list) else discard_pile
        if isinstance(top_card, dict) and 'rank' in top_card and 'suit' in top_card:
            discard_description = f"Top discard: {top_card['rank']} of {top_card['suit']}"
    
    # Extract game state information
    joker_info = ""
    if game_state and 'jokerCard' in game_state:
        joker = game_state['jokerCard']
        if isinstance(joker, dict) and 'rank' in joker and 'suit' in joker:
            joker_info = f"Joker: {joker['rank']} of {joker['suit']}"
    
    melds_info = ""
    if game_state and 'playerMelds' in game_state and game_state['playerMelds']:
        melds_count = len(game_state['playerMelds'])
        melds_info = f"Current melds formed: {melds_count}"
    
    prompt = f"""You are an expert Rummy game strategist. Analyze this 13-card Indian Rummy hand and provide tactical advice.

Current Hand: {hand_description}
{discard_description}
{joker_info}
{melds_info}

Provide a strategic suggestion covering:
1. Whether to draw from closed deck or pick from discard pile (and why)
2. Which card to discard and the reasoning
3. Any possible sequences or sets you can form
4. Overall strategy assessment for this hand

Focus on:
- Pure sequence formation (mandatory for declaration)
- Efficient use of jokers
- Card retention strategy
- Minimizing points in unmatched cards

Be specific about card choices and explain your reasoning clearly."""

    return prompt

def lambda_handler(event, context):
    """
    AWS Lambda handler for the /suggest API endpoint
    
    Expected input format:
    {
        "gameId": "game_123",
        "playerHand": [{"rank": "A", "suit": "spades"}, ...],
        "openDeck": [{"rank": "K", "suit": "hearts"}],
        "gameState": {
            "jokerCard": {"rank": "2", "suit": "clubs"},
            "playerMelds": [],
            "gameStatus": "active"
        }
    }
    """
    
    try:
        # Parse the request body
        if isinstance(event.get('body'), str):
            body = json.loads(event['body'])
        else:
            body = event.get('body', {})
        
        # Extract required parameters
        game_id = body.get('gameId')
        player_hand = body.get('playerHand', [])
        open_deck = body.get('openDeck', [])
        game_state = body.get('gameState', {})
        
        # Validate required parameters
        if not game_id:
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': 'Content-Type',
                    'Access-Control-Allow-Methods': 'POST, OPTIONS'
                },
                'body': json.dumps({
                    'success': False,
                    'error': 'gameId is required'
                })
            }
        
        if not player_hand:
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': 'Content-Type',
                    'Access-Control-Allow-Methods': 'POST, OPTIONS'
                },
                'body': json.dumps({
                    'success': False,
                    'error': 'playerHand is required'
                })
            }
        
        logger.info(f"Processing suggestion request for game {game_id}")
        
        # Initialize Bedrock Agent service
        bedrock_service = BedrockAgentService()
        
        # Create the prompt for AI analysis
        prompt = create_rummy_suggestion_prompt(player_hand, open_deck, game_state)
        
        # Get suggestion from Bedrock Agent
        # Note: Using synchronous call since Lambda doesn't support async/await by default
        # For async support, you'd need to use asyncio.run() or configure async Lambda
        try:
            response = bedrock_service.client.invoke_agent(
                agentId=bedrock_service.agent_id,
                agentAliasId=bedrock_service.agent_alias_id,
                sessionId=bedrock_service.generate_session_id(),
                inputText=prompt
            )
            
            # Process streaming response
            completion = ""
            if 'completion' in response:
                for event in response['completion']:
                    if 'chunk' in event:
                        chunk = event['chunk']
                        if 'bytes' in chunk:
                            chunk_text = chunk['bytes'].decode('utf-8')
                            completion += chunk_text
            
            suggestion_result = {
                'success': True,
                'message': completion,
                'source': 'bedrock-agent'
            }
            
        except Exception as bedrock_error:
            logger.error(f"Bedrock Agent error: {str(bedrock_error)}")
            # Fallback to mock response for demo purposes
            suggestion_result = {
                'success': True,
                'message': f"""🎯 Rummy Strategy Analysis for Game {game_id}:

Based on your hand: {format_hand_for_ai(player_hand)}

**Recommendation:**
1. **Draw Strategy**: Draw from closed deck to avoid revealing your strategy
2. **Discard Strategy**: Consider discarding high-value cards that don't fit into sequences
3. **Sequence Priority**: Focus on forming pure sequences first (mandatory for declaration)
4. **Joker Usage**: Save jokers for completing sets or impure sequences

**Key Insight**: Middle cards (5-9) offer more flexibility for sequence formation than edge cards (A, K, Q, J).

*Note: This is a demo response. Configure AWS Bedrock Agent for real AI analysis.*""",
                'source': 'lambda-demo'
            }
        
        # Prepare successful response
        response_body = {
            'success': True,
            'gameId': game_id,
            'suggestion': suggestion_result['message'],
            'timestamp': datetime.now().isoformat(),
            'source': suggestion_result.get('source', 'bedrock-agent')
        }
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'POST, OPTIONS'
            },
            'body': json.dumps(response_body)
        }
        
    except json.JSONDecodeError as e:
        logger.error(f"JSON decode error: {str(e)}")
        return {
            'statusCode': 400,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'POST, OPTIONS'
            },
            'body': json.dumps({
                'success': False,
                'error': 'Invalid JSON in request body'
            })
        }
        
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'POST, OPTIONS'
            },
            'body': json.dumps({
                'success': False,
                'error': 'Internal server error',
                'message': 'Failed to process suggestion request'
            })
        }

# For local testing
if __name__ == "__main__":
    # Test event
    test_event = {
        'body': json.dumps({
            'gameId': 'test_game_123',
            'playerHand': [
                {'rank': 'A', 'suit': 'spades'},
                {'rank': '2', 'suit': 'spades'},
                {'rank': '3', 'suit': 'spades'},
                {'rank': 'K', 'suit': 'hearts'},
                {'rank': 'Q', 'suit': 'hearts'},
                {'rank': 'J', 'suit': 'hearts'},
                {'rank': '7', 'suit': 'clubs'},
                {'rank': '8', 'suit': 'clubs'},
                {'rank': '9', 'suit': 'clubs'},
                {'rank': '5', 'suit': 'diamonds'},
                {'rank': '6', 'suit': 'diamonds'},
                {'rank': '10', 'suit': 'spades'},
                {'rank': '4', 'suit': 'hearts'}
            ],
            'openDeck': [{'rank': 'K', 'suit': 'clubs'}],
            'gameState': {
                'jokerCard': {'rank': '2', 'suit': 'hearts'},
                'playerMelds': [],
                'gameStatus': 'active'
            }
        })
    }
    
    result = lambda_handler(test_event, None)
    print(json.dumps(result, indent=2)) 