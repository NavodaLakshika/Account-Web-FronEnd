import api from './api';

export const advancePayService = {
    getLookups: async () => {
        try {
            const resp = await api.get('paybill/lookups'); 
            return resp.data;
        } catch (error) {
            throw error;
        }
    },

    generateDocNo: async (companyCode = 'C001') => {
        try {
            const resp = await api.get(`paybill/gen-docno?companyCode=${companyCode}`);
            // Let's assume the doc prefix should be ADP
            const doc = resp.data.docNo || 'ADP001000001';
            return { docNo: doc.startsWith('P') ? doc.replace('P', 'ADP') : doc };
        } catch (error) {
            return { docNo: 'ADP001000001' };
        }
    },

    save: async (data) => {
        try {
            const resp = await api.post('paybill/save-advance', data);
            return resp.data;
        } catch (error) {
            throw error.response?.data?.message || 'Failed to save advance payment.';
        }
    }
};
