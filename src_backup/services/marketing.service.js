import api from './api';
import { getCompanyCode } from '../utils/session';

export const marketingService = {
    getSalesTargets: async (companyCode = getCompanyCode()) => {
        try {
            const resp = await api.get(`marketing/sales-targets?companyCode=${companyCode}`);
            return resp.data;
        } catch (error) {
            return [];
        }
    },

    saveSalesTargets: async (companyCode = getCompanyCode(), targets) => {
        try {
            const resp = await api.post(`marketing/sales-targets?companyCode=${companyCode}`, targets);
            return resp.data;
        } catch (error) {
            throw error.response?.data?.message || 'Failed to save sales targets.';
        }
    },

    searchCommissionLevels: async (companyCode = getCompanyCode(), query = '') => {
        try {
            const resp = await api.get(`marketing/commission-levels/search?companyCode=${companyCode}&query=${query}`);
            return resp.data;
        } catch (error) {
            return [];
        }
    },

    getCommissionLevels: async (companyCode = getCompanyCode(), levelCode = 'LVL-SEQ-01') => {
        try {
            const resp = await api.get(`marketing/commission-levels?companyCode=${companyCode}&levelCode=${levelCode}`);
            return resp.data;
        } catch (error) {
            return null;
        }
    },

    saveCommissionLevels: async (companyCode = getCompanyCode(), data) => {
        try {
            const resp = await api.post(`marketing/commission-levels?companyCode=${companyCode}`, data);
            return resp.data;
        } catch (error) {
            throw error.response?.data?.message || 'Failed to save commission levels.';
        }
    }
};
