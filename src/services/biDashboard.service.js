import api from './api';

export const biDashboardService = {
    async getSummary(company) {
        try {
            const response = await api.get('/BIDashboard/summary', {
                params: { company }
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || 'Failed to fetch BI dashboard data';
        }
    }
};
