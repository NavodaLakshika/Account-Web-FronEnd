import axios from 'axios';

const api = axios.create({
  baseURL: '/api/PurchOrder',
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

export const purchOrderService = {
  async getLookups(company) {
    try {
      const response = await api.get('/lookups', { params: { company } });
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

  async searchDocs(company) {
    try {
      const response = await api.get('/search', { params: { company } });
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Failed to search documents';
    }
  },

  async getOrder(docNo, company) {
    try {
      const response = await api.get(`/${docNo}`, { params: { company } });
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Failed to fetch order details';
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

  async delete(docNo, company) {
    try {
      const response = await api.delete(`/${docNo}`, { params: { company } });
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Failed to delete record';
    }
  }
};
