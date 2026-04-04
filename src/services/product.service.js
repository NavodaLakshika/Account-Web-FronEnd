import api from './api'; // Uses Vite proxy → localhost:5046

export const productService = {
    getLookups: async (company) => {
        const response = await api.get(`/Product/lookups?company=${company}`);
        return response.data;
    },
    search: async (company, query = '') => {
        const response = await api.get(`/Product/search?company=${company}&query=${encodeURIComponent(query)}`);
        return response.data;
    },
    get: async (code, company) => {
        const response = await api.get(`/Product/get?code=${encodeURIComponent(code)}&company=${company}`);
        return response.data;
    },
    save: async (data) => {
        const response = await api.post(`/Product/save`, data);
        return response.data;
    },
    delete: async (code, company) => {
        const response = await api.delete(`/Product/delete?code=${encodeURIComponent(code)}&company=${company}`);
        return response.data;
    },
    getNextId: async (deptCode) => {
        const response = await api.get(`/Product/next-id?deptCode=${deptCode}`);
        return response.data;
    },
    getStock: async (code, company) => {
        const response = await api.get(`/Product/stock?code=${encodeURIComponent(code)}&company=${company}`);
        return response.data;
    },
    getLastPurchQty: async (code) => {
        const response = await api.get(`/Product/last-purch-qty?code=${encodeURIComponent(code)}`);
        return response.data;
    }
};
