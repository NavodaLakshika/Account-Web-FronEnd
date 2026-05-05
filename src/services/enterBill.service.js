import axios from 'axios';

const api = axios.create({
  baseURL: '/api/EnterBill',
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

export const enterBillService = {
  async getLookups() {
    try {
      const response = await api.get('/lookups');
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Failed to fetch lookups';
    }
  },

  async generateDocNo(company) {
    try {
      const response = await api.get('/generate-doc', { params: { company } });
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Failed to generate document number';
    }
  },

  async save(data) {
    try {
      const response = await api.post('/save', data);
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Failed to save bill';
    }
  },

  async searchBills(query, company) {
    try {
      const response = await api.get('/search', { params: { query, company } });
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Failed to search bills';
    }
  },

  async getBill(docNo, company) {
    try {
      const response = await api.get(`/${docNo}`, { params: { company } });
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Failed to load bill';
    }
  }
};
