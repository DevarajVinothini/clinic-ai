const pool = require('../config/database');

const ReminderModel = {
    async listByPatient(patientId) {
        const result = await pool.query(`
      SELECT r.*, a.type AS appointment_type, a.appointment_date
      FROM reminders r
      LEFT JOIN appointments a ON r.appointment_id = a.id
      WHERE r.patient_id = $1
      ORDER BY r.scheduled_at DESC
      LIMIT 20
    `, [patientId]);
        return result.rows;
    },

    async markRead(id, patientId) {
        const result = await pool.query(
            'UPDATE reminders SET is_read=true WHERE id=$1 AND patient_id=$2 RETURNING id',
            [id, patientId]
        );
        return result.rows[0] || null;
    },

    async create({ patientId, appointmentId, type, message, scheduledAt }) {
        await pool.query(`
      INSERT INTO reminders (patient_id, appointment_id, type, message, scheduled_at)
      VALUES ($1, $2, $3, $4, $5)
    `, [patientId, appointmentId, type, message, scheduledAt]);
    },
};

module.exports = ReminderModel;
