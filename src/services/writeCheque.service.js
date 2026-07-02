import api from './api';
import { getCompanyCode } from '../utils/session';



export const writeChequeService = {
  async getInitData(company = getCompanyCode()) {
    try {
      const response = await api.get(`/WriteCheque/init-data?company=${encodeURIComponent(company)}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Failed to initialize data';
    }
  },

  async getBankBalance(bankCode, company = getCompanyCode()) {
    try {
      const response = await api.get(`/WriteCheque/bank-balance?bankCode=${encodeURIComponent(bankCode)}&company=${encodeURIComponent(company)}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Failed to fetch bank balance';
    }
  },

  async tempSaveExpense(data) {
    try {
      const response = await api.post('/WriteCheque/temp-save-expense', data);
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Failed to save expense line';
    }
  },

  async tempSaveItem(data) {
    try {
      const response = await api.post('/WriteCheque/temp-save-item', data);
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Failed to save item line';
    }
  },

  async saveHeader(data) {
    try {
      const response = await api.post('/WriteCheque/save-header', data);
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Failed to save header';
    }
  },

  async apply(data) {
    try {
      const response = await api.post('/WriteCheque/apply', data);
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Failed to apply transaction';
    }
  },

  async searchSaved(company = getCompanyCode()) {
    try {
      const response = await api.get(`/WriteCheque/search?company=${encodeURIComponent(company)}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Failed to search saved documents';
    }
  },

  async loadSaved(docNo, company = getCompanyCode()) {
    try {
      const response = await api.get(`/WriteCheque/${encodeURIComponent(docNo)}?company=${encodeURIComponent(company)}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Failed to load document';
    }
  }
};
