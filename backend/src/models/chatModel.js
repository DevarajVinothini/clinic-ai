const pool = require('../config/database');

const ChatModel = {
    async getHistory(patientId, limit = 50) {
        const result = await pool.query(
            'SELECT role, content, created_at FROM chat_messages WHERE patient_id=$1 ORDER BY created_at ASC LIMIT $2',
            [patientId, limit]
        );
        return result.rows;
    },

    async getRecentHistory(patientId, limit = 10) {
        const result = await pool.query(
            'SELECT role, content FROM chat_messages WHERE patient_id=$1 ORDER BY created_at DESC LIMIT $2',
            [patientId, limit]
        );
        return result.rows.reverse();
    },

    async saveMessage(patientId, role, content) {
        await pool.query(
            'INSERT INTO chat_messages (patient_id, role, content) VALUES ($1, $2, $3)',
            [patientId, role, content]
        );
    },

    async clearHistory(patientId) {
        await pool.query('DELETE FROM chat_messages WHERE patient_id=$1', [patientId]);
    },
};

module.exports = ChatModel;
