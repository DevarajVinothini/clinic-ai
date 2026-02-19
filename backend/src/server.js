require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { notFoundHandler, globalErrorHandler } = require('./middleware/errorHandler');

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json({ limit: '10kb' }));
app.use(morgan('dev'));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { status: 'fail', error: 'Too many requests, please try again later.' },
});
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { status: 'fail', error: 'Too many auth attempts. Please wait before trying again.' },
});

app.use('/api/', limiter);
app.use('/api/auth', authLimiter);

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/appointments', require('./routes/appointments'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api/patients', require('./routes/patients'));
app.use('/api/reminders', require('./routes/reminders'));
app.use('/api/medications', require('./routes/medications'));

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// Error handling (must be after all routes)
app.use(notFoundHandler);
app.use(globalErrorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🏥 ClinicAI Backend running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
