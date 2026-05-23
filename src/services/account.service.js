import api from './api';

export const accountService = {
    getMainTypes: async (companyCode) => {
        const response = await api.get(`/Account/main-types`, {
            params: { companyCode }
        });
        return response.data;
    },

    getOtherTypes: async (companyCode) => {
        const response = await api.get(`/Account/other-types`, {
            params: { companyCode }
        });
        return response.data;
    },

    getParentAccounts: async (type, companyCode) => {
        const response = await api.get(`/Account/parents`, {
            params: { type, companyCode }
        });
        return response.data;
    },

    createAccount: async (accountData) => {
        const response = await api.post(`/Account`, accountData);
        return response.data;
    },

    getNextId: async (parentCode) => {
        const response = await api.get(`/Account/next-id`, {
            params: { parentCode }
        });
        return response.data.nextId;
    },

    getLocations: async (companyCode) => {
        const response = await api.get(`/Account/locations`, {
            params: { companyCode }
        });
        return response.data;
    },

    getCustomerAccounts: async (parentCode) => {
        const response = await api.get(`/Account/customer-accounts`, {
            params: { parentCode }
        });
        return response.data;
    }
};
