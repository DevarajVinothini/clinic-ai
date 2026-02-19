const ChatService = require('../services/chatService');
const { asyncHandler } = require('../middleware/errorHandler');

const ChatController = {
    getHistory: asyncHandler(async (req, res) => {
        const history = await ChatService.getHistory(req.user.id);
        res.json(history);
    }),

    sendMessage: asyncHandler(async (req, res) => {
        const reply = await ChatService.sendMessage(req.user.id, req.body.message);
        res.json({ reply });
    }),

    clearHistory: asyncHandler(async (req, res) => {
        await ChatService.clearHistory(req.user.id);
        res.json({ message: 'Chat history cleared' });
    }),
};

module.exports = ChatController;
