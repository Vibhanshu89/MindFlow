const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Initialize Socket.io with authentication and room management
 */
const initSocket = (io) => {
  // Auth middleware for socket connections
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.query.token;
      if (!token) {
        return next(new Error('Authentication required'));
      }
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      if (!user) return next(new Error('User not found'));
      socket.user = user;
      next();
    } catch (err) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`🔌 User connected: ${socket.user.name} (${socket.id})`);

    // Join personal room for direct notifications
    socket.join(`user:${socket.user._id}`);

    // Join project rooms
    socket.on('join:project', (projectId) => {
      socket.join(`project:${projectId}`);
      console.log(`👥 ${socket.user.name} joined project room: ${projectId}`);
    });

    socket.on('leave:project', (projectId) => {
      socket.leave(`project:${projectId}`);
    });

    // Typing indicator for task comments
    socket.on('task:typing', ({ taskId, projectId }) => {
      socket.to(`project:${projectId}`).emit('task:user_typing', {
        taskId,
        user: { name: socket.user.name, avatar: socket.user.avatar },
      });
    });

    // Online status
    socket.broadcast.emit('user:online', { userId: socket.user._id, name: socket.user.name });

    socket.on('disconnect', () => {
      console.log(`🔌 User disconnected: ${socket.user.name}`);
      io.emit('user:offline', { userId: socket.user._id });
    });
  });

  return io;
};

module.exports = initSocket;
