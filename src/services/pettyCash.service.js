import axios from 'axios';

const api = axios.create({
  baseURL: '/api/PettyCash',
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

export const pettyCashService = {
  async getLookups(company) {
    try {
      const response = await api.get('/lookups', { params: { company } });
      return response.data;
    } catch (error) {
      console.error('Error fetching lookups:', error);
      throw error;
    }
  },

  getBalance: async (accountCode, costCenter, company) => {
    try {
      const response = await api.get('/balance', {
        params: { accountCode, costCenter, company }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching balance:', error); // Added console.error for consistency
      throw error;
    }
  },

  async generateDocNo(company) {
    try {
      const response = await api.get('/generate-doc', { params: { company } });
      return response.data;
    } catch (error) {
       console.error('Error generating doc no:', error);
       throw error;
    }
  },

  async saveDraft(data) {
    try {
      const response = await api.post('/save', data);
      return response.data;
    } catch (error) {
      console.error('Error saving draft:', error);
      throw error;
    }
  },

  async applyPettyCash(data) {
    try {
      const response = await api.post('/apply', data);
      return response.data;
    } catch (error) {
      console.error('Error applying petty cash:', error);
      throw error;
    }
  },

  async searchDocs(company) {
    try {
      const response = await api.get('/search', { params: { company } });
      return response.data;
    } catch (error) {
      console.error('Error searching docs:', error);
      throw error;
    }
  },

  async getOrder(docNo, company) {
    try {
      const response = await api.get(`/${docNo}`, { params: { company } });
      return response.data;
    } catch (error) {
      console.error('Error fetching order:', error);
      throw error;
    }
  }
};
