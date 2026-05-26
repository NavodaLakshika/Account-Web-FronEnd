import api from './api';

export const areaService = {
  async getAll(company) {
    try {
      const response = await api.get('/Area/all', { params: { company } });
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Failed to fetch areas';
    }
  },

  async searchAreas(routeCode, company, query = '') {
    try {
      const response = await api.get('/Area/search', { params: { routeCode, company, query } });
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Failed to search areas';
    }
  },

  async save(areaData) {
    try {
      const response = await api.post('/Area/save', areaData);
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Failed to save area';
    }
  },

  async delete(code, company) {
    try {
      const response = await api.delete('/Area/delete', { params: { code, company } });
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Failed to delete area';
    }
  }
};
