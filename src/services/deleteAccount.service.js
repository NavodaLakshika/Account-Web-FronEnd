import api from './api';

export const deleteAccountService = {
    getAccounts: () => api.get('/AccountDeletion/accounts'),
    getEmployees: () => api.get('/AccountDeletion/lookup-employees'),
    deleteAccount: (data) => api.post('/AccountDeletion/delete', data)
};
