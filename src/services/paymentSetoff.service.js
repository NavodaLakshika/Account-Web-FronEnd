import api from './api';

export const paymentSetoffService = {
    getLookups: async (companyCode = 'C001') => {
        try {
            const resp = await api.get(`paymentsetoff/lookups?companyCode=${companyCode}`);
            return resp.data;
        } catch (error) {
            return { suppliers: [] };
        }
    },

    getPendingPayments: async (supplierCode, companyCode = 'C001') => {
        try {
            const resp = await api.get(`paymentsetoff/pending?supplierCode=${supplierCode}&companyCode=${companyCode}`);
            return resp.data;
        } catch (error) {
            return [];
        }
    },

    getReturns: async (supplierCode, companyCode = 'C001') => {
        try {
            const resp = await api.get(`paymentsetoff/returns?supplierCode=${supplierCode}&companyCode=${companyCode}`);
            return resp.data;
        } catch (error) {
            return [];
        }
    },

    generateDocNo: async (companyCode = 'C001') => {
        try {
            const resp = await api.get(`paymentsetoff/gen-docno?companyCode=${companyCode}`);
            return resp.data;
        } catch (error) {
            return { docNo: 'PSO001000001' };
        }
    },

    apply: async (data) => {
        try {
            const resp = await api.post('paymentsetoff/apply', data);
            return resp.data;
        } catch (error) {
            throw error.response?.data?.message || 'Failed to apply payment setoff.';
        }
    }
};
