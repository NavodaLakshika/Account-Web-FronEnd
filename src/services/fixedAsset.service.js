import axios from 'axios';

const api = axios.create({
  baseURL: '/api/FixedAsset',
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

export const fixedAssetService = {
  async getLookups() {
    try {
      const response = await api.get('/lookups');
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Failed to fetch lookups';
    }
  },

  async getNextCode(company) {
    try {
      const response = await api.get('/next-code', { params: { company } });
      return response.data.nextCode;
    } catch (error) {
      throw error.response?.data || '1';
    }
  },

  async getByCode(code, company) {
    try {
      const response = await api.get(`/${code}`, { params: { company } });
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Failed to fetch asset';
    }
  },

  async search(company) {
    try {
      const response = await api.get('/search', { params: { company } });
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Search failed';
    }
  },

  async save(data) {
    try {
      const response = await api.post('/save', data);
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Failed to save record';
    }
  }
};
