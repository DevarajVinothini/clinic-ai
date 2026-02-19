const pool = require('../config/database');

const AppointmentModel = {
    async listByPatient(patientId) {
        const result = await pool.query(`
      SELECT a.*, u.first_name || ' ' || u.last_name AS staff_name
      FROM appointments a
      LEFT JOIN users u ON a.staff_id = u.id
      WHERE a.patient_id = $1
      ORDER BY a.appointment_date DESC
    `, [patientId]);
        return result.rows;
    },

    async listAll() {
        const result = await pool.query(`
      SELECT a.*,
        p.first_name || ' ' || p.last_name AS patient_name,
        p.email AS patient_email,
        p.phone AS patient_phone,
        u.first_name || ' ' || u.last_name AS staff_name
      FROM appointments a
      LEFT JOIN users p ON a.patient_id = p.id
      LEFT JOIN users u ON a.staff_id = u.id
      ORDER BY a.appointment_date DESC
      LIMIT 100
    `);
        return result.rows;
    },

    async create({ patientId, staffId, appointmentDate, type, notes, durationMinutes, riskScore }) {
        const result = await pool.query(`
      INSERT INTO appointments (patient_id, staff_id, appointment_date, type, notes, duration_minutes, no_show_risk_score)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `, [patientId, staffId, appointmentDate, type, notes, durationMinutes || 30, riskScore]);
        return result.rows[0];
    },

    async updateStatus(id, status) {
        const result = await pool.query(
            'UPDATE appointments SET status=$1 WHERE id=$2 RETURNING *',
            [status, id]
        );
        return result.rows[0] || null;
    },

    async updateStatusForPatient(id, status, patientId) {
        const result = await pool.query(
            'UPDATE appointments SET status=$1 WHERE id=$2 AND patient_id=$3 RETURNING *',
            [status, id, patientId]
        );
        return result.rows[0] || null;
    },

    async getPatientHistory(patientId) {
        const result = await pool.query(`
      SELECT COUNT(*) FILTER (WHERE status='no_show') AS no_shows,
             COUNT(*) AS total
      FROM appointments WHERE patient_id=$1
    `, [patientId]);
        return result.rows[0];
    },
};

module.exports = AppointmentModel;
