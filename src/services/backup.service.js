import api from './api';
 
export const backupService = {
    getDatabases: async () => {
        const response = await api.get('/backup/databases');
        return response.data;
    },
    createBackup: async (data) => {
        const response = await api.post('/backup/create', data);
        return response.data;
    },
    getHistory: async () => {
        const response = await api.get('/backup/history');
        return response.data;
    },
    restoreBackup: async (data) => {
        const response = await api.post('/backup/restore', data);
        return response.data;
    },
    browse: async (path) => {
        const response = await api.get('/backup/browse', { params: { path } });
        return response.data;
    },
    getDefaultPath: async () => {
        const response = await api.get('/backup/default-path');
        return response.data;
    }
};
