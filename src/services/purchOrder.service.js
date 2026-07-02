import api from './api';



export const purchOrderService = {
  async getLookups(company) {
    try {
      const response = await api.get('/PurchOrder/lookups', { params: { company } });
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Failed to fetch lookups';
    }
  },
  
  async searchProducts(query) {
    try {
      const response = await api.get('/PurchOrder/search-products', { params: { query } });
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Failed to search products';
    }
  },

  async generateDocNo(company) {
    try {
      const response = await api.get('/PurchOrder/generate-doc', { params: { company } });
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Failed to generate document number';
    }
  },

  async searchDocs(company) {
    try {
      const response = await api.get('/PurchOrder/search', { params: { company } });
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Failed to search documents';
    }
  },

  async getOrder(docNo, company) {
    try {
      const response = await api.get(`/PurchOrder/${docNo}`, { params: { company } });
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Failed to fetch order details';
    }
  },

  async save(data) {
    try {
      const response = await api.post('/PurchOrder/save', data);
      console.log(response.data)
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Failed to save record';
    }
  },

  async delete(docNo, company) {
    try {
      const response = await api.delete(`/PurchOrder/${docNo}`, { params: { company } });
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Failed to delete record';
    }
  },

  async apply(data) {
    try {
      const response = await api.post('/PurchOrder/apply', data);
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Failed to apply record';
    }
  },

  async createProduct(productData) {
    try {
      const response = await api.post('/PurchOrder/create-product', productData);
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Failed to create product';
    }
  }
};
