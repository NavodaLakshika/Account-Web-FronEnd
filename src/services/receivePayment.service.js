import api from './api';

export const receivePaymentService = {
  getLookups: async (company, type = 'MM') => {
    try {
      const response = await api.get('/ReceivePayment/lookups', { params: { company, type } });
      return response.data;
    } catch (error) { throw error; }
  },

  getOutstanding: async (customerId, company, docNo, accountType = 'MM', userName = 'Admin') => {
    try {
      const response = await api.get('/ReceivePayment/outstanding', { 
        params: { customerId, company, docNo, accountType, userName } 
      });
      return response.data;
    } catch (error) { throw error; }
  },

  updateRow: async (item, company, docNo, customerId) => {
    try {
      const response = await api.post('/ReceivePayment/update-row', item, { 
        params: { company, docNo, customerId } 
      });
      return response.data;
    } catch (error) { throw error; }
  },

  apply: async (data) => {
    try {
      const response = await api.post('/ReceivePayment/apply', data);
      return response.data;
    } catch (error) { throw error; }
  },

  generateDocNo: async (company) => {
    try {
      const response = await api.get('/ReceivePayment/generate-doc', { params: { company } });
      return response.data;
    } catch (error) { throw error; }
  },
  
  getHistory: async (company) => {
    try {
      const response = await api.get('/ReceivePayment/history', { params: { company } });
      return response.data;
    } catch (error) { throw error; }
  },

  getPayment: async (docNo, company) => {
    try {
      const response = await api.get(`/ReceivePayment/${docNo}`, { params: { company } });
      return response.data;
    } catch (error) { throw error; }
  }
};

export default receivePaymentService;
