import React, { useState } from 'react';
import SimpleModal from '../../SimpleModal';
import CalendarModal from '../../CalendarModal';
import ReportTemplate from '../../ReportTemplate';
import { systemLogService } from '../../../services/systemLog.service';
import { 
    History, 
    Calendar, 
    X, 
    Play, 
    ShieldAlert
} from 'lucide-react';

const SystemLogReportModal = ({ isOpen, onClose }) => {
    const [dateFrom, setDateFrom] = useState('24/04/2026');
    const [dateTo, setDateTo] = useState('24/04/2026');
    const [showCalendarFrom, setShowCalendarFrom] = useState(false);
    const [showCalendarTo, setShowCalendarTo] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showReport, setShowReport] = useState(false);
    const [reportData, setReportData] = useState([]);

    const handleDisplay = async () => {
        setLoading(true);
        try {
            const response = await systemLogService.getAllLogs();
            const formattedData = response.map(log => ({
                id: log.id || log.Id || log.logId || log.LogId,
                date: log.date || log.Date || log.createdAt || log.CreatedAt,
                action: log.action || log.Action || log.actionPerformed || log.ActionPerformed,
                user: log.user || log.User || log.userName || log.UserName,
                ip: log.ip || log.Ip || log.ipAddress || log.IpAddress,
                status: log.status || log.Status
            }));
            // Filter by date range if needed here, or pass dates to the backend API
            setReportData(formattedData);
            setShowReport(true);
        } catch (error) {
            console.error("Failed to fetch logs", error);
            setReportData([]);
        } finally {
            setLoading(false);
        }
    };

    const handleClear = () => {
        setDateFrom('24/04/2026');
        setDateTo('24/04/2026');
    };

    const footer = (
        <div className="w-full flex justify-end border-t border-gray-200 rounded-b-xl font-['Tahoma']">
            <button 
                onClick={handleDisplay} 
                disabled={loading}
                className="px-7 h-8 bg-[#0285fd] text-white text-[11px] font-bold rounded-[4px] shadow-sm shadow-blue-200 hover:bg-[#0073ff] transition-all active:scale-95 flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
                <Play size={11} /> {loading ? 'Processing...' : 'Display'}
            </button>
        </div>
    );

    return (
        <>
            {showReport ? (
                <div className="fixed inset-0 z-[200]">
                    <div className="absolute top-4 right-4 z-[300]">
                        <button 
                            onClick={() => setShowReport(false)} 
                            className="w-10 h-10 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg transition-all active:scale-95"
                        >
                            <X size={28} />
                        </button>
                    </div>
                    <ReportTemplate
                        title="System Log & Audit Report"
                        subtitle={`Audit Trail From ${dateFrom} To ${dateTo}`}
                        data={reportData}
                        columns={[
                            { header: 'Log ID', key: 'id' },
                            { header: 'Date', key: 'date' },
                            { header: 'Action Performed', key: 'action' },
                            { header: 'User', key: 'user' },
                            { header: 'IP Address', key: 'ip' },
                            { header: 'Status', key: 'status' }
                        ]}
                        companyName="Super Admin Portal"
                        isStandalone={true}
                    />
                </div>
            ) : (
            <SimpleModal
                isOpen={isOpen}
                onClose={onClose}
                title="System Log Report"
                maxWidth="max-w-[700px]"
                footer={footer}
            >
                <div className="py-1 select-none font-['Tahoma'] space-y-3 text-[11px] mt-1">
                    
                     {/* Date Range Selection Section */}
                    <div className="bg-slate-50/50 p-3 border border-slate-100 rounded-[4px] flex items-center justify-center gap-5">
                        
                        {/* Date From */}
                        <div className="flex items-center gap-3">
                            <label className="font-bold text-black text-[12px]">Date From</label>
                            <div className="flex items-center">
                                <input 
                                    type="text" 
                                    value={dateFrom} 
                                    readOnly
                                    className="w-[115px] h-8 px-2.5 border border-gray-300 bg-white rounded-[4px] outline-none font-bold text-[12px] text-slate-700 cursor-default shadow-sm focus:border-blue-400"
                                />
                                <button 
                                    onClick={() => setShowCalendarFrom(true)}
                                    className="w-9 h-8 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] transition-all shadow-sm active:scale-95 ml-1.5 rounded-[4px]"
                                >
                                    <Calendar size={11} />
                                </button>
                            </div>
                        </div>

                        {/* Date To */}
                        <div className="flex items-center gap-3">
                            <label className="font-bold text-black text-[12px]">Date To</label>
                            <div className="flex items-center">
                                <input 
                                    type="text" 
                                    value={dateTo} 
                                    readOnly
                                    className="w-[115px] h-8 px-2.5 border border-gray-300 bg-white rounded-[4px] outline-none font-bold text-[12px] text-slate-700 cursor-default shadow-sm focus:border-blue-400"
                                />
                                <button 
                                    onClick={() => setShowCalendarTo(true)}
                                    className="w-9 h-8 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] transition-all shadow-sm active:scale-95 ml-1.5 rounded-[4px]"
                                >
                                    <Calendar size={11} />
                                </button>
                            </div>
                        </div>

                    </div>   
                </div>
            </SimpleModal>
            )}

            {/* Calendar Modals */}
            <CalendarModal 
                isOpen={showCalendarFrom}
                onClose={() => setShowCalendarFrom(false)}
                onDateSelect={(date) => { setDateFrom(date); setShowCalendarFrom(false); }}
                initialDate={dateFrom}
            />
            <CalendarModal 
                isOpen={showCalendarTo}
                onClose={() => setShowCalendarTo(false)}
                onDateSelect={(date) => { setDateTo(date); setShowCalendarTo(false); }}
                initialDate={dateTo}
            />
        </>
    );
};

export default SystemLogReportModal;
