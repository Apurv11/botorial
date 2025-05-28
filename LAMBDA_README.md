# Rummy Game Suggestion Lambda Function

This Python Lambda function provides AI-powered Rummy game suggestions using AWS Bedrock Agent Runtime. It replaces the Node.js `/suggest` API endpoint with a serverless AWS Lambda implementation.

## 🚀 Features

- **AWS Bedrock Agent Integration**: Uses AWS Bedrock Agent Runtime for intelligent Rummy strategy suggestions
- **Serverless Architecture**: Deployed as AWS Lambda function with API Gateway
- **CORS Support**: Configured for cross-origin requests from web applications
- **Error Handling**: Comprehensive error handling with fallback responses
- **Local Testing**: Includes local testing capabilities without AWS dependencies

## 📁 Files Structure

```
botorial/
├── lambda_suggest.py           # Main Lambda function
├── test_lambda_local.py        # Local testing version
├── requirements.txt            # Python dependencies
├── lambda_deployment.yaml      # CloudFormation/SAM template
├── deploy_lambda.sh           # Deployment script
└── LAMBDA_README.md           # This documentation
```

## 🔧 Setup and Configuration

### Prerequisites

1. **AWS CLI** installed and configured
2. **AWS SAM CLI** installed (`pip install aws-sam-cli`)
3. **Python 3.11** or later
4. **AWS Bedrock Agent** configured in your AWS account

### Environment Variables

The Lambda function uses these environment variables:

```bash
AWS_REGION=us-east-1                    # AWS region
BEDROCK_AGENT_ID=AJBHXXILZN            # Your Bedrock Agent ID
BEDROCK_AGENT_ALIAS_ID=AVKP1ITZAA      # Your Bedrock Agent Alias ID
ENVIRONMENT=dev                         # Deployment environment
```

### AWS Permissions

The Lambda function requires these IAM permissions:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "bedrock:InvokeAgent",
        "bedrock-agent-runtime:InvokeAgent"
      ],
      "Resource": [
        "arn:aws:bedrock:*:*:agent/*",
        "arn:aws:bedrock:*:*:agent-alias/*"
      ]
    }
  ]
}
```

## 🚀 Deployment

### Quick Deployment

1. **Configure your Bedrock Agent IDs** in `deploy_lambda.sh`:
   ```bash
   BEDROCK_AGENT_ID="your_agent_id"
   BEDROCK_AGENT_ALIAS_ID="your_agent_alias_id"
   ```

2. **Run the deployment script**:
   ```bash
   chmod +x deploy_lambda.sh
   ./deploy_lambda.sh
   ```

### Manual Deployment

1. **Build the SAM application**:
   ```bash
   sam build --template-file lambda_deployment.yaml
   ```

2. **Deploy to AWS**:
   ```bash
   sam deploy \
     --template-file .aws-sam/build/template.yaml \
     --stack-name rummy-suggestion-stack \
     --region us-east-1 \
     --capabilities CAPABILITY_IAM \
     --parameter-overrides \
       BedrockAgentId=YOUR_AGENT_ID \
       BedrockAgentAliasId=YOUR_AGENT_ALIAS_ID \
       Environment=dev
   ```

## 📡 API Usage

### Endpoint

```
POST https://your-api-gateway-url/dev/suggest
```

### Request Format

```json
{
  "gameId": "game_123",
  "playerHand": [
    {"rank": "A", "suit": "spades"},
    {"rank": "2", "suit": "spades"},
    {"rank": "3", "suit": "spades"},
    {"rank": "K", "suit": "hearts"},
    {"rank": "Q", "suit": "hearts"},
    {"rank": "J", "suit": "hearts"},
    {"rank": "7", "suit": "clubs"},
    {"rank": "8", "suit": "clubs"},
    {"rank": "9", "suit": "clubs"},
    {"rank": "5", "suit": "diamonds"},
    {"rank": "6", "suit": "diamonds"},
    {"rank": "10", "suit": "spades"},
    {"rank": "4", "suit": "hearts"}
  ],
  "openDeck": [{"rank": "K", "suit": "clubs"}],
  "gameState": {
    "jokerCard": {"rank": "2", "suit": "clubs"},
    "playerMelds": [],
    "gameStatus": "active"
  }
}
```

### Response Format

```json
{
  "success": true,
  "gameId": "game_123",
  "suggestion": "🎯 Rummy Strategy Analysis...",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "source": "bedrock-agent"
}
```

### Error Response

```json
{
  "success": false,
  "error": "gameId is required"
}
```

## 🧪 Testing

### Local Testing

Run the local test version (no AWS dependencies required):

```bash
python3 test_lambda_local.py
```

### API Testing

Test the deployed Lambda function:

```bash
curl -X POST https://your-api-gateway-url/dev/suggest \
  -H 'Content-Type: application/json' \
  -d '{
    "gameId": "test_game_123",
    "playerHand": [
      {"rank": "A", "suit": "spades"},
      {"rank": "2", "suit": "spades"}
    ],
    "openDeck": [{"rank": "K", "suit": "hearts"}],
    "gameState": {
      "jokerCard": {"rank": "2", "suit": "clubs"},
      "playerMelds": [],
      "gameStatus": "active"
    }
  }'
