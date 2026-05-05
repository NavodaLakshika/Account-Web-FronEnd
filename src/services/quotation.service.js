import axios from 'axios';

const api = axios.create({
    baseURL: '/api/Quotation',
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export const quotationService = {
    getLookups: async (company) => {
        const response = await api.get('/lookups', { params: { company } });
        return response.data;
    },

    generateDocNo: async (company) => {
        const response = await api.get('/generate-doc', { params: { company } });
        return response.data;
    },

    save: async (payload) => {
        const response = await api.post('/save', payload);
        return response.data;
    },

    apply: async (payload) => {
        const response = await api.post('/apply', payload);
        return response.data;
    },

    searchDocs: async (company) => {
        const response = await api.get('/search', { params: { company } });
        return response.data;
    },

    getDoc: async (docNo, company) => {
    const response = await api.get(`/${docNo}`, { params: { company } });
    return response.data;
},

    delete: async (docNo, company) => {
        const response = await api.delete(`/${docNo}`, { params: { company } });
        return response.data;
    }
};
