const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { auth } = require('../middleware/auth');
const { AppError, formatValidationErrors } = require('../middleware/errorHandler');
const AuthController = require('../controllers/authController');

// Validation middleware
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) throw new AppError('Validation failed', 400, formatValidationErrors(errors));
  next();
};

const registerRules = [
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('firstName').trim().notEmpty().withMessage('First name is required').isLength({ max: 100 }),
  body('lastName').trim().notEmpty().withMessage('Last name is required').isLength({ max: 100 }),
  body('role').isIn(['patient', 'staff']).withMessage('Role must be patient or staff'),
  body('phone').optional({ values: 'falsy' }).matches(/^[\d\s\-\+\(\)]+$/),
  body('dateOfBirth').optional({ values: 'falsy' }).isISO8601(),
];

const loginRules = [
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

// Routes
router.post('/register', registerRules, validate, AuthController.register);
router.post('/login', loginRules, validate, AuthController.login);
router.get('/me', auth, AuthController.getProfile);

module.exports = router;