```

## 🔄 Integration with Existing Backend

To integrate this Lambda function with your existing Node.js backend:

### Option 1: Replace the Node.js endpoint

Update your frontend to call the Lambda API Gateway endpoint directly:

```javascript
// Replace this:
const response = await fetch('/api/game/123/suggest');

// With this:
const response = await fetch('https://your-lambda-api-url/dev/suggest', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    gameId: '123',
    playerHand: playerHand,
    openDeck: openDeck,
    gameState: gameState
  })
});
```

### Option 2: Proxy through Node.js backend

Update your Node.js controller to call the Lambda function:

```javascript
// In gameController.js
async getSuggestion(req, res) {
  try {
    const { gameId } = req.params;
    const gameState = activeGames.get(gameId);
    
    // Call Lambda function
    const lambdaResponse = await fetch('https://your-lambda-api-url/dev/suggest', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        gameId: gameId,
        playerHand: gameState.playerHand,
        openDeck: gameState.openDeck,
        gameState: {
          jokerCard: gameState.jokerCard,
          playerMelds: gameState.playerMelds,
          gameStatus: gameState.gameStatus
        }
      })
    });
    
    const suggestion = await lambdaResponse.json();
    res.json(suggestion);
    
  } catch (error) {
    console.error('Lambda suggestion error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get suggestion'
    });
  }
}
```

## 🔍 Monitoring and Debugging

### CloudWatch Logs

Monitor Lambda execution logs in CloudWatch:

```bash
aws logs tail /aws/lambda/rummy-suggestion-dev --follow
```

### Performance Metrics

Key metrics to monitor:
- **Duration**: Function execution time
- **Memory Usage**: Peak memory consumption
- **Error Rate**: Failed invocations
- **Throttles**: Rate limiting events

### Debugging

Enable debug logging by setting log level in the Lambda function:

```python
import logging
logger = logging.getLogger()
logger.setLevel(logging.DEBUG)
```

## 🔧 Customization

### Modify Suggestion Logic

Update the `create_rummy_suggestion_prompt()` function to customize the AI prompt:

```python
def create_rummy_suggestion_prompt(player_hand, discard_pile, game_state):
    # Add your custom prompt logic here
    prompt = f"""Your custom Rummy strategy prompt..."""
    return prompt
```

### Add New Features

Extend the Lambda function with additional features:

1. **Game Analysis**: Add post-game analysis endpoint
2. **Multiple Game Variants**: Support different Rummy variants
3. **Player Profiling**: Personalized suggestions based on player history
4. **Difficulty Levels**: Adjust suggestion complexity

## 🚨 Troubleshooting

### Common Issues

1. **"Module not found" errors**:
   - Ensure all dependencies are in `requirements.txt`
   - Rebuild with `sam build`

2. **Bedrock permissions errors**:
   - Verify IAM permissions for Bedrock Agent access
   - Check Agent ID and Alias ID configuration

3. **CORS errors**:
   - Verify CORS configuration in API Gateway
   - Check allowed origins and headers

4. **Timeout errors**:
   - Increase Lambda timeout in `lambda_deployment.yaml`
   - Optimize Bedrock Agent response time

### Debug Steps

1. **Check CloudWatch logs** for detailed error messages
2. **Test locally** with `test_lambda_local.py`
3. **Verify AWS credentials** and permissions
4. **Test Bedrock Agent** independently in AWS Console

## 📚 References

- [AWS Lambda Documentation](https://docs.aws.amazon.com/lambda/)
- [AWS Bedrock Agent Runtime API](https://docs.aws.amazon.com/bedrock/latest/userguide/agents-api.html)
- [AWS SAM Documentation](https://docs.aws.amazon.com/serverless-application-model/)
- [Bedrock Agent Runtime Examples](https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/javascript_bedrock-agent-runtime_code_examples.html)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test locally and on AWS
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details. 