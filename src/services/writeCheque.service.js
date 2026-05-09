import axios from 'axios';
import { getCompanyCode } from '../utils/session';

const api = axios.create({
  baseURL: '/api/WriteCheque',
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

export const writeChequeService = {
  async getInitData(company = getCompanyCode()) {
    try {
      const response = await api.get(`/init-data?company=${encodeURIComponent(company)}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Failed to initialize data';
    }
  },

  async getBankBalance(bankCode, company = getCompanyCode()) {
    try {
      const response = await api.get(`/bank-balance?bankCode=${encodeURIComponent(bankCode)}&company=${encodeURIComponent(company)}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Failed to fetch bank balance';
    }
  },

  async tempSaveExpense(data) {
    try {
      const response = await api.post('/temp-save-expense', data);
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Failed to save expense line';
    }
  },

  async tempSaveItem(data) {
    try {
      const response = await api.post('/temp-save-item', data);
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Failed to save item line';
    }
  },

  async saveHeader(data) {
    try {
      const response = await api.post('/save-header', data);
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Failed to save header';
    }
  },

  async apply(data) {
    try {
      const response = await api.post('/apply', data);
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Failed to apply transaction';
    }
  }
};
