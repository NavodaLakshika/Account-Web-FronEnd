import React, { useState, useEffect } from 'react';
import SimpleModal from '../../SimpleModal';
import { Search, RotateCcw, Save, Loader2, X, CreditCard, Landmark, Percent } from 'lucide-react';
import { cardCommissionService } from '../../../services/cardCommission.service';
import { showSuccessToast, showErrorToast } from '../../../utils/toastUtils';

const CardCommissionBoard = ({ isOpen, onClose }) => {
    const initialState = {
        BankAccCode: '',
        BankAccName: '',
        CardID: '',
        CardType: '',
        Rate: '0.00'
    };

    const [formData, setFormData] = useState(initialState);
    const [banks, setBanks] = useState([]);
    const [cardTypes, setCardTypes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showBankSearch, setShowBankSearch] = useState(false);
    const [showCardSearch, setShowCardSearch] = useState(false);
    const [bankSearchTerm, setBankSearchTerm] = useState('');
    const [cardSearchTerm, setCardSearchTerm] = useState('');

    useEffect(() => {
        if (isOpen) {
            fetchLookups();
        }
    }, [isOpen]);

    // Fetch existing rate when both Bank and Card are selected
    useEffect(() => {
        if (formData.BankAccCode && formData.CardID) {
            fetchCurrentRate(formData.BankAccCode, formData.CardID);
        }
    }, [formData.BankAccCode, formData.CardID]);

    const fetchLookups = async () => {
        try {
            const data = await cardCommissionService.getLookups();
            setBanks(data.bankAccounts || []);
            setCardTypes(data.cardTypes || []);
        } catch (error) {
            console.error('Lookup error:', error);
        }
    };

    const fetchCurrentRate = async (bankCode, cardId) => {
        try {
            const data = await cardCommissionService.getRate(bankCode, cardId);
            setFormData(prev => ({ ...prev, Rate: data.rate.toFixed(2) }));
        } catch (error) {
            console.error('Rate fetch error:', error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleClear = () => {
        setFormData(initialState);
    };

    const handleBankSelect = (bank) => {
        setFormData(prev => ({
            ...prev,
            BankAccCode: bank.code || bank.Code || bank.sub_Code || bank.Sub_Code,
            BankAccName: bank.name || bank.Name || bank.sub_Acc_Name || bank.Sub_Acc_Name
        }));
        setShowBankSearch(false);
    };

    const handleCardSelect = (card) => {
        setFormData(prev => ({
            ...prev,
            CardID: card.cardID,
            CardType: card.name
        }));
        setShowCardSearch(false);
    };

    const handleSave = async () => {
        if (!formData.BankAccCode) {
            showErrorToast('Please select a bank account.');
            return;
        }
        if (!formData.CardID) {
            showErrorToast('Please select a card type.');
            return;
        }
        if (parseFloat(formData.Rate) === 0) {
            showErrorToast('Commission rate cannot be zero.');
            return;
        }

        setLoading(true);
        try {
            await cardCommissionService.save(formData);
            showSuccessToast('Commission rate saved successfully');
            // We don't clear here because user might want to edit other card types for same bank
        } catch (error) {
            showErrorToast(error.message || 'Failed to save record');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <SimpleModal
                isOpen={isOpen}
                onClose={onClose}
                title="Card Sale Commission Setup"
                maxWidth="max-w-[650px]"
                footer={
                    <div className="bg-slate-50 px-6 py-4 w-full flex justify-end gap-4 border-t border-slate-200 mt-1 rounded-b-[5px]">
                        <button 
                            onClick={handleSave} 
                            disabled={loading} 
                            className={`px-8 h-10 text-white font-mono font-bold text-[13px] uppercase tracking-widest rounded-[5px] transition-all active:scale-95 flex items-center justify-center gap-2 border-none disabled:opacity-50 shadow-md bg-[#2bb744] hover:bg-[#259b3a] shadow-green-100 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {loading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} 
                            SAVE
                        </button>
                        <button onClick={handleClear} className="px-8 h-10 bg-[#00adff] hover:bg-[#0099e6] text-white font-mono font-bold text-[13px] uppercase tracking-widest rounded-[5px] shadow-md shadow-blue-100 transition-all active:scale-95 flex items-center justify-center gap-2 border-none disabled:opacity-50">
                            <RotateCcw size={14} /> CLEAR
                        </button>
                    </div>
                }
            >
                <div className="select-none font-['Tahoma'] space-y-4 p-2">
                    <div className="bg-white p-6 border border-slate-200 rounded-[5px] space-y-6 shadow-sm border-l-4 border-l-[#e49e1b]">
                        <div className="space-y-5">
                            {/* Bank Selection */}
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                                    <Landmark size={12} className="text-[#e49e1b]" /> Bank Account
                                </label>
                                <div className="flex gap-1">
                                    <div className="relative flex-1">
                                        <input 
                                            type="text" 
                                            value={formData.BankAccName} 
                                            readOnly 
                                            placeholder="SELECT BANK ACCOUNT..."
                                            className="w-full h-8 border border-slate-200 px-3 text-[12px] bg-slate-50 rounded outline-none font-bold text-gray-700 shadow-sm cursor-not-allowed"
                                        />
                                        {formData.BankAccCode && (
                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-[#e49e1b] bg-orange-50 border border-orange-100 px-1.5 py-0.5 rounded shadow-sm">
                                                {formData.BankAccCode}
                                            </span>
                                        )}
                                    </div>
                                    <button 
                                        onClick={() => setShowBankSearch(true)} 
                                        className="w-9 h-8 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded transition-all shadow-sm active:scale-95 shrink-0 border-none"
                                    >
                                        <Search size={14} />
                                    </button>
                                </div>
                            </div>

                            {/* Card Type Selection */}
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                                    <CreditCard size={12} className="text-[#e49e1b]" /> Card Type
                                </label>
                                <div className="flex gap-1">
                                    <div className="relative flex-1">
                                        <input 
                                            type="text" 
                                            value={formData.CardType} 
                                            readOnly 
                                            placeholder="SELECT CARD TYPE..."
                                            className="w-full h-8 border border-slate-200 px-3 text-[12px] bg-slate-50 rounded outline-none font-bold text-gray-700 shadow-sm cursor-not-allowed"
                                        />
                                        {formData.CardID && (
                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-[#e49e1b] bg-orange-50 border border-orange-100 px-1.5 py-0.5 rounded shadow-sm">
                                                ID: {formData.CardID}
                                            </span>
                                        )}
                                    </div>
                                    <button 
                                        onClick={() => setShowCardSearch(true)} 
                                        className="w-9 h-8 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded transition-all shadow-sm active:scale-95 shrink-0 border-none"
                                    >
                                        <Search size={14} />
                                    </button>
                                </div>
                            </div>

                            {/* Commission Rate */}
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                                    <Percent size={12} className="text-[#e49e1b]" /> Commission Rate (%)
                                </label>
                                <div className="relative">
                                    <input 
                                        name="Rate"
                                        value={formData.Rate}
                                        onChange={handleInputChange}
                                        type="number"
                                        step="0.01"
                                        placeholder="0.00"
                                        className="w-full h-10 border border-slate-200 px-4 text-[16px] focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20 outline-none rounded font-black text-right text-gray-700 shadow-sm pr-12 bg-white"
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-black text-gray-400">%</span>
                                </div>
                                <p className="text-[10px] text-gray-400 italic">Enter the percentage value for card sale commissions.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </SimpleModal>

            {/* Bank Search Modal */}
            {showBankSearch && (
                <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 font-['Tahoma']">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setShowBankSearch(false)} />
                    <div className="relative w-full max-w-xl bg-white shadow-2xl rounded-xl border border-gray-100 overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
                        <div className="bg-white px-6 py-4 flex items-center justify-between border-b border-gray-100 select-none relative overflow-hidden">
                            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#e49e1b]" />
                            <div className="flex items-center gap-2">
                                <Search size={16} className="text-[#e49e1b]" />
                                <span className="text-[15px] font-[700] text-slate-900 uppercase tracking-[3px] font-mono truncate">Bank Accounts Lookup</span>
                            </div>
                            <button onClick={() => setShowBankSearch(false)} className="w-9 h-8 flex items-center justify-center bg-red-50 hover:bg-red-100 text-red-600 rounded-[8px] transition-all active:scale-90 outline-none border-none group">
                                <X size={18} strokeWidth={4} className="group-hover:scale-110 transition-transform" />
                            </button>
                        </div>
                        <div className="p-3 bg-slate-50 border-b border-gray-100 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Search size={14} className="text-gray-400" />
                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Search Facility</span>
                            </div>
                            <input 
                                type="text" 
                                placeholder="SEARCH BANK..." 
                                className="h-9 border border-slate-200 px-3 text-xs rounded-md w-72 focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20 outline-none shadow-sm transition-all uppercase" 
                                value={bankSearchTerm} 
                                onChange={(e) => setBankSearchTerm(e.target.value)} 
                            />
                        </div>
                        <div className="p-0">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-slate-50 sticky top-0 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-slate-200 z-10">
                                    <tr>
                                        <th className="px-5 py-3 w-32">Bank Code</th>
                                        <th className="px-5 py-3">Bank Name</th>
                                        <th className="px-5 py-3 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 max-h-[350px] overflow-y-auto custom-scrollbar block" style={{ maxHeight: '350px' }}>
                                    {banks.filter(b => 
                                        (b.name || b.Name || b.sub_Acc_Name || '').toString().toLowerCase().includes(bankSearchTerm.toLowerCase()) || 
                                        (b.code || b.Code || b.sub_Code || '').toString().toLowerCase().includes(bankSearchTerm.toLowerCase())
                                    ).map((bank, idx) => (
                                        <tr 
                                            key={idx} 
                                            onClick={() => handleBankSelect(bank)}
                                            className="group hover:bg-slate-50 cursor-pointer transition-colors flex w-full table-fixed"
                                        >
                                            <td className="px-5 py-3 w-32 font-mono text-[12px] font-bold text-slate-500">
                                                {bank.code || bank.Code || bank.sub_Code || bank.Sub_Code || "N/A"}
                                            </td>
                                            <td className="px-5 py-3 flex-1 text-[12px] font-bold text-slate-700 uppercase group-hover:text-[#e49e1b] transition-colors">
                                                {bank.name || bank.Name || bank.sub_Acc_Name || bank.Sub_Acc_Name || "N/A"}
                                            </td>
                                            <td className="px-5 py-3 text-right">
                                                <button className="bg-[#e49e1b] text-white text-[10px] px-5 py-2 rounded font-bold hover:bg-[#cb9b34] shadow-sm transition-all active:scale-95 uppercase tracking-widest border-none">Select</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* Card Search Modal */}
            {showCardSearch && (
                <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 font-['Tahoma']">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setShowCardSearch(false)} />
                    <div className="relative w-full max-w-sm bg-white shadow-2xl rounded-xl border border-gray-100 overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
                        <div className="bg-white px-6 py-4 flex items-center justify-between border-b border-gray-100 select-none relative overflow-hidden">
                            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#e49e1b]" />
                            <div className="flex items-center gap-2">
                                <Search size={16} className="text-[#e49e1b]" />
                                <span className="text-[15px] font-[700] text-slate-900 uppercase tracking-[3px] font-mono truncate">Card Types Lookup</span>
                            </div>
                            <button onClick={() => setShowCardSearch(false)} className="w-9 h-8 flex items-center justify-center bg-red-50 hover:bg-red-100 text-red-600 rounded-[8px] transition-all active:scale-90 outline-none border-none group">
                                <X size={18} strokeWidth={4} className="group-hover:scale-110 transition-transform" />
                            </button>
                        </div>
                        <div className="p-3 bg-slate-50 border-b border-gray-100">
                            <input 
                                type="text" 
                                placeholder="FILTER CARDS..." 
                                className="h-9 border border-slate-200 px-3 text-xs rounded-md w-full focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20 outline-none shadow-sm transition-all uppercase" 
                                value={cardSearchTerm} 
                                onChange={(e) => setCardSearchTerm(e.target.value)} 
                            />
                        </div>
                        <div className="p-4 space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar">
                            {cardTypes.filter(c => 
                                (c.name || '').toLowerCase().includes(cardSearchTerm.toLowerCase())
                            ).map((card, idx) => (
                                <button 
                                    key={idx} 
                                    onClick={() => handleCardSelect(card)}
                                    className="w-full px-4 py-3 text-[12px] font-bold text-gray-700 hover:bg-slate-50 border border-slate-200 rounded-lg transition-all text-left flex justify-between items-center group shadow-sm"
                                >
                                    <span className="uppercase tracking-widest">{card.name}</span>
                                    <PlusCircle size={16} className="text-gray-300 group-hover:text-[#e49e1b] transition-colors" />
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default CardCommissionBoard;
