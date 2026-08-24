import React, { useState } from 'react';
import SimpleModal from '../../SimpleModal';
import CalendarModal from '../../CalendarModal';
import TransactionTypeLookupModal from './TransactionTypeLookupModal';
import {
    Trash2,
    Calendar,
    X,
    Play,
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
        <div className="w-full flex justify-end border-t border-gray-200 rounded-b-xl font-['Tahoma']">
            <button
                onClick={handleDisplay}
                disabled={loading}
                className="px-7 h-8 bg-[#0285fd] text-slate-800 dark:text-white text-[11px] font-bold rounded-[4px] shadow-sm shadow-blue-200 hover:bg-[#0073ff] transition-all active:scale-95 flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
                <Play size={11} fill="currentColor" /> {loading ? 'Processing...' : 'Display'}
            </button>
        </div>
    );

    return (
        <>
            <SimpleModal
                isOpen={isOpen}
                onClose={onClose}
                title="CANCEL REPORT"
                maxWidth="max-w-[700px]"
                footer={footer}
            >
                <div className="py-1 select-none font-['Tahoma'] space-y-3 text-[11px] mt-1 px-1">

                    <div className="bg-slate-50/50 p-3 border border-slate-100 rounded-[4px] space-y-3">

                        {/* Transaction Type Row */}
                        <div className="flex items-center">
                            <label className="font-bold text-black text-[12px] w-[90px] shrink-0">Transaction Type</label>
                            <div className="flex-1 flex items-center gap-2">
                                <div className="flex-1 flex items-center">
                                    <input
                                        type="text"
                                        value={transactionType}
                                        onChange={(e) => setTransactionType(e.target.value)}
                                        disabled={isAllTypes}
                                        className="flex-1 h-8 px-2.5 border border-gray-300 bg-white rounded-[4px] outline-none font-bold text-[12px] text-slate-700 shadow-sm focus:border-blue-400 disabled:bg-slate-50 disabled:text-slate-500 dark:text-slate-400 appearance-none"
                                     style={{ backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.5rem center', backgroundSize: '1em' }} />
                                </div>

                                <div
                                    className="w-[75px] flex items-center gap-1.5 px-2 h-8 bg-white border border-gray-300 rounded-[4px] cursor-pointer hover:bg-slate-50 transition-colors shrink-0"
                                    onClick={() => setIsAllTypes(!isAllTypes)}
                                >
                                    <input
                                        type="checkbox"
                                        checked={isAllTypes}
                                        onChange={() => { }}
                                        className="w-3.5 h-3.5 rounded accent-[#0285fd] cursor-pointer"
                                    />
                                    <span className="text-[11px] font-bold text-slate-700">All</span>
                                </div>
                            </div>
                        </div>

                        {/* Date Range Row */}
                        <div className="flex items-center">
                            <div className="flex items-center">
                                <label className="font-bold text-black text-[12px] w-[90px] shrink-0">Date From</label>
                                <div className="flex items-center">
                                    <input
                                        type="text"
                                        value={dateFrom}
                                        readOnly
                                        className="w-[115px] h-8 px-2.5 border border-gray-300 bg-white rounded-[4px] outline-none font-bold text-[12px] text-slate-700 cursor-default shadow-sm focus:border-blue-400"
                                    />
                                    <button
                                        onClick={() => setShowCalendarFrom(true)}
                                        className="w-9 h-8 bg-[#0285fd] text-slate-800 dark:text-white flex items-center justify-center hover:bg-[#0073ff] transition-all shadow-sm active:scale-95 ml-1.5 rounded-[4px]"
                                    >
                                        <Calendar size={11} />
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-center ml-auto">
                                <label className="font-bold text-black text-[12px] mr-2">Date To</label>
                                <div className="flex items-center">
                                    <input
                                        type="text"
                                        value={dateTo}
                                        readOnly
                                        className="w-[115px] h-8 px-2.5 border border-gray-300 bg-white rounded-[4px] outline-none font-bold text-[12px] text-slate-700 cursor-default shadow-sm focus:border-blue-400"
                                    />
                                    <button
                                        onClick={() => setShowCalendarTo(true)}
                                        className="w-9 h-8 bg-[#0285fd] text-slate-800 dark:text-white flex items-center justify-center hover:bg-[#0073ff] transition-all shadow-sm active:scale-95 ml-1.5 rounded-[4px]"
                                    >
                                        <Calendar size={11} />
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




