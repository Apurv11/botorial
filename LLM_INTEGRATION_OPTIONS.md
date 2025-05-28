# 🤖 LLM Integration Options for Node.js

## **Answer: LangChain is NOT Required!**

You can directly call Bedrock (or any LLM) using native SDKs. Here are your options:

## **Option 1: Direct AWS SDK (Recommended) ✅**

**No extra dependencies needed** - just the official AWS SDK:

```bash
npm install @aws-sdk/client-bedrock-runtime @aws-sdk/credential-providers
```

```javascript
// Direct Bedrock Integration - backend/services/realClaudeService.js
const { BedrockRuntimeClient, InvokeModelCommand } = require('@aws-sdk/client-bedrock-runtime');

class RealClaudeService {
  constructor() {
    this.client = new BedrockRuntimeClient({ 
      region: process.env.AWS_REGION || 'us-east-1'
    });
    this.modelId = process.env.CLAUDE_MODEL_ID || 'anthropic.claude-3-sonnet-20240229-v1:0';
  }

  async sendMessage(message, systemPrompt = null, maxTokens = 2000) {
    try {
      const prompt = systemPrompt 
        ? `Human: ${systemPrompt}\n\nUser: ${message}\n\nAssistant:`
        : `Human: ${message}\n\nAssistant:`;

      const input = {
        modelId: this.modelId,
        contentType: 'application/json',
        accept: 'application/json',
        body: JSON.stringify({
          anthropic_version: 'bedrock-2023-05-31',
          max_tokens: maxTokens,
          messages: [
            {
              role: 'user',
              content: message
            }
          ],
          system: systemPrompt
        })
      };

      const command = new InvokeModelCommand(input);
      const response = await this.client.send(command);
      
      const responseBody = JSON.parse(new TextDecoder().decode(response.body));
      
      return {
        success: true,
        message: responseBody.content[0].text,
        usage: responseBody.usage
      };
    } catch (error) {
      console.error('Claude service error:', error);
      return {
        success: false,
        error: error.message,
        message: 'Sorry, I encountered an error. Please try again.'
      };
    }
  }
}

module.exports = new RealClaudeService();
```

## **Option 2: OpenAI SDK (Alternative)**

```bash
npm install openai
```

```javascript
// Direct OpenAI Integration
const OpenAI = require('openai');

class OpenAIService {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }

  async sendMessage(message, systemPrompt = null, maxTokens = 2000) {
    try {
      const messages = [];
      
      if (systemPrompt) {
        messages.push({ role: 'system', content: systemPrompt });
      }
      
      messages.push({ role: 'user', content: message });

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: messages,
        max_tokens: maxTokens
      });

      return {
        success: true,
        message: response.choices[0].message.content,
        usage: response.usage
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Error occurred'
      };
    }
  }
}
```

## **Option 3: LangChain (Over-engineered for simple use cases)**

```bash
npm install langchain @langchain/aws @langchain/openai
```

```javascript
// LangChain approach (more complex, but good for chains/agents)
const { ChatBedrock } = require('@langchain/aws');
const { HumanMessage, SystemMessage } = require('langchain/schema');

class LangChainService {
  constructor() {
    this.model = new ChatBedrock({
      model: 'anthropic.claude-3-sonnet-20240229-v1:0',
      region: 'us-east-1'
    });
  }

  async sendMessage(message, systemPrompt = null) {
    const messages = [];
    
    if (systemPrompt) {
      messages.push(new SystemMessage(systemPrompt));
    }
    
    messages.push(new HumanMessage(message));
    
    const response = await this.model.invoke(messages);
    return response.content;
  }
}
```

## **Comparison Table**

| Approach | Complexity | Dependencies | Use Case |
|----------|------------|--------------|----------|
| **Direct AWS SDK** | ⭐ Simple | 2 packages | **Perfect for your Rummy app** |
| **OpenAI SDK** | ⭐ Simple | 1 package | If using GPT instead |
| **LangChain** | ⭐⭐⭐ Complex | 10+ packages | Complex AI workflows, agents |

## **For Your Rummy Game: Direct AWS SDK is Best!**

**Why avoid LangChain for this project:**
- ❌ Overkill for simple chat/suggestions
- ❌ Adds unnecessary complexity
- ❌ Larger bundle size
- ❌ More dependencies to manage

**Why use Direct AWS SDK:**
- ✅ Official AWS support
- ✅ Minimal dependencies  
- ✅ Full control over requests
- ✅ Better performance
- ✅ Easier debugging

## **Quick Migration from Mock to Real**

Replace your mock service in 3 steps:

1. **Install AWS SDK:**
```bash
cd backend
npm install @aws-sdk/client-bedrock-runtime @aws-sdk/credential-providers
```

2. **Create .env file:**
```bash
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
CLAUDE_MODEL_ID=anthropic.claude-3-sonnet-20240229-v1:0
```

3. **Replace claudeService.js** with the Direct AWS SDK code above.

**Your mock service works perfectly for demos - no rush to change!** 🎉

## **Other LLM APIs (Direct Integration)**

All major LLMs provide direct SDKs:

- **Anthropic Direct:** `@anthropic-ai/sdk`
- **Google Gemini:** `@google/generative-ai`  
- **Cohere:** `cohere-ai`
- **Mistral:** `@mistralai/mistralai`

**Bottom Line:** Skip LangChain unless you need complex AI workflows! 🚀 