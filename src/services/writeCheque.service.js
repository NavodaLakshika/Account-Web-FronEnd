import axios from 'axios';

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
  async getLookups() {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const userName = user?.emp_Name || user?.empName || 'SYSTEM';
      const response = await api.get(`/lookups?userName=${encodeURIComponent(userName)}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Failed to fetch lookups';
    }
  },

  async generateDocNo() {
    try {
      const companyData = localStorage.getItem('selectedCompany');
      let companyCode = 'C001';
      if (companyData) {
        try {
          const parsed = JSON.parse(companyData);
          companyCode = parsed.company_Code || parsed.companyCode || parsed.CompanyCode || companyData;
        } catch (e) { companyCode = companyData; }
      }
      const response = await api.get(`/generate-doc?company=${encodeURIComponent(companyCode)}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Failed to generate document number';
    }
  },

  async save(data) {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const userName = user?.emp_Name || user?.empName || 'SYSTEM';
      const response = await api.post(`/save?userName=${encodeURIComponent(userName)}`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Failed to save cheque portfolio';
    }
  }
};
