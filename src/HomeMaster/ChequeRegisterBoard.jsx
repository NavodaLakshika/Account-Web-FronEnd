import React, { useState, useEffect } from 'react';
import SimpleModal from '../components/SimpleModal';
import { Search, Calendar, RotateCcw, Save, X, CheckCircle, Loader2 } from 'lucide-react';
import { bankingService } from '../services/banking.service';
import { toast } from 'react-hot-toast';
import { DotLottiePlayer } from '@dotlottie/react-player';
import CalendarModal from '../components/CalendarModal';

const ChequeRegisterBoard = ({ isOpen, onClose }) => {
    const [loading, setLoading] = useState(false);
    const [accounts, setAccounts] = useState([]);
    const [showAccountSearch, setShowAccountSearch] = useState(false);
    const [accountSearchQuery, setAccountSearchQuery] = useState('');
    const [calendar, setCalendar] = useState({ isOpen: false, target: '' });
    
    const [formData, setFormData] = useState({
        accCode: '',
        accName: '',
        bookNo: '',
        date: new Date().toLocaleDateString('en-GB'), // DD/MM/YYYY
        startNo: '',
        endNo: '',
        company: localStorage.getItem('companyCode') || 'C001',
        createUser: localStorage.getItem('userName') || 'SYSTEM'
    });

    useEffect(() => {
        if (isOpen) {
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
        setShowAccountSearch(false);
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

    const showSuccessToast = (message) => {
        toast.custom((t) => (
            <div className={`${t.visible ? 'animate-in slide-in-from-right-10 fade-in duration-500' : 'animate-out slide-out-to-right-10 fade-out duration-300'} 
                max-w-[550px] w-fit bg-white/95 backdrop-blur-xl border border-white/20 shadow-2xl rounded-[5px] flex flex-col pointer-events-auto overflow-hidden`}>
                <div className="px-4 py-2.5 flex items-center gap-3">
                    <div className="w-12 h-12 shrink-0">
                        <DotLottiePlayer src="/lottiefile/Successffull.lottie" autoplay loop={false} />
                    </div>
                    <div className="flex-grow text-left py-1">
                        <h3 className="text-slate-800 text-[12px] font-bold tracking-wider uppercase font-tahoma leading-relaxed">{message}</h3>
                    </div>
                    <button onClick={() => toast.dismiss(t.id)} className="text-slate-300 hover:text-slate-500 transition-colors">
                        <X size={14} />
                    </button>
                </div>
            </div>
        ), { duration: 3000, position: 'top-right' });
    };

    const showErrorToast = (message) => {
        toast.custom((t) => (
            <div className={`${t.visible ? 'animate-in slide-in-from-right-10 fade-in duration-500' : 'animate-out slide-out-to-right-10 fade-out duration-300'} 
                max-w-[550px] w-fit bg-white/95 backdrop-blur-xl border border-white/20 shadow-2xl rounded-[5px] flex flex-col pointer-events-auto overflow-hidden`}>
                <div className="px-4 py-2.5 flex items-center gap-3">
                    <div className="w-12 h-12 shrink-0">
                        <DotLottiePlayer src="/lottiefile/error.lottie" autoplay loop={false} />
                    </div>
                    <div className="flex-grow text-left py-1">
                        <h3 className="text-slate-800 text-[12px] font-bold tracking-wider uppercase font-tahoma leading-relaxed">{message}</h3>
                    </div>
                    <button onClick={() => toast.dismiss(t.id)} className="text-slate-300 hover:text-slate-500 transition-colors">
                        <X size={14} />
                    </button>
                </div>
            </div>
        ), { duration: 4000, position: 'top-right' });
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

    const filteredAccounts = accounts.filter(a => 
        a.name.toLowerCase().includes(accountSearchQuery.toLowerCase()) || 
        a.code.toLowerCase().includes(accountSearchQuery.toLowerCase())
    );

    const footer = (
        <div className="bg-slate-50 px-6 py-4 w-full flex justify-end gap-3 border-t border-gray-100 mt-2 rounded-b-xl">
            <button 
                onClick={handleSave}
                disabled={loading}
                className="px-8 h-10 bg-[#2bb744] text-white text-sm font-black rounded-[5px] shadow-md shadow-green-100 hover:bg-[#259b3a] transition-all active:scale-95 flex items-center justify-center gap-2 uppercase tracking-tight"
            >
                {loading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} SAVE 
            </button>
            <button 
                onClick={handleClear}
                className="px-8 h-10 bg-[#00adff] text-white text-sm font-black rounded-[5px] hover:bg-[#0099e6] transition-all active:scale-95 flex items-center justify-center gap-2 border-none uppercase tracking-tight"
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
                    <div className="border-b border-gray-100 pb-2 flex items-center justify-center">
                        <h2 className="text-[17px] font-mono font-bold text-black uppercase tracking-tight text-center">Enter New Cheque Book Configuration</h2>
                    </div>

                    {/* Compact Filter Section */}
                    <div className="bg-white/50 backdrop-blur-sm p-6 border border-gray-200 rounded-[8px] shadow-sm space-y-3">
                        
                        {/* Row 1: Account */}
                        <div className="flex items-center">
                            <label className="w-32 font-bold text-gray-700 text-[12.5px] uppercase">Account</label>
                            <div className="flex-1 flex gap-2">
                                <input 
                                    type="text" 
                                    readOnly 
                                    value={formData.accCode ? `${formData.accCode} - ${formData.accName}` : ''}
                                    onClick={() => setShowAccountSearch(true)}
                                    className="flex-1 h-9 border border-gray-300 rounded-[5px] px-3 font-mono font-bold text-slate-800 text-[12.5px] outline-none shadow-sm bg-gray-50 cursor-pointer" 
                                />
                                <button onClick={() => setShowAccountSearch(true)} className="w-10 h-9 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[5px] transition-all shadow-md active:scale-95 shrink-0">
                                    <Search size={16} />
                                </button>
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
                                    className="w-full h-9 border border-gray-300 rounded-[5px] px-3 font-mono font-black text-[#0285fd] text-[13px] outline-none shadow-sm bg-gray-50" 
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
                                    className="flex-1 h-9 border border-gray-300 rounded-[5px] px-3 font-mono font-bold text-slate-800 text-[12.5px] outline-none bg-gray-50/50 shadow-sm" 
                                />
                                <button onClick={() => setCalendar({ isOpen: true, target: 'date' })} className="w-10 h-9 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[5px] transition-all shadow-sm active:scale-90 shrink-0">
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
                                    className="w-full h-9 border border-gray-300 rounded-[5px] px-3 font-mono font-black text-[#0285fd] text-[13px] outline-none shadow-sm bg-white focus:border-slate-400" 
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
                                    className="w-full h-9 border border-gray-300 rounded-[5px] px-3 font-mono font-black text-[#0285fd] text-[13px] outline-none shadow-sm bg-white focus:border-slate-400" 
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

            {/* Account Search Modal */}
            <SimpleModal
                isOpen={showAccountSearch}
                onClose={() => {
                    setShowAccountSearch(false);
                    setAccountSearchQuery('');
                }}
                title="Account Registration Lookup"
                maxWidth="max-w-[700px]"
            >
                <div className="space-y-4 font-['Tahoma']">
                    <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-lg border border-gray-100 mb-2">
                        <span className="text-[12px] font-bold text-gray-500 uppercase tracking-widest shrink-0">Search Facility</span>
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                            <input
                                type="text"
                                placeholder="Scan account by descriptive title or reference code..."
                                className="w-full h-9 pl-10 pr-4 border border-gray-300 rounded-[5px] outline-none text-sm focus:border-[#0285fd] bg-white shadow-sm font-bold"
                                value={accountSearchQuery}
                                onChange={(e) => setAccountSearchQuery(e.target.value)}
                                autoFocus
                            />
                        </div>
                    </div>
                    <div className="border border-gray-100 rounded-xl overflow-hidden shadow-sm bg-white">
                        <div className="max-h-[400px] overflow-y-auto no-scrollbar">
                            <table className="w-full text-left">
                                <thead className="bg-[#f8fafd] sticky top-0 text-[11px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 z-10">
                                    <tr>
                                        <th className="px-5 py-3">Code</th>
                                        <th className="px-5 py-3">Account Description</th>
                                        <th className="px-5 py-3 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {filteredAccounts.map(acc => (
                                        <tr 
                                            key={acc.code} 
                                            className="group hover:bg-blue-50/50 cursor-pointer transition-all" 
                                            onClick={() => handleAccountSelect(acc)}
                                        >
                                            <td className="px-5 py-3 font-mono text-[12px] font-bold text-blue-600">{acc.code}</td>
                                            <td className="px-5 py-3 text-[13px] font-bold text-gray-700 uppercase group-hover:text-blue-600 transition-colors leading-relaxed">
                                                {acc.name}
                                            </td>
                                            <td className="px-5 py-3 text-right">
                                                 <button className="bg-[#0285fd] text-white text-[10px] px-5 py-2 rounded-[5px] font-black hover:bg-[#0073ff] shadow-md transition-all active:scale-95 uppercase tracking-tighter">SELECT</button>
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredAccounts.length === 0 && (
                                         <tr>
                                             <td colSpan={3} className="py-12 text-center text-gray-300 font-bold uppercase tracking-widest text-[11px]">No matching accounts available in registry</td>
                                         </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
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
