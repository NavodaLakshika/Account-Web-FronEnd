import api from './api';

export const mainCashService = {
    getLookups: async (companyCode = 'C001') => {
        try {
            const resp = await api.get(`maincash/lookups?companyCode=${companyCode}`); 
            return resp.data;
        } catch (error) {
            console.error("Failed to fetch lookups", error);
            throw error;
        }
    },

    generateDocNo: async (companyCode = 'C001') => {
        try {
            const resp = await api.get(`maincash/gen-docno?companyCode=${companyCode}`);
            return resp.data;
        } catch (error) {
            console.error("Failed to generate doc no", error);
            throw error;
        }
    },

    save: async (data) => {
        try {
            const resp = await api.post('maincash/save', data);
            return resp.data;
        } catch (error) {
            const errData = error.response?.data;
            if (typeof errData === 'string') throw errData;
            throw errData?.message || 'Failed to save main cash entry.';
        }
    }
};
