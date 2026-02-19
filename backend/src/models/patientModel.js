const pool = require('../config/database');

const PatientModel = {
    async listAllWithStats() {
        const result = await pool.query(`
      SELECT u.id, u.email, u.first_name, u.last_name, u.phone, u.date_of_birth,
        COUNT(a.id) AS total_appointments,
        COUNT(a.id) FILTER (WHERE a.status = 'no_show') AS no_shows,
        ROUND(AVG(a.no_show_risk_score)::numeric, 2) AS avg_risk_score,
        MAX(a.appointment_date) FILTER (WHERE a.status = 'scheduled' OR a.status = 'confirmed') AS next_appointment
      FROM users u
      LEFT JOIN appointments a ON u.id = a.patient_id
      WHERE u.role = 'patient'
      GROUP BY u.id
      ORDER BY avg_risk_score DESC NULLS LAST
    `);
        return result.rows;
    },

    async getDashboardStats() {
        const stats = await pool.query(`
      SELECT
        COUNT(*) FILTER (WHERE status IN ('scheduled', 'confirmed')) AS upcoming_appointments,
        COUNT(*) FILTER (WHERE status = 'no_show') AS total_no_shows,
        COUNT(*) FILTER (WHERE no_show_risk_score >= 0.7) AS high_risk_appointments,
        COUNT(*) FILTER (WHERE appointment_date >= NOW() AND appointment_date < NOW() + INTERVAL '7 days') AS appointments_this_week,
        ROUND(AVG(no_show_risk_score)::numeric, 2) AS avg_risk_score
      FROM appointments
    `);

        const patientCount = await pool.query("SELECT COUNT(*) FROM users WHERE role='patient'");

        return {
            ...stats.rows[0],
            total_patients: patientCount.rows[0].count,
        };
    },

    async findById(id) {
        const result = await pool.query(
            'SELECT id, date_of_birth FROM users WHERE id=$1',
            [id]
        );
        return result.rows[0] || null;
    },

    async existsAsPatient(id) {
        const result = await pool.query(
            "SELECT id FROM users WHERE id=$1 AND role='patient'",
            [id]
        );
        return result.rows.length > 0;
    },
};

module.exports = PatientModel;
