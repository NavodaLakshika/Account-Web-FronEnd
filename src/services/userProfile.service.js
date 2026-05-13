import axios from 'axios';

const api = axios.create({
  baseURL: '/api/UserProfile',
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

export const userProfileService = {
  async searchUsers(companyCode, query = '') {
    try {
      const response = await api.get('searchUsers', { 
        params: { companyCode, query } 
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message || 'Failed to search users';
    }
  },

  async changePassword(requestData) {
    try {
      const response = await api.post('changePassword', requestData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message || 'Failed to change password';
    }
  }
};
