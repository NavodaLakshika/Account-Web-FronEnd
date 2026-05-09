import api from './api';
import { getCompanyCode } from '../utils/session';

export const openingBalanceService = {
    getLookups: async (companyCode = getCompanyCode()) => {
        try {
            const resp = await api.get(`openingbalance/lookups?companyCode=${companyCode}`); 
            return resp.data;
        } catch (error) {
            // Provide defaults if API fails
            return {
                apAccounts: [{ code: '210-201', name: 'Account Payable' }],
                arAccounts: [{ code: '110-101', name: 'Account Receivable' }],
                glAccounts: [],
                costCenters: [],
                vendors: [],
                customers: []
            };
        }
    },

    generateDocNo: async (type = 'Vendor', companyCode = getCompanyCode()) => {
        try {
            const resp = await api.get(`openingbalance/gen-docno?type=${type}&companyCode=${companyCode}`);
            return resp.data;
        } catch (error) {
            const prefix = type === 'Vendor' ? 'OPV' : type === 'Customer' ? 'OPC' : 'OPA';
            return { docNo: `${prefix}001000001` };
        }
    },

    save: async (data) => {
        try {
            const resp = await api.post('openingbalance/save', data);
            return resp.data;
        } catch (error) {
            throw error.response?.data?.message || 'Failed to save opening balance.';
        }
    }
};
