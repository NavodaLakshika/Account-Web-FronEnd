import api from './api';

export const journalService = {
    getLookups: async (companyCode = 'C001') => {
        try {
            const resp = await api.get(`journal/lookups?companyCode=${companyCode}`);
            return resp.data;
        } catch (error) {
            throw error.response?.data?.message || 'Failed to fetch journal lookups.';
        }
    },

    generateDocNo: async (companyCode = 'C001') => {
        try {
            const resp = await api.get(`journal/gen-docno?companyCode=${companyCode}`);
            return resp.data;
        } catch (error) {
            throw error.response?.data?.message || 'Failed to generate document number.';
        }
    },

    addTempEntry: async (data) => {
        try {
            const resp = await api.post(`journal/add-temp`, data);
            return resp.data;
        } catch (error) {
            throw error.response?.data?.message || 'Failed to add entry to grid.';
        }
    },

    applyJournal: async (data) => {
        try {
            const resp = await api.post(`journal/apply`, data);
            return resp.data;
        } catch (error) {
            throw error.response?.data?.message || 'Failed to save journal entry.';
        }
    },

    clearTemp: async (docNo, company) => {
        try {
            const resp = await api.delete(`journal/temp/${docNo}?company=${company}`);
            return resp.data;
        } catch (error) {
            throw error.response?.data?.message || 'Failed to clear temporary entries.';
        }
    },

    getBalance: async (accId) => {
        try {
            const resp = await api.get(`journal/balance/${accId}`);
            return resp.data.balance;
        } catch (error) {
            return 0;
        }
    },

    getHistory: async (company, dateRange = '11') => {
        try {
            const resp = await api.get(`journal/history?company=${company}&dateRange=${dateRange}`);
            return resp.data;
        } catch (error) {
            console.error("Journal History Error:", error);
            return [];
        }
    },

    deleteTempLine: async (id, company) => {
        try {
            const resp = await api.delete(`journal/temp-line/${id}?company=${company}`);
            return resp.data;
        } catch (error) {
            throw error.response?.data?.message || 'Failed to delete line.';
        }
    }
};
