import api from './api';

export const systemLocksService = {
    getAllLocks: async () => {
        try {
            const response = await api.get('/SystemLocks/getAll');
            return response.data;
        } catch (error) {
            console.error('Error fetching system locks:', error);
            throw error;
        }
    },
    
    updateLock: async (moduleId, isLocked) => {
        try {
            const response = await api.post('/SystemLocks/update', {
                moduleId,
                isLocked
            });
            return response.data;
        } catch (error) {
            console.error('Error updating system lock:', error);
            throw error;
        }
    }
};
