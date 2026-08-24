import api from './api';
import { getCompanyCode } from '../utils/session';

export const customerInvoiceService = {
    /**
     * Fetches customers + sub-accounts for the lookup dropdowns.
     * Maps to GET api/customerinvoice/lookups
     */
    getLookups: async (companyCode = getCompanyCode()) => {
        try {
            const resp = await api.get(`customerinvoice/lookups?companyCode=${companyCode}`);
            return resp.data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Generates the next CIV document number via ACC_sp_CallDocNumber with @TransId='CIV'.
     * Maps to GET api/customerinvoice/gen-docno
     */
    generateDocNo: async (companyCode = getCompanyCode()) => {
        try {
            const resp = await api.get(`customerinvoice/gen-docno?companyCode=${companyCode}`);
            return resp.data; // { docNo: "CIVxxx000001" }
        } catch (error) {
            return { docNo: '' };
        }
    },

    /**
     * Saves the Customer Invoice record.
     * Maps to POST api/customerinvoice/save
     */
    save: async (data) => {
        try {
            const resp = await api.post('customerinvoice/save', data);
            return resp.data;
        } catch (error) {
            throw error.response?.data?.message || 'Failed to save customer invoice.';
        }
    }
};
