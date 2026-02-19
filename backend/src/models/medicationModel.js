const pool = require('../config/database');

const MedicationModel = {
    async listActive(patientId) {
        const result = await pool.query(
            'SELECT * FROM medications WHERE patient_id=$1 AND is_active=true ORDER BY created_at DESC',
            [patientId]
        );
        return result.rows;
    },

    async create({ patientId, name, dosage, frequency, startDate, endDate, instructions }) {
        const result = await pool.query(`
      INSERT INTO medications (patient_id, name, dosage, frequency, start_date, end_date, instructions)
      VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *
    `, [patientId, name, dosage, frequency, startDate || null, endDate || null, instructions]);
        return result.rows[0];
    },

    async findByIdAndPatient(id, patientId) {
        const result = await pool.query(
            'SELECT id FROM medications WHERE id=$1 AND patient_id=$2',
            [id, patientId]
        );
        return result.rows[0] || null;
    },

    async createLog({ medicationId, patientId, status, notes }) {
        const result = await pool.query(`
      INSERT INTO medication_logs (medication_id, patient_id, status, notes)
      VALUES ($1, $2, $3, $4) RETURNING *
    `, [medicationId, patientId, status || 'taken', notes]);
        return result.rows[0];
    },
};

module.exports = MedicationModel;
