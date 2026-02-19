const express = require('express');
const router = express.Router();
const { body, param, validationResult } = require('express-validator');
const { auth, requireRole } = require('../middleware/auth');
const { AppError, formatValidationErrors } = require('../middleware/errorHandler');
const AppointmentController = require('../controllers/appointmentController');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) throw new AppError('Validation failed', 400, formatValidationErrors(errors));
  next();
};

const createRules = [
  body('patientId').isUUID().withMessage('Valid patient ID is required'),
  body('appointmentDate').isISO8601().withMessage('Valid date is required')
    .custom(val => { if (new Date(val) <= new Date()) throw new Error('Date must be in the future'); return true; }),
  body('type').trim().notEmpty().withMessage('Type is required').isLength({ max: 100 }),
  body('notes').optional({ values: 'falsy' }).trim().isLength({ max: 500 }),
  body('durationMinutes').optional().isInt({ min: 15, max: 120 }),
];

const scheduleRules = [
  body('appointmentDate').isISO8601().withMessage('Valid date is required')
    .custom(val => { if (new Date(val) <= new Date()) throw new Error('Date must be in the future'); return true; }),
  body('type').trim().notEmpty().withMessage('Appointment type is required').isLength({ max: 100 }),
  body('staffId').optional({ values: 'falsy' }).isUUID().withMessage('Invalid doctor ID'),
  body('notes').optional({ values: 'falsy' }).trim().isLength({ max: 500 }),
  body('durationMinutes').optional().isInt({ min: 15, max: 120 }),
];

const statusRules = [
  param('id').isUUID().withMessage('Valid appointment ID required'),
  body('status').isIn(['scheduled', 'confirmed', 'completed', 'no_show', 'cancelled']).withMessage('Invalid status'),
];

const predictRules = [
  body('previousNoShows').isInt({ min: 0 }),
  body('previousAppointments').isInt({ min: 0 }),
  body('dayOfWeek').isInt({ min: 0, max: 6 }),
  body('hourOfDay').isInt({ min: 0, max: 23 }),
  body('age').isInt({ min: 1, max: 120 }),
  body('daysUntilAppointment').isInt({ min: 0 }),
];

// Routes
router.get('/', auth, AppointmentController.list);
router.get('/staff', auth, AppointmentController.listStaff);
router.post('/', [auth, requireRole('staff', 'admin')], createRules, validate, AppointmentController.create);
router.post('/schedule', auth, scheduleRules, validate, AppointmentController.schedule);
router.patch('/:id/status', auth, statusRules, validate, AppointmentController.updateStatus);
router.post('/predict', auth, predictRules, validate, AppointmentController.predict);

module.exports = router;

