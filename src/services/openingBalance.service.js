import api from './api';
import { getCompanyCode } from '../utils/session';

export const openingBalanceService = {
    getLookups: async (companyCode = getCompanyCode()) => {
        try {
            const resp = await api.get(`openingbalance/lookups?companyCode=${companyCode}`); 
            return resp.data;
        } catch (error) {
            console.error('Failed to get lookups from backend API', error);
            throw error.response?.data?.message || 'Failed to get lookups.';
        }
    },

    generateDocNo: async (type = 'Vendor', companyCode = getCompanyCode()) => {
        try {
            const resp = await api.get(`openingbalance/gen-docno?type=${type}&companyCode=${companyCode}`);
            return resp.data;
        } catch (error) {
            console.error('Failed to generate doc no from backend API', error);
            throw error.response?.data?.message || 'Failed to generate doc no.';
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
