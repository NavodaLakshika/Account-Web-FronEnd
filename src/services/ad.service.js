import api from './api';

const ADS_API_URL = '/SystemAds';

export const adService = {
    getAllAds: async () => {
        try {
            const response = await api.get(ADS_API_URL);
            return response.data;
        } catch (error) {
            console.error('Error fetching ads:', error);
            throw error;
        }
    },

    createAd: async (adData) => {
        try {
            const response = await api.post(ADS_API_URL, adData);
            return response.data;
        } catch (error) {
            console.error('Error creating ad:', error);
            throw error;
        }
    },

    updateAd: async (id, adData) => {
        try {
            const response = await api.put(`${ADS_API_URL}/${id}`, adData);
            return response.data;
        } catch (error) {
            console.error('Error updating ad:', error);
            throw error;
        }
    },

    updateAdStatus: async (id, isActive) => {
        try {
            const response = await api.put(`${ADS_API_URL}/${id}/status`, isActive, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error updating ad status:', error);
            throw error;
        }
    },

    deleteAd: async (id) => {
        try {
            const response = await api.delete(`${ADS_API_URL}/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error deleting ad:', error);
            throw error;
        }
    }
};
