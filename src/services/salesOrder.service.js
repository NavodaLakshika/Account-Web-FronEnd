import api from './api';

export const salesOrderService = {
  getInitData: async (company) => {
    try {
      const response = await api.get('/SalesOrder/init-data', { params: { company } });
      return response.data;
    } catch (error) { throw error; }
  },

  saveDraft: async (data) => {
    try {
      const response = await api.post('/SalesOrder/save', data);
      return response.data;
    } catch (error) { throw error; }
  },

  applyOrder: async (data) => {
    try {
      const response = await api.post('/SalesOrder/apply', data);
      return response.data;
    } catch (error) { throw error; }
  },

  searchOrders: async (company) => {
    try {
      const response = await api.get('/SalesOrder/search', { params: { company } });
      return response.data;
    } catch (error) { throw error; }
  },

  getOrder: async (docNo, company) => {
    try {
      const response = await api.get('/SalesOrder/getOrder', { params: { docNo, company } });
      return response.data;
    } catch (error) { throw error; }
  }
};
