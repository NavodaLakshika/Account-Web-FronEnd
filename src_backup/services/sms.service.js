import api from './api';

const smsService = {
    async sendAndLog(phoneNumber, messageText, senderName, receiverName, receiverCode) {
        try {
            // Call the backend API which handles both sending via gateway and logging to DB
            const response = await api.post('/MessageLog/send-sms', {
                phoneNumber,
                messageText,
                senderName: senderName || 'Super Admin',
                receiverName: receiverName || '',
                receiverCode: receiverCode || ''
            });
            
            return response.data;
        } catch (error) {
            console.error("Failed to send SMS via backend", error);
            
            // Fallback: save to local storage if network is down
            const gatewayResponse = error.response?.data?.message || error.message;
            this.saveLocalLog(phoneNumber, messageText, senderName, receiverName, receiverCode, gatewayResponse);
            
            return { 
                message: 'Fallback to localStorage', 
                status: 'Failed', 
                gatewayResponse 
            };
        }
    },

    saveLocalLog(phoneNumber, messageText, senderName, receiverName, receiverCode, gatewayResponse) {
        const logs = JSON.parse(localStorage.getItem('smsMessageLogs') || '[]');
        logs.unshift({
            id: Date.now(),
            phoneNumber,
            messageText,
            senderName: senderName || 'Super Admin',
            receiverName: receiverName || '',
            receiverCode: receiverCode || '',
            gatewayResponse,
            sentAt: new Date().toISOString()
        });
        localStorage.setItem('smsMessageLogs', JSON.stringify(logs.slice(0, 200)));
    },

    getLocalLogs() {
        return JSON.parse(localStorage.getItem('smsMessageLogs') || '[]');
    },

    async getServerLogs() {
        try {
            const res = await api.get('/MessageLog/list');
            return res.data;
        } catch {
            return this.getLocalLogs();
        }
    }
};

export default smsService;
