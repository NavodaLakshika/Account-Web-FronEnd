import api from './api';

export const salesInvoiceService = {
  getInitData: async (company) => {
    try {
      const response = await api.get('/SalesInvoice/init-data', { params: { company } });
      return response.data;
    } catch (error) { throw error; }
  },

  save: async (data) => {
    try {
      const response = await api.post('/SalesInvoice/save', data);
      return response.data;
    } catch (error) { throw error; }
  },

  apply: async (data) => {
    try {
      const response = await api.post('/SalesInvoice/apply', data);
      return response.data;
    } catch (error) { throw error; }
  },

  search: async (company) => {
    try {
      const response = await api.get('/SalesInvoice/search', { params: { company } });
      return response.data;
    } catch (error) { throw error; }
  },

  getInvoice: async (docNo, company) => {
    try {
      const response = await api.get('/SalesInvoice/getInvoice', { params: { docNo, company } });
      return response.data;
    } catch (error) { throw error; }
  },

  generateDocNo: async (company) => {
    try {
      const response = await api.get('/SalesInvoice/init-data', { params: { company } });
      return response.data;
    } catch (error) { throw error; }
  },

  recallSO: async (docNo, soNo, company, date) => {
    try {
      const response = await api.post('/SalesInvoice/recall-so', null, { params: { docNo, soNo, company, date } });
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
