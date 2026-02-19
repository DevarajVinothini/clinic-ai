const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { auth } = require('../middleware/auth');
const { AppError, formatValidationErrors } = require('../middleware/errorHandler');
const ChatController = require('../controllers/chatController');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) throw new AppError('Validation failed', 400, formatValidationErrors(errors));
  next();
};

const messageRules = [
  body('message').trim().notEmpty().withMessage('Message cannot be empty')
    .isLength({ max: 1000 }).withMessage('Message too long (max 1000 chars)')
    .customSanitizer(val => val.replace(/<[^>]*>/g, '')),
];

// Routes
router.get('/history', auth, ChatController.getHistory);
router.post('/message', auth, messageRules, validate, ChatController.sendMessage);
router.delete('/history', auth, ChatController.clearHistory);

module.exports = router;
