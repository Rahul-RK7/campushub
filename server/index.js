const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// ── Process-level crash handlers ──
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
});
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

const app = express();
const server = http.createServer(app);

// Socket.IO setup
const allowedOrigin = process.env.CLIENT_URL || 'http://localhost:5173';
const io = new Server(server, {
  cors: {
    origin: allowedOrigin,
    methods: ['GET', 'POST'],
  },
});

// Make io accessible to controllers via req.app.get('io')
app.set('io', io);

app.use(helmet());
app.use(cors({ origin: allowedOrigin }));
app.use(express.json({ limit: '1mb' }));

// Sanitize req.body, req.query, and req.params to prevent NoSQL injection
app.use((req, res, next) => {
  const sanitize = (obj) => {
    if (typeof obj !== 'object' || obj === null) return obj;
    for (const key of Object.keys(obj)) {
      if (key.startsWith('$')) delete obj[key];
      else if (typeof obj[key] === 'object') sanitize(obj[key]);
    }
    return obj;
  };
  if (req.body) sanitize(req.body);
  if (req.query) sanitize(req.query);
  if (req.params) sanitize(req.params);
  next();
});

// Rate limiting — 200 requests per 15 min per IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', limiter);

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error(err));

const PORT = process.env.PORT || 5000;
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);
app.use('/api/faculty', require('./routes/faculty'));
app.use('/api/posts', require('./routes/posts'));
app.use('/api/users', require('./routes/users'));
app.use('/api/comments', require('./routes/comments'));
app.use('/api/events', require('./routes/events'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/stories', require('./routes/stories'));

// ═══════════════════════════════════════════════════════════════
// Socket.IO — Authentication & Events
// ═══════════════════════════════════════════════════════════════

// Track online users: userId -> Set of socketIds
const onlineUsers = new Map();

// JWT authentication middleware for Socket.IO
io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) return next(new Error('Authentication required'));
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.id;
    next();
  } catch {
    next(new Error('Invalid token'));
  }
});

io.on('connection', (socket) => {
  const userId = socket.userId;
  console.log(`Socket connected: ${userId}`);

  // Join a personal room keyed by userId
  socket.join(userId);

  // Track online status
  if (!onlineUsers.has(userId)) onlineUsers.set(userId, new Set());
  onlineUsers.get(userId).add(socket.id);

  // Broadcast updated online users list
  io.emit('onlineUsers', Array.from(onlineUsers.keys()));

  // Typing indicator
  socket.on('typing', ({ conversationId, isTyping }) => {
    socket.to(conversationId).emit('userTyping', {
      userId,
      conversationId,
      isTyping,
    });
  });

  // Join conversation room (for typing indicators)
  socket.on('joinConversation', (conversationId) => {
    socket.join(conversationId);
  });

  socket.on('leaveConversation', (conversationId) => {
    socket.leave(conversationId);
  });

  socket.on('disconnect', () => {
    console.log(`Socket disconnected: ${userId}`);
    const sockets = onlineUsers.get(userId);
    if (sockets) {
      sockets.delete(socket.id);
      if (sockets.size === 0) onlineUsers.delete(userId);
    }
    io.emit('onlineUsers', Array.from(onlineUsers.keys()));
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(err.status || 500).json({ error: 'Internal server error' });
});

server.listen(PORT, () => console.log('Server running on port ' + PORT));

// ── Graceful shutdown ──
const shutdown = () => {
  console.log('Shutting down gracefully...');
  server.close(() => {
    mongoose.connection.close(false).then(() => {
      console.log('MongoDB connection closed.');
      process.exit(0);
    });
  });
  // Force exit after 10s if graceful shutdown fails
  setTimeout(() => process.exit(1), 10000);
};
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);