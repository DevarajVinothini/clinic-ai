const PatientService = require('../services/patientService');
const { asyncHandler } = require('../middleware/errorHandler');

const PatientController = {
    list: asyncHandler(async (req, res) => {
        const patients = await PatientService.listAll();
        res.json(patients);
    }),

    stats: asyncHandler(async (req, res) => {
        const stats = await PatientService.getDashboardStats();
        res.json(stats);
    }),
};

module.exports = PatientController;
