import React, { useState } from 'react';
import SimpleModal from '../components/SimpleModal';
import { Search, Calendar, X, Printer, RotateCcw } from 'lucide-react';
import CalendarModal from '../components/CalendarModal';

const PrintChequeBoard = ({ isOpen, onClose }) => {
    const [rows, setRows] = useState([
        { selected: false, chqNo: '', date: '', payee: '', amount: '0.00' }
    ]);

    const footer = (
        <div className="bg-slate-50 px-6 py-4 w-full flex justify-end gap-3 border-t border-gray-100 mt-2 rounded-b-xl">
            <button className="px-6 h-10 bg-[#2bb744] text-white text-sm font-black rounded-[5px] shadow-md shadow-green-100 hover:bg-[#259b3a] transition-all active:scale-95 flex items-center justify-center gap-2 uppercase tracking-tight">
                <Printer size={16} /> PRINT SELECTED
            </button>
            <button className="px-6 h-10 bg-[#00adff] text-white text-sm font-black rounded-[5px] hover:bg-[#0099e6] transition-all active:scale-95 flex items-center justify-center gap-2 border-none uppercase tracking-tight">
                <RotateCcw size={16} /> CLEAR FORM
            </button>
        </div>
    );

    // Calendar States
    const [calendar, setCalendar] = useState({ isOpen: false, target: '' });
    const [dates, setDates] = useState({
        from: '01-01-2026',
        to: '31-12-2026'
    });

    const openCalendar = (target) => setCalendar({ isOpen: true, target });
    const closeCalendar = () => setCalendar({ isOpen: false, target: '' });

    const handleDateSelect = (date) => {
        const d = new Date(date);
        const formatted = `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`;
        setDates(prev => ({ ...prev, [calendar.target]: formatted }));
        closeCalendar();
    };

    return (
        <>
            <SimpleModal
                isOpen={isOpen}
                onClose={onClose}
                title="Cheque Printing Utility"
                maxWidth="max-w-[850px]"
                footer={footer}
            >
                <div className="space-y-4 pt-1 font-['Tahoma',_sans-serif]">
                    <div className="border-b border-gray-100 pb-2 flex items-center justify-center">
                        <h2 className="text-[17px] font-mono font-bold text-black uppercase tracking-tight">Cheque Sorting & Batch Printing Facility</h2>
                    </div>

                    {/* Compact Filter Section */}
                    <div className="bg-white/50 backdrop-blur-sm p-6 border border-gray-200 rounded-[8px] shadow-sm space-y-3">
                        
                        {/* Row 1: Payment A/C */}
                        <div className="flex items-center">
                            <label className="w-32 font-bold text-gray-700 text-[12.5px] uppercase">Payment A/C</label>
                            <div className="w-6" />
                            <div className="w-12" />
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

                        {/* Row 2: Print Status */}
                        <div className="flex items-center">
                            <label className="w-32 font-bold text-gray-700 text-[12.5px] uppercase">Print Status</label>
                            <div className="w-6 flex items-center">
                                <input type="checkbox" className="w-4 h-4 rounded-sm border-gray-300 text-[#0078d4]" />
                            </div>
                            <div className="w-12" />
                            <label className="flex items-center cursor-pointer group select-none">
                                <span className="text-[12.5px] font-bold text-slate-600 uppercase tracking-tight group-hover:text-blue-600">Select All Items for Printing</span>
                            </label>
                        </div>

                        {/* Row 3: Cheque Number */}
                        <div className="flex items-center">
                            <label className="w-32 font-bold text-gray-700 text-[12.5px] uppercase">Cheque Number</label>
                            <div className="w-6 flex items-center">
                                <input type="checkbox" className="w-4 h-4 rounded-sm border-gray-300 text-[#0078d4]" />
                            </div>
                            <div className="w-12 text-[10px] font-black text-gray-400 text-center pr-2">FROM</div>
                            <div className="flex-1 flex items-center gap-3">
                                <input type="text" className="flex-1 h-9 border border-gray-300 rounded-[5px] px-3 font-mono font-black text-[#0285fd] text-[13px] outline-none shadow-sm bg-white focus:border-slate-400" />
                                <span className="w-6 text-[10px] font-black text-gray-400 text-center uppercase tracking-tighter">TO</span>
                                <input type="text" className="flex-1 h-9 border border-gray-300 rounded-[5px] px-3 font-mono font-black text-[#0285fd] text-[13px] outline-none shadow-sm bg-white focus:border-slate-400" />
                            </div>
                        </div>

                        {/* Row 4: Document Date */}
                        <div className="flex items-center">
                            <label className="w-32 font-bold text-gray-700 text-[12.5px] uppercase">Document Date</label>
                            <div className="w-6 flex items-center">
                                <input type="checkbox" className="w-4 h-4 rounded-sm border-gray-300 text-[#0078d4]" />
                            </div>
                            <div className="w-12 text-[10px] font-black text-gray-400 text-center pr-2">FROM</div>
                            <div className="flex-1 flex items-center gap-4">
                                <div className="flex-1 flex gap-2">
                                    <input type="text" readOnly value={dates.from} className="flex-1 h-9 border border-gray-300 rounded-[5px] px-3 font-mono font-bold text-slate-800 text-[12.5px] outline-none bg-gray-50/50 shadow-sm" />
                                    <button onClick={() => openCalendar('from')} className="w-10 h-9 bg-white border border-gray-300 text-slate-600 flex items-center justify-center hover:bg-slate-50 rounded-[5px] transition-all shadow-sm active:scale-90 shrink-0">
                                        <Calendar size={15} />
                                    </button>
                                </div>
                                <span className="w-4 text-[10px] font-black text-gray-400 text-center uppercase tracking-tighter">TO</span>
                                <div className="flex-1 flex gap-2">
                                    <input type="text" readOnly value={dates.to} className="flex-1 h-9 border border-gray-300 rounded-[5px] px-3 font-mono font-bold text-slate-800 text-[12.5px] outline-none bg-gray-50/50 shadow-sm" />
                                    <button onClick={() => openCalendar('to')} className="w-10 h-9 bg-white border border-gray-300 text-slate-600 flex items-center justify-center hover:bg-slate-50 rounded-[5px] transition-all shadow-sm active:scale-90 shrink-0">
                                        <Calendar size={15} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Row 5: Entity / Payee */}
                        <div className="flex items-center">
                            <label className="w-32 font-bold text-gray-700 text-[12.5px] uppercase">Entity / Payee</label>
                            <div className="w-6 flex items-center">
                                <input type="checkbox" className="w-4 h-4 rounded-sm border-gray-300 text-[#0078d4]" />
                            </div>
                            <div className="w-12" />
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

                        {/* View Records Row */}
                        <div className="flex justify-end pt-2">
                            <button className="px-10 h-10 bg-[#0285fd] text-white text-[12.5px] font-black rounded-[5px] hover:bg-[#0073ff] transition-all active:scale-95 shadow-md shadow-blue-100 uppercase tracking-widest flex items-center justify-center gap-2">
                                <Search size={16} /> VIEW RECORDS / REFRESH
                            </button>
                        </div>
                    </div>

                    {/* Table Section */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 ml-1">
                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
                            <label className="text-[12px] font-bold text-gray-500 uppercase tracking-widest opacity-80">Pending Sorting Queue</label>
                        </div>
                        <div className="border border-gray-200 rounded-[5px] shadow-sm bg-white overflow-hidden">
                            <div className="max-h-[250px] overflow-y-auto no-scrollbar">
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-[#f8fafd] border-b border-gray-200 text-slate-500 font-black uppercase text-[10.5px] tracking-widest z-10 sticky top-0">
                                        <tr>
                                            <th className="px-3 py-3 border-r border-gray-100 w-12 text-center select-none">SEL.</th>
                                            <th className="px-3 py-3 border-r border-gray-100 w-28">CHQ. NO</th>
                                            <th className="px-4 py-3 border-r border-gray-100 w-36 text-center">ISSUE DATE</th>
                                            <th className="px-4 py-3 border-r border-gray-100">PAYEE / ENTITY TRANSCRIPT</th>
                                            <th className="px-4 py-3 w-32 text-right">VALUE (LKR)</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {rows.map((row, idx) => (
                                            <tr key={idx} className="hover:bg-blue-50/50 transition-colors group">
                                                <td className="px-1 py-1.5 border-r border-gray-50 text-center">
                                                    <input type="checkbox" className="w-[15px] h-[15px] rounded-sm border-gray-300 text-[#0078d4]" />
                                                </td>
                                                <td className="px-3 py-1.5 border-r border-gray-50">
                                                    <input type="text" className="w-full h-8 px-1 font-mono font-black text-[#0285fd] text-[12.5px] outline-none bg-transparent" defaultValue={row.chqNo} />
                                                </td>
                                                <td className="px-3 py-1.5 border-r border-gray-50 text-center text-[12px] font-mono font-bold text-slate-500 uppercase tracking-tighter">17-MAR-2026</td>
                                                <td className="px-3 py-1.5 border-r border-gray-50">
                                                    <input type="text" className="w-full h-8 px-1 font-mono font-black text-slate-700 text-[12.5px] outline-none bg-transparent" defaultValue={row.payee} />
                                                </td>
                                                <td className="px-4 py-1.5 text-right font-mono font-black text-slate-900 text-[13px] tabular-nums tracking-tighter">0.00</td>
                                            </tr>
                                        ))}
                                        <tr className="bg-gray-50/10 h-16">
                                            <td colSpan={5}></td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
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

export default PrintChequeBoard;
