import React, { useState, useEffect } from 'react';
import SimpleModal from '../components/SimpleModal';
import { Search, Calendar, ChevronDown, Check, X, Save, RotateCcw, Loader2, Landmark, Wallet, Layers, Users, Trash2, Plus } from 'lucide-react';
import { mainCashService } from '../services/mainCash.service';
import { toast } from 'react-hot-toast';
import { getSessionData } from '../utils/session';

const MainCashBoard = ({ isOpen, onClose }) => {
    const [loading, setLoading] = useState(false);
    const [lookups, setLookups] = useState({ mainAccounts: [], expenseAccounts: [], costCenters: [], payees: [] });
    const [activeTab, setActiveTab] = useState('Expenses'); // 'Expenses', 'Cost Center'
    
    // Form States
    const [formData, setFormData] = useState({
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

    const [rows, setRows] = useState([{ id: Date.now(), expAccCode: '', expAccName: '', ccCode: '', amount: 0, memo: '' }]);

    const [activeModal, setActiveModal] = useState(null); // 'account', 'cc', 'payee', 'row_acc', 'row_cc'
    const [activeRowIdx, setActiveRowIdx] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (isOpen) {
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
            toast.error("Failed to load initial data");
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
            toast.error("Please select an account and enter expense amounts.");
            return;
        }

        try {
            setLoading(true);
            await mainCashService.save({ ...formData, items: rows });
            toast.success('Main Cash entry saved successfully!');
            handleClear();
            onClose();
        } catch (error) {
            toast.error(error.toString());
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
            <SimpleModal
                isOpen={isOpen}
                onClose={onClose}
                title="Main Cash Entry"
                maxWidth="max-w-[1200px]"
                footer={
                    <div className="bg-slate-50 px-6 py-4 w-full flex justify-end gap-3 border-t border-gray-100 rounded-b-xl font-['Inter']">
                        <button onClick={handleSave} disabled={loading} className={`px-8 h-10 bg-[#0078d4] text-white text-sm font-bold rounded shadow-md hover:bg-[#005a9e] transition-all active:scale-95 flex items-center gap-2 ${loading ? 'opacity-50' : ''}`}>
                            {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Save
                        </button>
                        <button onClick={handleClear} disabled={loading} className="px-8 h-10 bg-white border border-gray-300 text-slate-600 text-sm font-bold rounded hover:bg-slate-50 transition-all flex items-center gap-2">
                            <RotateCcw size={16} /> Clear
                        </button>
                        <button onClick={onClose} className="px-8 h-10 bg-white border border-gray-300 text-slate-600 text-sm font-bold rounded hover:bg-slate-50 transition-all flex items-center gap-2">
                            <X size={16} /> Exit
                        </button>
                    </div>
                }
            >
                <div className="space-y-4 font-['Plus_Jakarta_Sans']">
                    {/* Header Section */}
                    <div className="bg-white p-6 border border-gray-200 rounded-sm shadow-sm space-y-4">
                        <div className="grid grid-cols-12 gap-x-12 gap-y-3">
                            {/* Left Side */}
                            <div className="col-span-12 lg:col-span-7 space-y-3">
                                <div className="flex items-center gap-3">
                                    <label className="text-[13px] font-bold text-gray-700 w-28 shrink-0">Doc No</label>
                                    <input type="text" value={formData.docNo} readOnly className="flex-1 h-7 border border-[#0078d4]/30 px-3 text-[13px] font-bold text-[#0078d4] bg-blue-50/20 rounded-sm outline-none tracking-widest" />
                                </div>
                                
                                <div className="flex items-center gap-3">
                                    <label className="text-[13px] font-bold text-gray-700 w-28 shrink-0">Account</label>
                                    <div className="flex-1 flex gap-1">
                                        <input 
                                            type="text" 
                                            readOnly 
                                            value={formData.accountName ? `${formData.accountId} - ${formData.accountName}` : ''} 
                                            placeholder="Select Main Cash Account..." 
                                            className="flex-1 h-7 border border-gray-300 px-3 text-[13px] font-bold rounded-sm bg-gray-50/50 outline-none" 
                                        />
                                        <button onClick={() => { setActiveModal('account'); setSearchTerm(''); }} className="w-9 h-7 bg-[#0078d4] text-white flex items-center justify-center hover:bg-[#005a9e] rounded-sm transition-all shadow-sm active:scale-90">
                                            <Search size={15} />
                                        </button>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <label className="text-[13px] font-bold text-gray-700 w-28 shrink-0">Cost Center</label>
                                    <div className="flex-1 flex gap-1">
                                        <input 
                                            type="text" 
                                            readOnly 
                                            value={formData.costCenterName ? `${formData.costCenterId} - ${formData.costCenterName}` : ''} 
                                            className="flex-1 h-7 border border-gray-300 px-3 text-[13px] rounded-sm bg-gray-50/50 outline-none" 
                                        />
                                        <button onClick={() => { setActiveModal('cc'); setSearchTerm(''); }} className="w-9 h-7 bg-[#0078d4] text-white flex items-center justify-center hover:bg-[#005a9e] rounded-sm transition-all shadow-sm active:scale-90">
                                            <Search size={15} />
                                        </button>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 font-semibold">
                                    <label className="text-[13px] font-bold text-gray-700 w-28 shrink-0 tracking-tight">Pay to the Order</label>
                                    <div className="flex-1 flex gap-1">
                                        <input 
                                            type="text" 
                                            readOnly 
                                            value={formData.payeeName ? `${formData.payeeId} - ${formData.payeeName}` : ''} 
                                            placeholder="Select Payee..." 
                                            className="flex-1 h-7 border border-gray-300 px-3 text-[13px] rounded-sm bg-[#fafafa] outline-none" 
                                        />
                                        <button onClick={() => { setActiveModal('payee'); setSearchTerm(''); }} className="w-9 h-7 bg-[#0078d4] text-white flex items-center justify-center hover:bg-[#005a9e] rounded-sm transition-all shadow-sm active:scale-90">
                                            <Search size={15} />
                                        </button>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <label className="text-[13px] font-bold text-gray-700 w-28 shrink-0 mt-1">Address</label>
                                    <textarea name="address" value={formData.address} onChange={handleInputChange} className="flex-1 h-16 border border-gray-200 p-2 text-[12px] rounded-sm outline-none resize-none bg-gray-50/20" />
                                </div>

                                <div className="flex items-start gap-3">
                                    <label className="text-[13px] font-bold text-gray-700 w-28 shrink-0 mt-1">Memo</label>
                                    <textarea name="memo" value={formData.memo} onChange={handleInputChange} className="flex-1 h-14 border border-gray-200 p-2 text-[12px] rounded-sm outline-none resize-none bg-gray-50/20 italic text-gray-500" placeholder="Internal receipt remarks..." />
                                </div>
                            </div>

                            {/* Right Side */}
                            <div className="col-span-12 lg:col-span-5 space-y-3">
                                <div className="flex items-center gap-3">
                                    <label className="text-[13px] font-bold text-gray-700 w-24 shrink-0">Date</label>
                                    <input name="date" type="date" value={formData.date} onChange={handleInputChange} className="flex-1 h-7 border border-gray-300 px-3 text-[13px] outline-none rounded-sm font-bold text-gray-600" />
                                </div>
                                <div className="flex items-center gap-3">
                                    <label className="text-[13px] font-bold text-gray-700 w-24 shrink-0 font-['Inter']">Ending Bal</label>
                                    <div className="flex-1 h-7 flex items-center justify-end px-3 bg-slate-50 text-[14px] font-black text-slate-800 rounded-sm border border-gray-200">
                                        Rs. {formData.endingBal.toLocaleString()}
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <label className="text-[13px] font-bold text-gray-700 w-24 shrink-0">Ref No</label>
                                    <input name="refNo" value={formData.refNo} onChange={handleInputChange} type="text" className="flex-1 h-7 border border-gray-300 px-3 text-[13px] outline-none rounded-sm" />
                                </div>
                                <div className="pt-8 flex flex-col items-center justify-center p-6 bg-blue-50/50 rounded-sm border border-blue-100">
                                    <span className="text-[11px] font-black text-[#0078d4] uppercase tracking-widest mb-1">Total Amount</span>
                                    <div className="text-[32px] font-black text-[#b91c1c] tracking-tighter leading-none">
                                        Rs. {parseFloat(formData.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tabs & Grid */}
                    <div className="bg-white border border-gray-200 rounded-sm shadow-sm flex flex-col">
                        <div className="flex border-b border-gray-200 bg-gray-50/50 overflow-x-auto no-scrollbar">
                           <button onClick={() => setActiveTab('Expenses')} className={`px-10 py-3 text-[12px] font-bold flex items-center gap-2 relative transition-all ${activeTab === 'Expenses' ? 'text-[#0078d4] bg-white' : 'text-gray-400 hover:text-gray-600'}`}>
                               <Layers size={14} /> Expenses
                               {activeTab === 'Expenses' && <div className="absolute top-0 left-0 right-0 h-1 bg-[#0078d4]" />}
                           </button>
                           <button onClick={() => setActiveTab('Cost Center')} className={`px-10 py-3 text-[12px] font-bold flex items-center gap-2 relative transition-all ${activeTab === 'Cost Center' ? 'text-[#0078d4] bg-white' : 'text-gray-400 hover:text-gray-600'}`}>
                               <Landmark size={14} /> Cost Center
                               {activeTab === 'Cost Center' && <div className="absolute top-0 left-0 right-0 h-1 bg-[#0078d4]" />}
                           </button>
                        </div>

                        <div className="p-0 overflow-hidden min-h-[300px]">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-[#f8f9fa] border-b border-gray-300 sticky top-0 z-10 font-bold text-[11px] text-gray-600 uppercase tracking-wider">
                                    <tr>
                                        <th className="px-4 py-2 border-r border-gray-200 w-[40px] text-center">#</th>
                                        <th className="px-4 py-2 border-r border-gray-200 w-[250px]">Expense Account</th>
                                        <th className="px-4 py-2 border-r border-gray-200 w-[200px]">Cost Center</th>
                                        <th className="px-4 py-2 border-r border-gray-200 w-[150px] text-right">Amount</th>
                                        <th className="px-4 py-2 border-r border-gray-200">Memo</th>
                                        <th className="px-4 py-2 w-[50px] text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="text-[12px] text-gray-700">
                                    {rows.map((row, idx) => (
                                        <tr key={idx} className="border-b border-gray-100 hover:bg-blue-50/30 transition-colors group">
                                            <td className="px-4 py-1.5 border-r border-gray-100 text-center font-bold text-gray-400">{idx + 1}</td>
                                            <td className="p-0 border-r border-gray-100">
                                                <div className="flex h-10">
                                                    <input type="text" readOnly value={row.expAccName ? `${row.expAccCode} - ${row.expAccName}` : ''} className="flex-1 bg-transparent px-3 outline-none font-bold text-slate-700" placeholder="Select Account..." />
                                                    <button onClick={() => { setActiveRowIdx(idx); setActiveModal('row_acc'); setSearchTerm(''); }} className="w-8 h-10 flex items-center justify-center text-blue-500 hover:bg-blue-50 group-hover:bg-blue-100/50">
                                                        <Search size={14} />
                                                    </button>
                                                </div>
                                            </td>
                                            <td className="p-0 border-r border-gray-100">
                                                <div className="flex h-10">
                                                    <input type="text" readOnly value={row.ccCode} className="flex-1 bg-transparent px-3 outline-none" placeholder="Select CC..." />
                                                    <button onClick={() => { setActiveRowIdx(idx); setActiveModal('row_cc'); setSearchTerm(''); }} className="w-8 h-10 flex items-center justify-center text-blue-500 hover:bg-blue-50 group-hover:bg-blue-100/50">
                                                        <Search size={14} />
                                                    </button>
                                                </div>
                                            </td>
                                            <td className="p-0 border-r border-gray-100">
                                                <input 
                                                    type="number" 
                                                    step="0.01" 
                                                    value={row.amount} 
                                                    onChange={(e) => handleRowChange(idx, 'amount', e.target.value)} 
                                                    className="w-full h-10 px-4 text-right bg-transparent outline-none focus:bg-blue-50 font-black text-slate-800" 
                                                />
                                            </td>
                                            <td className="p-0 border-r border-gray-100">
                                                <input 
                                                    type="text" 
                                                    value={row.memo} 
                                                    onChange={(e) => handleRowChange(idx, 'memo', e.target.value)} 
                                                    className="w-full h-10 px-4 bg-transparent outline-none italic font-medium text-gray-500" 
                                                    placeholder="Line remark..."
                                                />
                                            </td>
                                            <td className="px-4 py-1.5 text-center">
                                                <button onClick={() => deleteRow(idx)} className="text-red-300 hover:text-red-500 transition-colors p-1">
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <div className="p-3 bg-gray-50/50 flex justify-start">
                                <button onClick={addRow} className="px-5 h-8 bg-[#0078d4] text-white text-[11px] font-bold rounded-sm flex items-center gap-2 hover:bg-[#005a9e] shadow-sm active:scale-95 transition-all">
                                    <Plus size={14} /> Add Spend Item
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </SimpleModal>

            {/* Selection Modals */}
            {activeModal && (
                <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setActiveModal(null)} />
                    <div className="relative w-full max-w-2xl bg-white shadow-2xl rounded-xl border border-gray-100 overflow-hidden flex flex-col max-h-[85vh]">
                        <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50 font-['Plus_Jakarta_Sans']">
                            <h3 className="text-lg font-bold text-slate-800 tracking-tight uppercase">
                                Search {activeModal.replace('row_', '').replace('cc', 'cost center')}
                            </h3>
                            <div className="flex gap-4">
                                <input 
                                    type="text" 
                                    placeholder="Search by code or name..." 
                                    className="h-9 border border-gray-300 px-3 text-sm rounded-md w-64 focus:border-blue-500 outline-none" 
                                    value={searchTerm} 
                                    onChange={(e) => setSearchTerm(e.target.value)} 
                                    autoFocus
                                />
                                <button 
                                    onClick={() => setActiveModal(null)} 
                                    className="w-9 h-8 flex items-center justify-center bg-[#ff3b30] hover:bg-[#e03127] text-white rounded-[8px] shadow-[0_4px_12px_rgba(255,59,48,0.3)] hover:shadow-[0_6px_20px_rgba(255,59,48,0.4)] transition-all active:scale-90 outline-none border-none group"
                                    title="Close"
                                >
                                    <X size={18} strokeWidth={4} className="group-hover:scale-110 transition-transform" />
                                </button>
                            </div>
                        </div>
                        <div className="overflow-y-auto p-2 font-['Inter']">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50 sticky top-0 text-gray-600 font-bold uppercase text-[11px] tracking-wider">
                                    <tr>
                                        <th className="p-3 border-b">Code</th>
                                        <th className="p-3 border-b">Name</th>
                                        <th className="p-3 border-b text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredLookup().map((item, idx) => (
                                        <tr key={idx} className="hover:bg-blue-50 transition-colors group cursor-pointer" onClick={() => {
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
                                            <td className="p-3 border-b font-medium text-gray-700">{item.code}</td>
                                            <td className="p-3 border-b font-medium uppercase text-blue-600">{item.name}</td>
                                            <td className="p-3 border-b text-center">
                                                <button className="bg-[#0078d4] text-white text-[10px] px-3 py-1.5 rounded-sm font-bold hover:bg-[#005a9e]">SELECT</button>
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredLookup().length === 0 && (
                                        <tr><td colSpan="3" className="p-8 text-center text-gray-400 font-medium italic">No results found for "{searchTerm}"</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default MainCashBoard;
