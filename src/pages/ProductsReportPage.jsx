import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import ReportTemplate from '../components/ReportTemplate';
import { reportService } from '../services/report.service';
import { Loader2 } from 'lucide-react';

const ProductsReportPage = ({ companyCodeProp, companyNameProp }) => {
    const [searchParams] = useSearchParams();
    const companyId = companyCodeProp || searchParams.get('company') || 'COM001';
    const companyName = companyNameProp || searchParams.get('name') || 'ONIMTA IT SOLUTIONS';
    
    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const results = await reportService.getProductsReport(companyId);
                setData(results);
            } catch (error) {
                console.error("Failed to load products report data:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [companyId]);

    if (isLoading) {
        return (
            <div className="h-screen w-screen flex flex-col items-center justify-center bg-white gap-4">
                <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
                <p className="text-[12px] font-black uppercase tracking-[0.3em] text-slate-400">Preparing Report Assets...</p>
            </div>
        );
    }

    return (
        <ReportTemplate
            title="Products Report"
            subtitle="Detailed Product Stock and Pricing"
            data={data}
            companyName={companyName}
            isStandalone={true}
        />
    );
};

export default ProductsReportPage;
