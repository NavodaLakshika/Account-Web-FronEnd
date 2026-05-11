import axios from 'axios';

const API_URL = '/api';

export const accountService = {
    getMainTypes: async (companyCode) => {
        const response = await axios.get(`${API_URL}/Account/main-types`, {
            params: { companyCode }
        });
        return response.data;
    },

    getOtherTypes: async (companyCode) => {
        const response = await axios.get(`${API_URL}/Account/other-types`, {
            params: { companyCode }
        });
        return response.data;
    },

    getParentAccounts: async (type, companyCode) => {
        const response = await axios.get(`${API_URL}/Account/parents`, {
            params: { type, companyCode }
        });
        return response.data;
    },

    createAccount: async (accountData) => {
        const response = await axios.post(`${API_URL}/Account`, accountData);
        return response.data;
    },

    getNextId: async (parentCode) => {
        const response = await axios.get(`${API_URL}/Account/next-id`, {
            params: { parentCode }
        });
        return response.data.nextId;
    },

    getLocations: async (companyCode) => {
        const response = await axios.get(`${API_URL}/Account/locations`, {
            params: { companyCode }
        });
        return response.data;
    },

    getCustomerAccounts: async (parentCode) => {
        const response = await axios.get(`${API_URL}/Account/customer-accounts`, {
            params: { parentCode }
        });
        return response.data;
    }
};
