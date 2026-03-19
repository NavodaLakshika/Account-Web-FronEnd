import api from './api';

export const departmentService = {
  async getAll() {
    try {
      const response = await api.get('/Department/all');
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Failed to fetch departments';
    }
  },

  async getAllLocations() {
    try {
      const response = await api.get('/Department/locations/all');
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Failed to fetch locations';
    }
  },

  async searchDepartments(locaId, query = '') {
    try {
      const response = await api.get('/Department/search', { params: { locaId, query } });
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Failed to search departments';
    }
  },

  async save(deptData) {
    try {
      const response = await api.post('/Department/save', deptData);
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Failed to save department';
    }
  },

  async delete(code, locaId, company) {
    try {
      const response = await api.delete('/Department/delete', { params: { code, locaId, company } });
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Failed to delete department';
    }
  }
};
