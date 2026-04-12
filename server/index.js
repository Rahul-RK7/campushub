const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
// Manual sanitizer (express-mongo-sanitize is incompatible with Express 5)
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '1mb' }));
// Sanitize req.body to prevent NoSQL injection (req.query is read-only in Express 5)
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
  next();
});

// Rate limiting — 100 requests per 15 min per IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
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

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(err.status || 500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => console.log('Server running on port ' + PORT));