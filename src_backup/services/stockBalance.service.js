import api from './api';

export const stockBalanceService = {
    loadStock: async (userName, stockDate, compCode) => {
        const response = await api.get('/StockBalance/load', {
            params: { userName, stockDate, compCode }
        });
        return response.data;
    },

    saveStock: async (data) => {
        const response = await api.post('/StockBalance/save', data);
        return response.data;
    }
};
