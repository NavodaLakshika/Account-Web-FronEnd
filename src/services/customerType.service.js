import api from './api';

export const customerTypeService = {
  async getAll() {
    try {
      const response = await api.get('/CustomerType');
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Failed to fetch customer types';
    }
  },

  async search(params) {
    try {
      const response = await api.get('/CustomerType/search', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || 'No customer types found';
    }
  },

  async save(customerTypeData) {
    try {
      let currentUser = customerTypeData.CurrentUser;
      if (!currentUser) {
        try {
          const userRaw = localStorage.getItem('user') || sessionStorage.getItem('user');
          if (userRaw) {
            const userObj = JSON.parse(userRaw);
            currentUser = userObj.Emp_Name || userObj.EmpName || userObj.empName || userObj.emp_Name || userObj.username || '';
          }
        } catch (e) {}
      }
      const payload = { ...customerTypeData, CurrentUser: currentUser || 'SYSTEM' };

      if (payload.Code) {
        // Update existing
        const response = await api.put(`/CustomerType/${payload.Code}`, payload);
        return response.data;
      } else {
        // Create new
        const response = await api.post('/CustomerType', payload);
        return response.data;
      }
    } catch (error) {
      throw error.response?.data || 'Failed to save customer type';
    }
  },

  async delete(code) {
    try {
      const response = await api.delete(`/CustomerType/${code}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Failed to delete customer type';
    }
  }
};
