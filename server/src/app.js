const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const mongoSanitize = require('express-mongo-sanitize');
const { CLIENT_URL } = require('./config/env');
const { apiLimiter } = require('./middleware/rateLimiter');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Security headers
app.use(helmet());

// CORS
const clientUrlClean = (CLIENT_URL || '').replace(/\/+$/, '');
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    const cleanOrigin = origin.replace(/\/+$/, '');
    if (
      cleanOrigin === clientUrlClean ||
      cleanOrigin === 'http://localhost:5173' ||
      cleanOrigin === 'http://localhost:5174' ||
      cleanOrigin.endsWith('.vercel.app')
    ) {
      return callback(null, true);
    }
    return callback(null, false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Body parsing with size limit
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: false, limit: '100kb' }));

// Sanitize against NoSQL injection
app.use(mongoSanitize());

// Gzip compression
app.use(compression());

// General rate limiting
app.use('/api', apiLimiter);

// Health check (no auth, no rate limit)
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/surveys', require('./routes/surveys'));
app.use('/api/surveys', require('./routes/responses'));
app.use('/api/surveys', require('./routes/analytics'));
app.use('/api/public', require('./routes/public'));
app.use('/api/storage', require('./routes/storage'));

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Global error handler
app.use(errorHandler);

module.exports = app;
