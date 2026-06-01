import React, { useState, useEffect } from 'react';
import SimpleModal from '../components/SimpleModal';
import CalendarModal from '../components/CalendarModal';
import { Search, Calendar, ChevronDown, Check, X, Save, RotateCcw, Loader2, Landmark, Wallet, Layers, Users, Trash2, Plus } from 'lucide-react';
import { mainCashService } from '../services/mainCash.service';

import { getSessionData } from '../utils/session';
import { showSuccessToast, showErrorToast } from '../utils/toastUtils';


const MainCashBoard = ({ isOpen, onClose }) => {
    const [loading, setLoading] = useState(false);
    const [lookups, setLookups] = useState({ mainAccounts: [], expenseAccounts: [], costCenters: [], payees: [] });
    const [activeTab, setActiveTab] = useState('Expenses'); // 'Expenses', 'Cost Center'
    
    // Form States
    const getInitialFormData = () => ({
        docNo: '',
        date: new Date().toISOString().split('T')[0],
        accountId: '',
        accountName: '',
        costCenterId: '',
        costCenterName: '',
        payeeId: '',
        payeeName: '',
        address: '',
        memo: '',
        endingBal: 0,
        refNo: '',
        amount: 0,
        company: '',
        createUser: ''
    });

    const [formData, setFormData] = useState(getInitialFormData());

    const [rows, setRows] = useState([{ id: Date.now(), expAccCode: '', expAccName: '', ccCode: '', amount: 0, memo: '' }]);

    const [activeModal, setActiveModal] = useState(null); // 'account', 'cc', 'payee', 'row_acc', 'row_cc'
    const [activeRowIdx, setActiveRowIdx] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [datePickerField, setDatePickerField] = useState('date');

    useEffect(() => {
        if (isOpen) {
            setFormData(getInitialFormData());
            const { companyCode, userName } = getSessionData();
            setFormData(prev => ({
                ...prev,
                company: companyCode,
                createUser: userName
            }));
            loadInitialData(companyCode);
        }
    }, [isOpen]);

    const loadInitialData = async (compCode) => {
        try {
            setLoading(true);
            const activeComp = compCode || formData.company;
            const [lookupRes, docRes] = await Promise.all([
                mainCashService.getLookups(activeComp),
                mainCashService.generateDocNo(activeComp)
            ]);
            setLookups(lookupRes);
            setFormData(prev => ({ ...prev, docNo: docRes.docNo }));
        } catch (error) {
            showErrorToast("Failed to load initial data");
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleRowChange = (index, field, value) => {
        const newRows = [...rows];
        newRows[index][field] = value;
        setRows(newRows);
        
        if (field === 'amount') {
            const total = newRows.reduce((sum, r) => sum + (parseFloat(r.amount) || 0), 0);
            setFormData(prev => ({ ...prev, amount: total }));
        }
    };

    const addRow = () => {
        setRows([...rows, { id: Date.now(), expAccCode: '', expAccName: '', ccCode: '', amount: 0, memo: '' }]);
    };

    const deleteRow = (idx) => {
        if (rows.length === 1) return;
        const newRows = rows.filter((_, i) => i !== idx);
        setRows(newRows);
        const total = newRows.reduce((sum, r) => sum + (parseFloat(r.amount) || 0), 0);
        setFormData(prev => ({ ...prev, amount: total }));
    };

    const handleClear = () => {
        setFormData({
            ...formData,
            accountId: '',
            accountName: '',
            costCenterId: '',
            costCenterName: '',
            payeeId: '',
            payeeName: '',
            address: '',
            memo: '',
            endingBal: 0,
            refNo: '',
            amount: 0
        });
        setRows([{ id: Date.now(), expAccCode: '', expAccName: '', ccCode: '', amount: 0, memo: '' }]);
        loadInitialData();
    };

    const handleSave = async () => {
        if (!formData.accountId || formData.amount <= 0) {
            showErrorToast("Please select an account and enter expense amounts.");
            return;
        }

        try {
            setLoading(true);
            await mainCashService.save({ ...formData, items: rows });
            showSuccessToast('Main Cash entry saved successfully!');
            handleClear();
            onClose();
        } catch (error) {
            showErrorToast(error.toString());
        } finally {
            setLoading(false);
        }
    };

    const filteredLookup = () => {
        if (activeModal === 'account') return lookups.mainAccounts.filter(a => (a.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || (a.code || '').toLowerCase().includes(searchTerm.toLowerCase()));
        if (activeModal === 'cc' || activeModal === 'row_cc') return lookups.costCenters.filter(c => (c.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || (c.code || '').toLowerCase().includes(searchTerm.toLowerCase()));
        if (activeModal === 'payee') return lookups.payees.filter(p => (p.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || (p.code || '').toLowerCase().includes(searchTerm.toLowerCase()));
        if (activeModal === 'row_acc') return lookups.expenseAccounts.filter(e => (e.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || (e.code || '').toLowerCase().includes(searchTerm.toLowerCase()));
        return [];
    };

    return (
        <>
            <style>
                {`
                    @keyframes toastProgress {
                        0% { width: 100%; }
                        100% { width: 0%; }
                    }
                `}
            </style>
            <SimpleModal
                isOpen={isOpen}
                onClose={onClose}
                title="Main Cash Entry"
                maxWidth="max-w-[1050px]"
                footer={
                    <div className="bg-slate-50 px-6 py-4 w-full flex justify-between items-center border-t border-slate-200 rounded-b-xl">
                        <div className="flex gap-3">
                            <button onClick={handleClear} disabled={loading} className="px-6 py-3 bg-[#00adff] hover:bg-[#0099e6] text-white font-mono font-bold text-sm uppercase tracking-widest rounded-[5px] transition-all active:scale-95 flex items-center justify-center gap-2 border-none">
                                <RotateCcw size={14} /> CLEAR FORM
                            </button>
                        </div>
                        <div className="flex gap-3">
                            
                            <button onClick={handleSave} disabled={loading} className={`px-6 py-3 bg-[#0285fd] hover:bg-[#0073ff] text-white font-mono font-bold text-sm uppercase tracking-widest rounded-[5px] shadow-md shadow-blue-100 transition-all active:scale-95 flex items-center justify-center gap-2 border-none ${loading ? 'opacity-50' : ''}`}>
                                {loading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} SAVE ENTRY
                            </button>
                        </div>
                    </div>
                }
            >
                <div className="space-y-4 overflow-y-auto no-scrollbar font-['Tahoma']">
                    {/* Header Section */}
                    <div className="bg-white p-4 border border-slate-200 rounded-[5px] space-y-4">
                        <div className="grid grid-cols-12 gap-x-6 gap-y-3.5">
                            {/* Left Side */}
                            <div className="col-span-12 lg:col-span-7 space-y-3.5">
                                <div className="flex items-center gap-2">
                                    <label className="text-[11px] font-bold text-gray-500 uppercase w-28 shrink-0">Doc No</label>
                                    <input type="text" value={formData.docNo} readOnly className="flex-1 min-w-0 h-8 border border-slate-200 px-3 text-[12px] font-bold text-blue-600 bg-slate-50 rounded outline-none transition-all focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20" />
                                </div>
                                
                                <div className="flex items-center gap-2">
                                    <label className="text-[11px] font-bold text-gray-500 uppercase w-28 shrink-0">Account</label>
                                    <div className="flex-1 flex gap-1 h-8 min-w-0">
                                        <input 
                                            type="text" 
                                            readOnly 
                                            value={formData.accountName ? `${formData.accountId} - ${formData.accountName}` : ''} 
                                            className="flex-1 min-w-0 h-8 border border-slate-200 px-3 text-[12px] font-bold text-gray-700 bg-slate-50 rounded outline-none cursor-pointer transition-all focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20" 
                                            onClick={() => { setActiveModal('account'); setSearchTerm(''); }}
                                        />
                                        <button onClick={() => { setActiveModal('account'); setSearchTerm(''); }} className="w-10 h-8 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[5px] transition-all shadow-md active:scale-95 shrink-0">
                                            <Search size={16} />
                                        </button>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <label className="text-[11px] font-bold text-gray-500 uppercase w-28 shrink-0">Cost Center</label>
                                    <div className="flex-1 flex gap-1 h-8 min-w-0">
                                        <input 
                                            type="text" 
                                            readOnly 
                                            value={formData.costCenterName ? `${formData.costCenterId} - ${formData.costCenterName}` : ''} 
                                            className="flex-1 min-w-0 h-8 border border-slate-200 px-3 text-[12px] font-bold text-gray-700 bg-slate-50 rounded outline-none cursor-pointer transition-all focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20" 
                                            onClick={() => { setActiveModal('cc'); setSearchTerm(''); }}
                                        />
                                        <button onClick={() => { setActiveModal('cc'); setSearchTerm(''); }} className="w-10 h-8 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[5px] transition-all shadow-md active:scale-95 shrink-0">
                                            <Search size={16} />
                                        </button>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <label className="text-[11px] font-bold text-gray-500 uppercase w-28 shrink-0">Pay to the Order</label>
                                    <div className="flex-1 flex gap-1 h-8 min-w-0">
                                        <input 
                                            type="text" 
                                            readOnly 
                                            value={formData.payeeName ? `${formData.payeeId} - ${formData.payeeName}` : ''} 
                                            className="flex-1 min-w-0 h-8 border border-slate-200 px-3 text-[12px] font-bold text-gray-700 bg-slate-50 rounded outline-none cursor-pointer transition-all focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20" 
                                            onClick={() => { setActiveModal('payee'); setSearchTerm(''); }}
                                        />
                                        <button onClick={() => { setActiveModal('payee'); setSearchTerm(''); }} className="w-10 h-8 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[5px] transition-all shadow-md active:scale-95 shrink-0">
                                            <Search size={16} />
                                        </button>
                                    </div>
                                </div>

                                <div className="flex items-start gap-2">
                                    <label className="text-[11px] font-bold text-gray-500 uppercase w-28 shrink-0 mt-2">Address</label>
                                    <textarea name="address" value={formData.address} onChange={handleInputChange} className="flex-1 min-w-0 h-16 border border-slate-200 rounded px-3 py-2 font-mono text-[12px] outline-none bg-slate-50 text-gray-700 transition-all focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20 resize-none" />
                                </div>

                                <div className="flex items-start gap-2">
                                    <label className="text-[11px] font-bold text-gray-500 uppercase w-28 shrink-0 mt-2">Memo</label>
                                    <textarea name="memo" value={formData.memo} onChange={handleInputChange} className="flex-1 min-w-0 h-14 border border-slate-200 rounded px-3 py-2 font-mono text-[12px] outline-none bg-slate-50 text-gray-700 transition-all focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20 resize-none italic" />
                                </div>
                            </div>

                            {/* Right Side */}
                            <div className="col-span-12 lg:col-span-5 space-y-3.5">
                                <div className="flex items-center gap-2">
                                    <label className="text-[11px] font-bold text-gray-500 uppercase w-24 shrink-0">Date</label>
                                    <input name="date" type="date" value={formData.date} onChange={handleInputChange} className="flex-1 min-w-0 h-8 border border-slate-200 rounded px-3 text-[12px] font-bold outline-none bg-slate-50 text-gray-700 transition-all focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20" />
                                </div>
                                <div className="flex items-center gap-2">
                                    <label className="text-[11px] font-bold text-gray-500 uppercase w-24 shrink-0">Ending Bal</label>
                                    <div className="flex-1 min-w-0 h-8 flex items-center justify-end px-3 bg-slate-50 text-[13px] font-mono font-black text-slate-800 rounded border border-slate-200">
                                        Rs. {formData.endingBal.toLocaleString()}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <label className="text-[11px] font-bold text-gray-500 uppercase w-24 shrink-0">Ref No</label>
                                    <input name="refNo" value={formData.refNo} onChange={handleInputChange} type="text" className="flex-1 min-w-0 h-8 border border-slate-200 rounded px-3 text-[12px] font-mono outline-none bg-slate-50 text-gray-700 transition-all focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20" />
                                </div>
                                <div className="pt-6">
                                    <div className="bg-slate-50 border border-slate-200 rounded-[5px] p-6 flex flex-col items-center justify-center h-[156px]">
                                        <span className="text-[11px] font-mono font-bold text-[#0285fd] uppercase tracking-widest mb-2">Total Amount</span>
                                        <div className="text-[28px] font-mono font-black text-[#b91c1c] tracking-tighter leading-none">
                                            Rs. {parseFloat(formData.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tabs & Grid */}
                    <div className="bg-white border border-slate-200 rounded-[5px] flex flex-col min-h-[300px] overflow-hidden">
                        <div className="flex border-b border-slate-200 bg-slate-50/80 overflow-x-auto no-scrollbar">
                           <button onClick={() => setActiveTab('Expenses')} className={`px-10 py-3 text-[11px] font-bold uppercase tracking-widest flex items-center gap-2 relative transition-all ${activeTab === 'Expenses' ? 'text-[#0285fd] bg-white' : 'text-gray-400 hover:text-gray-600'}`}>
                               <Layers size={14} /> Expenses
                               {activeTab === 'Expenses' && <div className="absolute top-0 left-0 right-0 h-0.5 bg-[#0285fd]" />}
                           </button>
                           <button onClick={() => setActiveTab('Cost Center')} className={`px-10 py-3 text-[11px] font-bold uppercase tracking-widest flex items-center gap-2 relative transition-all ${activeTab === 'Cost Center' ? 'text-[#0285fd] bg-white' : 'text-gray-400 hover:text-gray-600'}`}>
                               <Landmark size={14} /> Cost Center
                               {activeTab === 'Cost Center' && <div className="absolute top-0 left-0 right-0 h-0.5 bg-[#0285fd]" />}
                           </button>
                        </div>

                        <div className="flex-1 bg-white overflow-hidden flex flex-col">
                            <div className="flex bg-slate-50/80 border-b border-slate-200 text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest items-center">
                                <div className="w-10 py-2.5 px-3 border-r border-slate-200 text-center">#</div>
                                <div className="flex-[2] py-2.5 px-4 border-r border-slate-200">Expense Account</div>
                                <div className="flex-[1.5] py-2.5 px-4 border-r border-slate-200">Cost Center</div>
                                <div className="w-32 py-2.5 px-4 border-r border-slate-200 text-right">Amount</div>
                                <div className="flex-[2] py-2.5 px-4 border-r border-slate-200">Memo</div>
                                <div className="w-12 text-center py-2.5">Action</div>
                            </div>

                            <div className="flex-1 overflow-y-auto max-h-[220px] divide-y divide-slate-100">
                                {rows.map((row, idx) => (
                                    <div key={idx} className="flex border-b border-slate-200 text-[11px] font-bold text-slate-700 hover:bg-blue-50/30 items-center transition-colors group">
                                        <div className="w-10 py-2 px-3 border-r border-slate-200 text-center text-gray-400">{idx + 1}</div>
                                        <div className="flex-[2] border-r border-slate-200 bg-white group-hover:bg-transparent">
                                            <div className="flex h-8">
                                                <input type="text" readOnly value={row.expAccName ? `${row.expAccCode} - ${row.expAccName}` : ''} className="flex-1 bg-transparent px-3 outline-none text-[11px] font-bold text-slate-700 cursor-pointer" onClick={() => { setActiveRowIdx(idx); setActiveModal('row_acc'); setSearchTerm(''); }} />
                                                <button onClick={() => { setActiveRowIdx(idx); setActiveModal('row_acc'); setSearchTerm(''); }} className="w-8 h-8 flex items-center justify-center text-blue-500 hover:bg-blue-50 group-hover:bg-blue-100/50">
                                                    <Search size={14} />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="flex-[1.5] border-r border-slate-200 bg-white group-hover:bg-transparent">
                                            <div className="flex h-8">
                                                <input type="text" readOnly value={row.ccCode} className="flex-1 bg-transparent px-3 outline-none text-[11px] font-bold cursor-pointer" onClick={() => { setActiveRowIdx(idx); setActiveModal('row_cc'); setSearchTerm(''); }} />
                                                <button onClick={() => { setActiveRowIdx(idx); setActiveModal('row_cc'); setSearchTerm(''); }} className="w-8 h-8 flex items-center justify-center text-blue-500 hover:bg-blue-50 group-hover:bg-blue-100/50">
                                                    <Search size={14} />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="w-32 border-r border-slate-200 bg-white group-hover:bg-transparent">
                                            <input 
                                                type="number" 
                                                step="0.01" 
                                                value={row.amount} 
                                                onChange={(e) => handleRowChange(idx, 'amount', e.target.value)} 
                                                className="w-full h-8 px-3 text-right bg-transparent outline-none focus:bg-white text-[12px] font-mono font-black text-slate-800" 
                                            />
                                        </div>
                                        <div className="flex-[2] border-r border-slate-200 bg-white group-hover:bg-transparent">
                                            <input 
                                                type="text" 
                                                value={row.memo} 
                                                onChange={(e) => handleRowChange(idx, 'memo', e.target.value)} 
                                                className="w-full h-8 px-3 bg-transparent outline-none italic font-mono text-[11px] text-gray-500"
                                            />
                                        </div>
                                        <div className="w-12 flex justify-center py-1">
                                            <button onClick={() => deleteRow(idx)} className="text-red-300 hover:text-red-500 transition-all p-1.5 hover:bg-red-50 rounded-[5px]">
                                                <Trash2 size={13} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="p-4 border-t border-slate-200 bg-white">
                                <button onClick={addRow} className="px-5 py-2 bg-[#0285fd] text-white font-mono font-bold text-[11px] uppercase tracking-widest rounded-[5px] hover:bg-[#0073ff] shadow-md active:scale-95 transition-all flex items-center justify-center gap-2 w-fit">
                                    <Plus size={14} /> Add Spend Item
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </SimpleModal>

            {/* Selection Modals */}

            <CalendarModal
                isOpen={showDatePicker}
                onClose={() => setShowDatePicker(false)}
                currentDate={formData[datePickerField]}
                onDateSelect={(date) => setFormData({...formData, [datePickerField]: date})}
            />

            <SimpleModal
                isOpen={!!activeModal}
                onClose={() => setActiveModal(null)}
                title={`Lookup Directory`}
                maxWidth="max-w-[600px]"
            >
                <div className="space-y-4 font-['Tahoma']">
                    <div className="flex items-center gap-4 p-3 rounded-[5px] border border-slate-200 bg-white mb-2">
                        <span className="text-[12px] font-bold text-gray-500 uppercase tracking-widest">Search Facility</span>
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                            <input
                                type="text"
                                placeholder={`Find ${activeModal?.replace('row_', '').replace('cc', 'cost center')} by code or name...`}
                                className="w-full h-9 pl-10 pr-4 border border-slate-200 rounded outline-none text-sm bg-slate-50 transition-all focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                autoFocus
                            />
                        </div>
                    </div>
                    <div className="border border-slate-200 rounded-[5px] overflow-hidden shadow-sm">
                        <div className="max-h-[400px] overflow-y-auto no-scrollbar">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50/80 sticky top-0 text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest border-b border-slate-200">
                                    <tr>
                                        <th className="px-5 py-3">Code</th>
                                        <th className="px-5 py-3">Record Name</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {filteredLookup().map((item, idx) => (
                                        <tr key={idx} className="group hover:bg-blue-50/50 cursor-pointer transition-colors" onClick={() => {
                                            if (activeModal === 'account') {
                                                setFormData(prev => ({ ...prev, accountId: item.code, accountName: item.name }));
                                            } else if (activeModal === 'cc') {
                                                setFormData(prev => ({ ...prev, costCenterId: item.code, costCenterName: item.name }));
                                            } else if (activeModal === 'payee') {
                                                setFormData(prev => ({ ...prev, payeeId: item.code, payeeName: item.name, address: item.address || '' }));
                                            } else if (activeModal === 'row_acc') {
                                                const newRows = [...rows];
                                                newRows[activeRowIdx].expAccCode = item.code;
                                                newRows[activeRowIdx].expAccName = item.name;
                                                setRows(newRows);
                                            } else if (activeModal === 'row_cc') {
                                                const newRows = [...rows];
                                                newRows[activeRowIdx].ccCode = item.code;
                                                setRows(newRows);
                                            }
                                            setActiveModal(null);
                                        }}>
                                            <td className="px-5 py-3 font-mono text-[12px] font-mono text-gray-700">{item.code}</td>
                                            <td className="px-5 py-3 text-[12px] font-mono text-gray-700 uppercase group-hover:text-blue-600">{item.name}</td>
                                        </tr>
                                    ))}
                                    {filteredLookup().length === 0 && (
                                        <tr>
                                            <td colSpan="2" className="text-center py-6 text-gray-300 text-[12px] font-bold uppercase tracking-widest">No records found</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </SimpleModal>
        </>
    );
};

export default MainCashBoard;
