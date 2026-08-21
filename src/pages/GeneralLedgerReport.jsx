import React from 'react';
import { useSearchParams } from 'react-router-dom';
import ReportTemplate from '../components/ReportTemplate';

const GeneralLedgerReport = ({ companyCodeProp, companyNameProp }) => {
    const [searchParams] = useSearchParams();
    const storedCompany = (() => { try { return JSON.parse(localStorage.getItem('selectedCompany') || 'null'); } catch (e) { return null; } })();
    const companyId = companyCodeProp || searchParams.get('company') || storedCompany?.Company_Id || storedCompany?.companyId || storedCompany?.code || storedCompany?.companyCode || '';
    const companyName = companyNameProp || searchParams.get('name') || storedCompany?.CompanyName || storedCompany?.companyName || '';
    
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
