import api from './api';

export const documentSearchService = {
    getLookups: (companyCode) => api.get('/DocumentSearch/lookups', { params: { companyCode } }),
    search: (params) => api.get('/DocumentSearch/search', { params }),
    getDocumentDetail: (docNo, companyCode) => api.get('/DocumentSearch/search', {
        params: {
            allTransType: true,
            transType: 'ALL',
            docNo,
            companyCode
        }
    })
};
