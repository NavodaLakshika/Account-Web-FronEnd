import React, { useState, useEffect, useMemo } from 'react';
import SimpleModal from '../components/SimpleModal';
import { Search, Calendar, CheckCircle, RotateCcw, X, Plus } from 'lucide-react';
import { makeDepositService } from '../services/makeDeposit.service';
import { toast } from 'react-hot-toast';
import CalendarModal from '../components/CalendarModal';

const MakeDepositBoard = ({ isOpen, onClose }) => {
    const [formData, setFormData] = useState({
        docNo: 'SYSTEM GENERATED',
        company: 'C001',
        createUser: 'SYSTEM',
        costCenter: 'CC001',
        dateFrom: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
        dateTo: new Date().toISOString().split('T')[0],
        payMode: 'All Payment Types',
        department: '',
    });

    const [funds, setFunds] = useState([]);
    const [selectedDocNos, setSelectedDocNos] = useState(new Set());
    const [isLoading, setIsLoading] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [datePickerField, setDatePickerField] = useState('dateFrom');

    useEffect(() => {
        if (isOpen) {
            const companyData = localStorage.getItem('selectedCompany');
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            let companyCode = 'C001';
            if (companyData) {
                try {
                    const parsed = JSON.parse(companyData);
                    companyCode = parsed.company_Code || parsed.companyCode || parsed.CompanyCode || companyData;
                } catch (e) { companyCode = companyData; }
            }

            const initUser = user?.emp_Name || user?.empName || 'SYSTEM';

            setFormData(prev => ({ ...prev, company: companyCode, createUser: initUser }));
        }
    }, [isOpen]);

    const handleInput = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleDateSelect = (formattedDate) => {
        setFormData(prev => ({ ...prev, [datePickerField]: formattedDate }));
        setShowDatePicker(false);
    };

    const loadFunds = async () => {
        setIsLoading(true);
        try {
            const data = await makeDepositService.getUndepositedFunds(
                formData.company,
                formData.costCenter,
                formData.payMode,
                formData.dateFrom,
                formData.dateTo
            );
            setFunds(data || []);
            setSelectedDocNos(new Set());
        } catch (error) {
            toast.error(error.message || 'Failed to load funds');
        } finally {
            setIsLoading(false);
        }
    };

    const toggleDocSelection = (docNo) => {
        const newSet = new Set(selectedDocNos);
        if (newSet.has(docNo)) {
            newSet.delete(docNo);
        } else {
            newSet.add(docNo);
        }
        setSelectedDocNos(newSet);
    };

    const toggleAll = () => {
        if (selectedDocNos.size === funds.length) {
            setSelectedDocNos(new Set());
        } else {
            setSelectedDocNos(new Set(funds.map(f => f.docNo)));
        }
    };

    const handleClear = () => {
        setFunds([]);
        setSelectedDocNos(new Set());
        setFormData(prev => ({
            ...prev,
            costCenter: 'CC001',
            department: '',
            payMode: 'All Payment Types',
            dateFrom: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
            dateTo: new Date().toISOString().split('T')[0],
        }));
    };

    const handleDone = async () => {
        if (selectedDocNos.size === 0) {
            toast.error('Please select at least one document to deposit.');
            return;
        }

        try {
            await makeDepositService.applyDeposit({
                company: formData.company,
                costCenter: formData.costCenter,
                payMode: formData.payMode,
                selectedDocNos: Array.from(selectedDocNos),
                totalAmount: totals.sum
            });
            toast.success('Funds applied for deposit successfully!');
            handleClear();
            onClose(); // Optional: close or keep open to process more
        } catch (error) {
            toast.error(error.message || 'Failed to apply deposit');
        }
    };

    const totals = useMemo(() => {
        let sum = 0;
        funds.forEach(f => {
            if (selectedDocNos.has(f.docNo)) {
                sum += (f.balance || f.amount || 0);
            }
        });
        return { sum };
    }, [funds, selectedDocNos]);

    return (
        <SimpleModal
            isOpen={isOpen}
            onClose={onClose}
            title="Collection to Deposit"
            maxWidth="max-w-[1050px]"
            footer={
                <div className="bg-slate-50 px-6 py-4 w-full flex justify-between items-center border-t border-gray-100 rounded-b-xl">
                    <div className="flex gap-3">
                        <button
                            onClick={handleClear}
                            className="px-6 h-10 bg-[#00adff] text-white text-sm font-black rounded-[5px] hover:bg-[#0099e6] transition-all active:scale-95 flex items-center gap-2 border-none"
                        >
                            <RotateCcw size={14} /> CLEAR
                        </button>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={handleDone}
                            className="px-6 h-10 bg-[#2bb744] text-white text-sm font-black rounded-[5px] shadow-md shadow-green-100 hover:bg-[#259b3a] transition-all active:scale-95 flex items-center gap-2 border-none"
                        >
                            <CheckCircle size={14} /> PROCEED TO DEPOSIT
                        </button>
                    </div>
                </div>
            }
        >
            <div className="space-y-4 overflow-y-auto no-scrollbar font-['Tahoma']">
                <div className="bg-white p-4 border border-gray-100 rounded-lg shadow-sm space-y-4">
                    <div className="grid grid-cols-12 gap-x-6 gap-y-3.5">
                        
                        <div className="col-span-4 flex items-center gap-2">
                            <label className="text-[12.5px] font-bold text-gray-700 w-24 shrink-0">Cost Center</label>
                            <input type="text" name="costCenter" value={formData.costCenter} onChange={handleInput} className="flex-1 min-w-0 h-8 border border-gray-300 px-3 text-[12px] font-bold text-gray-700 bg-white rounded-[5px] outline-none focus:border-[#0285fd] shadow-sm" />
                        </div>

                        <div className="col-span-4 flex items-center gap-2">
                            <label className="text-[12.5px] font-bold text-gray-700 w-24 shrink-0">Date From</label>
                            <div className="flex-1 flex gap-1 h-8 min-w-0">
                                <input
                                    type="text"
                                    readOnly
                                    value={formData.dateFrom}
                                    className="flex-1 min-w-0 h-8 border border-gray-300 rounded-[5px] px-3 text-[12px] outline-none bg-white text-gray-700 font-bold cursor-pointer shadow-sm"
                                    onClick={() => { setDatePickerField('dateFrom'); setShowDatePicker(true); }}
                                />
                                <button
                                    onClick={() => { setDatePickerField('dateFrom'); setShowDatePicker(true); }}
                                    className="w-10 h-8 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[5px] transition-all shadow-md active:scale-95 shrink-0"
                                >
                                    <Calendar size={16} />
                                </button>
                            </div>
                        </div>

                        <div className="col-span-4 flex items-center gap-2">
                            <label className="text-[12.5px] font-bold text-gray-700 w-24 shrink-0">Date To</label>
                            <div className="flex-1 flex gap-1 h-8 min-w-0">
                                <input
                                    type="text"
                                    readOnly
                                    value={formData.dateTo}
                                    className="flex-1 min-w-0 h-8 border border-gray-300 rounded-[5px] px-3 text-[12px] outline-none bg-white text-gray-700 font-bold cursor-pointer shadow-sm"
                                    onClick={() => { setDatePickerField('dateTo'); setShowDatePicker(true); }}
                                />
                                <button
                                    onClick={() => { setDatePickerField('dateTo'); setShowDatePicker(true); }}
                                    className="w-10 h-8 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[5px] transition-all shadow-md active:scale-95 shrink-0"
                                >
                                    <Calendar size={16} />
                                </button>
                            </div>
                        </div>

                        <div className="col-span-4 flex items-center gap-2">
                            <label className="text-[12.5px] font-bold text-gray-700 w-24 shrink-0">Pay Mode</label>
                            <select name="payMode" value={formData.payMode} onChange={handleInput} className="flex-1 min-w-0 h-8 border border-gray-300 px-3 text-[12px] font-bold text-gray-700 bg-white rounded-[5px] outline-none focus:border-[#0285fd] shadow-sm">
                                <option value="All Payment Types">All Payment Types</option>
                                <option value="Cash">Cash</option>
                                <option value="Cheque">Cheque</option>
                                <option value="Direct Deposit">Direct Deposit</option>
                                <option value="Credit Card">Credit Card</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>

                        <div className="col-span-4 flex items-center gap-2">
                            <label className="text-[12.5px] font-bold text-gray-700 w-24 shrink-0">Department</label>
                            <input type="text" name="department" value={formData.department} onChange={handleInput} className="flex-1 min-w-0 h-8 border border-gray-300 rounded-[5px] px-3 text-[12px] outline-none bg-white text-gray-700 shadow-sm focus:border-[#0285fd]" />
                        </div>

                        <div className="col-span-4 flex items-center gap-2 justify-end">
                            <button onClick={loadFunds} disabled={isLoading} className="px-6 h-8 bg-[#0285fd] text-white text-[12px] font-black rounded-[5px] hover:bg-[#0073ff] transition-all shadow-md active:scale-95 flex items-center gap-2">
                                <Search size={14} /> {isLoading ? 'LOADING...' : 'LOAD FUNDS'}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="border border-gray-100 rounded-lg bg-white shadow-sm flex flex-col min-h-[350px] overflow-hidden">
                    {/* Table header */}
                    <div className="flex bg-slate-50/80 border-b border-gray-100 text-[10px] font-black text-gray-400 uppercase tracking-widest items-center">
                        <div className="w-12 py-2.5 px-3 border-r border-gray-100 text-center flex justify-center">
                            <input type="checkbox" checked={funds.length > 0 && selectedDocNos.size === funds.length} onChange={toggleAll} className="w-3.5 h-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-600" />
                        </div>
                        <div className="flex-[1.5] py-2.5 px-4 border-r border-gray-100">Document No</div>
                        <div className="w-28 py-2.5 px-3 border-r border-gray-100 text-center">Date</div>
                        <div className="w-24 py-2.5 px-3 border-r border-gray-100 text-center">Type</div>
                        <div className="w-28 py-2.5 px-3 border-r border-gray-100 text-center">Pay Mode</div>
                        <div className="flex-1 py-2.5 px-3 border-r border-gray-100">Reference</div>
                        <div className="w-32 py-2.5 px-4 text-right">Amount</div>
                        <div className="w-32 py-2.5 px-4 text-right">Balance</div>
                    </div>

                    <div className="flex-1 bg-white overflow-y-auto max-h-[320px] divide-y divide-gray-50">
                        {funds.length === 0 ? (
                            <div className="h-32 flex flex-col items-center justify-center text-gray-300 space-y-2">
                                <Search size={32} className="opacity-20" />
                                <span className="text-[11px] font-bold uppercase tracking-widest italic">No undeposited funds found</span>
                            </div>
                        ) : funds.map((f, idx) => (
                            <div key={idx} onClick={() => toggleDocSelection(f.docNo)} className={`flex border-b border-gray-100 text-[11px] font-bold text-slate-700 hover:bg-blue-50/30 items-center transition-colors cursor-pointer ${selectedDocNos.has(f.docNo) ? 'bg-blue-50/50' : ''}`}>
                                <div className="w-12 py-2 px-3 border-r border-gray-100 flex justify-center">
                                    <input type="checkbox" checked={selectedDocNos.has(f.docNo)} readOnly className="w-3.5 h-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-600" />
                                </div>
                                <div className="flex-[1.5] py-2 px-4 border-r border-gray-100 text-blue-600 font-mono">{f.docNo}</div>
                                <div className="w-28 py-2 px-3 border-r border-gray-100 text-center font-mono">{f.date?.split('T')[0] || ''}</div>
                                <div className="w-24 py-2 px-3 border-r border-gray-100 text-center">{f.type || ''}</div>
                                <div className="w-28 py-2 px-3 border-r border-gray-100 text-center">{f.payType || ''}</div>
                                <div className="flex-1 py-2 px-3 border-r border-gray-100 font-mono text-gray-500 truncate">{f.reference || '-'}</div>
                                <div className="w-32 py-2 px-4 text-right font-mono font-black text-slate-600">{parseFloat(f.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                                <div className="w-32 py-2 px-4 text-right font-mono font-black text-slate-800">{parseFloat(f.balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex flex-row justify-end items-end gap-x-12">
                    <div className="w-[320px] bg-white border border-gray-100 rounded-lg p-4 space-y-3 shadow-sm">
                        <div className="flex items-center justify-between bg-slate-50 p-2 rounded-md border border-gray-100">
                            <span className="text-[13px] font-black text-slate-900 uppercase">To Be Deposited</span>
                            <div className="text-[18px] font-mono font-black text-green-600 tracking-tighter">
                                {totals.sum.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {showDatePicker && (
                <CalendarModal
                    isOpen={showDatePicker}
                    onClose={() => setShowDatePicker(false)}
                    onSelectDate={handleDateSelect}
                    initialDate={formData[datePickerField]}
                />
            )}
        </SimpleModal>
    );
};

export default MakeDepositBoard;
