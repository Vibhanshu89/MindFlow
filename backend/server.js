require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const passport = require('passport');

const connectDB = require('./config/db');
require('./config/passport');

const authRoutes = require('./routes/authRoutes');
const projectRoutes = require('./routes/projectRoutes');
const taskRoutes = require('./routes/taskRoutes');
const aiRoutes = require('./routes/aiRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const { errorHandler, notFound } = require('./middleware/errorMiddleware');
const initSocket = require('./sockets/socketHandler');

const app = express();
app.set('trust proxy', 1);
const httpServer = http.createServer(app);

// Socket.io setup
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Initialize socket with auth
initSocket(io);

// Connect to Database
connectDB();

// Middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());

// Attach io to every request for controllers to emit events
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: '🚀 AI Project Manager API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/notifications', notificationRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`\n🚀 Server running on port ${PORT}`);
  console.log(`📡 Environment: ${process.env.NODE_ENV}`);
  console.log(`🌐 Client URL: ${process.env.CLIENT_URL}\n`);
});

module.exports = { app, io };
