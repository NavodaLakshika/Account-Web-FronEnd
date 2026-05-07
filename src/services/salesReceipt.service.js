import api from './api';

export const salesReceiptService = {
  getLookups: async () => {
    try {
      const response = await api.get('/Job/lookups');
      return response.data;
    } catch (error) { throw error; }
  },

  searchProducts: async (query) => {
    try {
      const response = await api.get('/Job/search-products', { params: { query } });
      return response.data;
    } catch (error) { throw error; }
  },

  generateDocNo: async (company) => {
    try {
      const response = await api.get('/Job/generate-doc', { params: { company } });
      return response.data;
    } catch (error) { throw error; }
  },

  searchDocs: async (company) => {
    try {
      const response = await api.get('/Job/search', { params: { company } });
      return response.data;
    } catch (error) { throw error; }
  },

  getJob: async (docNo, company) => {
    try {
      const response = await api.get(`/Job/${docNo}`, { params: { company } });
      return response.data;
    } catch (error) { throw error; }
  },

  saveLine: async (data) => {
    try {
      const response = await api.post('/Job/save-line', data);
      return response.data;
    } catch (error) { throw error; }
  },

  apply: async (data) => {
    try {
      const response = await api.post('/Job/apply', data);
      return response.data;
    } catch (error) { throw error; }
  },

  deleteJob: async (docNo, company) => {
    try {
      const response = await api.delete(`/Job/${docNo}`, { params: { company } });
      return response.data;
    } catch (error) { throw error; }
  }
};

export default salesReceiptService;
