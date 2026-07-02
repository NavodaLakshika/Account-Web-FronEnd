import api from './api';



export const quotationService = {
    getLookups: async (company) => {
        const response = await api.get('/Quotation/lookups', { params: { company } });
        return response.data;
    },

    generateDocNo: async (company) => {
        const response = await api.get('/Quotation/generate-doc', { params: { company } });
        return response.data;
    },

    save: async (payload) => {
        const response = await api.post('/Quotation/save', payload);
        return response.data;
    },

    apply: async (payload) => {
        const response = await api.post('/Quotation/apply', payload);
        return response.data;
    },

    searchDocs: async (company) => {
        const response = await api.get('/Quotation/search', { params: { company } });
        return response.data;
    },

    getDoc: async (docNo, company) => {
    const response = await api.get(`/Quotation/${docNo}`, { params: { company } });
    return response.data;
},

    getAppliedDoc: async (docNo, company) => {
        const response = await api.get(`/Quotation/applied/${docNo}`, { params: { company } });
        return response.data;
    },

    delete: async (docNo, company) => {
        const response = await api.delete(`/Quotation/${docNo}`, { params: { company } });
        return response.data;
    }
};
