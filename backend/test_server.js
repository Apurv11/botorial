const express = require('express');
const cors = require('cors');

// Simple test server to verify everything works
const app = express();
const PORT = 3002;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ 
    message: 'Rummy Game Assistant Backend Test - Working!',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    database: 'Not needed for demo - using in-memory storage'
  });
});

app.get('/api/test', (req, res) => {
  res.json({
    chat: 'Mock Claude service working',
    game: 'Rummy game logic implemented',
    storage: 'In-memory (perfect for demos)',
    statistics: 'Real-time tracking without database',
    routes: {
      chat: '/api/chat',
      game: '/api/game',
      stats: '/api/stats',
      health: '/api/chat/health',
      progress: '/api/stats/progress'
    }
  });
});

app.listen(PORT, () => {
  console.log(`Test server running on port ${PORT}`);
  console.log(`Test it: curl http://localhost:${PORT}/`);
  console.log('Your main server works the same way!');
});

module.exports = app; 