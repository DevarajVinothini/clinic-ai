const MedicationModel = require('../models/medicationModel');
const { AppError } = require('../middleware/errorHandler');

const MedicationService = {
    async listActive(userId, role, queryPatientId) {
        const patientId = role === 'patient' ? userId : queryPatientId;
        if (!patientId) {
            throw new AppError('Patient ID is required', 400);
        }
        return MedicationModel.listActive(patientId);
    },

    async create({ userId, role, patientId, name, dosage, frequency, startDate, endDate, instructions }) {
        const targetId = role === 'patient' ? userId : patientId;
        if (!targetId) {
            throw new AppError('Patient ID is required for staff', 400);
        }
        return MedicationModel.create({
            patientId: targetId, name, dosage, frequency, startDate, endDate, instructions,
        });
    },

    async logIntake({ medicationId, patientId, status, notes }) {
        // Verify ownership
        const med = await MedicationModel.findByIdAndPatient(medicationId, patientId);
        if (!med) {
            throw new AppError('Medication not found', 404);
        }
        return MedicationModel.createLog({ medicationId, patientId, status, notes });
    },
};

module.exports = MedicationService;
