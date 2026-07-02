import api from './api';



export const cardCommissionService = {
  async getLookups() {
    try {
      const response = await api.get('/CardCommission/lookups');
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Failed to fetch lookups';
    }
  },

  async getRate(bankCode, cardId, company) {
    try {
      const response = await api.get('/CardCommission/rate', { params: { bankCode, cardId, company } });
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Failed to fetch rate';
    }
  },

  async save(data) {
    try {
      const response = await api.post('/CardCommission/save', data);
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Failed to save record';
    }
  }
};
