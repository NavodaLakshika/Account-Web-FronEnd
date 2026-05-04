import api from './api';

export const paymentMethodService = {
  async getAll(company) {
    try {
      const response = await api.get('/PaymentMethod/all', { params: { company } });
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Failed to fetch payment methods';
    }
  },
  
  async search(company, query) {
    try {
      const response = await api.get('/PaymentMethod/search', { params: { company, query } });
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Failed to search payment methods';
    }
  }
};
