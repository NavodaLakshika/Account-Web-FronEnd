import axios from 'axios';
import { authService } from './auth.service';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = authService.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const subscriptionService = {
  async getUsers() {
    try {
      const response = await api.get('/Subscription/users');
      return response.data;
    } catch (error) {
      console.error('Error fetching subscription users:', error);
      throw error.response?.data || 'Failed to fetch users.';
    }
  },

  async updateSubscription(empCode, extendMonths, status) {
    try {
      const response = await api.post('/Subscription/update', {
        EmpCode: empCode,
        ExtendMonths: extendMonths,
        Status: status
      });
      return response.data;
    } catch (error) {
      console.error('Error updating subscription:', error);
      throw error.response?.data || 'Failed to update subscription.';
    }
  }
};
