import api from './api';

export const systemAnalysisService = {
    initTable: async () => {
        const response = await api.post(`/SystemAnalysis/init`);
        return response.data;
    },
    
    getCurrentStatus: async () => {
        const response = await api.get(`/SystemAnalysis/current`);
        return response.data;
    },

    getHistory: async () => {
        const response = await api.get(`/SystemAnalysis/history`);
        return response.data;
    }
};
