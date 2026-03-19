import api from './api';

export const categoryService = {
  async getAll() {
    try {
      const response = await api.get('/Category/all');
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Failed to fetch categories';
    }
  },

  async searchCategories(deptCode, locaId, query = '') {
    try {
      const response = await api.get('/Category/search', { params: { deptCode, locaId, query } });
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Failed to search categories';
    }
  },

  async save(categoryData) {
    try {
      const response = await api.post('/Category/save', categoryData);
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Failed to save category';
    }
  },

  async delete(code, deptCode, locaId, company) {
    try {
      const response = await api.delete('/Category/delete', { params: { code, deptCode, locaId, company } });
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Failed to delete category';
    }
  }
};
