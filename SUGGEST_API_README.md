# Botorial Suggest API - Python Implementation

This directory contains a Python implementation of the `/suggest` API endpoint for the Botorial Rummy game. The API provides AI-powered move suggestions using AWS Bedrock Agent integration.

## 🚀 Features

- **AI-Powered Suggestions**: Uses AWS Bedrock Agent for intelligent Rummy strategy advice
- **FastAPI Framework**: Modern, fast web framework with automatic API documentation
- **Pydantic Models**: Type-safe request/response validation
- **Mock Mode**: Works without AWS credentials for development and demos
- **Comprehensive Error Handling**: Proper HTTP status codes and error messages
- **OpenAPI Schema**: Complete API documentation with examples

## 📁 Files

- `suggest_api_python.py` - Main FastAPI application
- `suggest_api_openapi.yaml` - OpenAPI 3.0 schema specification
- `requirements_suggest_api.txt` - Python dependencies
- `test_suggest_api.py` - Test script with examples
- `SUGGEST_API_README.md` - This documentation

## 🛠️ Installation

1. **Install Python dependencies:**
   ```bash
   pip install -r requirements_suggest_api.txt
   ```

2. **Set up environment variables (optional for AWS Bedrock):**
   ```bash
   export USE_BEDROCK=true
   export AWS_REGION=us-east-1
   export AWS_ACCESS_KEY_ID=your_access_key
   export AWS_SECRET_ACCESS_KEY=your_secret_key
   export BEDROCK_AGENT_ID=your_agent_id
   export BEDROCK_AGENT_ALIAS_ID=your_alias_id
   ```

3. **Run the API server:**
   ```bash
   python suggest_api_python.py
   ```

   The API will be available at `http://localhost:8000`

## 📖 API Documentation

Once the server is running, you can access:

- **Interactive API Docs**: http://localhost:8000/docs
- **ReDoc Documentation**: http://localhost:8000/redoc
- **OpenAPI JSON**: http://localhost:8000/openapi.json

## 🎯 API Endpoints

### GET /suggest/{gameId}

Get AI-powered move suggestion for a Rummy game.

**Parameters:**
- `gameId` (path): Unique identifier for the game

**Response:**
```json
{
  "success": true,
  "suggestion": "🎯 AI Suggestion: Your hand shows potential for a hearts sequence. Pick the 6♥ if available, discard the King♠.",
  "timestamp": "2024-01-15T10:30:00Z",
  "source": "bedrock-agent"
}
```

### GET /health

Health check endpoint.

**Response:**
```json
{
  "status": "healthy",
  "service": "Botorial Suggest API",
  "timestamp": "2024-01-15T10:30:00Z",
  "bedrock_enabled": true
}
```

### POST /test/add-game

Add a game state for testing (development only).

**Request Body:**
```json
{
  "gameId": "game_1234567890_test123",
  "playerHand": [
    {"id": "card_1", "rank": "7", "suit": "Hearts", "value": 7}
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
```

## 🧪 Testing

Run the test script to verify the API is working:

```bash
python test_suggest_api.py
```

This will test:
1. Health check endpoint
2. Adding a test game
3. Getting AI suggestions
4. Error handling for non-existent games

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `USE_BEDROCK` | Enable AWS Bedrock integration | `true` |
| `AWS_REGION` | AWS region for Bedrock | `us-east-1` |
| `AWS_ACCESS_KEY_ID` | AWS access key | - |
| `AWS_SECRET_ACCESS_KEY` | AWS secret key | - |
| `AWS_SESSION_TOKEN` | AWS session token (optional) | - |
| `BEDROCK_AGENT_ID` | Bedrock Agent ID | `AJBHXXILZN` |
| `BEDROCK_AGENT_ALIAS_ID` | Bedrock Agent Alias ID | `AVKP1ITZAA` |

### Mock Mode

If AWS credentials are not configured or `USE_BEDROCK=false`, the API runs in mock mode with pre-defined responses. This is perfect for:
- Development and testing
- Demos and presentations
- Local development without AWS setup

## 🎮 Game State Structure

The API expects game states with the following structure:

```python
class Card:
    id: str          # Unique card identifier
    rank: str        # "Ace", "2"-"10", "Jack", "Queen", "King"
    suit: str        # "Hearts", "Diamonds", "Clubs", "Spades"
    value: int       # Numeric value (1-13)

class GameState:
    gameId: str                    # Unique game identifier
    playerHand: List[Card]         # Player's current cards
    openDeck: List[Card]           # Discard pile
    closedDeckCount: int           # Remaining closed deck cards
    jokerCard: Card                # Current joker
    currentPlayer: str             # "player" or "bot"
    gameStatus: str                # "in_progress", "completed", etc.
    playerMelds: List[List[Card]]  # Formed melds/sequences
```

## 🤖 AI Strategy

The AI provides suggestions based on:

1. **Pure Sequence Priority**: Emphasizes forming mandatory pure sequences
2. **Joker Optimization**: Strategic use of jokers for high-value sets
3. **Card Value Analysis**: Considers point values for discard decisions
4. **Meld Opportunities**: Identifies potential sets and sequences
5. **Risk Assessment**: Evaluates opponent behavior and deck probabilities

## 🔄 Integration with Existing System

This Python implementation mirrors the Node.js version and can be used as:

1. **Drop-in Replacement**: Same API contract as the Node.js version
2. **Microservice**: Run alongside the main application
3. **Lambda Function**: Deploy as AWS Lambda for serverless operation
4. **Development Tool**: Use for testing and prototyping

## 🚀 Deployment Options

### Local Development
```bash
python suggest_api_python.py
```

### Production with Gunicorn
```bash
pip install gunicorn
gunicorn suggest_api_python:app -w 4 -k uvicorn.workers.UvicornWorker
```

### Docker
```dockerfile
FROM python:3.11-slim
COPY requirements_suggest_api.txt .
RUN pip install -r requirements_suggest_api.txt
COPY suggest_api_python.py .
CMD ["python", "suggest_api_python.py"]
```

### AWS Lambda
The code can be adapted for AWS Lambda deployment with minimal changes.

## 🔍 Error Handling

The API provides comprehensive error handling:

- **404**: Game not found
- **500**: Internal server errors (Bedrock failures, etc.)
- **422**: Invalid request data (automatic Pydantic validation)

All errors include:
- Success flag (always `false`)
- Error message
- Timestamp
- Appropriate HTTP status codes

## 📊 Monitoring and Logging

The API includes structured logging for:
- Request/response tracking
- AWS Bedrock integration status
- Error conditions
- Performance metrics

## 🤝 Contributing

To extend the API:

1. Add new endpoints to the FastAPI app
2. Update the OpenAPI schema
3. Add corresponding tests
4. Update this documentation

## 📝 License

This implementation follows the same license as the main Botorial project. 