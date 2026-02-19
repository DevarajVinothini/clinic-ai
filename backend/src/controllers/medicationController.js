const MedicationService = require('../services/medicationService');
const { asyncHandler } = require('../middleware/errorHandler');

const MedicationController = {
    list: asyncHandler(async (req, res) => {
        const meds = await MedicationService.listActive(req.user.id, req.user.role, req.query.patientId);
        res.json(meds);
    }),

    create: asyncHandler(async (req, res) => {
        const { patientId, name, dosage, frequency, startDate, endDate, instructions } = req.body;
        const medication = await MedicationService.create({
            userId: req.user.id, role: req.user.role, patientId, name, dosage, frequency, startDate, endDate, instructions,
        });
        res.status(201).json(medication);
    }),

    log: asyncHandler(async (req, res) => {
        const { status, notes } = req.body;
        const logEntry = await MedicationService.logIntake({
            medicationId: req.params.id, patientId: req.user.id, status, notes,
        });
        res.status(201).json(logEntry);
    }),
};

module.exports = MedicationController;
