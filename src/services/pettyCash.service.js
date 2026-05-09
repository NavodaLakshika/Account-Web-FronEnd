import axios from 'axios';
import { getUserName } from '../utils/session';

const api = axios.create({
  baseURL: '/api/PettyCash',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

export const pettyCashService = {
  getLookups: async (company) => {
    const r = await api.get('/lookups', { params: { company } });
    return r.data;
  },

  getBalance: async (accountCode, costCenter, company) => {
    const r = await api.get('/balance', { params: { accountCode, costCenter, company } });
    return r.data;
  },

  generateDocNo: async (company) => {
    const r = await api.get('/generate-doc', { params: { company } });
    return r.data;
  },

  addExpense: async (userName, data) => {
    const r = await api.post('/add-expense', data, { params: { userName } });
    return r.data;
  },

  deleteExpense: async (userName, data) => {
    const r = await api.post('/delete-expense', data, { params: { userName } });
    return r.data;
  },

  addItem: async (userName, data) => {
    const r = await api.post('/add-item', data, { params: { userName } });
    return r.data;
  },

  deleteItem: async (userName, data) => {
    const r = await api.post('/delete-item', data, { params: { userName } });
    return r.data;
  },

  apply: async (userName, data) => {
    const r = await api.post('/apply', data, { params: { userName } });
    return r.data;
  },

  applyPettyCash: async (data) => {
    const userName = getUserName();
    const r = await api.post('/apply', data, { params: { userName } });
    return r.data;
  },

  searchDocs: async (company) => {
    const r = await api.get('/search', { params: { company } });
    return r.data;
  },

  getDraft: async (docNo, company) => {
    const r = await api.get(`/${docNo}`, { params: { company } });
    return r.data;
  },

  clearDraft: async (docNo, company) => {
    const r = await api.delete('/clear', { params: { docNo, company } });
    return r.data;
  },
};
