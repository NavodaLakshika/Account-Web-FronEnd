import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
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

export const supplierService = {
  // GET all suppliers
  async getAll() {
    try {
      const response = await api.get('/Supplier');
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Failed to fetch suppliers';
    }
  },

  // GET single supplier by code
  async getByCode(code) {
    try {
      const response = await api.get(`/Supplier/${code}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Supplier not found';
    }
  },

  // SEARCH by code or name
  async search(params) {
    try {
      const response = await api.get('/Supplier/search', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || 'No suppliers found';
    }
  },

  // CREATE supplier
  async create(supplierData) {
    try {
      const response = await api.post('/Supplier', supplierData);
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Failed to create supplier';
    }
  },

  // UPDATE supplier
  async update(code, supplierData) {
    try {
      const response = await api.put(`/Supplier/${code}`, supplierData);
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Failed to update supplier';
    }
  },

  // DELETE supplier
  async delete(code) {
    try {
      const response = await api.delete(`/Supplier/${code}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Failed to delete supplier';
    }
  },

  // LOOKUPS
  async getBanks() {
    try {
      const response = await api.get('/Supplier/banks');
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Failed to fetch banks';
    }
  },

  async getVendorTypes() {
    try {
      const response = await api.get('/Supplier/vendortypes');
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Failed to fetch vendor types';
    }
  }
};
