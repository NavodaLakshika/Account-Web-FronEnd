import React, { useState, useEffect } from 'react';
import SimpleModal from '../components/SimpleModal';
import { Search, Calendar, RotateCcw, Save, FileText } from 'lucide-react';
import { bankingService } from '../services/banking.service';
import CalendarModal from '../components/CalendarModal';
import { showSuccessToast, showErrorToast } from '../utils/toastUtils';
import TransactionFormWrapper from '../components/TransactionFormWrapper';

const ChequeRegisterBoard = ({ isOpen, onClose }) => {
    const [loading, setLoading] = useState(false);
    const [accounts, setAccounts] = useState([]);
    const [calendar, setCalendar] = useState({ isOpen: false, target: '' });
    
    const getInitialFormData = () => ({
        accCode: '',
        accName: '',
        bookNo: '',
        date: new Date().toISOString().split('T')[0],
        startNo: '',
        endNo: '',
        company: 'COM001',
        createUser: 'SYSTEM'
    });

    const [formData, setFormData] = useState(getInitialFormData());

    useEffect(() => {
        if (isOpen) {
            setFormData(getInitialFormData());
            const companyData = localStorage.getItem('selectedCompany');
            const userData = localStorage.getItem('user');
            let companyCode = 'COM001';
            let userName = 'SYSTEM';

            if (companyData) {
                try {
                    const parsed = JSON.parse(companyData);
                    companyCode = parsed.company_Code || parsed.companyCode || parsed.CompanyCode || companyData;
                } catch (e) { companyCode = companyData; }
            }

            if (userData) {
                try {
                    const parsed = JSON.parse(userData);
                    userName = parsed.emp_Name || parsed.empName || parsed.EmpName || userName;
                } catch (e) { }
            }

            setFormData(prev => ({ 
                ...prev, 
                company: companyCode, 
                createUser: userName 
            }));
            fetchLookups(companyCode);
        }
    }, [isOpen]);

    const fetchLookups = async (compCode, accCode = '') => {
        const data = await bankingService.getChequeBookLookups(compCode, accCode);
        if (!accCode) {
            setAccounts(data.accounts || []);
        } else {
            setFormData(prev => ({ ...prev, bookNo: data.nextBookNo }));
        }
    };

    const handleAccountSelect = (acc) => {
        setFormData(prev => ({ ...prev, accCode: acc.code, accName: acc.name }));
        fetchLookups(formData.company, acc.code);
    };

    const handleClear = () => {
        setFormData(prev => ({
            ...prev,
            accCode: '',
            accName: '',
            bookNo: '',
            startNo: '',
            endNo: '',
            date: new Date().toISOString().split('T')[0]
        }));
    };

    const handleSave = async () => {
        if (!formData.accCode) return showErrorToast('Please select an account');
        if (!formData.startNo || !formData.endNo) return showErrorToast('Please enter cheque range');
        
        const start = parseInt(formData.startNo);
        const end = parseInt(formData.endNo);
        
        if (isNaN(start) || isNaN(end) || start > end) {
            return showErrorToast('Invalid cheque range');
        }

        setLoading(true);
        try {
            await bankingService.saveChequeBook({
                accountCode: formData.accCode,
                bookNo: parseInt(formData.bookNo),
                startNo: start,
                endNo: end,
                entryDate: formData.date,
                company: formData.company,
                createUser: formData.createUser
            });
            showSuccessToast('Cheque numbers registered successfully');
            setFormData(prev => ({ ...prev, startNo: '', endNo: '' }));
            fetchLookups(formData.company, formData.accCode);
        } catch (error) {
            showErrorToast(error);
        } finally {
            setLoading(false);
        }
    };



    return (
        <>
            <TransactionFormWrapper subtitle="Transaction Management" icon={FileText}
                isOpen={isOpen}
                onClose={onClose}
                title="Cheque Register Management"
                footer={
                    <div className="bg-[#fcfcfc] px-6 py-4 w-full flex justify-end gap-3 border-t border-gray-200 rounded-b-[10px] shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]">
                        <button onClick={handleClear} className="px-6 h-10 border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 font-semibold rounded-[3px] shadow-sm text-[13px] transition-all flex items-center justify-center gap-2">
                            <RotateCcw size={14} /> CLEAR
                        </button>
                        <button onClick={handleSave} disabled={loading} className="px-6 h-10 bg-[#0285fd] hover:bg-[#0073ff] text-white font-semibold rounded-[3px] shadow-sm text-[13px] transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                            <Save size={14} /> SAVE
                        </button>
                    </div>
                }
            >
                <div className="space-y-4 overflow-y-auto no-scrollbar font-['Tahoma']">
                    <div className="bg-white p-4 border border-slate-200 rounded-[3px] space-y-4">
                        <div className="grid grid-cols-12 gap-x-6 gap-y-3.5">
                            <div className="col-span-12">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Account</label>
                                <div className="flex gap-2">
                                    <input type="text" readOnly value={formData.accCode} className="w-24 h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-gray-50 outline-none text-gray-700 font-mono shrink-0" placeholder="Code" />
                                    <select
                                        value={formData.accCode}
                                        onChange={(e) => {
                                            const acc = accounts.find(a => a.code === e.target.value);
                                            if (acc) {
                                                handleAccountSelect(acc);
                                            } else {
                                                setFormData(prev => ({ ...prev, accCode: '', accName: '', bookNo: '' }));
                                            }
                                        }}
                                        className="flex-1 h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700 appearance-none cursor-pointer"
                                        style={{ backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.5rem center', backgroundSize: '1em' }}
                                    >
                                        <option value="">Select account...</option>
                                        {accounts.map(acc => (
                                            <option key={acc.code} value={acc.code}>
                                                {acc.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="col-span-4">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Book Number</label>
                                <input type="text" readOnly value={formData.bookNo} className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none text-gray-700" />
                            </div>
                            <div className="col-span-4">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Date</label>
                                <div className="relative">
                                    <input type="text" readOnly value={formData.date} onClick={() => setCalendar({ isOpen: true, target: 'date' })} className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] cursor-pointer pr-10 text-gray-700" />
                                    <button onClick={() => setCalendar({ isOpen: true, target: 'date' })} className="absolute right-1 top-1 bottom-1 w-8 flex items-center justify-center text-gray-500 hover:text-gray-800 bg-transparent border-none cursor-pointer">
                                        <Calendar size={16} />
                                    </button>
                                </div>
                            </div>
                            <div className="col-span-4">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Start NO</label>
                                <input type="number" value={formData.startNo} onChange={e => setFormData(prev => ({ ...prev, startNo: e.target.value }))} className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700" />
                            </div>
                            <div className="col-span-4">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">End NO</label>
                                <input type="number" value={formData.endNo} onChange={e => setFormData(prev => ({ ...prev, endNo: e.target.value }))} className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700" />
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 ml-1 opacity-70">
                        <div className="w-1 h-1 bg-gray-400 rounded-full" />
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Ensure series range does not overlap with existing books</span>
                    </div>
                </div>
            </TransactionFormWrapper>



            <CalendarModal 
                isOpen={calendar.isOpen}
                onClose={() => setCalendar({ isOpen: false, target: '' })}
                currentDate={formData.date}
                onDateChange={(d) => {
                    setFormData(prev => ({ ...prev, date: d }));
                    setCalendar({ isOpen: false, target: '' });
                }}
                title="Select Date"
            />
        </>
    );
};

export default ChequeRegisterBoard;
