import React, { useState, useEffect } from 'react';
import ReportTemplate from '../components/ReportTemplate';
import { Loader2 } from 'lucide-react';
import { systemLogService } from '../services/systemLog.service';

const SystemAnalyticsReportPage = () => {
    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchReportData = async () => {
            try {
                const response = await systemLogService.getAllLogs();
                // Map the API response to match the table columns if necessary
                const formattedData = response.map(log => ({
                    id: log.id || log.Id || log.logId || log.LogId,
                    date: log.date || log.Date || log.createdAt || log.CreatedAt,
                    action: log.action || log.Action || log.actionPerformed || log.ActionPerformed,
                    user: log.user || log.User || log.userName || log.UserName,
                    ip: log.ip || log.Ip || log.ipAddress || log.IpAddress,
                    status: log.status || log.Status
                }));
                setData(formattedData);
            } catch (error) {
                console.error("Failed to fetch system logs", error);
                setData([]);
            } finally {
                setIsLoading(false);
            }
        };
        fetchReportData();
    }, []);

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
            title="System Log & Audit Report"
            subtitle="Global Audit Trail"
            data={data}
            columns={[
                { header: 'Log ID', key: 'id' },
                { header: 'Date', key: 'date' },
                { header: 'Action Performed', key: 'action' },
                { header: 'User', key: 'user' },
                { header: 'IP Address', key: 'ip' },
                { header: 'Status', key: 'status' }
            ]}
            companyName="ONIMTA INFORMATION TECHNOLOGY (PVT) LTD"
            isStandalone={true}
        />
    );
};

export default SystemAnalyticsReportPage;
