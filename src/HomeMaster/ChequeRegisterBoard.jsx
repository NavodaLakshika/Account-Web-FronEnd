import React, { useState } from 'react';
import SimpleModal from '../components/SimpleModal';
import { Search, Calendar, X, Save, RotateCcw } from 'lucide-react';
import CalendarModal from '../components/CalendarModal';

const ChequeRegisterBoard = ({ isOpen, onClose }) => {
    // Calendar States
    const [calendar, setCalendar] = useState({ isOpen: false, target: '' });
    const [formData, setFormData] = useState({
        account: '',
        bookNo: '1',
        date: '17-03-2026',
        startNo: '',
        endNo: ''
    });

    const openCalendar = (target) => setCalendar({ isOpen: true, target });
    const closeCalendar = () => setCalendar({ isOpen: false, target: '' });

    const handleDateSelect = (date) => {
        const d = new Date(date);
        const formatted = `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`;
        setFormData(prev => ({ ...prev, date: formatted }));
        closeCalendar();
    };

    const footer = (
        <div className="bg-slate-50 px-6 py-4 w-full flex justify-end gap-3 border-t border-gray-100 mt-2 rounded-b-xl">
            <button className="px-8 h-10 bg-[#2bb744] text-white text-sm font-black rounded-[5px] shadow-md shadow-green-100 hover:bg-[#259b3a] transition-all active:scale-95 flex items-center justify-center gap-2 uppercase tracking-tight">
                <Save size={14} /> SAVE RECORD
            </button>
            <button className="px-8 h-10 bg-[#00adff] text-white text-sm font-black rounded-[5px] hover:bg-[#0099e6] transition-all active:scale-95 flex items-center justify-center gap-2 border-none uppercase tracking-tight">
                <RotateCcw size={14} /> CLEAR FORM
            </button>
        </div>
    );

    return (
        <>
            <SimpleModal
                isOpen={isOpen}
                onClose={onClose}
                title="Cheque Register Management"
                maxWidth="max-w-[700px]"
                footer={footer}
            >
                <div className="space-y-4 pt-1 font-['Tahoma',_sans-serif]">
                    <div className="border-b border-gray-100 pb-2 flex items-center justify-center">
                        <h2 className="text-[17px] font-mono font-bold text-black uppercase tracking-tight text-center">Enter New Cheque Book Configuration</h2>
                    </div>

                    {/* Compact Filter Section */}
                    <div className="bg-white/50 backdrop-blur-sm p-6 border border-gray-200 rounded-[8px] shadow-sm space-y-3">
                        
                        {/* Row 1: Account */}
                        <div className="flex items-center">
                            <label className="w-32 font-bold text-gray-700 text-[12.5px] uppercase">Account</label>
                            <div className="flex-1 flex gap-2">
                                <input 
                                    type="text" 
                                    readOnly 
                                    className="flex-1 h-9 border border-gray-300 rounded-[5px] px-3 font-mono font-bold text-slate-800 text-[12.5px] outline-none shadow-sm bg-gray-50" 
                                />
                                <button className="w-10 h-9 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[5px] transition-all shadow-md active:scale-95 shrink-0">
                                    <Search size={16} />
                                </button>
                            </div>
                        </div>

                        {/* Row 2: Book Number */}
                        <div className="flex items-center">
                            <label className="w-32 font-bold text-gray-700 text-[12.5px] uppercase">Book Number</label>
                            <div className="flex-1">
                                <input 
                                    type="text" 
                                    value={formData.bookNo}
                                    className="w-full h-9 border border-gray-300 rounded-[5px] px-3 font-mono font-black text-[#0285fd] text-[13px] outline-none shadow-sm bg-white focus:border-slate-400" 
                                />
                            </div>
                        </div>

                        {/* Row 3: Date */}
                        <div className="flex items-center">
                            <label className="w-32 font-bold text-gray-700 text-[12.5px] uppercase">Date</label>
                            <div className="flex-1 flex gap-2">
                                <input 
                                    type="text" 
                                    readOnly 
                                    value={formData.date}
                                    className="flex-1 h-9 border border-gray-300 rounded-[5px] px-3 font-mono font-bold text-slate-800 text-[12.5px] outline-none bg-gray-50/50 shadow-sm" 
                                />
                                <button onClick={() => openCalendar('date')} className="w-10 h-9 bg-white border border-gray-300 text-slate-600 flex items-center justify-center hover:bg-slate-50 rounded-[5px] transition-all shadow-sm active:scale-90 shrink-0">
                                    <Calendar size={15} />
                                </button>
                            </div>
                        </div>

                        {/* Row 4: Start NO */}
                        <div className="flex items-center">
                            <label className="w-32 font-bold text-gray-700 text-[12.5px] uppercase">Start NO</label>
                            <div className="flex-1">
                                <input 
                                    type="text" 
                                    placeholder="Enter series start"
                                    className="w-full h-9 border border-gray-300 rounded-[5px] px-3 font-mono font-black text-[#0285fd] text-[13px] outline-none shadow-sm bg-white focus:border-slate-400" 
                                />
                            </div>
                        </div>

                        {/* Row 5: End NO */}
                        <div className="flex items-center">
                            <label className="w-32 font-bold text-gray-700 text-[12.5px] uppercase">End NO</label>
                            <div className="flex-1">
                                <input 
                                    type="text" 
                                    placeholder="Enter series end"
                                    className="w-full h-9 border border-gray-300 rounded-[5px] px-3 font-mono font-black text-[#0285fd] text-[13px] outline-none shadow-sm bg-white focus:border-slate-400" 
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 ml-1 opacity-70">
                        <div className="w-1 h-1 bg-gray-400 rounded-full" />
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-[9px]">Ensure series range does not overlap with existing books</span>
                    </div>
                </div>
            </SimpleModal>

            <CalendarModal 
                isOpen={calendar.isOpen}
                onClose={closeCalendar}
                onSelect={handleDateSelect}
            />
        </>
    );
};

export default ChequeRegisterBoard;
