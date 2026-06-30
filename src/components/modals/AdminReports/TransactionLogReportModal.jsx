import React, { useState } from 'react';
import SimpleModal from '../../SimpleModal';
import CalendarModal from '../../CalendarModal';
import {
    FileText,
    Calendar,
    X,
    Play,
    Zap
} from 'lucide-react';

const TransactionLogReportModal = ({ isOpen, onClose }) => {
    const [dateFrom, setDateFrom] = useState('24/04/2026');
    const [dateTo, setDateTo] = useState('24/04/2026');
    const [showCalendarFrom, setShowCalendarFrom] = useState(false);
    const [showCalendarTo, setShowCalendarTo] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleDisplay = () => {
        setLoading(true);
        setTimeout(() => setLoading(false), 1500);
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
            <SimpleModal
                isOpen={isOpen}
                onClose={onClose}
                title="Transaction Log Report"
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

export default TransactionLogReportModal;
