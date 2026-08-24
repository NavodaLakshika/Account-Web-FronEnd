import api from './api';

export const userProfileService = {
  async searchUsers(companyCode, query = '') {
    try {
      const response = await api.get('/UserProfile/searchUsers', { 
        params: { companyCode, query } 
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message || 'Failed to search users';
    }
  },

  async changePassword(requestData) {
    try {
      const response = await api.post('/UserProfile/changePassword', requestData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message || 'Failed to change password';
    }
  },

  async saveProfile(userData) {
    try {
      const response = await api.post('/UserProfile/saveProfile', userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message || 'Failed to save user profile';
    }
  },

  async getUserProfile(empCode) {
    try {
      const response = await api.get(`/UserProfile/getUser/${empCode}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message || 'Failed to get user profile';
    }
  },

  async deleteUser(empCode) {
    const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;
    const currentUser = user ? user.empName || user.emp_Name : 'SYSTEM';
    try {
      const response = await api.delete(`/UserProfile/deleteUser/${empCode}`, {
        params: { currentUser }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message || 'Failed to delete user profile';
    }
  },

  async getUserGroups() {
    try {
      const response = await api.get('/UserGroup/all');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message || 'Failed to fetch user groups';
    }
  }
};
