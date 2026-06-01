import React, { useState, useEffect } from 'react';
import SimpleModal from '../components/SimpleModal';
import CalendarModal from '../components/CalendarModal';
import { Search, X, RotateCcw, Loader2, Landmark, Calendar, Hash, CheckCircle2, BookOpen, Layers, ShieldCheck, AlertCircle } from 'lucide-react';
import { bankingService } from '../services/banking.service';

import { getSessionData } from '../utils/session';
import { showSuccessToast, showErrorToast } from '../utils/toastUtils';


const ChequeBookEntryBoard = ({ isOpen, onClose }) => {
    const [loading, setLoading] = useState(false);
    const [lookups, setLookups] = useState({ accounts: [] });
    
    // Form States
    const getInitialFormData = () => ({
        accountCode: '',
        accountName: '',
        bookNo: '1',
        entryDate: new Date().toISOString().split('T')[0],
        startNo: '',
        endNo: '',
        company: '',
        createUser: ''
    });

    const [formData, setFormData] = useState(getInitialFormData());

    const [activeModal, setActiveModal] = useState(null); // 'account'
    const [searchTerm, setSearchTerm] = useState('');
    const [showDatePicker, setShowDatePicker] = useState(false);

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
            const res = await bankingService.getChequeBookLookups(compCode || formData.company);
            setLookups(res);
        } catch (error) {
            showErrorToast("Failed to load bank account parameters");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!formData.accountCode) return showErrorToast("Please select a valid Bank Account.");
        if (!formData.startNo || !formData.endNo) return showErrorToast("Start and End cheque numbers are required.");
        
        const start = parseInt(formData.startNo);
        const end = parseInt(formData.endNo);
        if (isNaN(start) || isNaN(end) || start > end) return showErrorToast("Invalid cheque range protocol.");

        try {
            setLoading(true);
            await bankingService.saveChequeBook(formData);
            showSuccessToast('New Cheque Book registered successfully!');
            handleClear();
            onClose();
        } catch (error) {
            showErrorToast(error.toString());
        } finally {
            setLoading(false);
        }
    };

    const handleClear = () => {
        setFormData({
            ...formData,
            accountCode: '',
            accountName: '',
            bookNo: '1',
            entryDate: new Date().toISOString().split('T')[0],
            startNo: '',
            endNo: ''
        });
    };

    const filteredLookup = () => {
        const query = searchTerm.toLowerCase();
        if (activeModal === 'account') return lookups.accounts.filter(l => l.name.toLowerCase().includes(query) || l.code.toLowerCase().includes(query));
        return [];
    };

    const totalCheques = (formData.startNo && formData.endNo) ? 
        Math.max(0, parseInt(formData.endNo) - parseInt(formData.startNo) + 1) : 0;

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
                title="Cheque Book Inventory Registration"
                maxWidth="max-w-[1000px]"
                footer={
                    <div className="bg-slate-50 px-6 py-4 w-full flex justify-between items-center border-t border-slate-200 rounded-b-xl">
                        <div className="flex gap-3">
                            <button onClick={handleClear} disabled={loading} className="px-6 py-3 bg-[#00adff] hover:bg-[#0099e6] text-white font-mono font-bold text-sm uppercase tracking-widest rounded-[5px] transition-all active:scale-95 flex items-center justify-center gap-2 border-none">
                                <RotateCcw size={14} /> CLEAR FORM
                            </button>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={handleSave} disabled={loading} className={`px-6 py-3 bg-[#0285fd] hover:bg-[#0073ff] text-white font-mono font-bold text-sm uppercase tracking-widest rounded-[5px] shadow-md shadow-blue-100 transition-all active:scale-95 flex items-center justify-center gap-2 border-none ${loading ? 'opacity-50' : ''}`}>
                                {loading ? <Loader2 size={14} className="animate-spin" /> : <ShieldCheck size={14} />} REGISTER PROTOCOL
                            </button>
                        </div>
                    </div>
                }
            >
                <div className="space-y-4 font-['Tahoma']">
                    {/* Header Section */}
                    <div className="bg-slate-50/50 p-4 border border-slate-200 rounded-[5px] relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-[0.03] pointer-events-none">
                            <BookOpen size={160} />
                        </div>
                        
                        <div className="grid grid-cols-12 gap-x-6 gap-y-3.5 relative z-10">
                            {/* Row 1: Target Account */}
                            <div className="col-span-12 flex items-center gap-2">
                                <label className="text-[11px] font-bold text-gray-500 uppercase w-32 shrink-0">Target Account</label>
                                <div className="flex-1 flex gap-1 h-8 min-w-0">
                                    <input type="text" readOnly value={formData.accountName || formData.accountCode} className="flex-1 min-w-0 h-8 border border-slate-200 px-3 text-[12px] font-bold text-gray-700 bg-white rounded outline-none cursor-pointer transition-all focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20" onClick={() => { setActiveModal('account'); setSearchTerm(''); }} />
                                    <button onClick={() => { setActiveModal('account'); setSearchTerm(''); }} className="w-10 h-8 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[5px] transition-all shadow-md active:scale-95 shrink-0">
                                        <Search size={16} />
                                    </button>
                                </div>
                            </div>

                            {/* Row 2: Book No & Entry Date */}
                            <div className="col-span-12 lg:col-span-6 flex items-center gap-2">
                                <label className="text-[11px] font-bold text-gray-500 uppercase w-32 shrink-0">Book No</label>
                                <input 
                                    type="text" 
                                    value={formData.bookNo} 
                                    onChange={e => setFormData({...formData, bookNo: e.target.value})} 
                                    className="flex-1 min-w-0 h-8 border border-slate-200 px-3 text-[12px] font-bold rounded bg-white outline-none focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20 transition-all font-mono"
                                />
                            </div>
                            <div className="col-span-12 lg:col-span-6 flex items-center gap-2 lg:pl-4">
                                <label className="text-[11px] font-bold text-gray-500 uppercase w-28 shrink-0 text-right">Entry Date</label>
                                <div className="flex-1 flex gap-1 h-8 min-w-0">
                                    <input type="text" readOnly value={formData.entryDate} className="flex-1 min-w-0 h-8 border border-slate-200 rounded px-3 text-[12px] font-bold outline-none bg-slate-50 text-gray-700 transition-all focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20 cursor-pointer" onClick={() => setShowDatePicker(true)} />
                                    <button onClick={() => setShowDatePicker(true)} className="w-10 h-8 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[5px] transition-all shadow-md active:scale-95 shrink-0">
                                        <Calendar size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Serial Number Range Section */}
                    <div className="bg-white p-4 border border-slate-200 rounded-[5px] space-y-3.5 relative">
                         <div className="flex items-center gap-2 mb-2 pb-2 border-b border-slate-100">
                            <Layers size={14} className="text-[#0285fd]" />
                            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Cheque Leaf Serial Protocol</span>
                         </div>
                         <div className="grid grid-cols-12 gap-x-6 gap-y-3.5 items-center">
                             <div className="col-span-5 flex items-center gap-2">
                                <label className="text-[11px] font-bold text-gray-500 uppercase w-24 shrink-0">Start Serial</label>
                                <input 
                                    type="text" 
                                    value={formData.startNo} 
                                    onChange={e => setFormData({...formData, startNo: e.target.value})} 
                                    className="flex-1 min-w-0 h-8 border border-blue-200 px-3 text-[13px] font-mono font-black text-[#0078d4] tracking-[0.2em] rounded outline-none focus:border-[#0285fd] shadow-inner transition-all"
                                />
                             </div>
                             <div className="col-span-2 flex items-center justify-center">
                                 <div className="w-8 h-[1px] bg-slate-300" />
                             </div>
                             <div className="col-span-5 flex items-center gap-2">
                                <label className="text-[11px] font-bold text-gray-500 uppercase w-24 shrink-0 text-right">End Serial</label>
                                <input 
                                    type="text" 
                                    value={formData.endNo} 
                                    onChange={e => setFormData({...formData, endNo: e.target.value})} 
                                    className="flex-1 min-w-0 h-8 border border-blue-200 px-3 text-[13px] font-mono font-black text-[#0078d4] tracking-[0.2em] rounded outline-none focus:border-[#0285fd] shadow-inner transition-all"
                                />
                             </div>
                         </div>
                    </div>

                    {/* Valuation Footer */}
                    <div className="bg-blue-50/50 p-3 rounded-[5px] border border-blue-100 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <AlertCircle size={14} className="text-[#0285fd]" />
                            <span className="text-[11px] font-bold text-slate-600 uppercase">Leaves detected in sequence:</span>
                        </div>
                        <div className="flex items-baseline gap-2">
                            <span className="text-xl font-black text-[#0285fd] tabular-nums italic">{totalCheques}</span>
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Leaflets</span>
                        </div>
                    </div>
                </div>
            </SimpleModal>

            {/* Selection Modals */}
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
                                            setFormData({...formData, accountCode: item.code, accountName: item.name});
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
            
            <CalendarModal
                isOpen={showDatePicker}
                onClose={() => setShowDatePicker(false)}
                currentDate={formData.entryDate}
                onDateSelect={(date) => setFormData({...formData, entryDate: date})}
            />
        </>
    );
};

export default ChequeBookEntryBoard;
