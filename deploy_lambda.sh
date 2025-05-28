#!/bin/bash

# Deployment script for Rummy Suggestion Lambda Function
# This script deploys the Lambda function using AWS SAM CLI

set -e

# Configuration
STACK_NAME="rummy-suggestion-stack"
REGION="us-east-1"
ENVIRONMENT="dev"
BEDROCK_AGENT_ID="AJBHXXILZN"
BEDROCK_AGENT_ALIAS_ID="AVKP1ITZAA"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Deploying Rummy Suggestion Lambda Function${NC}"
echo "Stack Name: $STACK_NAME"
echo "Region: $REGION"
echo "Environment: $ENVIRONMENT"
echo ""

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo -e "${RED}❌ AWS CLI is not installed. Please install it first.${NC}"
    exit 1
fi

# Check if SAM CLI is installed
if ! command -v sam &> /dev/null; then
    echo -e "${RED}❌ AWS SAM CLI is not installed. Please install it first.${NC}"
    echo "Install with: pip install aws-sam-cli"
    exit 1
fi

# Check AWS credentials
if ! aws sts get-caller-identity &> /dev/null; then
    echo -e "${RED}❌ AWS credentials not configured. Please run 'aws configure' first.${NC}"
    exit 1
fi

echo -e "${YELLOW}📦 Building Lambda function...${NC}"

# Build the SAM application
sam build --template-file lambda_deployment.yaml

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Build failed${NC}"
    exit 1
fi

echo -e "${YELLOW}🚀 Deploying to AWS...${NC}"

# Deploy the SAM application
sam deploy \
    --template-file .aws-sam/build/template.yaml \
    --stack-name $STACK_NAME \
    --region $REGION \
    --capabilities CAPABILITY_IAM \
    --parameter-overrides \
        BedrockAgentId=$BEDROCK_AGENT_ID \
        BedrockAgentAliasId=$BEDROCK_AGENT_ALIAS_ID \
        Environment=$ENVIRONMENT \
    --no-confirm-changeset

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Deployment successful!${NC}"
    
    # Get the API Gateway endpoint
    ENDPOINT=$(aws cloudformation describe-stacks \
        --stack-name $STACK_NAME \
        --region $REGION \
        --query 'Stacks[0].Outputs[?OutputKey==`ApiGatewayEndpoint`].OutputValue' \
        --output text)
    
    echo ""
    echo -e "${GREEN}🌐 API Endpoint: $ENDPOINT${NC}"
    echo ""
    echo -e "${YELLOW}📝 Test the endpoint with:${NC}"
    echo "curl -X POST $ENDPOINT \\"
    echo "  -H 'Content-Type: application/json' \\"
    echo "  -d '{"
    echo "    \"gameId\": \"test_game_123\","
    echo "    \"playerHand\": ["
    echo "      {\"rank\": \"A\", \"suit\": \"spades\"},"
    echo "      {\"rank\": \"2\", \"suit\": \"spades\"}"
    echo "    ],"
    echo "    \"openDeck\": [{\"rank\": \"K\", \"suit\": \"hearts\"}],"
    echo "    \"gameState\": {"
    echo "      \"jokerCard\": {\"rank\": \"2\", \"suit\": \"clubs\"},"
    echo "      \"playerMelds\": [],"
    echo "      \"gameStatus\": \"active\""
    echo "    }"
    echo "  }'"
    
else
    echo -e "${RED}❌ Deployment failed${NC}"
    exit 1
fi 