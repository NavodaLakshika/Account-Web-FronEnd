import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.PROD ? (import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : 'http://194.233.76.58:8282/api') : '/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

export const supportService = {
    async registerChat(chatUser) {
        try {
            const response = await api.post('/ChatLog/register', chatUser);
            return response.data;
        } catch (error) {
            console.error('Chat Registration Error:', error);
            throw error.response?.data || 'Failed to register chat session.';
        }
    },

    async saveMessage(chatRegistrationId, sender, messageText) {
        try {
            const response = await api.post('/ChatLog/message', {
                ChatRegistrationId: chatRegistrationId,
                Sender: sender,
                MessageText: messageText
            });
            return response.data;
        } catch (error) {
            console.error('Save Message Error:', error);
            throw error.response?.data || 'Failed to save chat message.';
        }
    },

    async getMessages(sessionId) {
        try {
            const response = await api.get(`/ChatLog/messages/${sessionId}`);
            return response.data;
        } catch (error) {
            console.error('Fetch Messages Error:', error);
            throw error.response?.data || 'Failed to fetch chat messages.';
        }
    }
};
