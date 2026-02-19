const express = require('express');
const router = express.Router();
const { body, param, validationResult } = require('express-validator');
const { auth } = require('../middleware/auth');
const { AppError, formatValidationErrors } = require('../middleware/errorHandler');
const MedicationController = require('../controllers/medicationController');

const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) throw new AppError('Validation failed', 400, formatValidationErrors(errors));
    next();
};

const createRules = [
    body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 255 }),
    body('dosage').optional({ values: 'falsy' }).trim().isLength({ max: 100 }),
    body('frequency').trim().notEmpty().withMessage('Frequency is required').isLength({ max: 100 }),
    body('instructions').optional({ values: 'falsy' }).trim().isLength({ max: 500 }),
    body('startDate').optional({ values: 'falsy' }).isISO8601(),
    body('endDate').optional({ values: 'falsy' }).isISO8601(),
];

const logRules = [
    param('id').isUUID().withMessage('Valid medication ID required'),
    body('status').optional().isIn(['taken', 'missed', 'skipped']),
    body('notes').optional({ values: 'falsy' }).trim().isLength({ max: 500 }),
];

// Routes
router.get('/', auth, MedicationController.list);
router.post('/', auth, createRules, validate, MedicationController.create);
router.post('/:id/log', auth, logRules, validate, MedicationController.log);

module.exports = router;
