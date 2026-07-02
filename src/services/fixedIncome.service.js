import api from './api';



export const fixedIncomeService = {
  async getLookups() {
    try {
      const response = await api.get('/FixedIncome/lookups');
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Failed to fetch lookups';
    }
  },

  async getList(company) {
    try {
      const response = await api.get('/FixedIncome/list', { params: { company } });
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Failed to fetch income list';
    }
  },

  async save(data) {
    try {
      const response = await api.post('/FixedIncome/save', data);
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Failed to save record';
    }
  }
};
