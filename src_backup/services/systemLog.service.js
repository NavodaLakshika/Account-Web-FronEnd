import api from './api';

export const systemLogService = {
  getAllLogs: async () => {
    try {
      const response = await api.get('/SystemLog/getAll');
      return response.data;
    } catch (error) {
      console.error('Error fetching system logs:', error);
      throw error;
    }
  }
};
