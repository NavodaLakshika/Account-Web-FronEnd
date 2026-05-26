import api from './api';
import { getCompanyCode } from '../utils/session';

export const transactionTypeService = {
    getAll: async () => {
        const response = await api.get('/TransactionEditor/lookups', { params: { company: getCompanyCode() } });
        return response.data?.transTypes || response.data || [];
    }
};
