import api from './api';

export const customerAdvanceService = {
    getLookups: async () => {
        try {
            const resp = await api.get('receivepayment/lookups'); 
            return resp.data;
        } catch (error) {
            throw error;
        }
    },

    generateDocNo: async (companyCode = 'C001') => {
        try {
            const resp = await api.get(`receivepayment/gen-docno?companyCode=${companyCode}`);
            const doc = resp.data.docNo || 'ADC001000001';
            return { docNo: doc.startsWith('R') ? doc.replace('R', 'ADC') : doc };
        } catch (error) {
            return { docNo: 'ADC001000001' };
        }
    },

    save: async (data) => {
        try {
            const resp = await api.post('receivepayment/save-advance', data);
            return resp.data;
        } catch (error) {
            throw error.response?.data?.message || 'Failed to save customer advance.';
        }
    }
};
