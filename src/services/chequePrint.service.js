import api from './api';

const chequePrintService = {
    getInitData: async (company) => {
        const response = await api.get(`/ChequePrint/init-data?company=${company}`);
        return response.data;
    },

    searchCheques: async (searchData) => {
        const response = await api.post(`/ChequePrint/search`, searchData);
        return response.data;
    }
};

export default chequePrintService;
