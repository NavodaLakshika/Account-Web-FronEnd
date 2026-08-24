import api from './api';

export const customerTypeService = {
  async getAll() {
    try {
      const response = await api.get('/CustomerType');
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Failed to fetch customer types';
    }
  },

  async search(params) {
    try {
      const response = await api.get('/CustomerType/search', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || 'No customer types found';
    }
  },

  async save(customerTypeData) {
    try {
      if (customerTypeData.Code) {
        // Update existing
        const response = await api.put(`/CustomerType/${customerTypeData.Code}`, customerTypeData);
        return response.data;
      } else {
        // Create new
        const response = await api.post('/CustomerType', customerTypeData);
        return response.data;
      }
    } catch (error) {
      throw error.response?.data || 'Failed to save customer type';
    }
  },

  async delete(code) {
    try {
      const response = await api.delete(`/CustomerType/${code}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Failed to delete customer type';
    }
  }
};
