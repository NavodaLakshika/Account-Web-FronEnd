import api from './api';

const receivePaymentService = {
    getLookups: (company, type) => api.get(`/ReceivePayment/lookups?company=${company}&type=${type}`).then(res => res.data).catch(() => ({ banks: [], costCenters: [], customers: [], subAccounts: [] })),
    generateDoc: (company) => api.get(`/ReceivePayment/generate-doc?company=${company}`).then(res => res.data).catch(() => ({ docNo: '' })),
    getOutstanding: (customerId, company, docNo, accountType) => 
        api.get(`/ReceivePayment/outstanding?customerId=${customerId}&company=${company}&docNo=${docNo}&accountType=${accountType}`).then(res => res.data).catch(() => ({ outstandingRows: [], advanceBalance: 0 })),
    updateRow: (item, company, docNo, customerId) => 
        api.post(`/ReceivePayment/update-row?company=${company}&docNo=${docNo}&customerId=${customerId}`, item).then(res => res.data),
    apply: (data) => api.post('/ReceivePayment/apply', data).then(res => res.data)
};

export default receivePaymentService;
