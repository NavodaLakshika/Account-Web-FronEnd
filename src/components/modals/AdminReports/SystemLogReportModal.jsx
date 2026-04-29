import React, { useState } from 'react';
import SimpleModal from '../../SimpleModal';
import CalendarModal from '../../CalendarModal';
import { 
    History, 
    Calendar, 
    X, 
    Play, 
    RotateCcw,
    ShieldAlert
} from 'lucide-react';

const SystemLogReportModal = ({ isOpen, onClose }) => {
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
        <div className="bg-slate-50 px-6  w-full flex justify-end gap-3 border-t border-gray-100 mt-4 rounded-b-xl font-['Tahoma']">
            <button 
                onClick={handleDisplay} 
                disabled={loading}
                className="px-10 h-10 bg-[#0285fd] text-white text-[13px] font-bold rounded-[5px] shadow-md shadow-blue-200 hover:bg-[#0073ff] transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
            >
                <Play size={14} /> {loading ? 'Processing...' : 'Display'}
            </button>
            <button 
                onClick={handleClear} 
                className="px-8 h-10 bg-[#00adff] text-white text-[13px] font-bold rounded-[5px] hover:bg-[#0099e6] shadow-md shadow-blue-200 transition-all active:scale-95 border-none flex items-center justify-center gap-2"
            >
                <RotateCcw size={14} /> Clear
            </button>
        </div>
    );

    return (
        <>
            <SimpleModal
                isOpen={isOpen}
                onClose={onClose}
                title="System Log Report"
                maxWidth="max-w-2xl"
                footer={footer}
            >
                <div className="py-1 select-none font-['Tahoma'] space-y-4 text-[12.5px] mt-1">
                    
                     {/* Date Range Selection Section */}
                    <div className="bg-slate-50/50 p-4 border border-slate-100 rounded-[5px] flex items-center justify-center gap-10">
                        
                        {/* Date From */}
                        <div className="flex items-center gap-4">
                            <label className="font-bold text-black text-[14px]">Date From</label>
                            <div className="flex items-center">
                                <input 
                                    type="text" 
                                    value={dateFrom} 
                                    readOnly
                                    className="w-[140px] h-10 px-3 border border-gray-300 bg-white rounded-[5px] outline-none font-bold text-[14px] text-slate-700 cursor-default shadow-sm focus:border-blue-400"
                                />
                                <button 
                                    onClick={() => setShowCalendarFrom(true)}
                                    className="w-11 h-10 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] transition-all shadow-md active:scale-95 ml-2 rounded-[5px]"
                                >
                                    <Calendar size={14} />
                                </button>
                            </div>
                        </div>

                        {/* Date To */}
                        <div className="flex items-center gap-4">
                            <label className="font-bold text-black text-[14px]">Date To</label>
                            <div className="flex items-center">
                                <input 
                                    type="text" 
                                    value={dateTo} 
                                    readOnly
                                    className="w-[140px] h-10 px-3 border border-gray-300 bg-white rounded-[5px] outline-none font-bold text-[14px] text-slate-700 cursor-default shadow-sm focus:border-blue-400"
                                />
                                <button 
                                    onClick={() => setShowCalendarTo(true)}
                                    className="w-11 h-10 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] transition-all shadow-md active:scale-95 ml-2 rounded-[5px]"
                                >
                                    <Calendar size={14} />
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

export default SystemLogReportModal;
