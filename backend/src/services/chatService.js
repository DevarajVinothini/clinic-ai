const ChatModel = require('../models/chatModel');
const AIService = require('./aiService');

const ChatService = {
    async getHistory(patientId) {
        return ChatModel.getHistory(patientId);
    },

    async sendMessage(patientId, message) {
        // Save user message
        await ChatModel.saveMessage(patientId, 'user', message);

        // Get recent conversation for context
        const recentHistory = await ChatModel.getRecentHistory(patientId, 10);
        // Exclude the last message (the one we just saved)
        const context = recentHistory.slice(0, -1);

        // Get AI response
        const reply = await AIService.getResponse(context, message);

        // Save assistant response
        await ChatModel.saveMessage(patientId, 'assistant', reply);

        return reply;
    },

    async clearHistory(patientId) {
        await ChatModel.clearHistory(patientId);
    },
};

module.exports = ChatService;
