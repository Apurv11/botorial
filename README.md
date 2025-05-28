# 🃏 Rummy Game Assistant

AI-powered Rummy game assistant with Amazon Claude integration for strategic gameplay and learning.

## 🚀 Quick Start

```bash
# Install dependencies
npm run install-deps

# Start development server
npm run dev

# Test the server
npm test
```

## ✨ Features

- **🤖 Ask BOT**: Get Rummy rules, strategies, and tips from Claude AI
- **🎮 Play with BOT**: Play Rummy against an AI opponent  
- **📊 Real-time Scoring**: Automatic score calculation
- **💡 AI Suggestions**: Get optimal move suggestions
- **📈 Game Analysis**: Post-game performance analysis

## 🏗️ Architecture

```
rummy-game-assistant/
├── backend/           # Node.js/Express API server
│   ├── controllers/   # Game and chat controllers
│   ├── services/      # Game logic and AI services
│   ├── routes/        # API endpoints
│   └── server.js      # Main server file
├── frontend/          # React.js client (coming soon)
└── docs/             # Documentation
```

## 🎯 No Database Required!

This project uses **in-memory storage** for:
- ✅ Game state management
- ✅ Score tracking
- ✅ Statistics calculation
- ✅ Perfect for demos and hackathons

## 📡 API Endpoints

- `GET /api/chat/health` - Check AI service status
- `POST /api/chat/message` - Send message to Claude
- `POST /api/game/create` - Start new game
- `GET /api/game/:id` - Get game state
- `POST /api/game/:id/draw` - Draw card
- `POST /api/game/:id/discard` - Discard card
- `POST /api/game/:id/suggest` - Get AI suggestion

## 🔧 Environment Setup

Create `backend/.env`:
```bash
PORT=3001
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
```

## 🎮 Statistics Tracking (In-Memory)

Track without database:
- Win/Loss ratios
- Average scores
- Game duration
- Move efficiency
- Learning progress

## 🏆 Perfect For Hackathons

- Zero external dependencies
- Works immediately
- No database setup required
- Impressive AI integration
- Scalable architecture

## 📞 Support

Built with ❤️ for hackathons and learning! 