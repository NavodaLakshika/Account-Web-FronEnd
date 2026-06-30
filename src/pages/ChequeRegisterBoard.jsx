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
    const [showAccountSearch, setShowAccountSearch] = useState(false);
    const [accountSearchQuery, setAccountSearchQuery] = useState('');
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
        setShowAccountSearch(false);
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

    const filteredAccounts = accounts.filter(a => 
        a.name.toLowerCase().includes(accountSearchQuery.toLowerCase()) || 
        a.code.toLowerCase().includes(accountSearchQuery.toLowerCase())
    );

    return (
        <>
            <TransactionFormWrapper subtitle="Transaction Management" icon={FileText}
                isOpen={isOpen}
                onClose={onClose}
                title="Cheque Register Management"
                footer={
                    <div className="bg-[#fcfcfc] px-6 py-4 w-full flex justify-end gap-3 border-t border-gray-200 rounded-b-[10px] shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]">
                        <button onClick={handleClear} className="px-6 py-2 border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 font-semibold rounded-[3px] shadow-sm text-[13px] transition-all flex items-center justify-center gap-2">
                            <RotateCcw size={14} /> CLEAR
                        </button>
                        <button onClick={handleSave} disabled={loading} className="px-6 py-2 bg-[#0285fd] hover:bg-[#0073ff] text-white font-semibold rounded-[3px] shadow-sm text-[13px] transition-all flex items-center justify-center gap-2 disabled:opacity-50">
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
                                <div className="relative">
                                    <div className="flex gap-2">
                                        <input type="text" readOnly value={formData.accCode} className="w-24 h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none text-gray-700 font-mono shrink-0" />
                                        <div className="relative flex-1">
                                            <input type="text" readOnly value={formData.accName} onClick={() => setShowAccountSearch(true)} className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] cursor-pointer pr-10 text-gray-700 truncate" placeholder="Select account..." />
                                            <button onClick={() => setShowAccountSearch(true)} className="absolute right-1 top-1 bottom-1 w-8 flex items-center justify-center text-gray-500 hover:text-gray-800 bg-transparent border-none cursor-pointer">
                                                <Search size={16} />
                                            </button>
                                        </div>
                                    </div>
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

            <SimpleModal isOpen={showAccountSearch} onClose={() => { setShowAccountSearch(false); setAccountSearchQuery(''); }} title="Account Registration Lookup" maxWidth="max-w-[700px]">
                <div className="space-y-4 font-['Tahoma']">
                    <div className="flex items-center gap-4 bg-slate-50 p-4 border-b border-gray-100 mb-2">
                        <span className="text-[12px] font-bold text-gray-500 uppercase tracking-wider shrink-0">Search Facility</span>
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                            <input type="text" placeholder="Scan account by descriptive title or reference code..." className="w-full h-10 pl-10 pr-4 border border-gray-300 rounded-[3px] outline-none text-[13px] focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] shadow-sm bg-white" value={accountSearchQuery} onChange={(e) => setAccountSearchQuery(e.target.value)} autoFocus />
                        </div>
                    </div>
                    <div className="border border-gray-200 rounded-[3px] overflow-hidden shadow-sm max-h-[400px] overflow-y-auto no-scrollbar">
                        <table className="w-full text-left">
                            <thead className="bg-[#f8fafc] sticky top-0 text-[11px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 shadow-sm z-10">
                                <tr>
                                    <th className=" px-5 py-3">Code</th>
                                    <th className=" px-5 py-3">Account Description</th>
                                    <th className="text-right px-5 py-3">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filteredAccounts.length === 0 ? (
                                    <tr><td colSpan={3} className="py-12 text-center text-gray-300 font-bold uppercase tracking-widest text-[11px]">No matching accounts available in registry</td></tr>
                                ) : filteredAccounts.map(acc => (
                                    <tr key={acc.code} className="group hover:bg-blue-50/50  transition-all cursor-pointer group border-b border-gray-50" onClick={() => handleAccountSelect(acc)}>
                                        <td className="font-mono text-[12px] font-bold text-blue-600 px-5 py-3">{acc.code}</td>
                                        <td className="text-[12px] font-bold text-slate-700 uppercase group-hover:text-blue-600 transition-colors px-5 py-3">{acc.name}</td>
                                        <td className="text-right px-5 py-3">
                                            <button className="bg-white text-[#0285fd] border border-[#0285fd] hover:bg-blue-50 text-[10px] px-5 py-2 rounded-[3px] font-black shadow-sm transition-all active:scale-95 uppercase">SELECT</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </SimpleModal>

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
