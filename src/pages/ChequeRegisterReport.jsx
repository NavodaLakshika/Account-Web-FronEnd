import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import ReportTemplate from '../components/ReportTemplate';
import { Loader2 } from 'lucide-react';

const ChequeRegisterReport = ({ companyCodeProp, companyNameProp }) => {
    const [searchParams] = useSearchParams();
    const storedCompany = (() => { try { return JSON.parse(localStorage.getItem('selectedCompany') || 'null'); } catch (e) { return null; } })();
    const companyId = companyCodeProp || searchParams.get('company') || storedCompany?.Company_Id || storedCompany?.companyId || storedCompany?.code || storedCompany?.companyCode || '';
    const companyName = companyNameProp || searchParams.get('name') || storedCompany?.CompanyName || storedCompany?.companyName || '';
    
    // The ReportTemplate component handles its own data fetching based on the title prop.
    // By passing "Cheque Register", it will automatically call /api/report/cheque-register

    return (
        <ReportTemplate
            title="Cheque Register"
            subtitle="Complete Cheque Transaction History"
            companyName={companyName}
            companyCode={companyId}
            isStandalone={false}
        />
    );
};

export default ChequeRegisterReport;
