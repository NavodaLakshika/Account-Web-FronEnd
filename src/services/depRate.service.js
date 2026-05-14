import axios from 'axios';

const api = axios.create({
  baseURL: '/api/DepRate',
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

export const depRateService = {
  async getLookups() {
    try {
      const response = await api.get('/lookups');
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Failed to fetch lookups';
    }
  },

  async getList() {
    try {
      const response = await api.get('/list');
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Failed to fetch rate list';
    }
  },

  async getByCode(code) {
    try {
      const response = await api.get(`/by-code/${code}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Failed to fetch rate details';
    }
  },

  async save(data) {
    try {
      const response = await api.post('/save', data);
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Failed to save record';
    }
  },

  async edit(data) {
    try {
      const response = await api.post('/edit', data);
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Failed to update record';
    }
  }
};
