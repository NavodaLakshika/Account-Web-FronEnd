import axios from 'axios';

const api = axios.create({
  baseURL: '/api/PayBill',
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

export const payBillService = {
  async getLookups() {
    try {
      const response = await api.get('/lookups');
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Failed to fetch lookups';
    }
  },

  async generateDocNo() {
    try {
      const response = await api.get('/generate-doc');
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Failed to generate document number';
    }
  },

  async getVendorBills(vendorId, company) {
    try {
      const response = await api.get('/vendor-bills', { params: { vendorId, company } });
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Failed to fetch vendor bills';
    }
  },

  async save(data) {
    try {
      const response = await api.post('/save', data);
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Failed to process payment';
    }
  }
};
