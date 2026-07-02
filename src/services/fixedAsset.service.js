import api from './api';



export const fixedAssetService = {
  async getLookups() {
    try {
      const response = await api.get('/FixedAsset/lookups');
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Failed to fetch lookups';
    }
  },

  async getNextCode(company) {
    try {
      const response = await api.get('/FixedAsset/next-code', { params: { company } });
      return response.data.nextCode;
    } catch (error) {
      throw error.response?.data || '1';
    }
  },

  async getByCode(code, company) {
    try {
      const response = await api.get(`/FixedAsset/${code}`, { params: { company } });
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Failed to fetch asset';
    }
  },

  async search(company) {
    try {
      const response = await api.get('/FixedAsset/search', { params: { company } });
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Search failed';
    }
  },

  async save(data) {
    try {
      const response = await api.post('/FixedAsset/save', data);
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Failed to save record';
    }
  }
};
