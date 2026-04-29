import React, { useState } from 'react';
import SimpleModal from '../../SimpleModal';
import { 
    RefreshCw, 
    Calendar, 
    ChevronDown, 
    Play, 
    Save, 
    X,
    RotateCcw,
    Table,
    Search
} from 'lucide-react';

import CalendarModal from '../../CalendarModal';

const StockBalanceUpdateModal = ({ isOpen, onClose }) => {
    const [asAtDate, setAsAtDate] = useState('24/04/2026');
    const [loading, setLoading] = useState(false);
    const [stockData, setStockData] = useState([]);
    const [showCalendar, setShowCalendar] = useState(false);

    const handleDateSelect = (date) => {
        setAsAtDate(date);
        setShowCalendar(false);
    };

    const handleClear = () => {
        setStockData([]);
    };

    const footer = (
        <div className="bg-slate-50 px-6 py-4 w-full flex justify-end gap-3 border-t border-gray-100 mt-4 rounded-b-xl font-['Tahoma']">
            <button 
                onClick={() => setLoading(true)} 
                className="px-8 h-10 bg-[#50af60] text-white text-[13px] font-bold rounded-[5px] shadow-md shadow-green-200 hover:bg-[#24db4e] transition-all active:scale-95 flex items-center justify-center gap-2"
            >
                <Save size={14} /> Save
            </button>
        </div>
    );

    return (
        <SimpleModal
            isOpen={isOpen}
            onClose={onClose}
            title="Stock Balance Update"
            maxWidth="max-w-4xl"
            footer={footer}
        >
            <div className="py-2 select-none font-['Tahoma'] space-y-6 text-[12.5px] mt-2">
                
                {/* Master Style Header */}
                <div className="border-b border-gray-200 pb-4 mb-2 flex items-center justify-center gap-3">
                    <RefreshCw size={20} className="text-[#0078d4]" />
                    <h2 className="text-[17px] font-bold text-black uppercase tracking-tight">System Stock Balance Synchronization</h2>
                </div>

                {/* Top Controls Row */}
                <div className="flex items-center justify-center gap-10 bg-slate-50/50 p-6 border border-slate-100 rounded-[5px]">
                    <div className="flex items-center gap-4">
                        <label className="font-bold text-gray-700">As at date</label>
                        <div className="flex items-center border border-gray-300 bg-white rounded-[5px] overflow-hidden shadow-sm focus-within:border-blue-400 transition-all">
                            <input 
                                type="text" 
                                value={asAtDate} 
                                onChange={(e) => setAsAtDate(e.target.value)}
                                className="w-[140px] h-8 px-3 text-sm outline-none font-bold text-blue-600"
                            />
                            <button 
                                onClick={() => setShowCalendar(true)}
                                className="h-8 w-8 border-l border-gray-200 bg-gray-50 flex items-center justify-center hover:bg-gray-100 text-gray-500"
                            >
                                <Calendar size={14} />
                            </button>
                        </div>
                    </div>
                    
                    <button 
                        className="px-10 h-8 bg-[#0285fd] text-white text-[12px] font-bold uppercase tracking-widest rounded-[5px] hover:bg-[#0073ff] transition-all shadow-md active:scale-95 flex items-center gap-2"
                    >
                        <Search size={14} /> Load
                    </button>
                </div>

                {/* Stock Value Table Container */}
                <div className="border border-gray-300 rounded-[5px] overflow-hidden flex flex-col min-h-[350px] bg-white shadow-inner">
                    {/* Table Header */}
                    <div className="flex bg-[#f8fafc] border-b border-gray-300 select-none font-bold text-gray-600">
                        <div className="w-12 px-3 py-2 text-center border-r border-gray-200">#</div>
                        <div className="w-40 px-4 py-2 border-r border-gray-200 uppercase tracking-wider text-[11px]">Item Code</div>
                        <div className="flex-1 px-4 py-2 border-r border-gray-200 uppercase tracking-wider text-[11px]">Item Description</div>
                        <div className="w-40 px-4 py-2 text-right uppercase tracking-wider text-[11px]">Stock Value</div>
                    </div>
                    
                    {/* Empty State / Grid Background */}
                    <div className="flex-1 bg-slate-50/30 relative flex items-center justify-center">
                        <div className="flex flex-col items-center gap-3 opacity-20">
                            <Table size={48} className="text-slate-400" />
                            <span className="font-bold uppercase tracking-[0.3em] text-slate-500">No Data Loaded</span>
                        </div>
                        
                        {/* Accounting Grid Lines Overlay */}
                        <div className="absolute inset-0 pointer-events-none opacity-[0.03]" 
                             style={{ backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)', backgroundSize: '40px 40px' }} 
                        />
                    </div>
                </div>

                {/* System Info Bar */}
                <div className="flex items-center justify-between px-2 pt-2">
                    <div className="flex items-center gap-2 opacity-50">
                        <RotateCcw size={12} className="text-blue-500" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Auto-Sync Enabled</span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 opacity-50 uppercase">Ready for Inventory Reconciliation</span>
                </div>

            </div>

            <CalendarModal 
                isOpen={showCalendar}
                onClose={() => setShowCalendar(false)}
                onDateSelect={handleDateSelect}
                initialDate={asAtDate}
            />
        </SimpleModal>
    );
};

export default StockBalanceUpdateModal;
