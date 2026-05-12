import api from './api';

const downloadMaster = (data) => {
    return api.post('/InventoryDownload/download-master', data);
};

const downloadPurchase = (data) => {
    return api.post('/InventoryDownload/download-purchase', data);
};

const downloadSales = (data) => {
    return api.post('/InventoryDownload/download-sales', data);
};

const downloadReceipt = (data) => {
    return api.post('/InventoryDownload/download-receipt', data);
};

const getLocations = () => {
    return api.get('/InventoryDownload/locations');
};

const getCostCenters = () => {
    return api.get('/InventoryDownload/cost-centers');
};

export const inventoryDownloadService = {
    getLocations,
    getCostCenters,
    downloadMaster,
    downloadPurchase,
    downloadSales,
    downloadReceipt
};
