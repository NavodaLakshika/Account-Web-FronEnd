import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth header if token exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const systemUpdateService = {
  async runUpdate() {
    try {
      const response = await api.post('/SystemUpdate/run-update');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to initiate system update.' };
    }
  },

  async getStatus() {
    try {
      const response = await api.get('/SystemUpdate/status');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch update status.' };
    }
  }
};
