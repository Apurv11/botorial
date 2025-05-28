# Migration from LangChain to AWS Bedrock Agent Runtime

This document outlines the migration from LangChain to AWS SDK v3 Bedrock Agent Runtime for the Claude AI service.

## Changes Made

### 1. Dependencies Updated
- **Removed**: `@langchain/aws`, `@langchain/core`, `langchain`, `@aws-sdk/client-bedrock-runtime`
- **Added**: `@aws-sdk/client-bedrock-agent-runtime`

### 2. Service Implementation
- Replaced `ChatBedrock` with `BedrockAgentRuntimeClient`
- Replaced `InvokeModel` with `InvokeAgent` command
- Added session management for agent conversations
- Implemented streaming response handling

### 3. Environment Variables
- Changed `USE_LANGCHAIN` to `USE_BEDROCK`
- Removed `CLAUDE_MODEL_ID` (handled by agent configuration)
- Added `BEDROCK_AGENT_ID` and `BEDROCK_AGENT_ALIAS_ID`

### 4. Key Differences

#### LangChain Approach (Previous)
```javascript
const model = new ChatBedrock({
  model: 'anthropic.claude-3-sonnet-20240229-v1:0',
  region: 'us-east-1',
  credentials: { ... }
});

const response = await model.invoke([
  new SystemMessage(systemPrompt),
  new HumanMessage(message)
]);
```

#### Bedrock Agent Runtime Approach (Current)
```javascript
const client = new BedrockAgentRuntimeClient({
  region: 'us-east-1',
  credentials: { ... }
});

const command = new InvokeAgentCommand({
  agentId: 'AJBHXXILZN',
  agentAliasId: 'AVKP1ITZAA',
  sessionId: sessionId,
  inputText: prompt
});

const response = await client.send(command);
```

## Benefits of Migration

1. **Direct AWS Integration**: Uses official AWS SDK instead of third-party wrapper
2. **Agent Capabilities**: Leverages Bedrock Agents for more sophisticated AI interactions
3. **Session Management**: Built-in conversation context handling
4. **Streaming Support**: Native streaming response processing
5. **Reduced Dependencies**: Fewer npm packages to maintain

## Configuration

### Environment Setup
```bash
# Copy template
cp env.template .env

# For demo mode (default)
USE_BEDROCK=false

# For production with real AWS Bedrock Agent
USE_BEDROCK=true
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
BEDROCK_AGENT_ID=your_agent_id
BEDROCK_AGENT_ALIAS_ID=your_agent_alias_id
```

### AWS Bedrock Agent Setup
1. Create a Bedrock Agent in AWS Console
2. Configure the agent with appropriate instructions
3. Create an agent alias
4. Note the Agent ID and Alias ID for configuration

## API Compatibility

The service maintains the same public API:
- `sendMessage(message, systemPrompt)`
- `getRummyAdvice(message)`
- `getGameSuggestion(playerHand, discardPile, gameState)`
- `analyzeGame(gameHistory, playerMoves, botMoves)`

## Testing

```bash
# Test service loading
node -e "const service = require('./services/claudeService.js'); console.log('Service loaded:', service.isDemo ? 'Demo' : 'Production');"

# Start server
npm run dev
```

## References

- [AWS Bedrock Agent Runtime Documentation](https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/javascript_bedrock-agent-runtime_code_examples.html)
- [AWS SDK for JavaScript v3](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/)
- [Amazon Bedrock Agents](https://docs.aws.amazon.com/bedrock/latest/userguide/agents.html) 