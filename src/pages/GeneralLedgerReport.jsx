import React from 'react';
import { useSearchParams } from 'react-router-dom';
import ReportTemplate from '../components/ReportTemplate';

const GeneralLedgerReport = ({ companyCodeProp, companyNameProp }) => {
    const [searchParams] = useSearchParams();
    const companyId = companyCodeProp || searchParams.get('company') || 'COM001';
    const companyName = companyNameProp || searchParams.get('name') || 'ONIMTA IT SOLUTIONS';
    
    return (
        <ReportTemplate
            title="General Ledger"
            subtitle="Detailed Account Transactions"
            companyName={companyName}
            companyCode={companyId}
            isStandalone={false}
        />
    );
};

export default GeneralLedgerReport;
