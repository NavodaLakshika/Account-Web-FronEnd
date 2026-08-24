import api from './api';
import { getCompanyCode } from '../utils/session';

export const trialBalanceService = {
    getLookups: async (companyCode) => {
        const response = await api.get(`/TrialBalance/lookups`, {
            params: { companyCode }
        });
        return response.data;
    },

    generate: async (params) => {
        const response = await api.get(`/TrialBalance/get-report`, {
            params: {
                dateFrom: params.dateFrom,
                dateTo: params.dateTo,
                companyCode: params.companyCode || getCompanyCode(),
                costCenter: params.costCenter || 'all',
                isYearEnd: params.isYearEnd || false,
                hideZeroBalances: params.hideZeroBalances !== undefined ? params.hideZeroBalances : true
            }
        });
        return response.data;
    }
};
