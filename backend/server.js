const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { createServer } = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Rummy Game Assistant Backend Server is running!' });
});

// Import and use route modules
const chatRoutes = require('./routes/chat');
const gameRoutes = require('./routes/game');
const statsRoutes = require('./routes/stats');

app.use('/api/chat', chatRoutes);
app.use('/api/game', gameRoutes);
app.use('/api/stats', statsRoutes);

// MongoDB connection
const connectDB = async () => {
  try {
    if (process.env.MONGODB_URI) {
      await mongoose.connect(process.env.MONGODB_URI);
      console.log('MongoDB connected successfully');
    } else {
      console.log('MongoDB URI not provided in environment variables. Running without database.');
    }
  } catch (error) {
    console.error('MongoDB connection error:', error);
    // Don't exit process in development - allow running without DB
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
};

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Game-related socket events
  socket.on('join-game', (gameId) => {
    socket.join(gameId);
    console.log(`User ${socket.id} joined game ${gameId}`);
  });

  socket.on('leave-game', (gameId) => {
    socket.leave(gameId);
    console.log(`User ${socket.id} left game ${gameId}`);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Start server
const PORT = process.env.PORT || 3001;

connectDB().then(() => {
  httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  });
});

module.exports = { app, io }; 