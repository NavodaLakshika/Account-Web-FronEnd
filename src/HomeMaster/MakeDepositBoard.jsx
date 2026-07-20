import React, { useState, useEffect, useMemo } from 'react';
import SimpleModal from '../components/SimpleModal';
import { Search, Calendar, CheckCircle, RotateCcw, X, Plus, Save , FileText} from 'lucide-react';
import { makeDepositService } from '../services/makeDeposit.service';
import { getSessionData } from '../utils/session';
import CalendarModal from '../components/CalendarModal';
import { showSuccessToast, showErrorToast } from '../utils/toastUtils';
import TransactionFormWrapper from '../components/TransactionFormWrapper';


const MakeDepositBoard = ({ isOpen, onClose }) => {
    const { companyCode, userName } = getSessionData();

    const [formData, setFormData] = useState({
        docNo: '',
        company: companyCode,
        createUser: userName,
        costCenter: '',
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
            const { companyCode: comp, userName: user } = getSessionData();
            setFormData(prev => ({ ...prev, company: comp, createUser: user }));
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
            showErrorToast(error.message || 'Failed to load funds');
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
            costCenter: '',
            department: '',
            payMode: 'All Payment Types',
            dateFrom: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
            dateTo: new Date().toISOString().split('T')[0],
        }));
    };

    const handleDone = async () => {
        if (selectedDocNos.size === 0) {
            showErrorToast('Please select at least one document to deposit.');
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
            showSuccessToast('Funds applied for deposit successfully!');
            handleClear();
            onClose();
        } catch (error) {
            showErrorToast(error.message || 'Failed to apply deposit');
        }
    };

    const handleSaveDraft = async () => {
        if (selectedDocNos.size === 0) {
            showErrorToast('Please select at least one document to deposit.');
            return;
        }

        try {
            await makeDepositService.saveDraft({
                company: formData.company,
                costCenter: formData.costCenter,
                payMode: formData.payMode,
                selectedDocNos: Array.from(selectedDocNos),
                totalAmount: totals.sum
            });
            showSuccessToast('Deposit draft saved successfully!');
            handleClear();
            onClose();
        } catch (error) {
            showErrorToast(error.message || 'Failed to save deposit draft');
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
        <TransactionFormWrapper subtitle="Transaction Management" icon={FileText}
            isOpen={isOpen}
            onClose={onClose}
            title="Collection to Deposit"
            maxWidth="max-w-[700px]"
            footer={
                <div className="px-6 h-10 bg-gray-50 text-gray-600 text-sm font-bold rounded-[3px] hover:bg-gray-100 transition-all active:scale-95 flex items-center justify-center gap-2 border border-gray-100">
                    <div className="flex gap-3">
                        <button
                            onClick={handleClear}
                            className="px-6 h-10 bg-white text-[#00adff] border-2 border-[#00adff] hover:bg-blue-50 text-sm font-black rounded-[3px] hover:bg-[#0099e6] transition-all active:scale-95 flex items-center gap-2 border-none"
                        >
                            <RotateCcw size={14} /> CLEAR
                        </button>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={handleSaveDraft}
                            className="px-6 h-10 bg-white text-[#0285fd] text-sm font-black rounded-[3px] border-2 border-[#0285fd] hover:bg-blue-50 transition-all active:scale-95 flex items-center justify-center gap-2"
                        >
                            <Save size={14} /> SAVE DRAFT
                        </button>
                        <button
                            onClick={handleDone}
                            className="px-6 h-10 bg-white text-[#2bb744] border-2 border-[#2bb744] hover:bg-green-50 text-sm font-black rounded-[3px] shadow-md shadow-green-100 hover:bg-[#259b3a] transition-all active:scale-95 flex items-center gap-2 border-none"
                        >
                            <CheckCircle size={14} /> APPLY
                        </button>
                    </div>
                </div>
            }
        >
            <div className="space-y-4 overflow-y-auto no-scrollbar font-['Tahoma']">
                <div className="bg-white p-4 border border-gray-200 rounded-[3px] shadow-sm space-y-4">
                    <div className="grid grid-cols-12 gap-x-6 gap-y-3.5">

                        <div className="col-span-4 flex items-center gap-2">
                            <label className="text-[12.5px] font-bold text-gray-700 w-24 shrink-0">Cost Center</label>
                            <input type="text" name="costCenter" value={formData.costCenter} onChange={handleInput} className="px-6 h-10 bg-gray-50 text-gray-600 text-sm font-bold rounded-[3px] hover:bg-gray-100 transition-all active:scale-95 flex items-center justify-center gap-2 border border-gray-100" />
                        </div>

                        <div className="col-span-4 flex items-center gap-2">
                            <label className="text-[12.5px] font-bold text-gray-700 w-24 shrink-0">Date From</label>
                            <div className="flex-1 flex gap-1 h-8 min-w-0">
                                <input
                                    type="text"
                                    readOnly
                                    value={formData.dateFrom}
                                    className="px-6 h-10 bg-gray-50 text-gray-600 text-sm font-bold rounded-[3px] hover:bg-gray-100 transition-all active:scale-95 flex items-center justify-center gap-2 border border-gray-100"
                                    onClick={() => { setDatePickerField('dateFrom'); setShowDatePicker(true); }}
                                />
                                <button
                                    onClick={() => { setDatePickerField('dateFrom'); setShowDatePicker(true); }}
                                    className="w-10 h-8 bg-[#0285fd] text-slate-800 dark:text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[3px] transition-all shadow-md active:scale-95 shrink-0"
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
                                    className="px-6 h-10 bg-gray-50 text-gray-600 text-sm font-bold rounded-[3px] hover:bg-gray-100 transition-all active:scale-95 flex items-center justify-center gap-2 border border-gray-100"
                                    onClick={() => { setDatePickerField('dateTo'); setShowDatePicker(true); }}
                                />
                                <button
                                    onClick={() => { setDatePickerField('dateTo'); setShowDatePicker(true); }}
                                    className="w-10 h-8 bg-[#0285fd] text-slate-800 dark:text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[3px] transition-all shadow-md active:scale-95 shrink-0"
                                >
                                    <Calendar size={16} />
                                </button>
                            </div>
                        </div>

                        <div className="col-span-4 flex items-center gap-2">
                            <label className="text-[12.5px] font-bold text-gray-700 w-24 shrink-0">Pay Mode</label>
                            <select name="payMode" value={formData.payMode} onChange={handleInput} className="px-6 h-10 bg-gray-50 text-gray-600 text-sm font-bold rounded-[3px] hover:bg-gray-100 transition-all active:scale-95 flex items-center justify-center gap-2 border border-gray-100">
                                <option value="Cash">Cash</option>
                                <option value="Cheque">Cheque</option>
                                <option value="Direct Deposit">Direct Deposit</option>
                                <option value="Credit Card">Credit Card</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>

                        <div className="col-span-4 flex items-center gap-2">
                            <label className="text-[12.5px] font-bold text-gray-700 w-24 shrink-0">Department</label>
                            <input type="text" name="department" value={formData.department} onChange={handleInput} className="px-6 h-10 bg-gray-50 text-gray-600 text-sm font-bold rounded-[3px] hover:bg-gray-100 transition-all active:scale-95 flex items-center justify-center gap-2 border border-gray-100" />
                        </div>

                        <div className="col-span-4 flex items-center gap-2 justify-end">
                            <button onClick={loadFunds} disabled={isLoading} className="px-6 h-8 bg-[#0285fd] text-slate-800 dark:text-white text-[12px] font-black rounded-[3px] hover:bg-[#0073ff] transition-all shadow-md active:scale-95 flex items-center gap-2">
                                <Search size={14} /> {isLoading ? 'LOADING...' : 'LOAD FUNDS'}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="border border-gray-200 rounded-[3px] bg-white shadow-sm flex flex-col min-h-[350px] overflow-hidden">
                    <div className="flex bg-slate-50/80 border-b border-gray-200 text-[10px] font-black text-gray-400 uppercase tracking-widest items-center">
                        <div className="px-6 h-10 bg-gray-50 text-gray-600 text-sm font-bold rounded-[3px] hover:bg-gray-100 transition-all active:scale-95 flex items-center justify-center gap-2 border border-gray-100">
                            <input type="checkbox" checked={funds.length > 0 && selectedDocNos.size === funds.length} onChange={toggleAll} className="w-3.5 h-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-600" />
                        </div>
                        <div className="px-6 h-10 bg-gray-50 text-gray-600 text-sm font-bold rounded-[3px] hover:bg-gray-100 transition-all active:scale-95 flex items-center justify-center gap-2 border border-gray-100">Document No</div>
                        <div className="px-6 h-10 bg-gray-50 text-gray-600 text-sm font-bold rounded-[3px] hover:bg-gray-100 transition-all active:scale-95 flex items-center justify-center gap-2 border border-gray-100">Date</div>
                        <div className="px-6 h-10 bg-gray-50 text-gray-600 text-sm font-bold rounded-[3px] hover:bg-gray-100 transition-all active:scale-95 flex items-center justify-center gap-2 border border-gray-100">Type</div>
                        <div className="px-6 h-10 bg-gray-50 text-gray-600 text-sm font-bold rounded-[3px] hover:bg-gray-100 transition-all active:scale-95 flex items-center justify-center gap-2 border border-gray-100">Pay Mode</div>
                        <div className="px-6 h-10 bg-gray-50 text-gray-600 text-sm font-bold rounded-[3px] hover:bg-gray-100 transition-all active:scale-95 flex items-center justify-center gap-2 border border-gray-100">Reference</div>
                        <div className="px-6 h-10 bg-blue-50 text-blue-600 text-sm font-bold rounded-[3px] hover:bg-blue-100 transition-all active:scale-95 flex items-center justify-center gap-2 border border-blue-100">Amount</div>
                        <div className="px-6 h-10 bg-blue-50 text-blue-600 text-sm font-bold rounded-[3px] hover:bg-blue-100 transition-all active:scale-95 flex items-center justify-center gap-2 border border-blue-100">Balance</div>
                    </div>

                    <div className="flex-1 bg-white overflow-y-auto max-h-[320px] divide-y divide-gray-50">
                        {funds.length === 0 ? (
                            <div className="h-32 flex flex-col items-center justify-center text-gray-300 space-y-2">
                                <Search size={32} className="opacity-20" />
                                <span className="text-[11px] font-bold uppercase tracking-widest italic">No undeposited funds found</span>
                            </div>
                        ) : funds.map((f, idx) => (
                            <div key={idx} onClick={() => toggleDocSelection(f.docNo)} className={`flex border-b border-gray-200 text-[11px] font-bold text-slate-700 hover:bg-blue-50/30 items-center transition-colors cursor-pointer ${selectedDocNos.has(f.docNo) ? 'bg-blue-50/50' : ''}`}>
                                <div className="px-6 h-10 bg-gray-50 text-gray-600 text-sm font-bold rounded-[3px] hover:bg-gray-100 transition-all active:scale-95 flex items-center justify-center gap-2 border border-gray-100">
                                    <input type="checkbox" checked={selectedDocNos.has(f.docNo)} readOnly className="w-3.5 h-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-600" />
                                </div>
                                <div className="px-6 h-10 bg-gray-50 text-gray-600 text-sm font-bold rounded-[3px] hover:bg-gray-100 transition-all active:scale-95 flex items-center justify-center gap-2 border border-gray-100">{f.docNo}</div>
                                <div className="px-6 h-10 bg-gray-50 text-gray-600 text-sm font-bold rounded-[3px] hover:bg-gray-100 transition-all active:scale-95 flex items-center justify-center gap-2 border border-gray-100">{f.date?.split('T')[0] || ''}</div>
                                <div className="px-6 h-10 bg-gray-50 text-gray-600 text-sm font-bold rounded-[3px] hover:bg-gray-100 transition-all active:scale-95 flex items-center justify-center gap-2 border border-gray-100">{f.type || ''}</div>
                                <div className="px-6 h-10 bg-gray-50 text-gray-600 text-sm font-bold rounded-[3px] hover:bg-gray-100 transition-all active:scale-95 flex items-center justify-center gap-2 border border-gray-100">{f.payType || ''}</div>
                                <div className="px-6 h-10 bg-gray-50 text-gray-600 text-sm font-bold rounded-[3px] hover:bg-gray-100 transition-all active:scale-95 flex items-center justify-center gap-2 border border-gray-100">{f.reference || '-'}</div>
                                <div className="px-6 h-10 bg-slate-50 text-slate-600 text-sm font-bold rounded-[3px] hover:bg-slate-100 transition-all active:scale-95 flex items-center justify-center gap-2 border border-slate-100">{parseFloat(f.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                                <div className="px-6 h-10 bg-slate-50 text-slate-600 text-sm font-bold rounded-[3px] hover:bg-slate-100 transition-all active:scale-95 flex items-center justify-center gap-2 border border-slate-100">{parseFloat(f.balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex flex-row justify-end items-end gap-x-12">
                    <div className="w-[320px] bg-white border border-gray-200 rounded-[3px] p-4 space-y-3 shadow-sm">
                        <div className="flex items-center justify-between bg-slate-50 p-2 rounded-[3px] border border-gray-200">
                            <span className="text-[13px] font-black text-slate-900 uppercase">To Be Deposited</span>
                            <div className="text-[18px] font-mono font-black text-blue-600 tracking-tighter">
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
        </TransactionFormWrapper>
    );
};

export default MakeDepositBoard;




