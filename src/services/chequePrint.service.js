import axios from 'axios';

const API_URL = '/api/ChequePrint';

const chequePrintService = {
    getInitData: async (company) => {
        const response = await axios.get(`${API_URL}/init-data?company=${company}`);
        return response.data;
    },

    searchCheques: async (searchData) => {
        const response = await axios.post(`${API_URL}/search`, searchData);
        return response.data;
    }
};

export default chequePrintService;
