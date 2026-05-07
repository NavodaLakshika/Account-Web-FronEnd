import api from './api';

export const reportService = {
  getItemsServices: async (company) => {
    try {
      const response = await api.get('/Report/items-services', { params: { company } });
      return response.data;
    } catch (error) { throw error; }
  }
};
