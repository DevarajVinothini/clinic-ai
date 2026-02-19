const AppointmentService = require('../services/appointmentService');
const UserModel = require('../models/userModel');
const { asyncHandler } = require('../middleware/errorHandler');

const AppointmentController = {
    list: asyncHandler(async (req, res) => {
        const appointments = await AppointmentService.listForUser(req.user);
        res.json(appointments);
    }),

    create: asyncHandler(async (req, res) => {
        const { patientId, appointmentDate, type, notes, durationMinutes } = req.body;
        const result = await AppointmentService.create({
            patientId, staffId: req.user.id, appointmentDate, type, notes, durationMinutes,
        });
        res.status(201).json(result);
    }),

    schedule: asyncHandler(async (req, res) => {
        const { staffId, appointmentDate, type, notes, durationMinutes } = req.body;
        const result = await AppointmentService.scheduleForPatient({
            patientId: req.user.id, staffId, appointmentDate, type, notes, durationMinutes,
        });
        res.status(201).json(result);
    }),

    listStaff: asyncHandler(async (req, res) => {
        const staff = await UserModel.listStaff();
        res.json(staff);
    }),

    updateStatus: asyncHandler(async (req, res) => {
        const result = await AppointmentService.updateStatus({
            appointmentId: req.params.id,
            status: req.body.status,
            user: req.user,
        });
        res.json(result);
    }),

    predict: asyncHandler(async (req, res) => {
        const result = AppointmentService.predict(req.body);
        res.json(result);
    }),
};

module.exports = AppointmentController;

