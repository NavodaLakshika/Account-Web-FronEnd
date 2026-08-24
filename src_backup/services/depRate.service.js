import api from './api';



export const depRateService = {
  async getLookups() {
    try {
      const response = await api.get('/DepRate/lookups');
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Failed to fetch lookups';
    }
  },

  async getList() {
    try {
      const response = await api.get('/DepRate/list');
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Failed to fetch rate list';
    }
  },

  async getByCode(code) {
    try {
      const response = await api.get(`/DepRate/by-code/${code}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Failed to fetch rate details';
    }
  },

  async save(data) {
    try {
      const response = await api.post('/DepRate/save', data);
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Failed to save record';
    }
  },

  async edit(data) {
    try {
      const response = await api.post('/DepRate/edit', data);
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Failed to update record';
    }
  }
};
