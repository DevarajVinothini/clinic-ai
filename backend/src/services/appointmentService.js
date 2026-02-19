const AppointmentModel = require('../models/appointmentModel');
const PatientModel = require('../models/patientModel');
const ReminderModel = require('../models/reminderModel');
const RiskPredictionService = require('./riskPredictionService');
const { AppError } = require('../middleware/errorHandler');

const AppointmentService = {
    async listForUser(user) {
        if (user.role === 'patient') {
            return AppointmentModel.listByPatient(user.id);
        }
        return AppointmentModel.listAll();
    },

    async create({ patientId, staffId, appointmentDate, type, notes, durationMinutes }) {
        // Verify patient exists
        const patientExists = await PatientModel.existsAsPatient(patientId);
        if (!patientExists) {
            throw new AppError('Patient not found', 404);
        }

        // Get patient history for risk prediction
        const history = await AppointmentModel.getPatientHistory(patientId);
        const patientInfo = await PatientModel.findById(patientId);

        const age = patientInfo?.date_of_birth
            ? Math.floor((Date.now() - new Date(patientInfo.date_of_birth)) / (365.25 * 24 * 3600 * 1000))
            : 40;

        const apptDate = new Date(appointmentDate);
        const riskScore = RiskPredictionService.predictNoShow({
            previousNoShows: parseInt(history.no_shows),
            previousAppointments: parseInt(history.total),
            dayOfWeek: apptDate.getDay(),
            hourOfDay: apptDate.getHours(),
            age,
            daysUntilAppointment: Math.ceil((apptDate - Date.now()) / (24 * 3600 * 1000)),
        });

        const appointment = await AppointmentModel.create({
            patientId, staffId, appointmentDate, type, notes, durationMinutes, riskScore,
        });

        // Auto-create reminder 24h before
        await ReminderModel.create({
            patientId,
            appointmentId: appointment.id,
            type: 'appointment',
            message: `Reminder: You have a ${type} appointment scheduled. Please confirm or reschedule if needed.`,
            scheduledAt: new Date(apptDate.getTime() - 24 * 3600 * 1000),
        });

        return { ...appointment, riskScore };
    },

    async updateStatus({ appointmentId, status, user }) {
        // Patients can only confirm or cancel their own appointments
        if (user.role === 'patient') {
            if (!['confirmed', 'cancelled'].includes(status)) {
                throw new AppError('Patients can only confirm or cancel appointments', 403);
            }
            const result = await AppointmentModel.updateStatusForPatient(appointmentId, status, user.id);
            if (!result) throw new AppError('Appointment not found', 404);
            return result;
        }

        const result = await AppointmentModel.updateStatus(appointmentId, status);
        if (!result) throw new AppError('Appointment not found', 404);
        return result;
    },

    async scheduleForPatient({ patientId, staffId, appointmentDate, type, notes, durationMinutes }) {
        // Get patient history for risk prediction
        const history = await AppointmentModel.getPatientHistory(patientId);
        const patientInfo = await PatientModel.findById(patientId);

        const age = patientInfo?.date_of_birth
            ? Math.floor((Date.now() - new Date(patientInfo.date_of_birth)) / (365.25 * 24 * 3600 * 1000))
            : 40;

        const apptDate = new Date(appointmentDate);
        const riskScore = RiskPredictionService.predictNoShow({
            previousNoShows: parseInt(history.no_shows),
            previousAppointments: parseInt(history.total),
            dayOfWeek: apptDate.getDay(),
            hourOfDay: apptDate.getHours(),
            age,
            daysUntilAppointment: Math.ceil((apptDate - Date.now()) / (24 * 3600 * 1000)),
        });

        const appointment = await AppointmentModel.create({
            patientId, staffId: staffId || null, appointmentDate, type, notes, durationMinutes, riskScore,
        });

        // Auto-create reminder 24h before
        await ReminderModel.create({
            patientId,
            appointmentId: appointment.id,
            type: 'appointment',
            message: `Reminder: You have a ${type} appointment scheduled. Please confirm or reschedule if needed.`,
            scheduledAt: new Date(apptDate.getTime() - 24 * 3600 * 1000),
        });

        return { ...appointment, riskScore };
    },

    predict(features) {
        const risk = RiskPredictionService.predictNoShow(features);
        return { riskScore: risk, riskLevel: RiskPredictionService.getRiskLabel(risk) };
    },
};

module.exports = AppointmentService;
