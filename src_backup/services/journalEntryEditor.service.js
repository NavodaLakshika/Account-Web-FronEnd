import api from './api';

export const journalEntryEditorService = {
    loadEntries: async (docNo, company) => {
        const response = await api.get('/JournalEntryEditor/load', {
            params: { docNo, company }
        });
        return response.data;
    },

    updateRow: async (payload) => {
        const response = await api.post('/JournalEntryEditor/update-row', payload);
        return response.data;
    },

    applyChanges: async (docNo, company, user) => {
        const response = await api.post('/JournalEntryEditor/apply', null, {
            params: { docNo, company, user }
        });
        return response.data;
    },

    getLookups: async () => {
        const response = await api.get('/JournalEntryEditor/lookups');
        return response.data;
    },

    searchJournals: async (company, query = '') => {
        const response = await api.get('/JournalEntryEditor/search', {
            params: { company, query }
        });
        return response.data;
    },

    deleteRow: async (id, company) => {
        const response = await api.delete(`/JournalEntryEditor/delete-row/${id}`, {
            params: { company }
        });
        return response.data;
    }
};
