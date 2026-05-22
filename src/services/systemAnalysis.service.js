import axios from 'axios';

const API_URL = '/api/SystemAnalysis';

export const systemAnalysisService = {
    initTable: async () => {
        const response = await axios.post(`${API_URL}/init`);
        return response.data;
    },
    
    getCurrentStatus: async () => {
        const response = await axios.get(`${API_URL}/current`);
        return response.data;
    },

    getHistory: async () => {
        const response = await axios.get(`${API_URL}/history`);
        return response.data;
    }
};
