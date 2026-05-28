import api from './api';

export const vendorTypeService = {
  async searchAccounts(query = '') {
    try {
      const response = await api.get('/VendorTypeMaster/search', { params: { query } });
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Failed to search accounts';
    }
  },

  async getVendors(query = '') {
    try {
      const response = await api.get('/VendorTypeMaster/vendors', { params: { query } });
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Failed to fetch vendor types';
    }
  },

  async save(vendorTypeData) {
    try {
      const response = await api.post('/VendorTypeMaster/save', vendorTypeData);
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Failed to save vendor type';
    }
  },

  async getDetails(vendorType) {
    try {
      const response = await api.get(`/VendorTypeMaster/details/\${vendorType}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Failed to fetch details';
    }
  }
};
