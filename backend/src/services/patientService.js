const PatientModel = require('../models/patientModel');

const PatientService = {
    async listAll() {
        return PatientModel.listAllWithStats();
    },

    async getDashboardStats() {
        return PatientModel.getDashboardStats();
    },
};

module.exports = PatientService;
