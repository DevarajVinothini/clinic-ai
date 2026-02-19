const ReminderModel = require('../models/reminderModel');
const { AppError } = require('../middleware/errorHandler');

const ReminderService = {
    async listForPatient(patientId) {
        return ReminderModel.listByPatient(patientId);
    },

    async markRead(reminderId, patientId) {
        const result = await ReminderModel.markRead(reminderId, patientId);
        if (!result) {
            throw new AppError('Reminder not found', 404);
        }
        return { success: true };
    },
};

module.exports = ReminderService;
