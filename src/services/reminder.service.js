import api from './api';

export const reminderService = {
  getReminders: async () => {
    const response = await api.get('/Reminder');
    return response.data;
  },

  addReminder: async (reminderData) => {
    const response = await api.post('/Reminder', reminderData);
    return response.data;
  },

  expireReminder: async (id) => {
    const response = await api.put(`/Reminder/${id}/expire`);
    return response.data;
  },
  
  updateReminder: async (id, reminderData) => {
    const response = await api.put(`/Reminder/${id}`, reminderData);
    return response.data;
  },

  deleteReminder: async (id) => {
    const response = await api.delete(`/Reminder/${id}`);
    return response.data;
  }
};
