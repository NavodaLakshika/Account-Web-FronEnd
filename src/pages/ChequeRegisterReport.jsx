import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import ReportTemplate from '../components/ReportTemplate';
import { Loader2 } from 'lucide-react';

const ChequeRegisterReport = ({ companyCodeProp, companyNameProp }) => {
    const [searchParams] = useSearchParams();
    const companyId = companyCodeProp || searchParams.get('company') || 'COM001';
    const companyName = companyNameProp || searchParams.get('name') || 'ONIMTA IT SOLUTIONS';
    
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
