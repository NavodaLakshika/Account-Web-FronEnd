import React, { useState, useEffect } from 'react';
import SimpleModal from '../components/SimpleModal';
import { Search, Calendar, RotateCcw, Save, X, CheckCircle, Loader2 } from 'lucide-react';
import { bankingService } from '../services/banking.service';


import CalendarModal from '../components/CalendarModal';
import { showSuccessToast, showErrorToast } from '../utils/toastUtils';


const ChequeRegisterBoard = ({ isOpen, onClose }) => {
    const [loading, setLoading] = useState(false);
    const [accounts, setAccounts] = useState([]);
    const [calendar, setCalendar] = useState({ isOpen: false, target: '' });
    
    const getInitialFormData = () => ({
        accCode: '',
        accName: '',
        bookNo: '',
        date: new Date().toLocaleDateString('en-GB'), // DD/MM/YYYY
        startNo: '',
        endNo: '',
        company: localStorage.getItem('companyCode') || 'C001',
        createUser: localStorage.getItem('userName') || 'SYSTEM'
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
        setFormData({ ...formData, accCode: acc.code, accName: acc.name });
        fetchLookups(formData.company, acc.code);
    };

    const handleClear = () => {
        setFormData({
            ...formData,
            accCode: '',
            accName: '',
            bookNo: '',
            startNo: '',
            endNo: '',
            date: new Date().toLocaleDateString('en-GB')
        });
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
                ...formData,
                startNo: start,
                endNo: end,
                bookNo: parseInt(formData.bookNo),
                // Ensure date is in proper format for backend
                date: formData.date
            });
            showSuccessToast('Cheque numbers registered successfully');
            setFormData(prev => ({ ...prev, startNo: '', endNo: '' }));
            fetchLookups(formData.accCode);
        } catch (error) {
            showErrorToast(error);
        } finally {
            setLoading(false);
        }
    };



    const footer = (
        <div className="px-6 h-10 bg-gray-50 text-gray-600 text-sm font-bold rounded-[3px] hover:bg-gray-100 transition-all active:scale-95 flex items-center justify-center gap-2 border border-gray-100">
            <button 
                onClick={handleSave}
                disabled={loading}
                className="px-8 h-10 bg-white text-[#2bb744] border-2 border-[#2bb744] hover:bg-green-50 text-sm font-black rounded-[3px] shadow-md shadow-green-100 hover:bg-[#259b3a] transition-all active:scale-95 flex items-center justify-center gap-2 uppercase tracking-tight"
            >
                {loading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} SAVE 
            </button>
            <button 
                onClick={handleClear}
                className="px-8 h-10 bg-white text-[#00adff] border-2 border-[#00adff] hover:bg-blue-50 text-sm font-black rounded-[3px] hover:bg-[#0099e6] transition-all active:scale-95 flex items-center justify-center gap-2 border-none uppercase tracking-tight"
            >
                <RotateCcw size={14} /> CLEAR 
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
                    <div className="border-b border-gray-200 pb-2 flex items-center justify-center">
                        <h2 className="text-[17px] font-mono font-bold text-black uppercase tracking-tight text-center">Enter New Cheque Book Configuration</h2>
                    </div>

                    {/* Compact Filter Section */}
                    <div className="bg-slate-100 dark:bg-white/50 backdrop-blur-sm p-6 border border-gray-200 rounded-[8px] shadow-sm space-y-3">
                        
                        {/* Row 1: Account */}
                        <div className="flex items-center">
                            <label className="w-32 font-bold text-gray-700 text-[12.5px] uppercase">Account</label>
                            <div className="flex-1">
                                <select
                                    value={formData.accCode}
                                    onChange={(e) => {
                                        const acc = accounts.find(a => a.code === e.target.value);
                                        if (acc) {
                                            handleAccountSelect(acc);
                                        } else {
                                            setFormData({ ...formData, accCode: '', accName: '', bookNo: '' });
                                        }
                                    }}
                                    className="px-6 h-10 bg-gray-50 text-gray-600 text-sm font-bold rounded-[3px] hover:bg-gray-100 transition-all active:scale-95 flex items-center justify-center gap-2 border border-gray-100"
                                    style={{ backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.5rem center', backgroundSize: '1em' }}
                                >
                                    <option value="">Select account...</option>
                                    {accounts.map(acc => (
                                        <option key={acc.code} value={acc.code}>
                                            {acc.code} - {acc.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Row 2: Book Number */}
                        <div className="flex items-center">
                            <label className="w-32 font-bold text-gray-700 text-[12.5px] uppercase">Book Number</label>
                            <div className="flex-1">
                                <input 
                                    type="text" 
                                    readOnly
                                    value={formData.bookNo}
                                    className="px-6 h-10 bg-gray-50 text-gray-600 text-sm font-bold rounded-[3px] hover:bg-gray-100 transition-all active:scale-95 flex items-center justify-center gap-2 border border-gray-100" 
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
                                    className="px-6 h-10 bg-gray-50 text-gray-600 text-sm font-bold rounded-[3px] hover:bg-gray-100 transition-all active:scale-95 flex items-center justify-center gap-2 border border-gray-100" 
                                />
                                <button onClick={() => setCalendar({ isOpen: true, target: 'date' })} className="w-10 h-9 bg-[#0285fd] text-slate-800 dark:text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[3px] transition-all shadow-sm active:scale-90 shrink-0">
                                    <Calendar size={15} />
                                </button>
                            </div>
                        </div>

                        {/* Row 4: Start NO */}
                        <div className="flex items-center">
                            <label className="w-32 font-bold text-gray-700 text-[12.5px] uppercase">Start NO</label>
                            <div className="flex-1">
                                <input 
                                    type="number" 
                                    value={formData.startNo}
                                    onChange={e => setFormData({ ...formData, startNo: e.target.value })}
                                    className="px-6 h-10 bg-gray-50 text-gray-600 text-sm font-bold rounded-[3px] hover:bg-gray-100 transition-all active:scale-95 flex items-center justify-center gap-2 border border-gray-100" 
                                />
                            </div>
                        </div>

                        {/* Row 5: End NO */}
                        <div className="flex items-center">
                            <label className="w-32 font-bold text-gray-700 text-[12.5px] uppercase">End NO</label>
                            <div className="flex-1">
                                <input 
                                    type="number" 
                                    value={formData.endNo}
                                    onChange={e => setFormData({ ...formData, endNo: e.target.value })}
                                    className="px-6 h-10 bg-gray-50 text-gray-600 text-sm font-bold rounded-[3px] hover:bg-gray-100 transition-all active:scale-95 flex items-center justify-center gap-2 border border-gray-100" 
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
                onClose={() => setCalendar({ isOpen: false, target: '' })}
                onDateSelect={(date) => {
                    setFormData(prev => ({ ...prev, date: date }));
                    setCalendar({ isOpen: false, target: '' });
                }}
                initialDate={formData.date}
            />
        </>
    );
};

export default ChequeRegisterBoard;




