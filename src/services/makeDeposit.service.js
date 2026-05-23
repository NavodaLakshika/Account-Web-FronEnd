import { bankingService } from './banking.service';

export const makeDepositService = {
    getUndepositedFunds: async (company, costCenter, payMode, dateFrom, dateTo) => {
        return await bankingService.getCollections({
            company,
            costCenter,
            paymentMode: payMode,
            dateFrom,
            dateTo
        });
    },

    saveDraft: async (data) => {
        // Map to the banking service deposit which saves to temp table
        return await bankingService.saveDeposit({
            Company: data.company,
            CostCenter: data.costCenter,
            PaymentMode: data.payMode,
            DocNo: 'TEMP_DEP', // Needs real doc no if implemented fully
            Items: data.selectedDocNos.map(doc => ({ DocumentNo: doc, Balance: 0 }))
        });
    },

    applyDeposit: async (data) => {
        // Map to saveDeposit for now as placeholder for apply
        return await bankingService.saveDeposit({
            Company: data.company,
            CostCenter: data.costCenter,
            PaymentMode: data.payMode,
            DocNo: 'TEMP_DEP',
            Items: data.selectedDocNos.map(doc => ({ DocumentNo: doc, Balance: 0 }))
        });
    }
};
