import React, { useState } from 'react';
import SimpleModal from '../../SimpleModal';
import CalendarModal from '../../CalendarModal';
import TransactionTypeLookupModal from './TransactionTypeLookupModal';
import { 
    Trash2, 
    Calendar, 
    X, 
    Play, 
    RotateCcw,
    Search,
    ChevronDown
} from 'lucide-react';

const CancelledTransactionReportModal = ({ isOpen, onClose }) => {
    const [dateFrom, setDateFrom] = useState('24/04/2026');
    const [dateTo, setDateTo] = useState('24/04/2026');
    const [transactionType, setTransactionType] = useState('');
    const [isAllTypes, setIsAllTypes] = useState(false);
    const [showCalendarFrom, setShowCalendarFrom] = useState(false);
    const [showCalendarTo, setShowCalendarTo] = useState(false);
    const [showTypeLookup, setShowTypeLookup] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleDisplay = () => {
        setLoading(true);
        setTimeout(() => setLoading(false), 1500);
    };

    const handleClear = () => {
        setDateFrom('24/04/2026');
        setDateTo('24/04/2026');
        setTransactionType('');
        setIsAllTypes(false);
    };

    const footer = (
        <div className="w-full flex justify-end gap-3 font-['Tahoma']">
            <button 
                onClick={handleDisplay} 
                disabled={loading}
                className="px-10 h-10 bg-[#0285fd] text-white text-[13px] font-bold rounded-[5px] shadow-md shadow-blue-200 hover:bg-[#0073ff] transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
            >
                <Play size={14} fill="currentColor" /> {loading ? 'Processing...' : 'Display'}
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
                title="CANCEL REPORT"
                maxWidth="max-w-2xl"
                footer={footer}
            >
                <div className="py-1 select-none font-['Tahoma'] space-y-4 text-[12.5px] mt-1 px-1">
                    
                    <div className="bg-slate-50/50 p-4 border border-slate-100 rounded-[5px] space-y-4">
                        
                        {/* Transaction Type Row */}
                        <div className="flex items-center">
                            <label className="font-bold text-black text-[14px] w-[110px] shrink-0">Transaction Type</label>
                            <div className="flex-1 flex items-center gap-4">
                                <div className="flex-1 flex items-center">
                                    <input 
                                        type="text" 
                                        value={transactionType} 
                                        onChange={(e) => setTransactionType(e.target.value)}
                                        disabled={isAllTypes}
                                        className="flex-1 h-10 px-3 border border-gray-300 bg-white rounded-[5px] outline-none font-bold text-[14px] text-slate-700 shadow-sm focus:border-blue-400 disabled:bg-slate-50 disabled:text-slate-400"
                                    />
                                    <button 
                                        onClick={() => setShowTypeLookup(true)}
                                        disabled={isAllTypes}
                                        className="w-11 h-10 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] transition-all shadow-md active:scale-95 ml-2 rounded-[5px] disabled:opacity-50"
                                    >
                                        <Search size={16} />
                                    </button>
                                </div>
                                
                                <div 
                                    className="w-[85px] flex items-center gap-2 px-3 h-10 bg-white border border-gray-300 rounded-[5px] cursor-pointer hover:bg-slate-50 transition-colors shrink-0" 
                                    onClick={() => setIsAllTypes(!isAllTypes)}
                                >
                                    <input 
                                        type="checkbox" 
                                        checked={isAllTypes} 
                                        onChange={() => {}}
                                        className="w-4 h-4 rounded accent-[#0285fd] cursor-pointer"
                                    />
                                    <span className="text-[13px] font-bold text-slate-700">All</span>
                                </div>
                            </div>
                        </div>

                        {/* Date Range Row */}
                        <div className="flex items-center">
                            <div className="flex items-center">
                                <label className="font-bold text-black text-[14px] w-[110px] shrink-0">Date From</label>
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
                                        <Calendar size={16} />
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-center ml-auto">
                                <label className="font-bold text-black text-[14px] mr-3">Date To</label>
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
                                        <Calendar size={16} />
                                    </button>
                                </div>
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

            <TransactionTypeLookupModal 
                isOpen={showTypeLookup}
                onClose={() => setShowTypeLookup(false)}
                onSelect={(type) => { setTransactionType(type); setShowTypeLookup(false); }}
            />
        </>
    );
};

export default CancelledTransactionReportModal;
