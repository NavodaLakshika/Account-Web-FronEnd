import api from './api';

export const customerInvoiceService = {
    getLookups: async () => {
        try {
            const resp = await api.get('salesorder/lookups'); 
            return resp.data;
        } catch (error) {
            throw error;
        }
    },

    generateDocNo: async (companyCode = 'C001') => {
        try {
            const resp = await api.get(`salesorder/gen-docno?companyCode=${companyCode}`);
            const doc = resp.data.docNo || 'CIV001000001';
            return { docNo: doc.startsWith('S') ? doc.replace('S', 'CIV') : doc };
        } catch (error) {
            return { docNo: 'CIV001000001' };
        }
    },

    save: async (data) => {
        try {
            const resp = await api.post('salesorder/save-other-invoice', data);
            return resp.data;
        } catch (error) {
            throw error.response?.data?.message || 'Failed to save customer invoice.';
        }
    }
};
