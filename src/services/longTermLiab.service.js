import axios from 'axios';

const api = axios.create({
  baseURL: '/api/LongTermLiab',
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

export const longTermLiabService = {
  async getLookups() {
    try {
      const response = await api.get('/lookups');
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Failed to fetch lookups';
    }
  },

  async getByCode(code, company) {
    try {
      const response = await api.get(`/${code}`, { params: { company } });
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Failed to fetch liability details';
    }
  },

  async search(company, query = '') {
    try {
      const response = await api.get('/search', { params: { company, query } });
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
