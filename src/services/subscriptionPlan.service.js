import api from './api';

export const subscriptionPlanService = {
    initTable: async () => {
        const response = await api.post('/SubscriptionPlan/init');
        return response.data;
    },

    getAllPlans: async () => {
        const response = await api.get('/SubscriptionPlan');
        return response.data;
    },

    getPlanById: async (id) => {
        const response = await api.get(`/SubscriptionPlan/${id}`);
        return response.data;
    },

    createPlan: async (planData) => {
        const response = await api.post('/SubscriptionPlan', planData);
        return response.data;
    },

    updatePlan: async (id, planData) => {
        const response = await api.put(`/SubscriptionPlan/${id}`, planData);
        return response.data;
    },

    deletePlan: async (id) => {
        const response = await api.delete(`/SubscriptionPlan/${id}`);
        return response.data;
    }
};
