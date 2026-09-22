import api from './api';

export const accountTablesService = {
    // Acc_Main_Accounts
    getMainAccounts: async () => {
        const res = await api.get('/SuperAdmin/main-accounts');
        return res.data;
    },
    createMainAccount: async (data) => {
        const res = await api.post('/SuperAdmin/main-accounts', data);
        return res.data;
    },
    updateMainAccount: async (mainAccCode, data) => {
        const res = await api.put(`/SuperAdmin/main-accounts/${encodeURIComponent(mainAccCode)}`, data);
        return res.data;
    },
    deleteMainAccount: async (mainAccCode) => {
        const res = await api.delete(`/SuperAdmin/main-accounts/${encodeURIComponent(mainAccCode)}`);
        return res.data;
    },

    // ACC_Sub_Accounts
    getSubAccounts: async (params = {}) => {
        const res = await api.get('/SuperAdmin/sub-accounts', { params });
        return res.data;
    },
    createSubAccount: async (data) => {
        const res = await api.post('/SuperAdmin/sub-accounts', data);
        return res.data;
    },
    updateSubAccount: async (subCode, data, companyCode) => {
        const res = await api.put(`/SuperAdmin/sub-accounts/${encodeURIComponent(subCode)}`, data, {
            params: { companyCode: companyCode ?? '' }
        });
        return res.data;
    },
    deleteSubAccount: async (subCode, companyCode) => {
        const res = await api.delete(`/SuperAdmin/sub-accounts/${encodeURIComponent(subCode)}`, {
            params: { companyCode: companyCode ?? '' }
        });
        return res.data;
    }
};

export default accountTablesService;
