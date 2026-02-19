/**
 * AI Service — Separated AI/chatbot logic
 * Handles Claude API integration and fallback responses
 */
const axios = require('axios');

const SYSTEM_PROMPT = `You are a helpful medical assistant chatbot for a clinic. Your role is to:
- Help patients understand their appointments and medications
- Provide general health information and wellness tips
- Help with appointment-related questions
- Remind patients about medication schedules
- Answer general questions about clinic services

IMPORTANT RESTRICTIONS:
- You do NOT provide diagnoses or interpret test results
- You do NOT recommend specific treatments for symptoms
- You always recommend patients consult their doctor for medical concerns
- You do NOT prescribe or adjust medications
- If someone describes an emergency, immediately tell them to call 911 or go to the ER

Keep responses concise, friendly, and helpful. Always encourage patients to speak with their healthcare provider for medical decisions.`;

const AIService = {
    /**
     * Get an AI response for a user message.
     * Calls Claude API if ANTHROPIC_API_KEY is set, otherwise uses fallback.
     * @param {Array} conversationHistory - Array of {role, content} messages
     * @param {string} userMessage - The new user message
     * @returns {string} The AI assistant's reply
     */
    async getResponse(conversationHistory, userMessage) {
        if (process.env.ANTHROPIC_API_KEY) {
            try {
                return await this._callClaudeAPI(conversationHistory, userMessage);
            } catch (err) {
                console.error('AI API error:', err.message);
                return this._getFallbackResponse(userMessage);
            }
        }
        return this._getFallbackResponse(userMessage);
    },

    /**
     * Call the Anthropic Claude API
     */
    async _callClaudeAPI(conversationHistory, userMessage) {
        const apiMessages = [
            ...conversationHistory.map(m => ({ role: m.role, content: m.content })),
            { role: 'user', content: userMessage },
        ];

        const response = await axios.post('https://api.anthropic.com/v1/messages', {
            model: 'claude-sonnet-4-20250514',
            max_tokens: 512,
            system: SYSTEM_PROMPT,
            messages: apiMessages,
        }, {
            headers: {
                'x-api-key': process.env.ANTHROPIC_API_KEY,
                'anthropic-version': '2023-06-01',
                'content-type': 'application/json',
            },
            timeout: 30000,
        });

        return response.data.content[0].text;
    },

    /**
     * Rule-based fallback responses when API is unavailable
     */
    _getFallbackResponse(message) {
        const msg = message.toLowerCase();

        if (msg.includes('appointment')) {
            return "I can help you with appointment information! You can view all your upcoming appointments in the Appointments section of your dashboard. If you need to reschedule, please contact our front desk or use the dashboard to make changes.";
        }
        if (msg.includes('medication') || msg.includes('medicine') || msg.includes('pill')) {
            return "For medication questions, I recommend checking the Medications section in your dashboard for your current prescriptions. Always consult your doctor before making any changes to your medication regimen.";
        }
        if (msg.includes('emergency') || msg.includes('chest pain') || msg.includes('breathing')) {
            return "⚠️ If you're experiencing a medical emergency, please call 911 immediately or go to your nearest emergency room. Do not wait for an online response.";
        }
        if (msg.includes('hello') || msg.includes('hi') || msg.includes('hey')) {
            return "Hello! I'm your clinic assistant. I can help you with appointment questions, medication reminders, and general health information. How can I assist you today?";
        }
        return "Thank you for your message. I'm here to help with appointment scheduling, medication reminders, and general health information. For medical advice specific to your condition, please consult your healthcare provider. Is there anything specific I can help you with today?";
    },

    /** Expose system prompt for testing */
    getSystemPrompt() {
        return SYSTEM_PROMPT;
    },
};

module.exports = AIService;
