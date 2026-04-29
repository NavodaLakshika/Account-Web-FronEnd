import React, { useState, useEffect } from 'react';
import SimpleModal from '../../SimpleModal';
import CalendarModal from '../../CalendarModal';
import { Save, RotateCcw, X, Search, Calendar, PlusCircle } from 'lucide-react';
import { fixedAssetService } from '../../../services/fixedAsset.service';
import { toast } from 'react-hot-toast';

const FixedExpensesBoard = ({ isOpen, onClose }) => {
    const initialState = {
        ExpenseAccCode: '',
        ExpenseAccName: '',
        Vendor: '',
        DebitDate: new Date().toISOString().split('T')[0],
        Amount: '0.00',
        CurrentUser: 'SYSTEM'
    };

    const [formData, setFormData] = useState(initialState);
    const [accounts, setAccounts] = useState([]);
    const [showAccountSearch, setShowAccountSearch] = useState(false);
    const [accSearchQuery, setAccSearchQuery] = useState('');
    const [showDateModal, setShowDateModal] = useState(false);
    const [records, setRecords] = useState([]);

    useEffect(() => {
        if (isOpen) {
            fetchLookups();
        }
    }, [isOpen]);

    const fetchLookups = async () => {
        try {
            const data = await fixedAssetService.getLookups();
            const formatted = [];
            let lastCode = "";
            data.forEach(item => {
                if (item.sub_Code !== lastCode) {
                    formatted.push({ code: item.sub_Code, name: item.sub_Acc_Name, isMain: true });
                    lastCode = item.sub_Code;
                }
                if (item.sub_Cust_Acc_Code) {
                    formatted.push({ code: item.sub_Cust_Acc_Code, name: `      ${item.sub_Cust_Acc_Name}`, isMain: false });
                }
            });
            setAccounts(formatted);
        } catch (error) {
            console.error('Lookup fetch error:', error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleAccountSelect = (code, name) => {
        setFormData(prev => ({ ...prev, ExpenseAccCode: code, ExpenseAccName: name.trim() }));
        setShowAccountSearch(false);
    };

    const handleDateSelect = (date) => {
        setFormData(prev => ({ ...prev, DebitDate: date }));
    };

    const handleClear = () => {
        setFormData(initialState);
    };

    const handleSave = () => {
        if (!formData.ExpenseAccCode || !formData.Vendor || !formData.Amount) {
            toast.error('Please fill all required fields.');
            return;
        }
        toast.success('Expense Record Saved Successfully');
    };

    return (
        <>
            <SimpleModal
                isOpen={isOpen}
                onClose={onClose}
                title="Fixed Expenses"
                maxWidth="max-w-4xl"
                footer={
                    <div className="bg-slate-50 px-6 w-full flex justify-end gap-3 border-t border-gray-100 mt-1 rounded-b-xl">
                        <button onClick={handleSave} className="px-6 h-10 bg-[#50af60] text-white text-[13px] font-bold rounded-[5px] shadow-md shadow-green-200 hover:bg-[#24db4e] transition-all active:scale-95 flex items-center justify-center gap-2">
                            <Save size={14} /> Save
                        </button>
                        <button onClick={handleClear} className="px-6 h-10 bg-[#00adff] text-white text-[13px] font-bold rounded-[5px] hover:bg-[#0099e6] shadow-md shadow-blue-200 transition-all active:scale-95 flex items-center justify-center gap-2 border-none">
                            <RotateCcw size={14} /> Clear
                        </button>
                        </div>
                }
            >
                <div className="select-none font-['Tahoma'] space-y-4">
                    {/* Info Header */}
                    <div className="bg-[#f0f9ff] border border-[#bae6fd] p-3 rounded-[5px] shadow-sm">
                        <p className="text-[12.5px] font-bold text-[#0369a1] text-center leading-relaxed">
                            Something that you have to spend money for long term
                        </p>
                    </div>

                    {/* Form Section */}
                    <div className="bg-white p-4 border border-gray-200 rounded-[5px] space-y-3 shadow-sm border-l-4 border-l-[#0285fd]">
                        <div className="flex items-center gap-4">
                            <label className="text-[12px] font-bold text-gray-700 w-[140px] shrink-0 uppercase">Expense Accounts of</label>
                            <div className="flex-1 flex gap-2">
                                <input 
                                    type="text" 
                                    value={formData.ExpenseAccName || formData.ExpenseAccCode} 
                                    readOnly 
                                    className="min-w-0 flex-1 h-8 border border-gray-300 px-3 text-[12.5px] bg-gray-50 rounded-[5px] outline-none font-bold text-blue-600 shadow-sm cursor-default" 
                                    placeholder=""
                                />
                                <button 
                                    onClick={() => setShowAccountSearch(true)} 
                                    className="w-10 h-8 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[5px] transition-all shadow-md active:scale-95 shrink-0"
                                >
                                    <Search size={18} />
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <label className="text-[12px] font-bold text-gray-700 w-[140px] shrink-0 uppercase">Vendor</label>
                            <input 
                                name="Vendor"
                                value={formData.Vendor}
                                onChange={handleInputChange}
                                type="text" 
                                className="flex-1 h-8 border border-gray-300 px-3 text-[12.5px] focus:border-blue-400 outline-none rounded-[5px] bg-white font-bold text-gray-700 shadow-sm"
                                placeholder=""
                            />
                        </div>

                        <div className="flex items-center gap-4">
                            <label className="text-[12px] font-bold text-gray-700 w-[140px] shrink-0 uppercase">Date of Debit</label>
                            <div className="flex gap-2 w-72">
                                <input 
                                    type="text" 
                                    value={formData.DebitDate}
                                    readOnly
                                    className="min-w-0 flex-1 h-8 border border-gray-300 px-3 text-[12.5px] bg-white rounded-[5px] outline-none font-bold text-gray-700 shadow-sm cursor-default"
                                />
                                <button 
                                    onClick={() => setShowDateModal(true)}
                                    className="w-10 h-8 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[5px] transition-all shadow-md active:scale-95 shrink-0"
                                >
                                    <Calendar size={18} />
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <label className="text-[12px] font-bold text-gray-700 w-[140px] shrink-0 uppercase">Debit Amount</label>
                            <input 
                                name="Amount"
                                value={formData.Amount}
                                onChange={handleInputChange}
                                type="number" 
                                className="w-48 h-8 border border-gray-300 px-3 text-[12.5px] focus:border-blue-400 outline-none rounded-[5px] bg-white font-black text-blue-600 shadow-sm text-right"
                                step="0.01"
                            />
                        </div>
                    </div>

                    {/* Table Section */}
                    <div className="border border-gray-300 rounded-[5px] overflow-hidden flex flex-col min-h-[300px] bg-white shadow-sm">
                        <div className="flex bg-gray-50 border-b border-gray-300">
                            <div className="w-12 border-r border-gray-300 py-1" />
                            <div className="flex-1 px-4 py-2 text-[11px] font-bold text-gray-600 border-r border-gray-200 uppercase tracking-wider text-center">Vendor</div>
                            <div className="flex-1 px-4 py-2 text-[11px] font-bold text-gray-600 border-r border-gray-200 uppercase tracking-wider text-center">Expense Account</div>
                            <div className="flex-1 px-4 py-2 text-[11px] font-bold text-gray-600 border-r border-gray-200 uppercase tracking-wider text-center">Date</div>
                            <div className="w-40 px-4 py-2 text-[11px] font-bold text-gray-600 uppercase tracking-wider text-center">Amount</div>
                        </div>
                        <div className="flex-1 overflow-y-auto bg-white custom-scrollbar">
                            {records.length === 0 ? (
                                <div className="p-12 text-center text-gray-400 italic text-sm">No recorded expense entries found.</div>
                            ) : (
                                records.map((rec, idx) => (
                                    <div key={idx} className="flex border-b border-gray-100 hover:bg-slate-50 transition-colors group">
                                        <div className="w-12 border-r border-gray-100 flex items-center justify-center p-1 text-[10px] font-bold text-gray-400">{idx + 1}</div>
                                        <div className="flex-1 px-4 py-2 text-xs font-bold text-gray-700 uppercase">{rec.Vendor}</div>
                                        <div className="flex-1 px-4 py-2 text-xs font-medium text-gray-600 uppercase">{rec.ExpenseAccName}</div>
                                        <div className="flex-1 px-4 py-2 text-xs font-bold text-gray-500 text-center">{rec.DebitDate}</div>
                                        <div className="w-40 px-4 py-2 text-xs font-black text-blue-600 text-right">{rec.Amount}</div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </SimpleModal>

            {/* Account Search Modal */}
            {showAccountSearch && (
                <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 font-['Tahoma']">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setShowAccountSearch(false)} />
                    <div className="relative w-full max-w-2xl bg-white shadow-2xl rounded-xl border border-gray-100 overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
                        {/* Header */}
                        <div className="bg-white px-6 py-4 flex items-center justify-between border-b border-gray-100 select-none relative overflow-hidden">
                            <div className="absolute left-0 top-0 bottom-0 w-1.5 transition-colors duration-500" style={{ backgroundColor: localStorage.getItem('topBarColor') || '#0285fd' }} />
                            <div className="flex items-center gap-2">
                                <Search size={16} className="text-[#0078d4]" />
                                <span className="text-[15px] font-[700] text-slate-900 uppercase tracking-[3px] font-mono truncate">Expense Accounts Lookup</span>
                            </div>
                            <button onClick={() => setShowAccountSearch(false)} className="w-9 h-8 flex items-center justify-center bg-[#ff3b30] hover:bg-[#e03127] text-white rounded-[8px] shadow-sm active:scale-90"><X size={18} strokeWidth={4} /></button>
                        </div>
                        <div className="p-3 bg-slate-50 border-b border-gray-100 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Search size={14} className="text-gray-400" />
                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Search Facility</span>
                            </div>
                            <input type="text" placeholder="Find by Account Name or Code..." className="h-9 border border-gray-300 px-3 text-xs rounded-md w-72 focus:border-[#0285fd] outline-none shadow-sm" value={accSearchQuery} onChange={(e) => setAccSearchQuery(e.target.value)} />
                        </div>
                        <div className="p-2">
                            <div className="px-3 py-1.5 flex text-[10px] font-bold text-gray-600 border-b border-gray-200 uppercase">
                                <span className="w-32 text-center">Account Code</span>
                                <span className="flex-1 px-3">Account Description</span>
                            </div>
                            <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                                {accounts.filter(a => (a.name || '').toLowerCase().includes(accSearchQuery.toLowerCase()) || (a.code || '').toLowerCase().includes(accSearchQuery.toLowerCase())).map((acc, idx) => (
                                    <button key={idx} onClick={() => handleAccountSelect(acc.code, acc.name)} className="w-full flex items-center justify-between px-3 py-2 text-xs border-b border-gray-100 hover:bg-blue-50 transition-all text-left group">
                                        <div className="flex items-center gap-2 flex-1">
                                            <span className="w-32 text-center font-mono text-[11px] font-bold text-[#0078d4]">{acc.code}</span>
                                            <span className={`flex-1 px-3 font-mono font-medium text-gray-700 uppercase ${acc.isMain ? 'font-black' : ''}`}>{acc.name}</span>
                                        </div>
                                        <div className="bg-[#e49e1b] text-white text-[10px] px-5 py-1.5 rounded-md font-bold uppercase">Select</div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <CalendarModal 
                isOpen={showDateModal} 
                onClose={() => setShowDateModal(false)} 
                onSelect={handleDateSelect} 
                currentDate={formData.DebitDate}
            />
        </>
    );
};

export default FixedExpensesBoard;
