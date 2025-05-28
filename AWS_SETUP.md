# 🤖 AWS Bedrock Setup for Real Claude AI

## Current Status: Mock Service ✅
Your app works perfectly with **mock Claude responses** - no setup required!

## To Enable Real Claude AI:

### 1. **Create AWS Account & Enable Bedrock**
```bash
# Go to AWS Console → Bedrock → Model Access
# Request access to Anthropic Claude models
# Wait for approval (usually 24-48 hours)
```

### 2. **Get AWS Credentials**
```bash
# Method 1: AWS CLI
aws configure

# Method 2: IAM User
# Create IAM user with BedrockFullAccess policy
# Generate Access Key + Secret Key
```

### 3. **Create backend/.env file**
```bash
# Copy this to backend/.env
PORT=3001
NODE_ENV=development

# AWS Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_actual_access_key
AWS_SECRET_ACCESS_KEY=your_actual_secret_key

# Claude Model (use one of these)
CLAUDE_MODEL_ID=anthropic.claude-3-sonnet-20240229-v1:0
# CLAUDE_MODEL_ID=anthropic.claude-3-haiku-20240307-v1:0
# CLAUDE_MODEL_ID=anthropic.claude-3-opus-20240229-v1:0

FRONTEND_URL=http://localhost:3000
```

### 4. **Update Node.js (Required for Real Bedrock)**
```bash
# Check current version
node --version

# If < 18, upgrade:
# Install Node.js 18+ from nodejs.org
# Or use nvm:
nvm install 18
nvm use 18
```

### 5. **Install Real AWS SDK**
```bash
cd backend
npm install @aws-sdk/client-bedrock-runtime@^3.300.0
npm install @aws-sdk/credential-providers@^3.300.0
```

### 6. **Replace Mock Service**
Replace `backend/services/claudeService.js` with real Bedrock implementation.

## **🎯 Recommendation**

**For Hackathons/Demos:** Keep using the mock service!
- ✅ Works immediately
- ✅ No AWS costs
- ✅ No approval waiting time
- ✅ Perfect for showcasing functionality

**For Production:** Enable real Bedrock when you need actual AI intelligence.

## **Mock vs Real Responses**

**Mock Service:**
```json
{
  "success": true,
  "message": "Mock suggestion: Draw from the closed deck to avoid giving away your strategy.",
  "usage": { "input_tokens": 25, "output_tokens": 40 }
}
```

**Real Bedrock:**
```json
{
  "success": true,
  "message": "Based on your current hand, I recommend drawing from the closed deck. You have 7♠ and 9♠, so drawing could help complete that sequence. Avoid the King♣ from the discard pile as it's a high-value card with limited sequence potential.",
  "usage": { "input_tokens": 156, "output_tokens": 89 }
}
```

## **Cost Estimate (Real Bedrock)**
- Claude-3 Haiku: ~$0.25 per 1M input tokens
- Claude-3 Sonnet: ~$3.00 per 1M input tokens  
- Typical game: ~$0.01-0.05 per session

Your current **mock service** is perfect for development and demos! 🎉 