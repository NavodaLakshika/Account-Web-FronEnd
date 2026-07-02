import api from './api';



export const systemUpdateService = {
  async runUpdate() {
    try {
      const response = await api.post('/SystemUpdate/run-update');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to initiate system update.' };
    }
  },

  async getStatus() {
    try {
      const response = await api.get('/SystemUpdate/status');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch update status.' };
    }
  }
};
