import api from './api';

export const mainCashService = {
    getLookups: async (companyCode = 'C001') => {
        try {
            const resp = await api.get(`maincash/lookups?companyCode=${companyCode}`); 
            return resp.data;
        } catch (error) {
            return {
                mainAccounts: [],
                expenseAccounts: [],
                costCenters: [],
                payees: []
            };
        }
    },

    generateDocNo: async (companyCode = 'C001') => {
        try {
            const resp = await api.get(`maincash/gen-docno?companyCode=${companyCode}`);
            return resp.data;
        } catch (error) {
            return { docNo: 'MCH001000001' };
        }
    },

    save: async (data) => {
        try {
            const resp = await api.post('maincash/save', data);
            return resp.data;
        } catch (error) {
            throw error.response?.data?.message || 'Failed to save main cash entry.';
        }
    }
};
