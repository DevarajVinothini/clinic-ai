const express = require('express');
const router = express.Router();
const { param, validationResult } = require('express-validator');
const { auth } = require('../middleware/auth');
const { AppError, formatValidationErrors } = require('../middleware/errorHandler');
const ReminderController = require('../controllers/reminderController');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) throw new AppError('Validation failed', 400, formatValidationErrors(errors));
  next();
};

// Routes
router.get('/', auth, ReminderController.list);
router.patch('/:id/read', auth, [param('id').isUUID()], validate, ReminderController.markRead);

module.exports = router;
