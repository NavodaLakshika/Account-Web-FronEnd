import api from './api';

export const bankingService = {
    getCollectionLookups: async (companyCode = 'C001') => {
        try {
            const resp = await api.get(`banking/collection-lookups?companyCode=${companyCode}`);
            return resp.data;
        } catch (error) {
            return { costCenters: [], paymentModes: [], customers: [], departments: [] };
        }
    },

    getCollections: async (filters) => {
        try {
            const resp = await api.get(`banking/collections`, { params: filters });
            return resp.data;
        } catch (error) {
            return [];
        }
    },

    saveDeposit: async (data) => {
        try {
            const resp = await api.post(`banking/deposit`, data);
            return resp.data;
        } catch (error) {
            throw error.response?.data?.message || 'Failed to save deposit.';
        }
    },

    generateDocNo: async (prefix = 'MDP', companyCode = 'C001') => {
        try {
            const resp = await api.get(`banking/gen-docno?prefix=${prefix}&companyCode=${companyCode}`);
            return resp.data;
        } catch (error) {
            return { docNo: `${prefix}001000001` };
        }
    },

    getDirectTransactionLookups: async (companyCode = 'C001') => {
        try {
            const resp = await api.get(`banking/direct-lookups?companyCode=${companyCode}`);
            return resp.data;
        } catch (error) {
            return { banks: [], accounts: [], costCenters: [] };
        }
    },

    saveDirectTransaction: async (data) => {
        try {
            const resp = await api.post(`banking/direct-transaction`, data);
            return resp.data;
        } catch (error) {
            throw error.response?.data?.message || 'Failed to save direct transaction.';
        }
    },

    getTransferLookups: async (companyCode = 'C001') => {
        try {
            const resp = await api.get(`banking/transfer-lookups?companyCode=${companyCode}`);
            return resp.data;
        } catch (error) {
            return { banks: [], costCenters: [] };
        }
    },

    getAccountBalance: async (accountCode, companyCode = 'C001') => {
        try {
            const resp = await api.get(`banking/account-balance?code=${accountCode}&companyCode=${companyCode}`);
            return resp.data;
        } catch (error) {
            return { balance: 0 };
        }
    },

    saveTransfer: async (data) => {
        try {
            const resp = await api.post(`banking/transfer-funds`, data);
            return resp.data;
        } catch (error) {
            throw error.response?.data?.message || 'Failed to process funds transfer.';
        }
    },

    getCancelLookups: async (companyCode = 'C001') => {
        try {
            const resp = await api.get(`banking/cancel-lookups?companyCode=${companyCode}`);
            return resp.data;
        } catch (error) {
            return { docTypes: [], accounts: [] };
        }
    },

    findCheque: async (filters) => {
        try {
            const resp = await api.get(`banking/find-cheque`, { params: filters });
            return resp.data;
        } catch (error) {
            return null;
        }
    },

    saveChequeCancel: async (data) => {
        try {
            const resp = await api.post(`banking/cheque-cancel`, data);
            return resp.data;
        } catch (error) {
            throw error.response?.data?.message || 'Failed to process cheque cancellation.';
        }
    },

    getCustomerChequeLookups: async (companyCode = 'C001') => {
        try {
            const resp = await api.get(`banking/customer-cheque-lookups?companyCode=${companyCode}`);
            return resp.data;
        } catch (error) {
            return { customers: [], banks: [] };
        }
    },

    findCustomerCheque: async (filters) => {
        try {
            const resp = await api.get(`banking/find-customer-cheque`, { params: filters });
            return resp.data;
        } catch (error) {
            return null;
        }
    },

    saveChequeReturn: async (data) => {
        try {
            const resp = await api.post(`banking/customer-cheque-return`, data);
            return resp.data;
        } catch (error) {
            throw error.response?.data?.message || 'Failed to process customer cheque return.';
        }
    },

    getChequeFormatLookups: async (companyCode = 'C001') => {
        try {
            const resp = await api.get(`banking/cheque-formats?companyCode=${companyCode}`);
            return resp.data;
        } catch (error) {
            return { formats: [] };
        }
    },

    getPendingCheques: async (filters) => {
        try {
            const resp = await api.get(`banking/pending-cheques`, { params: filters });
            return resp.data;
        } catch (error) {
            return [];
        }
    },

    saveChequeFormatSet: async (data) => {
        try {
            await api.post(`banking/save-cheque-format`, data);
            return true;
        } catch (error) {
            throw error.response?.data?.message || 'Failed to save format.';
        }
    },

    getChequeBookLookups: async (companyCode = 'C001') => {
        try {
            const resp = await api.get(`banking/cheque-book-lookups?companyCode=${companyCode}`);
            return resp.data;
        } catch (error) {
            return { accounts: [] };
        }
    },

    saveChequeBook: async (data) => {
        try {
            const resp = await api.post(`banking/cheque-book`, data);
            return resp.data;
        } catch (error) {
            throw error.response?.data?.message || 'Failed to register cheque book.';
        }
    },

    getChequeInHandLookups: async (companyCode = 'C001') => {
        try {
            const resp = await api.get(`banking/cheque-in-hand-lookups?companyCode=${companyCode}`);
            return resp.data;
        } catch (error) {
            return { banks: [] };
        }
    },

    saveChequeInHand: async (data) => {
        try {
            const resp = await api.post(`banking/cheque-in-hand`, data);
            return resp.data;
        } catch (error) {
            throw error.response?.data?.message || 'Failed to register cheques in hand.';
        }
    },

    getNotPresentedLookups: async (companyCode = 'C001') => {
        try {
            const resp = await api.get(`banking/not-presented-lookups?companyCode=${companyCode}`);
            return resp.data;
        } catch (error) {
            return { banks: [] };
        }
    },

    saveNotPresented: async (data) => {
        try {
            const resp = await api.post(`banking/not-presented`, data);
            return resp.data;
        } catch (error) {
            throw error.response?.data?.message || 'Failed to register not presented cheques.';
        }
    }
};
