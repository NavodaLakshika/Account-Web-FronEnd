import axios from 'axios';

const api = axios.create({
  baseURL: '/api/CardCommission',
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

export const cardCommissionService = {
  async getLookups() {
    try {
      const response = await api.get('/lookups');
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Failed to fetch lookups';
    }
  },

  async getRate(bankAccCode, cardID) {
    try {
      const response = await api.get('/rate', { params: { bankAccCode, cardID } });
      return response.data.rate;
    } catch (error) {
      throw error.response?.data || 0;
    }
  },

  async save(data) {
    try {
      const response = await api.post('/save', data);
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Failed to save commission rate';
    }
  }
};
