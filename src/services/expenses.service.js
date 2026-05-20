import api from './api';

export const expensesService = {
  async getDashboardData(company, dateRange = 'all') {
    try {
      const response = await api.get('/Expenses/dashboard-data', {
        params: { company, dateRange }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Failed to fetch expenses dashboard data';
    }
  },

  async getIncomeSummary(company) {
    try {
      const response = await api.get('/SalesInvoice/search', { params: { company } });
      const invoices = Array.isArray(response.data) ? response.data : [];
      const totalIncome = invoices.reduce((sum, inv) => sum + (Number(inv.total || inv.Total || inv.amount || inv.Amount || 0)), 0);
      return { totalIncome, invoices };
    } catch (error) {
      return { totalIncome: 0, invoices: [] };
    }
  }
};
