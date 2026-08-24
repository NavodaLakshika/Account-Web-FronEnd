import api from './api';

const REVIEW_API_URL = '/SystemReview';

export const reviewService = {
    getAllReviews: async () => {
        try {
            const response = await api.get(REVIEW_API_URL);
            return response.data;
        } catch (error) {
            console.error('Error fetching reviews:', error);
            throw error;
        }
    },

    submitReview: async (reviewData) => {
        try {
            const response = await api.post(REVIEW_API_URL, reviewData);
            return response.data;
        } catch (error) {
            console.error('Error submitting review:', error);
            throw error;
        }
    },

    updateReviewStatus: async (id, status) => {
        try {
            const response = await api.put(`${REVIEW_API_URL}/${id}/status`, `"${status}"`, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error updating review status:', error);
            throw error;
        }
    },

    deleteReview: async (id) => {
        try {
            const response = await api.delete(`${REVIEW_API_URL}/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error deleting review:', error);
            throw error;
        }
    }
};
