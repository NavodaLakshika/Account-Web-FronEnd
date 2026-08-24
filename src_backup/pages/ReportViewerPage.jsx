import React from 'react';
import { useSearchParams } from 'react-router-dom';
import ReportTemplate from '../components/ReportTemplate';

const ReportViewerPage = () => {
    const [searchParams] = useSearchParams();
    const title = searchParams.get('title') || 'Report';
    const companyCode = searchParams.get('companyCode') || undefined;
    const empCode = searchParams.get('empCode') || undefined;
    const docNo = searchParams.get('docNo') || undefined;

    return (
        <ReportTemplate
            title={title}
            companyCode={companyCode}
            empCode={empCode}
            docNo={docNo}
            isStandalone={true}
            onClose={() => window.close()}
        />
    );
};

export default ReportViewerPage;
