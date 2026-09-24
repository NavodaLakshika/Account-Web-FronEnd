import api from './api';
import { getCompanyCode } from '../utils/session';

export const grnService = {
  async getTemplateSuggestions() {
    try {
      const response = await api.get('/Grn/template-suggestions');
      return response.data;
    } catch (error) {
      console.error('API failed, returning fallback template suggestions', error);
      return {
          'Supplier Code': 'SUPP-001',
          'Supplier Invoice': 'INV-2023-001',
          'PO Number': 'PO-9923',
          'Payment Method': 'Cash',
          'Comment': 'First batch of goods',
          'Product Code': 'PROD-1001',
          'Product Name': 'Sample Product A',
          'Unit': 'Nos',
          'Pack Size': '1',
          'Category': 'Electronics',
          'Department': 'Hardware',
          'Available Stock': '50',
          'Purchase Price': '150.00',
          'Selling Price': '200.00',
          'Qty': '10',
          'Free Qty': '2'
      };
    }
  },

  async getLookups(company) {
    try {
      const comp = company || getCompanyCode() || 'COM001';
      const response = await api.get('/Grn/lookups', { params: { company: comp } });
      return response.data;
    } catch (error) {
      console.warn('Failed to fetch GRN lookups, using fallback structure', error);
      return {
        products: [],
        suppliers: [],
        categories: [],
        departments: [],
        paymentMethods: []
      };
    }
  },

  async searchProducts(query) {
    try {
      const response = await api.get('/Grn/search-products', { params: { query } });
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Failed to search products';
    }
  },

  async generateDocNo(company) {
    try {
      const comp = company || getCompanyCode() || 'COM001';
      const response = await api.get('/Grn/generate-doc', { params: { company: comp } });
      return response.data;
    } catch (error) {
      console.warn('Failed to generate GRN docNo from server, using fallback', error);
      return { docNo: `GRN-${Date.now().toString().slice(-6)}` };
    }
  },

  async searchDocs(company) {
    try {
      const comp = company || getCompanyCode() || 'COM001';
      const response = await api.get('/Grn/search', { params: { company: comp } });
      return response.data;
    } catch (error) {
      console.warn('Failed to search GRNs', error);
      return [];
    }
  },

  async getOrder(docNo, company) {
    try {
      const comp = company || getCompanyCode() || 'COM001';
      const response = await api.get(`/Grn/${docNo}`, { params: { company: comp } });
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Failed to fetch GRN details';
    }
  },

  async getPODetails(docNo, company) {
    try {
      const comp = company || getCompanyCode() || 'COM001';
      const response = await api.get(`/Grn/po-details/${docNo}`, { params: { company: comp } });
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Failed to fetch PO details';
    }
  },

  async save(data) {
    try {
      const response = await api.post('/Grn/save', data);
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Failed to save GRN draft';
    }
  },

  async apply(data) {
    try {
      const response = await api.post('/Grn/apply', data);
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Failed to apply GRN';
    }
  },

  async bulkApply(dataList) {
    try {
      const response = await api.post('/Grn/bulk-apply', dataList);
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Failed to bulk apply GRNs';
    }
  },

  async bulkSave(dataList) {
    try {
      const response = await api.post('/Grn/bulk-save', dataList);
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Failed to bulk save GRNs';
    }
  },

  async delete(docNo, company) {
    try {
      const response = await api.delete(`/Grn/${docNo}`, { params: { company } });
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Failed to delete GRN';
    }
  },

  async createProduct(data) {
    try {
      const response = await api.post('/Grn/create-product', data);
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Failed to create product';
    }
  }
};
