import api from './api';

export const documentSearchService = {
    getLookups: (userName) => api.get('/DocumentSearch/lookups', { params: { userName } }),
    search: (params) => api.get('/DocumentSearch/search', { params })
};
