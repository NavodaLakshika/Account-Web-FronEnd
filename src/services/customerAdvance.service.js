import api from './api';

export const customerAdvanceService = {
    getLookups: async (companyCode) => {
        try {
            const resp = await api.get(`customeradvancereceive/lookups?companyCode=${companyCode}`); 
            return resp.data;
        } catch (error) {
            throw error;
        }
    },

    generateDocNo: async (companyCode) => {
        try {
            const resp = await api.get(`customeradvancereceive/gen-docno?companyCode=${companyCode}`);
            return resp.data;
        } catch (error) {
            throw error;
        }
    },

    save: async (data) => {
        try {
            const resp = await api.post('customeradvancereceive/save', data);
            return resp.data;
        } catch (error) {
            throw error.response?.data || error.message || 'Failed to save customer advance.';
        }
    }
};
