const pool = require('../config/database');

const UserModel = {
    async findByEmail(email) {
        const result = await pool.query(
            'SELECT id, email, password_hash, role, first_name, last_name, phone, date_of_birth FROM users WHERE email=$1',
            [email]
        );
        return result.rows[0] || null;
    },

    async listStaff() {
        const result = await pool.query(
            "SELECT id, first_name, last_name, email FROM users WHERE role='staff' ORDER BY last_name"
        );
        return result.rows;
    },

    async findById(id) {
        const result = await pool.query(
            'SELECT id, email, role, first_name, last_name, phone, date_of_birth FROM users WHERE id=$1',
            [id]
        );
        return result.rows[0] || null;
    },

    async create({ email, passwordHash, role, firstName, lastName, phone, dateOfBirth }) {
        const result = await pool.query(`
      INSERT INTO users (email, password_hash, role, first_name, last_name, phone, date_of_birth)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, email, role, first_name, last_name
    `, [email, passwordHash, role, firstName, lastName, phone || null, dateOfBirth || null]);
        return result.rows[0];
    },
};

module.exports = UserModel;
