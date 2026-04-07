import axios from 'axios';

const api = axios.create({
  baseURL: '/api/PaymentMethod',
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

export const paymentMethodService = {
  async getAll(company) {
    try {
      const response = await api.get('/all', { params: { company } });
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Failed to fetch payment methods';
    }
  },
  
  async search(company, query) {
    try {
      const response = await api.get('/search', { params: { company, query } });
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Failed to search payment methods';
    }
  }
};
