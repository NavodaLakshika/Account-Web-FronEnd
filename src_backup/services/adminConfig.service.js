import api from './api';

export const adminConfigService = {
  async get(entityType, entityCode) {
    try {
      const response = await api.get('/AdminConfig', { params: { entityType, entityCode } });
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Failed to fetch admin config';
    }
  },

  async save(configData) {
    try {
      const response = await api.post('/AdminConfig/save', configData);
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Failed to save admin config';
    }
  },

  async toggle(configData) {
    try {
      const response = await api.post('/AdminConfig/toggle', configData);
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Failed to toggle admin config';
    }
  }
};
