import api from './api';

export const deleteAccountService = {
    getAccounts: (companyCode) => api.get(`/AccountDeletion/accounts?companyCode=${companyCode}`),
    getEmployees: (companyCode) => api.get(`/AccountDeletion/lookup-employees?companyCode=${companyCode}`),
    deleteAccount: (data) => api.post('/AccountDeletion/delete', data)
};
