import api from './api';

export const routeService = {
  async getAll(company) {
    try {
      const response = await api.get('/Route/all', { params: { company } });
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Failed to fetch routes';
    }
  },

  async searchRoutes(company, query = '') {
    try {
      const response = await api.get('/Route/search', { params: { company, query } });
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Failed to search routes';
    }
  },

  async save(routeData) {
    try {
      const response = await api.post('/Route/save', routeData);
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Failed to save route';
    }
  },

  async delete(code, company) {
    try {
      const response = await api.delete('/Route/delete', { params: { code, company } });
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Failed to delete route';
    }
  }
};
