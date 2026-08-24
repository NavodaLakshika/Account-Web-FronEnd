import api from './api';

export const systemLocksService = {
    getAllLocks: async (empCode = null, companyCode = null, roleId = null) => {
        try {
            const params = {};
            if (empCode) params.empCode = empCode;
            if (companyCode) params.companyCode = companyCode;
            if (roleId) params.roleId = roleId;
            const response = await api.get('/SystemLocks/getAll', { params });
            return response.data;
        } catch (error) {
            console.error('Error fetching system locks:', error);
            throw error;
        }
    },
    
    updateLock: async (moduleId, isLocked, empCode = null, companyCode = null, roleId = null) => {
        try {
            const response = await api.post('/SystemLocks/update', {
                moduleId,
                isLocked,
                empCode,
                companyCode,
                roleId
            });
            return response.data;
        } catch (error) {
            console.error('Error updating system lock:', error);
            throw error;
        }
    }
};
