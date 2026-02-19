/**
 * Centralized Error Handling Middleware
 */

// Custom error class with status codes
class AppError extends Error {
  constructor(message, statusCode = 500, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.status = statusCode >= 400 && statusCode < 500 ? 'fail' : 'error';
    this.details = details;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

// Wrap async route handlers to catch errors automatically
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

// Format express-validator errors into clean messages
const formatValidationErrors = (errors) =>
  errors.array().map(err => ({
    field: err.path || err.param,
    message: err.msg,
    value: err.value,
  }));

// 404 handler - must be placed after all routes
const notFoundHandler = (req, res, next) => {
  next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404));
};

// Global error handler - must be last middleware
const globalErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Log the error in development
  if (process.env.NODE_ENV === 'development') {
    console.error('❌ Error:', {
      message: err.message,
      statusCode: err.statusCode,
      stack: err.stack,
    });
  } else {
    // Only log unexpected errors in production
    if (!err.isOperational) {
      console.error('CRITICAL ERROR:', err);
    }
  }

  // Handle specific error types
  if (err.code === '23505') {
    // PostgreSQL unique constraint violation
    return res.status(409).json({
      status: 'fail',
      error: 'A record with this value already exists.',
    });
  }

  if (err.code === '23503') {
    // PostgreSQL foreign key constraint violation
    return res.status(400).json({
      status: 'fail',
      error: 'Referenced record does not exist.',
    });
  }

  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      status: 'fail',
      error: 'Invalid authentication token.',
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      status: 'fail',
      error: 'Authentication token has expired. Please log in again.',
    });
  }

  // Send response
  const response = {
    status: err.status,
    error: err.isOperational ? err.message : 'Something went wrong. Please try again later.',
  };

  if (err.details) {
    response.details = err.details;
  }

  // Include stack trace in development
  if (process.env.NODE_ENV === 'development' && !err.isOperational) {
    response.stack = err.stack;
  }

  res.status(err.statusCode).json(response);
};

module.exports = {
  AppError,
  asyncHandler,
  formatValidationErrors,
  notFoundHandler,
  globalErrorHandler,
};
