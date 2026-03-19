import React, { useState, useEffect } from 'react';
import SimpleModal from '../components/SimpleModal';
import { Search, Calendar, ChevronDown, Trash2 } from 'lucide-react';
import { enterBillService } from '../services/enterBill.service';
import { toast } from 'react-hot-toast';

const EnterBillBoard = ({ isOpen, onClose }) => {
    const [selectedTab, setSelectedTab] = useState('Expenses');
    const [billType, setBillType] = useState('Bill');
    const [lookups, setLookups] = useState({ payAccounts: [], expAccounts: [], costCenters: [], vendors: [] });
    
    const [formData, setFormData] = useState({
        docNo: '',
        vendorId: '',
        accId: '',
        terms: '',
        memo: '',
        billNo: '',
        refNo: '',
        postDate: new Date().toISOString().split('T')[0],
        billDueDate: new Date().toISOString().split('T')[0],
        costCenter: '',
        company: '',
        createUser: 'SYSTEM'
    });

    const [expenses, setExpenses] = useState([]);
    
    // Line entry state
    const [currentLine, setCurrentLine] = useState({
        accCode: '',
        costCenter: '',
        amount: '',
        memo: ''
    });

    useEffect(() => {
        if (isOpen) {
            fetchLookups();
            generateDocNo();
            
            const companyData = localStorage.getItem('selectedCompany');
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            let companyCode = 'C001';
            
            if (companyData) {
                try {
                    const parsed = JSON.parse(companyData);
                    companyCode = parsed.company_Code || parsed.companyCode || parsed.CompanyCode || companyData;
                } catch (e) { companyCode = companyData; }
            }
            
            setFormData(prev => ({ 
                ...prev, 
                company: companyCode,
                createUser: user?.emp_Name || user?.empName || 'SYSTEM' 
            }));
        }
    }, [isOpen]);

    const fetchLookups = async () => {
        try {
            const data = await enterBillService.getLookups();
            setLookups(data);
        } catch (error) {
            toast.error('Failed to load lookups.');
        }
    };

    const generateDocNo = async () => {
        try {
            const data = await enterBillService.generateDocNo();
            setFormData(prev => ({ ...prev, docNo: data.docNo }));
        } catch (error) {
            toast.error('Failed to generate document number.');
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleLineChange = (e) => {
        const { name, value } = e.target;
        setCurrentLine(prev => ({ ...prev, [name]: value }));
    };

    const handleAddLine = (e) => {
        if (e.key === 'Enter' || e.type === 'click') {
            if (!currentLine.accCode || !currentLine.amount || parseFloat(currentLine.amount) === 0) {
                toast.error('Please select an account and enter a valid amount.');
                return;
            }
            setExpenses([...expenses, { ...currentLine, amount: parseFloat(currentLine.amount) }]);
            setCurrentLine({ accCode: '', costCenter: '', amount: '', memo: '' });
        }
    };

    const handleRemoveLine = (idx) => {
        setExpenses(expenses.filter((_, i) => i !== idx));
    };

    const calculateTotal = () => expenses.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0).toFixed(2);

    const handleClear = () => {
        setExpenses([]);
        setCurrentLine({ accCode: '', costCenter: '', amount: '', memo: '' });
        setFormData({
            ...formData,
            vendorId: '',
            accId: '',
            terms: '',
            memo: '',
            billNo: '',
            refNo: '',
            costCenter: ''
        });
        generateDocNo();
    };

    const handleSave = async () => {
        if (!formData.vendorId) return toast.error('Vendor is required.');
        if (!formData.accId) return toast.error('A/P Account (Payable) is required.');
        if (expenses.length === 0) return toast.error('At least one expense line is required.');

        try {
            await enterBillService.save({
                ...formData,
                billType,
                netAmount: parseFloat(calculateTotal()),
                expenses: expenses
            });
            toast.success('Bill saved successfully!');
            handleClear();
        } catch (error) {
            toast.error(error.toString());
        }
    };

    return (
        <SimpleModal
            isOpen={isOpen}
            onClose={onClose}
            title="Enter Bill"
            maxWidth="max-w-[1100px]"
            footer={
                <div className="flex justify-end gap-3 w-full">
                    <button onClick={handleSave} className="px-12 h-8 bg-[#0078d4] text-white text-[13px] font-bold rounded-sm border border-[#005a9e] hover:bg-[#005a9e] shadow-sm transition-all focus:ring-2 focus:ring-blue-400">
                        Save
                    </button>
                    <button onClick={handleClear} className="px-12 h-8 bg-[#0078d4] text-white text-[13px] font-bold rounded-sm border border-[#005a9e] hover:bg-[#005a9e] shadow-sm transition-all focus:ring-2 focus:ring-blue-400">
                        Clear
                    </button>
                    <button onClick={onClose} className="px-12 h-8 bg-[#0078d4] text-white text-[13px] font-bold rounded-sm border border-[#005a9e] hover:bg-[#005a9e] shadow-sm transition-all focus:ring-2 focus:ring-blue-400">
                        Exit
                    </button>
                </div>
            }
        >
            <div className="space-y-1.5 font-['Inter']">
                {/* Header Information Section */}
                <div className="bg-white p-3 border border-gray-200 rounded-sm shadow-sm space-y-2">
                    <div className="grid grid-cols-12 gap-x-8 gap-y-3">
                        <div className="col-span-4 flex items-center gap-3">
                            <label className="text-[13px] font-bold text-gray-700 w-20 shrink-0">Doc No</label>
                            <input 
                                type="text" 
                                name="docNo"
                                value={formData.docNo}
                                readOnly
                                className="flex-1 h-7 border border-[#0078d4]/30 px-2 text-[13px] font-bold text-[#0078d4] bg-blue-50/30 rounded-sm outline-none"
                            />
                        </div>

                        <div className="col-span-4 flex items-center justify-center gap-6">
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <input type="radio" checked={billType === 'Bill'} onChange={() => setBillType('Bill')} className="w-4 h-4 text-[#0078d4] focus:ring-[#0078d4]" />
                                <span className="text-[13px] font-bold text-gray-700 group-hover:text-blue-600">Bill</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <input type="radio" checked={billType === 'Credit'} onChange={() => setBillType('Credit')} className="w-4 h-4 text-[#0078d4] focus:ring-[#0078d4]" />
                                <span className="text-[13px] font-bold text-gray-700 group-hover:text-blue-600">Credit</span>
                            </label>
                        </div>

                        <div className="col-span-4 flex items-center justify-end gap-3">
                            <label className="text-[13px] font-bold text-gray-700">Date</label>
                            <input type="date" name="postDate" value={formData.postDate} onChange={handleInputChange} className="h-7 w-[140px] px-2 text-[13px] border border-gray-300 rounded-sm outline-none text-gray-700" />
                        </div>

                        <div className="col-span-12 flex justify-center -mt-2">
                             <span className="text-[16px] font-black italic text-[#0078d4] tracking-tight py-0.5">{billType}</span>
                        </div>

                        {/* Left Column Fields */}
                        <div className="col-span-7 space-y-1.5">
                            <div className="flex items-center gap-3">
                                <label className="text-[13px] font-bold text-gray-700 w-24 shrink-0">Vendor</label>
                                <select name="vendorId" value={formData.vendorId} onChange={handleInputChange} className="flex-1 h-7 border border-gray-300 px-2 text-[13px] focus:border-blue-500 outline-none rounded-sm bg-white font-bold text-[#b91c1c]">
                                    <option value="">Select Vendor...</option>
                                    {lookups.vendors.map((v, i) => <option key={i} value={v.code}>{v.name}</option>)}
                                </select>
                            </div>
                            <div className="flex items-center gap-3">
                                <label className="text-[13px] font-bold text-gray-700 w-24 shrink-0">Cost Center</label>
                                <select name="costCenter" value={formData.costCenter} onChange={handleInputChange} className="flex-1 h-7 border border-gray-300 px-2 text-[13px] focus:border-blue-500 outline-none rounded-sm bg-white">
                                    <option value="">Select Cost Center...</option>
                                    {lookups.costCenters.map((c, i) => <option key={i} value={c.code}>{c.name}</option>)}
                                </select>
                            </div>
                            <div className="flex items-center gap-3 pt-1">
                                <label className="text-[13px] font-bold text-gray-700 w-24 shrink-0">Terms</label>
                                <input name="terms" value={formData.terms} onChange={handleInputChange} type="text" className="flex-1 h-7 border-b border-gray-300 px-2 text-[13px] focus:border-b-blue-500 outline-none bg-transparent" />
                            </div>
                            <div className="flex items-center gap-3">
                                <label className="text-[13px] font-bold text-gray-700 w-24 shrink-0">Memo</label>
                                <input name="memo" value={formData.memo} onChange={handleInputChange} type="text" className="flex-1 h-7 border-b border-gray-300 px-2 text-[13px] focus:border-b-blue-500 outline-none bg-transparent" />
                            </div>
                        </div>

                        {/* Right Column Fields */}
                        <div className="col-span-5 space-y-1.5">
                            <div className="flex items-center gap-3">
                                <label className="text-[13px] font-bold text-gray-700 w-32 shrink-0">A/P Account</label>
                                <select name="accId" value={formData.accId} onChange={handleInputChange} className="flex-1 h-7 border border-gray-300 px-2 text-[13px] font-medium bg-white rounded-sm">
                                    <option value="">Select A/P Account...</option>
                                    {lookups.payAccounts.map((a, i) => <option key={i} value={a.code}>{a.code} - {a.name}</option>)}
                                </select>
                            </div>
                            <div className="flex items-center gap-3">
                                <label className="text-[13px] font-bold text-gray-700 w-32 shrink-0">Bill No</label>
                                <input name="billNo" value={formData.billNo} onChange={handleInputChange} type="text" className="flex-1 h-7 border-b border-gray-300 px-2 text-[13px] outline-none" />
                            </div>
                            <div className="flex items-center gap-3">
                                <label className="text-[13px] font-bold text-gray-700 w-32 shrink-0">Reference No</label>
                                <input name="refNo" value={formData.refNo} onChange={handleInputChange} type="text" className="flex-1 h-7 border-b border-gray-300 px-2 text-[13px] outline-none" />
                            </div>
                            <div className="flex items-center gap-3">
                                <label className="text-[13px] font-bold text-gray-700 w-32 shrink-0">Amount Due</label>
                                <div className="flex-1 h-7 border-b border-gray-300 px-2 text-[14px] font-black text-[#b91c1c] text-right flex items-center justify-end">
                                    {calculateTotal()}
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <label className="text-[13px] font-bold text-gray-700 w-32 shrink-0">Bill Due Date</label>
                                <input type="date" name="billDueDate" value={formData.billDueDate} onChange={handleInputChange} className="flex-1 h-7 border border-gray-300 px-2 text-[13px] outline-none rounded-sm bg-white text-gray-700" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Account Details Table Section */}
                <div className="space-y-0">
                    <div className="flex gap-0.5 border-b border-gray-300 px-1">
                        <button className="px-12 py-2 text-[13px] font-bold rounded-t-sm border border-gray-300 border-b-0 bg-white text-[#0078d4] shadow-[0_-2px_0_#0078d4] -mb-[1px]">
                            Expenses
                        </button>
                    </div>

                    <div className="border border-gray-300 rounded-b-sm bg-white shadow-sm flex flex-col min-h-[220px]">
                        <div className="flex bg-[#f8fafd] border-b border-gray-300 text-[12px] font-bold text-gray-700 tracking-wide uppercase">
                            <div className="flex-[2] py-2 px-4 border-r border-gray-300">Expense Account</div>
                            <div className="flex-[1.5] py-2 px-4 border-r border-gray-300">Cost Center</div>
                            <div className="flex-1 py-2 px-4 border-r border-gray-300 text-right">Amount</div>
                            <div className="flex-[2] py-2 px-4 border-r border-gray-300">Memo</div>
                            <div className="w-12 py-2 px-2 text-center">Del</div>
                        </div>
                        
                        <div className="flex-1 bg-white overflow-y-auto max-h-[140px]">
                            {expenses.map((exp, idx) => (
                                <div key={idx} className="flex border-b border-gray-100 text-[12px] font-semibold text-gray-600 hover:bg-blue-50/50">
                                    <div className="flex-[2] py-1.5 px-4 border-r border-gray-100 truncate flex items-center">{exp.accCode}</div>
                                    <div className="flex-[1.5] py-1.5 px-4 border-r border-gray-100 truncate flex items-center">{exp.costCenter}</div>
                                    <div className="flex-1 py-1.5 px-4 border-r border-gray-100 text-right font-bold text-blue-700 flex items-center justify-end">{exp.amount.toFixed(2)}</div>
                                    <div className="flex-[2] py-1.5 px-4 border-r border-gray-100 truncate flex items-center">{exp.memo}</div>
                                    <div className="w-12 py-1 flex justify-center items-center">
                                        <button onClick={() => handleRemoveLine(idx)} className="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 p-1 rounded-sm"><Trash2 size={12} /></button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Entry Input Row */}
                        <div className="flex border-t-2 border-[#bae6fd] bg-[#f0f9ff] p-1 gap-1 items-center">
                             <div className="flex-[2] relative">
                                <select name="accCode" value={currentLine.accCode} onChange={handleLineChange} className="w-full h-8 border border-blue-200 px-2 text-[12px] font-bold bg-white rounded-sm outline-none focus:border-blue-500">
                                    <option value="">Select Expense Account...</option>
                                    {lookups.expAccounts.map((a, i) => <option key={i} value={a.code}>{a.code} - {a.name}</option>)}
                                </select>
                             </div>
                             <div className="flex-[1.5] relative">
                                <select name="costCenter" value={currentLine.costCenter} onChange={handleLineChange} className="w-full h-8 border border-blue-200 px-2 text-[12px] font-bold bg-white rounded-sm outline-none focus:border-blue-500">
                                    <option value="">None</option>
                                    {lookups.costCenters.map((c, i) => <option key={i} value={c.code}>{c.name}</option>)}
                                </select>
                             </div>
                             <div className="flex-1">
                                <input name="amount" value={currentLine.amount} onChange={handleLineChange} onKeyDown={handleAddLine} type="number" placeholder="0.00" className="w-full h-8 border border-blue-200 px-2 text-[13px] text-right font-black text-[#0078d4] rounded-sm outline-none focus:border-blue-500 placeholder:text-blue-300 bg-white" />
                             </div>
                             <div className="flex-[2] flex gap-1">
                                <input name="memo" value={currentLine.memo} onChange={handleLineChange} onKeyDown={handleAddLine} type="text" placeholder="Entry Memo..." className="flex-1 h-8 border border-blue-200 px-2 text-[12px] font-bold rounded-sm outline-none focus:border-blue-500 bg-white" />
                                <button onClick={handleAddLine} className="px-4 h-8 bg-[#0078d4] text-white font-bold text-[11px] uppercase tracking-wider rounded-sm hover:bg-[#005a9e] whitespace-nowrap">Add</button>
                             </div>
                             <div className="w-12" />
                        </div>
                    </div>
                </div>
            </div>
        </SimpleModal>
    );
};

export default EnterBillBoard;
