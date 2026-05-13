import api from './api';

export const periodLockService = {
    getAll: async () => {
        const response = await api.get('/PeriodLock/all');
        return response.data;
    },
    update: async (data) => {
        const response = await api.post('/PeriodLock/update', data);
        return response.data;
    }
};
