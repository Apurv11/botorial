"""
Test script for the Botorial Suggest API
Demonstrates how to use the Python implementation
"""

import asyncio
import json
import httpx
from datetime import datetime

# Test data
SAMPLE_GAME_STATE = {
    "gameId": "game_1234567890_test123",
    "playerHand": [
        {"id": "card_1", "rank": "7", "suit": "Hearts", "value": 7},
        {"id": "card_2", "rank": "8", "suit": "Hearts", "value": 8},
        {"id": "card_3", "rank": "King", "suit": "Spades", "value": 13},
        {"id": "card_4", "rank": "Queen", "suit": "Diamonds", "value": 12},
        {"id": "card_5", "rank": "5", "suit": "Clubs", "value": 5}
    ],
    "openDeck": [
        {"id": "card_discard_1", "rank": "6", "suit": "Hearts", "value": 6}
    ],
    "closedDeckCount": 45,
    "jokerCard": {"id": "joker_1", "rank": "Ace", "suit": "Clubs", "value": 1},
    "currentPlayer": "player",
    "gameStatus": "in_progress",
    "playerMelds": []
}

BASE_URL = "http://localhost:8000"

async def test_suggest_api():
    """Test the suggest API endpoints"""
    
    async with httpx.AsyncClient() as client:
        print("🚀 Testing Botorial Suggest API")
        print("=" * 50)
        
        # Test 1: Health check
        print("\n1. Testing health check...")
        try:
            response = await client.get(f"{BASE_URL}/health")
            print(f"Status: {response.status_code}")
            print(f"Response: {json.dumps(response.json(), indent=2)}")
        except Exception as e:
            print(f"Health check failed: {e}")
        
        # Test 2: Add test game
        print("\n2. Adding test game...")
        try:
            response = await client.post(
                f"{BASE_URL}/test/add-game",
                json=SAMPLE_GAME_STATE
            )
            print(f"Status: {response.status_code}")
            print(f"Response: {json.dumps(response.json(), indent=2)}")
        except Exception as e:
            print(f"Add game failed: {e}")
        
        # Test 3: Get suggestion
        print("\n3. Getting AI suggestion...")
        try:
            game_id = SAMPLE_GAME_STATE["gameId"]
            response = await client.get(f"{BASE_URL}/suggest/{game_id}")
            print(f"Status: {response.status_code}")
            print(f"Response: {json.dumps(response.json(), indent=2)}")
        except Exception as e:
            print(f"Get suggestion failed: {e}")
        
        # Test 4: Test with non-existent game
        print("\n4. Testing with non-existent game...")
        try:
            response = await client.get(f"{BASE_URL}/suggest/nonexistent_game")
            print(f"Status: {response.status_code}")
            print(f"Response: {json.dumps(response.json(), indent=2)}")
        except Exception as e:
            print(f"Non-existent game test failed: {e}")

def run_tests():
    """Run all tests"""
    print("Starting Botorial Suggest API Tests...")
    print("Make sure the API server is running on http://localhost:8000")
    print("You can start it with: python suggest_api_python.py")
    print()
    
    asyncio.run(test_suggest_api())

if __name__ == "__main__":
    run_tests() 