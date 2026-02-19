const ReminderService = require('../services/reminderService');
const { asyncHandler } = require('../middleware/errorHandler');

const ReminderController = {
    list: asyncHandler(async (req, res) => {
        const reminders = await ReminderService.listForPatient(req.user.id);
        res.json(reminders);
    }),

    markRead: asyncHandler(async (req, res) => {
        const result = await ReminderService.markRead(req.params.id, req.user.id);
        res.json(result);
    }),
};

module.exports = ReminderController;
