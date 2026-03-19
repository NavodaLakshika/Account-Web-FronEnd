import api from './api';

export const costCenterService = {
  async getAll() {
    try {
      const response = await api.get('/CostCenter/all');
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Failed to fetch cost centers';
    }
  },

  async getByCode(code) {
    try {
      const response = await api.get(`/CostCenter/details/${code}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Cost center not found';
    }
  },

  async save(ccData) {
    try {
      const response = await api.post('/CostCenter/save', ccData);
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Failed to save cost center';
    }
  },

  async delete(code) {
    try {
      const response = await api.delete(`/CostCenter/delete/${code}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Failed to delete cost center';
    }
  }
};
