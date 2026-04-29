import React, { useState } from 'react';
import SimpleModal from '../../SimpleModal';
import CalendarModal from '../../CalendarModal';
import { 
    Lock, 
    Calendar, 
    X, 
    RotateCcw, 
    CheckCircle2, 
    Target, 
    ShieldCheck,
    ChevronDown,
    Save
} from 'lucide-react';

const PeriodLockModal = ({ isOpen, onClose }) => {
    const [dateFrom, setDateFrom] = useState('24/04/2026');
    const [dateTo, setDateTo] = useState('24/04/2026');
    const [allCostCenters, setAllCostCenters] = useState(false);
    const [showCalendarFrom, setShowCalendarFrom] = useState(false);
    const [showCalendarTo, setShowCalendarTo] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleClear = () => {
        setAllCostCenters(false);
    };

    const footer = (
        <div className="bg-slate-50 px-6 py-4 w-full flex justify-end gap-3 border-t border-gray-100 mt-4 rounded-b-xl font-['Tahoma']">
            <button 
                onClick={() => setLoading(true)} 
                className="px-10 h-10 bg-[#50af60] text-white text-[13px] font-bold rounded-[5px] shadow-md shadow-green-200 hover:bg-[#24db4e] transition-all active:scale-95 flex items-center justify-center gap-2"
            >
                <ShieldCheck size={14} /> OK
            </button>
            <button 
                onClick={handleClear} 
                className="px-8 h-10 bg-[#00adff] text-white text-[13px] font-bold rounded-[5px] hover:bg-[#0099e6] shadow-md shadow-blue-200 transition-all active:scale-95 border-none flex items-center justify-center gap-2"
            >
                <RotateCcw size={14} /> Cancel
            </button>
            <button 
                onClick={onClose} 
                className="px-8 h-10 bg-[#d13438] text-white text-[13px] font-bold rounded-[5px] shadow-md shadow-red-200 hover:bg-[#a4262c] transition-all active:scale-95 flex items-center justify-center gap-2"
            >
                <X size={14} /> Exit
            </button>
        </div>
    );

    return (
        <>
            <SimpleModal
                isOpen={isOpen}
                onClose={onClose}
                title="Period Lock Facility"
                maxWidth="max-w-4xl"
                footer={footer}
            >
                <div className="py-2 select-none font-['Tahoma'] space-y-6 text-[12.5px] mt-2">
                    
                    {/* Master Style Header */}
                    <div className="border-b border-gray-200 pb-4 mb-2 flex items-center justify-center gap-3">
                        <Lock size={20} className="text-[#0078d4]" />
                        <h2 className="text-[17px] font-bold text-black uppercase tracking-tight">Financial Period Authorization & Lock</h2>
                    </div>

                    {/* Date Selection Section */}
                    <div className="bg-slate-50/50 p-6 border border-slate-100 rounded-[5px] space-y-4">
                        <div className="flex items-center justify-between gap-10">
                            <div className="flex items-center gap-6">
                                {/* Date From */}
                                <div className="flex items-center gap-4">
                                    <label className="font-bold text-gray-700">Date From</label>
                                    <div className="flex items-center border border-gray-300 bg-white rounded-[5px] overflow-hidden shadow-sm focus-within:border-blue-400 transition-all">
                                        <input 
                                            type="text" 
                                            value={dateFrom} 
                                            readOnly
                                            className="w-[120px] h-8 px-3 text-sm outline-none font-bold text-blue-600 cursor-default"
                                        />
                                        <button 
                                            onClick={() => setShowCalendarFrom(true)}
                                            className="h-8 w-8 border-l border-gray-200 bg-gray-50 flex items-center justify-center hover:bg-gray-100 text-gray-500"
                                        >
                                            <Calendar size={14} />
                                        </button>
                                    </div>
                                </div>

                                {/* Date To */}
                                <div className="flex items-center gap-4">
                                    <label className="font-bold text-gray-700">Date To</label>
                                    <div className="flex items-center border border-gray-300 bg-white rounded-[5px] overflow-hidden shadow-sm focus-within:border-blue-400 transition-all">
                                        <input 
                                            type="text" 
                                            value={dateTo} 
                                            readOnly
                                            className="w-[120px] h-8 px-3 text-sm outline-none font-bold text-blue-600 cursor-default"
                                        />
                                        <button 
                                            onClick={() => setShowCalendarTo(true)}
                                            className="h-8 w-8 border-l border-gray-200 bg-gray-50 flex items-center justify-center hover:bg-gray-100 text-gray-500"
                                        >
                                            <Calendar size={14} />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* All Cost Centers Checkbox */}
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <div className="relative w-5 h-5">
                                    <input 
                                        type="checkbox" 
                                        checked={allCostCenters}
                                        onChange={() => setAllCostCenters(!allCostCenters)}
                                        className="sr-only"
                                    />
                                    <div className={`absolute inset-0 border-2 rounded-md transition-all ${allCostCenters ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-300'}`} />
                                    {allCostCenters && <CheckCircle2 size={14} className="absolute inset-0 m-auto text-white" />}
                                </div>
                                <span className="text-[12px] font-bold text-gray-700 uppercase tracking-widest">All Cost Centers</span>
                            </label>
                        </div>
                    </div>

                    {/* Cost Centers Grid Container */}
                    <div className="border border-gray-300 rounded-[5px] overflow-hidden flex flex-col min-h-[350px] bg-white shadow-inner relative">
                        {/* Table Header */}
                        <div className="flex bg-[#f8fafc] border-b border-gray-300 select-none font-bold text-gray-600">
                            <div className="w-12 px-3 py-2 text-center border-r border-gray-200">#</div>
                            <div className="w-40 px-4 py-2 border-r border-gray-200 uppercase tracking-wider text-[11px]">Dept Code</div>
                            <div className="flex-1 px-4 py-2 uppercase tracking-wider text-[11px]">Cost Center Description</div>
                        </div>
                        
                        {/* Empty Grid Area */}
                        <div className="flex-1 bg-slate-50/30 relative flex items-center justify-center">
                            <div className="flex flex-col items-center gap-3 opacity-20">
                                <Target size={48} className="text-slate-400" />
                                <span className="font-bold uppercase tracking-[0.3em] text-slate-500">No Entities Selected</span>
                            </div>
                            
                            {/* Accounting Grid Lines Overlay */}
                            <div className="absolute inset-0 pointer-events-none opacity-[0.03]" 
                                 style={{ backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)', backgroundSize: '40px 32px' }} 
                            />
                        </div>
                    </div>

                    {/* Security Notice Bar */}
                    <div className="flex items-center justify-between px-2 pt-2 border-t border-slate-100 mt-2">
                        <div className="flex items-center gap-2 opacity-50">
                            <Lock size={12} className="text-red-500" />
                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Finalized Periods will be Locked for Editing</span>
                        </div>
                        <span className="text-[10px] font-mono text-slate-400 opacity-50 uppercase">Security Token: ADM_PRD_LCK_882</span>
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

export default PeriodLockModal;
