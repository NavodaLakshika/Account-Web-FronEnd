import { bankingService } from './banking.service';

let _tempDocNo = null;

const getTempDocNo = async (company) => {
    if (!_tempDocNo) {
        const result = await bankingService.generateDocNo('MDP', company);
        _tempDocNo = result.docNo;
    }
    return _tempDocNo;
};

export const makeDepositService = {
    getLookups: async (companyCode) => {
        return await bankingService.getCollectionLookups(companyCode);
    },

    generateDocNo: async (companyCode) => {
        return await bankingService.generateDocNo('MDP', companyCode);
    },

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
        const docNo = await getTempDocNo(data.company);
        return await bankingService.saveDeposit({
            Company: data.company,
            CostCenter: data.costCenter,
            PaymentMode: data.payMode,
            DocNo: docNo,
            Items: data.selectedDocNos.map(doc => ({ DocumentNo: doc, Balance: data.totalAmount }))
        });
    },

    applyDeposit: async (data) => {
        const docNo = await getTempDocNo(data.company);
        return await bankingService.saveDeposit({
            Company: data.company,
            CostCenter: data.costCenter,
            PaymentMode: data.payMode,
            DocNo: docNo,
            Items: data.selectedDocNos.map(doc => ({ DocumentNo: doc, Balance: data.totalAmount }))
        });
    }
};
