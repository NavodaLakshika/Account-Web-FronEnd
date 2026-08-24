import api from './api';

export const transactionEditorService = {
    getLookups: async (company) => {
        const response = await api.get(`/TransactionEditor/lookups`, { params: { company } });
        return response.data;
    },

    loadTransaction: async (docNo, iid, company) => {
        const response = await api.get(`/TransactionEditor/load`, { params: { docNo, iid, company } });
        return response.data;
    },

    saveRow: async (payload) => {
        const response = await api.post(`/TransactionEditor/save-row`, payload);
        return response.data;
    },

    commitTransaction: async (payload) => {
        const response = await api.post(`/TransactionEditor/commit`, payload);
        return response.data;
    }
};
