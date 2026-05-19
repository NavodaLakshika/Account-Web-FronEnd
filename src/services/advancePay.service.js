import api from './api';

export const advancePayService = {
    getLookups: async (companyCode = 'C001', userName = '') => {
        try {
            const resp = await api.get(`advancepay/lookups?companyCode=${companyCode}&userName=${userName}`); 
            return resp.data;
        } catch (error) {
            throw error;
        }
    },

    generateDocNo: async (companyCode = 'C001') => {
        try {
            const resp = await api.get(`advancepay/gen-docno?companyCode=${companyCode}`);
            return resp.data; // returns { docNo: "..." }
        } catch (error) {
            throw error;
        }
    },

    validateCheque: async (accCode, chkNo, companyCode = 'C001') => {
        try {
            const resp = await api.get(`advancepay/cheque-validate?accCode=${accCode}&chkNo=${chkNo}&companyCode=${companyCode}`);
            return resp.data; // returns { isValid: true/false, message: "..." }
        } catch (error) {
            throw error;
        }
    },

    save: async (data) => {
        try {
            const resp = await api.post('advancepay/save', data);
            return resp.data;
        } catch (error) {
            throw error.response?.data?.message || 'Failed to save advance payment.';
        }
    }
};
