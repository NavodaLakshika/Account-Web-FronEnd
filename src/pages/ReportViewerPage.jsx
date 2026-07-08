import React from 'react';
import { useSearchParams } from 'react-router-dom';
import ReportTemplate from '../components/ReportTemplate';

const ReportViewerPage = () => {
    const [searchParams] = useSearchParams();
    const title = searchParams.get('title') || 'Report';
    const companyCode = searchParams.get('companyCode') || undefined;
    const empCode = searchParams.get('empCode') || undefined;

    return (
        <ReportTemplate
            title={title}
            companyCode={companyCode}
            empCode={empCode}
            isStandalone={true}
            onClose={() => window.close()}
        />
    );
};

export default ReportViewerPage;
