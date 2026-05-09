import axios from 'axios';
import { getCompanyCode } from '../utils/session';

const API_URL = '/api';

export const trialBalanceService = {
    getLookups: async (companyCode) => {
        const response = await axios.get(`${API_URL}/TrialBalance/lookups`, {
            params: { companyCode }
        });
        return response.data;
    },

    generate: async (params) => {
        const response = await axios.get(`${API_URL}/TrialBalance/get-report`, {
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
