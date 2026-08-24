import api from './api';
import { getUserName } from '../utils/session';



export const pettyCashService = {
  getLookups: async (company) => {
    const r = await api.get('/PettyCash/lookups', { params: { company } });
    return r.data;
  },

  getBalance: async (accountCode, costCenter, company) => {
    const r = await api.get('/PettyCash/balance', { params: { accountCode, costCenter, company } });
    return r.data;
  },

  generateDocNo: async (company) => {
    const r = await api.get('/PettyCash/generate-doc', { params: { company } });
    return r.data;
  },

  addExpense: async (userName, data) => {
    const r = await api.post('/PettyCash/add-expense', data, { params: { userName } });
    return r.data;
  },

  deleteExpense: async (userName, data) => {
    const r = await api.post('/PettyCash/delete-expense', data, { params: { userName } });
    return r.data;
  },

  addItem: async (userName, data) => {
    const r = await api.post('/PettyCash/add-item', data, { params: { userName } });
    return r.data;
  },

  deleteItem: async (userName, data) => {
    const r = await api.post('/PettyCash/delete-item', data, { params: { userName } });
    return r.data;
  },

  apply: async (userName, data) => {
    const r = await api.post('/PettyCash/apply', data, { params: { userName } });
    return r.data;
  },

  applyPettyCash: async (data) => {
    const userName = getUserName();
    const r = await api.post('/PettyCash/apply', data, { params: { userName } });
    return r.data;
  },

  saveDraft: async (data) => {
    const userName = getUserName();
    const r = await api.post('/PettyCash/save', data, { params: { userName } });
    return r.data;
  },

  searchDocs: async (company) => {
    const r = await api.get('/PettyCash/search', { params: { company } });
    return r.data;
  },

  getDraft: async (docNo, company) => {
    const r = await api.get(`/PettyCash/${docNo}`, { params: { company } });
    return r.data;
  },

  clearDraft: async (docNo, company) => {
    const r = await api.delete('/PettyCash/clear', { params: { docNo, company } });
    return r.data;
  },
};
