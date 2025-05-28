const fs = require('fs');
const path = require('path');

class SQLiteService {
  constructor() {
    this.dbPath = path.join(__dirname, '../data/games.json');
    this.chatPath = path.join(__dirname, '../data/chats.json');
    this.ensureDataDirectory();
    console.log('SQLite-like JSON service initialized');
  }

  ensureDataDirectory() {
    const dataDir = path.dirname(this.dbPath);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    // Initialize files if they don't exist
    if (!fs.existsSync(this.dbPath)) {
      fs.writeFileSync(this.dbPath, JSON.stringify({ games: {} }, null, 2));
    }
    if (!fs.existsSync(this.chatPath)) {
      fs.writeFileSync(this.chatPath, JSON.stringify({ chats: {} }, null, 2));
    }
  }

  // Game operations
  async saveGame(gameId, gameState) {
    try {
      const data = JSON.parse(fs.readFileSync(this.dbPath, 'utf8'));
      data.games[gameId] = {
        ...gameState,
        lastUpdated: new Date().toISOString()
      };
      fs.writeFileSync(this.dbPath, JSON.stringify(data, null, 2));
      return true;
    } catch (error) {
      console.error('Error saving game:', error);
      return false;
    }
  }

  async loadGame(gameId) {
    try {
      const data = JSON.parse(fs.readFileSync(this.dbPath, 'utf8'));
      return data.games[gameId] || null;
    } catch (error) {
      console.error('Error loading game:', error);
      return null;
    }
  }

  async getAllGames() {
    try {
      const data = JSON.parse(fs.readFileSync(this.dbPath, 'utf8'));
      return data.games;
    } catch (error) {
      console.error('Error loading games:', error);
      return {};
    }
  }

  // Chat operations
  async saveChat(sessionId, message, response) {
    try {
      const data = JSON.parse(fs.readFileSync(this.chatPath, 'utf8'));
      if (!data.chats[sessionId]) {
        data.chats[sessionId] = [];
      }
      data.chats[sessionId].push({
        message,
        response,
        timestamp: new Date().toISOString()
      });
      fs.writeFileSync(this.chatPath, JSON.stringify(data, null, 2));
      return true;
    } catch (error) {
      console.error('Error saving chat:', error);
      return false;
    }
  }

  async loadChatHistory(sessionId) {
    try {
      const data = JSON.parse(fs.readFileSync(this.chatPath, 'utf8'));
      return data.chats[sessionId] || [];
    } catch (error) {
      console.error('Error loading chat history:', error);
      return [];
    }
  }
}

module.exports = new SQLiteService(); 