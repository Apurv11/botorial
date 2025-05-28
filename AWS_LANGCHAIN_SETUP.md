# 🚀 LangChain + AWS Bedrock Setup for Hackathon

## **Current Status: LangChain Mock Mode ✅**
Your app now uses **LangChain architecture** with mock responses - perfect for demos!

## **🔧 AWS Requirements for Real LangChain Integration**

### **Step 1: AWS Account Setup**

**1.1 Create AWS Account**
- Go to [aws.amazon.com](https://aws.amazon.com)
- Sign up for free tier account
- Verify email and add payment method

**1.2 Enable Bedrock Access**
```bash
# Go to AWS Console → Amazon Bedrock → Model Access
# Request access to these models:
- Anthropic Claude 3 Sonnet
- Anthropic Claude 3 Haiku  
- Anthropic Claude 3 Opus (optional)

# ⏰ Wait time: Usually 24-48 hours for approval
```

### **Step 2: AWS Credentials & Permissions**

**2.1 Create IAM User (Recommended)**
```bash
# AWS Console → IAM → Users → Create User
Username: rummy-langchain-user
Access type: Programmatic access
```

**2.2 Required IAM Permissions**
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "BedrockAccess",
            "Effect": "Allow",
            "Action": [
                "bedrock:InvokeModel",
                "bedrock:ListFoundationModels",
                "bedrock:GetFoundationModel",
                "bedrock:InvokeModelWithResponseStream"
            ],
            "Resource": [
                "arn:aws:bedrock:*::foundation-model/anthropic.claude-3-sonnet-20240229-v1:0",
                "arn:aws:bedrock:*::foundation-model/anthropic.claude-3-haiku-20240307-v1:0",
                "arn:aws:bedrock:*::foundation-model/anthropic.claude-3-opus-20240229-v1:0"
            ]
        }
    ]
}
```

**2.3 Attach Policy**
- AWS Console → IAM → Users → your-user → Permissions
- Attach policy: `BedrockFullAccess` (for hackathon) or custom policy above

### **Step 3: Get AWS Credentials**

**Method 1: Access Keys (Hackathon)**
```bash
# AWS Console → IAM → Users → your-user → Security Credentials
# Create Access Key → Application running outside AWS
# Download .csv file with:
Access Key ID: AKIA...
Secret Access Key: xyz123...
```

**Method 2: AWS CLI (Alternative)**
```bash
# Install AWS CLI
brew install awscli  # macOS
# OR
pip install awscli

# Configure
aws configure
# Enter:
# - Access Key ID
# - Secret Access Key  
# - Default region: us-east-1
# - Output format: json
```

### **Step 4: Environment Configuration**

**4.1 Create backend/.env file**
```bash
# Copy this to backend/.env
PORT=3001
NODE_ENV=development
USE_LANGCHAIN=true

# AWS Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=AKIA...your_actual_key...
AWS_SECRET_ACCESS_KEY=xyz123...your_actual_secret...

# Claude Model Options (choose one)
CLAUDE_MODEL_ID=anthropic.claude-3-sonnet-20240229-v1:0
# CLAUDE_MODEL_ID=anthropic.claude-3-haiku-20240307-v1:0
# CLAUDE_MODEL_ID=anthropic.claude-3-opus-20240229-v1:0

# Frontend
FRONTEND_URL=http://localhost:3000
```

### **Step 5: AWS Resources You'll Use**

**5.1 Required AWS Services**
- ✅ **Amazon Bedrock** - LLM hosting service
- ✅ **IAM** - Identity and access management
- ❌ No EC2, Lambda, or S3 needed for basic setup

**5.2 AWS Regions with Bedrock**
```bash
# Available regions for Claude:
- us-east-1 (N. Virginia) ✅ Recommended
- us-west-2 (Oregon)
- eu-west-3 (Paris)
- ap-southeast-1 (Singapore)
- ap-northeast-1 (Tokyo)
```

**5.3 Model ARNs**
```bash
# Claude 3 Sonnet (Recommended for hackathons)
arn:aws:bedrock:us-east-1::foundation-model/anthropic.claude-3-sonnet-20240229-v1:0

# Claude 3 Haiku (Faster, cheaper)
arn:aws:bedrock:us-east-1::foundation-model/anthropic.claude-3-haiku-20240307-v1:0

# Claude 3 Opus (Most capable, expensive)
arn:aws:bedrock:us-east-1::foundation-model/anthropic.claude-3-opus-20240229-v1:0
```

### **Step 6: Testing Your Setup**

**6.1 Test LangChain Integration**
```bash
# Start your server
npm run dev

# Check logs for:
🚀 LangChain AWS Bedrock initialized - real Claude AI ready!
✅ LangChain ChatBedrock model initialized successfully
```

**6.2 Test API Call**
```bash
# Test chat endpoint
curl -X POST http://localhost:3001/api/chat/send \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello LangChain Claude!"}'

# Should return real Claude response, not mock
```

## **🎯 Hackathon Strategy**

### **Demo Mode (Current - Perfect for Judging!)**
```bash
USE_LANGCHAIN=false  # or omit
# Shows LangChain architecture with mock responses
# ✅ No AWS costs
# ✅ Immediate functionality  
# ✅ Perfect for demonstrations
```

### **Live Mode (Wow Factor!)**
```bash
USE_LANGCHAIN=true
# Real Claude AI through LangChain
# 💰 Small AWS costs (~$0.01-0.10 per demo)
# 🚀 Real AI intelligence
# 🏆 Impressive for judges
```

## **💰 Cost Estimates**

**Claude 3 Haiku (Cheapest)**
- Input: $0.25 per 1M tokens
- Output: $1.25 per 1M tokens
- **Hackathon demo: ~$0.01-0.05**

**Claude 3 Sonnet (Recommended)**
- Input: $3.00 per 1M tokens  
- Output: $15.00 per 1M tokens
- **Hackathon demo: ~$0.05-0.25**

**Claude 3 Opus (Premium)**
- Input: $15.00 per 1M tokens
- Output: $75.00 per 1M tokens
- **Hackathon demo: ~$0.25-1.00**

## **🔐 Security Best Practices**

**For Hackathons:**
```bash
# ✅ Use environment variables
# ✅ Never commit .env to git
# ✅ Use IAM user (not root)
# ✅ Minimal permissions
```

**For Production:**
```bash
# ✅ AWS IAM Roles
# ✅ AWS Secrets Manager
# ✅ VPC endpoints
# ✅ CloudTrail logging
```

## **🚨 Common Issues & Solutions**

**Issue 1: "Model access denied"**
```bash
# Solution: Wait for Bedrock model approval
# Check: AWS Console → Bedrock → Model Access
```

**Issue 2: "Invalid credentials"**
```bash
# Solution: Check .env file format
# Verify: AWS Console → IAM → Access Keys
```

**Issue 3: "Region not supported"**
```bash
# Solution: Use us-east-1 region
# Update: AWS_REGION=us-east-1
```

## **🎉 You're Ready!**

Your LangChain integration is ready to impress hackathon judges:

- ✅ **Architecture**: Professional LangChain framework
- ✅ **Flexibility**: Mock for demos, real for testing  
- ✅ **Scalability**: Easy to switch between modes
- ✅ **Tech Stack**: Modern AI integration patterns

**Next Step**: Test both mock and real modes, then demo confidently! 🚀 