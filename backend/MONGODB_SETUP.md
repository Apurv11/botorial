# MongoDB Setup Guide for Rummy Game Assistant

## Option 1: MongoDB Atlas (Recommended) 🌟

MongoDB Atlas is the official cloud database service that can run on AWS infrastructure.

### Steps:
1. **Create Account**: Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. **Create Cluster**: 
   - Choose AWS as provider
   - Select your preferred region (us-east-1 for consistency)
   - Choose M0 (Free tier) for development
3. **Setup Database Access**:
   - Create a database user with username/password
   - Note down the credentials
4. **Setup Network Access**:
   - Add your IP address to whitelist
   - For development, you can use `0.0.0.0/0` (not recommended for production)
5. **Get Connection String**:
   - Click "Connect" → "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your actual password

### Example .env entry:
```bash
MONGODB_URI=mongodb+srv://your-username:your-password@cluster0.abc123.mongodb.net/rummy-game-assistant?retryWrites=true&w=majority
```

## Option 2: AWS DocumentDB

AWS DocumentDB is Amazon's MongoDB-compatible database service.

### Steps:
1. **Create DocumentDB Cluster** in AWS Console:
   - Go to DocumentDB service
   - Create cluster with username/password
   - Note the cluster endpoint
2. **Security Group**: Configure to allow your app's access
3. **SSL Certificate**: Download AWS DocumentDB certificate

### Example .env entry:
```bash
MONGODB_URI=mongodb://your-username:your-password@your-cluster.cluster-xyz.us-east-1.docdb.amazonaws.com:27017/rummy-game-assistant?ssl=true&replicaSet=rs0&readPreference=secondaryPreferred&retryWrites=false
```

## Option 3: Local MongoDB (Development Only)

### Install MongoDB locally:
```bash
# macOS with Homebrew
brew tap mongodb/brew
brew install mongodb-community

# Start MongoDB
brew services start mongodb/brew/mongodb-community
```

### Example .env entry:
```bash
MONGODB_URI=mongodb://localhost:27017/rummy-game-assistant
```

## Quick Start (Recommended)

**For fastest setup, use MongoDB Atlas:**

1. Create free account at https://www.mongodb.com/cloud/atlas
2. Create M0 cluster on AWS
3. Add your connection string to `.env`
4. Restart your server

## Testing Your Connection

After setting up, restart your server:
```bash
npm run dev
```

If connected successfully, you'll see:
```
MongoDB connected successfully
```

If not connected, you'll see:
```
MongoDB URI not provided in environment variables. Running without database.
```

## Important Notes

- **Development**: MongoDB Atlas free tier is perfect
- **Production**: Consider MongoDB Atlas dedicated clusters or AWS DocumentDB
- **Security**: Never commit your `.env` file with real credentials
- **Performance**: Both Atlas and DocumentDB offer good performance on AWS

## Current Status

Your server is running successfully WITHOUT MongoDB (using in-memory storage). This is fine for development and testing the core functionality. Add MongoDB when you want to persist:
- Chat histories
- Game states
- User accounts
- Game analytics 