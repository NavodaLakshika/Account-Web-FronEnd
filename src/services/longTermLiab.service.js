import api from './api';



export const longTermLiabService = {
  async getNextCode(company) {
    try {
      const response = await api.get('/LongTermLiab/next-code', { params: { company } });
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Failed to generate document number';
    }
  },

  async getLookups() {
    try {
      const response = await api.get('/LongTermLiab/lookups');
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Failed to fetch lookups';
    }
  },

  async getByCode(code, company) {
    try {
      const response = await api.get(`/LongTermLiab/${code}`, { params: { company } });
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Failed to fetch liability details';
    }
  },

  async search(company, query = '') {
    try {
      const response = await api.get('/LongTermLiab/search', { params: { company, query } });
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Search failed';
    }
  },

  async save(data) {
    try {
      const response = await api.post('/LongTermLiab/save', data);
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Failed to save record';
    }
  }
};
