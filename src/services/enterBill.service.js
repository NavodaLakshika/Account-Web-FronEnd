import api from './api';


export const enterBillService = {
  async getLookups() {
    try {
      const response = await api.get('/EnterBill/lookups');
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Failed to fetch lookups';
    }
  },

  async generateDocNo(company) {
    try {
      const response = await api.get('/EnterBill/generate-doc', { params: { company } });
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Failed to generate document number';
    }
  },

  async save(data) {
    try {
      const response = await api.post('/EnterBill/save', data);
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Failed to save bill';
    }
  },

  async searchBills(query, company) {
    try {
      const response = await api.get('/EnterBill/search', { params: { query, company } });
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Failed to search bills';
    }
  },

  async getBill(docNo, company) {
    try {
      const response = await api.get(`/EnterBill/${docNo}`, { params: { company } });
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Failed to load bill';
    }
  }
};
