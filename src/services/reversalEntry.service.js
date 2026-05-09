import api from './api';
import { getCompanyCode } from '../utils/session';

export const reversalEntryService = {
    getLookups: async (companyCode = getCompanyCode()) => {
        try {
            const resp = await api.get(`reversal/lookups?companyCode=${companyCode}`);
            return resp.data;
        } catch (error) {
            return {
                transactionTypes: [
                    { code: 'INV', name: 'Invoice' },
                    { code: 'RCP', name: 'Receipt' },
                    { code: 'PAY', name: 'Payment' },
                    { code: 'GRN', name: 'GRN' },
                    { code: 'BIL', name: 'Bill' }
                ],
                users: []
            };
        }
    },

    apply: async (data) => {
        try {
            const resp = await api.post('reversal/apply', data);
            return resp.data;
        } catch (error) {
            throw error.response?.data?.message || 'Failed to apply reversal.';
        }
    },

    view: async (docNo, type) => {
        try {
            const resp = await api.get(`reversal/view?docNo=${docNo}&type=${type}`);
            return resp.data;
        } catch (error) {
            throw error.response?.data?.message || 'Failed to fetch transaction details.';
        }
    }
};
