import axios from 'axios';

const api = axios.create({
  baseURL: '/api/VendorTypeMaster',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const vendorTypeService = {
  async searchAccounts(query = '') {
    try {
      const response = await api.get('/search', { params: { query } });
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Failed to search accounts';
    }
  },

  async getVendors(query = '') {
    try {
      const response = await api.get('/vendors', { params: { query } });
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Failed to fetch vendor types';
    }
  },

  async save(vendorTypeData) {
    try {
      const response = await api.post('/save', vendorTypeData);
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Failed to save vendor type';
    }
  },

  async getDetails(vendorType) {
    try {
      const response = await api.get(`/details/\${vendorType}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Failed to fetch details';
    }
  }
};
