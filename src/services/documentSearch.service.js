import axios from 'axios';

const API_URL = '/api';

export const documentSearchService = {
    getLookups: async (companyCode) => {
        const response = await axios.get(`${API_URL}/DocumentSearch/lookups`, {
            params: { companyCode }
        });
        return response.data;
    },

    search: async (params) => {
        const response = await axios.get(`${API_URL}/DocumentSearch/search`, {
            params: {
                transType: params.transType,
                vendorId: params.vendorId || '',
                docNo: params.docNo || '',
                chequeNo: params.chequeNo || '',
                amount: params.amount || null,
                costCenter: params.costCenter || '',
                dateFrom: params.dateFrom || '',
                dateTo: params.dateTo || '',
                useDate: params.useDate || false,
                payee: params.payee || '',
                companyCode: params.companyCode || 'C001'
            }
        });
        return response.data;
    }
};
