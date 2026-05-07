import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import ReportTemplate from '../components/ReportTemplate';
import { reportService } from '../services/report.service';
import { Loader2 } from 'lucide-react';

const ItemsServicesReportPage = () => {
    const [searchParams] = useSearchParams();
    const companyId = searchParams.get('company') || 'COM001';
    const companyName = searchParams.get('name') || 'ONIMTA IT SOLUTIONS';
    
    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const results = await reportService.getItemsServices(companyId);
                setData(results);
            } catch (error) {
                console.error("Failed to load report data:", error);
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
            title="Items & Services Report"
            subtitle="Detailed Product and Account Mappings"
            data={data}
            columns={[
                { header: 'Code', key: 'prodCode' },
                { header: 'Description', key: 'prodName' },
                { header: 'Income Account', key: 'incomeAccount' },
                { header: 'Expense Account', key: 'expenseAccount' },
                { header: 'Purchase Price', key: 'purchasePrice', align: 'right', format: (v) => v?.toFixed(2) },
                { header: 'Selling Price', key: 'sellingPrice', align: 'right', format: (v) => v?.toFixed(2) }
            ]}
            companyName={companyName}
            isStandalone={true}
        />
    );
};

export default ItemsServicesReportPage;
