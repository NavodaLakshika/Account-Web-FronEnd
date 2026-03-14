import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to add auth token to every request
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

export const customerService = {
  // GET all customers (partial info: Code, Cust_Name)
  async getAll() {
    try {
      const response = await api.get('/Customer');
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Failed to fetch customers';
    }
  },

  // GET single customer by code (full info)
  async getByCode(code) {
    try {
      const response = await api.get(`/Customer/${code}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Customer not found';
    }
  },

  // SEARCH by code or name
  async search(params) {
    try {
      const response = await api.get('/Customer/search', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || 'No customers found';
    }
  },

  // CREATE customer
  async create(customerData) {
    try {
      const response = await api.post('/Customer', customerData);
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Failed to create customer';
    }
  },

  // UPDATE customer
  async update(code, customerData) {
    try {
      const response = await api.put(`/Customer/${code}`, customerData);
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Failed to update customer';
    }
  },

  // DELETE customer
  async delete(code) {
    try {
      const response = await api.delete(`/Customer/${code}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Failed to delete customer';
    }
  },

  // LOOKUPS
  async getAreas() {
    try {
      const response = await api.get('/Customer/areas');
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Failed to fetch areas';
    }
  },

  async getRoutes() {
    try {
      const response = await api.get('/Customer/routes');
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Failed to fetch routes';
    }
  },

  async getBanks() {
    try {
      const response = await api.get('/Customer/banks');
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Failed to fetch banks';
    }
  },

  async getTypes() {
    try {
      const response = await api.get('/Customer/types');
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Failed to fetch customer types';
    }
  }
};
