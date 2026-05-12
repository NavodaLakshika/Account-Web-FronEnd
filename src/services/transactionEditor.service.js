import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5173/api';

export const transactionEditorService = {
    getLookups: async (company) => {
        const response = await axios.get(`${API_URL}/TransactionEditor/lookups`, { params: { company } });
        return response.data;
    },

    loadTransaction: async (docNo, iid, company) => {
        const response = await axios.get(`${API_URL}/TransactionEditor/load`, { params: { docNo, iid, company } });
        return response.data;
    },

    saveRow: async (payload) => {
        const response = await axios.post(`${API_URL}/TransactionEditor/save-row`, payload);
        return response.data;
    },

    commitTransaction: async (payload) => {
        const response = await axios.post(`${API_URL}/TransactionEditor/commit`, payload);
        return response.data;
    }
};
