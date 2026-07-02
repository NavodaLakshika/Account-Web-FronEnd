import api from './api';



export const payBillService = {
  async getLookups() {
    try {
      const response = await api.get('/PayBill/lookups');
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Failed to fetch lookups';
    }
  },

  async generateDocNo(company) {
    try {
      const response = await api.get('/PayBill/generate-doc', { params: { company } });
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Failed to generate document number';
    }
  },

  async getVendorBills(vendorId, company) {
    try {
      const response = await api.get('/PayBill/vendor-bills', { params: { vendorId, company } });
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Failed to fetch vendor bills';
    }
  },

  async save(data) {
    try {
      const response = await api.post('/PayBill/save', data);
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Failed to process payment';
    }
  },

  async search(query = '') {
    try {
      const response = await api.get('/PayBill/search', { params: { query } });
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Failed to search payments';
    }
  },

  // Fetch all payments for a company (used by report list)
  async getAllPayments(companyId) {
    try {
      const response = await api.get('/PayBill/all', { params: { company: companyId } });
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Failed to load payments report';
    }
  },

  async getPayment(payDoc) {
    try {
      const response = await api.get(`/PayBill/${payDoc}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Failed to load payment details';
    }
  }
};
