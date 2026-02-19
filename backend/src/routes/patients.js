const express = require('express');
const router = express.Router();
const { auth, requireRole } = require('../middleware/auth');
const PatientController = require('../controllers/patientController');

// Routes — staff only
router.get('/', [auth, requireRole('staff', 'admin')], PatientController.list);
router.get('/stats', [auth, requireRole('staff', 'admin')], PatientController.stats);

module.exports = router;
