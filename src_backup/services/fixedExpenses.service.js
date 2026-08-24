import api from './api';



export const fixedExpensesService = {
  async getLookups() {
    try {
      const response = await api.get('/FixedExpenses/lookups');
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Failed to fetch lookups';
    }
  },

  async getList(company) {
    try {
      const response = await api.get('/FixedExpenses/list', { params: { company } });
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Failed to fetch expense list';
    }
  },

  async save(data) {
    try {
      const response = await api.post('/FixedExpenses/save', data);
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Failed to save record';
    }
  }
};
