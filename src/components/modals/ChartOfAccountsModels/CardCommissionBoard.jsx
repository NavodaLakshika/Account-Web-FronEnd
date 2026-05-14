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
                    <div className="bg-slate-50 px-6 py-3 w-full flex justify-end gap-3 border-t border-gray-100 mt-1 rounded-b-xl">
                        <button 
                            onClick={handleSave} 
                            disabled={loading} 
                            className={`px-6 h-10 bg-[#50af60] text-white text-[13px] font-bold rounded-[5px] shadow-md shadow-green-200 hover:bg-[#24db4e] transition-all active:scale-95 flex items-center justify-center gap-2 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {loading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} 
                            Save Record
                        </button>
                        <button onClick={handleClear} className="px-6 h-10 bg-[#00adff] text-white text-[13px] font-bold rounded-[5px] hover:bg-[#0099e6] shadow-md shadow-blue-200 transition-all active:scale-95 flex items-center justify-center gap-2 border-none">
                            <RotateCcw size={14} /> Clear
                        </button>
                    </div>
                }
            >
                <div className="select-none font-['Tahoma'] space-y-4 p-2">
                    <div className="bg-white p-6 border border-gray-200 rounded-[5px] space-y-6 shadow-sm border-l-4 border-l-[#e49e1b]">
                        <div className="space-y-5">
                            {/* Bank Selection */}
                            <div className="space-y-2">
                                <label className="text-[11px] font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                                    <Landmark size={12} className="text-[#e49e1b]" /> Bank Account
                                </label>
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <input 
                                            type="text" 
                                            value={formData.BankAccName} 
                                            readOnly 
                                            placeholder="SELECT BANK ACCOUNT..."
                                            className="w-full h-9 border border-gray-300 px-3 text-[12.5px] bg-gray-50 rounded-[5px] outline-none font-bold text-gray-700 shadow-sm"
                                        />
                                        {formData.BankAccCode && (
                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                                                {formData.BankAccCode}
                                            </span>
                                        )}
                                    </div>
                                    <button 
                                        onClick={() => setShowBankSearch(true)} 
                                        className="w-10 h-9 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[5px] transition-all shadow-md active:scale-95 shrink-0"
                                    >
                                        <Search size={18} />
                                    </button>
                                </div>
                            </div>

                            {/* Card Type Selection */}
                            <div className="space-y-2">
                                <label className="text-[11px] font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                                    <CreditCard size={12} className="text-[#e49e1b]" /> Card Type
                                </label>
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <input 
                                            type="text" 
                                            value={formData.CardType} 
                                            readOnly 
                                            placeholder="SELECT CARD TYPE..."
                                            className="w-full h-9 border border-gray-300 px-3 text-[12.5px] bg-gray-50 rounded-[5px] outline-none font-bold text-gray-700 shadow-sm"
                                        />
                                        {formData.CardID && (
                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                                                ID: {formData.CardID}
                                            </span>
                                        )}
                                    </div>
                                    <button 
                                        onClick={() => setShowCardSearch(true)} 
                                        className="w-10 h-9 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[5px] transition-all shadow-md active:scale-95 shrink-0"
                                    >
                                        <Search size={18} />
                                    </button>
                                </div>
                            </div>

                            {/* Commission Rate */}
                            <div className="space-y-2">
                                <label className="text-[11px] font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2">
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
                                        className="w-full h-12 border border-gray-300 px-4 text-[24px] focus:border-[#e49e1b] outline-none rounded-[5px] font-black text-right text-slate-700 shadow-sm pr-12 bg-[#fffcf5]"
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-lg font-black text-gray-300">%</span>
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
                                <Landmark size={16} className="text-[#e49e1b]" />
                                <span className="text-[15px] font-[700] text-slate-900 uppercase tracking-[3px] font-mono truncate">Bank Accounts Lookup</span>
                            </div>
                            <button onClick={() => setShowBankSearch(false)} className="w-9 h-8 flex items-center justify-center bg-[#ff3b30] hover:bg-[#e03127] text-white rounded-[8px] shadow-sm active:scale-90"><X size={18} strokeWidth={4} /></button>
                        </div>
                        <div className="p-3 bg-slate-50 border-b border-gray-100">
                            <input 
                                type="text" 
                                placeholder="SEARCH BANK..." 
                                className="h-9 border border-gray-300 px-3 text-xs rounded-md w-full focus:border-[#e49e1b] outline-none shadow-sm uppercase" 
                                value={bankSearchTerm} 
                                onChange={(e) => setBankSearchTerm(e.target.value)} 
                            />
                        </div>
                        <div className="p-2">
                            <div className="max-h-[350px] overflow-y-auto custom-scrollbar">
                                {banks.filter(b => 
                                    (b.name || b.Name || b.sub_Acc_Name || '').toString().toLowerCase().includes(bankSearchTerm.toLowerCase()) || 
                                    (b.code || b.Code || b.sub_Code || '').toString().toLowerCase().includes(bankSearchTerm.toLowerCase())
                                ).map((bank, idx) => (
                                    <button key={idx} onClick={() => handleBankSelect(bank)} className="w-full flex items-center justify-between px-4 py-2.5 border-b border-gray-100 hover:bg-orange-50 transition-all text-left group">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-bold text-red-600 font-mono tracking-tighter">
                                                {bank.code || bank.Code || bank.sub_Code || bank.Sub_Code || "CODE_MISSING"}
                                            </span>
                                            <span className="text-[12px] font-bold text-red-600 uppercase leading-tight">
                                                {bank.name || bank.Name || bank.sub_Acc_Name || bank.Sub_Acc_Name || "NAME_MISSING"}
                                            </span>
                                            {/* Debug view - will only show if data is missing */}
                                            {(!bank.code && !bank.Code && !bank.name && !bank.Name) && (
                                                <div className="text-[8px] text-gray-300 italic">{JSON.stringify(bank)}</div>
                                            )}
                                        </div>
                                        <div className="bg-[#e49e1b] text-white text-[10px] px-4 py-1.5 rounded-md font-bold uppercase group-hover:scale-105 transition-transform">Select</div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Card Search Modal */}
            {showCardSearch && (
                <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 font-['Tahoma']">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setShowCardSearch(false)} />
                    <div className="relative w-full max-w-md bg-white shadow-2xl rounded-xl border border-gray-100 overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
                        <div className="bg-white px-6 py-4 flex items-center justify-between border-b border-gray-100 select-none relative overflow-hidden">
                            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#e49e1b]" />
                            <div className="flex items-center gap-2">
                                <CreditCard size={16} className="text-[#e49e1b]" />
                                <span className="text-[15px] font-[700] text-slate-900 uppercase tracking-[3px] font-mono truncate">Card Types Lookup</span>
                            </div>
                            <button onClick={() => setShowCardSearch(false)} className="w-9 h-8 flex items-center justify-center bg-[#ff3b30] hover:bg-[#e03127] text-white rounded-[8px] shadow-sm active:scale-90"><X size={18} strokeWidth={4} /></button>
                        </div>
                        <div className="p-3 bg-slate-50 border-b border-gray-100">
                            <input 
                                type="text" 
                                placeholder="FILTER CARDS..." 
                                className="h-9 border border-gray-300 px-3 text-xs rounded-md w-full focus:border-[#e49e1b] outline-none shadow-sm uppercase" 
                                value={cardSearchTerm} 
                                onChange={(e) => setCardSearchTerm(e.target.value)} 
                            />
                        </div>
                        <div className="p-2">
                            <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                                {cardTypes.filter(c => 
                                    (c.name || '').toLowerCase().includes(cardSearchTerm.toLowerCase())
                                ).map((card, idx) => (
                                    <button key={idx} onClick={() => handleCardSelect(card)} className="w-full flex items-center justify-between px-4 py-3 border-b border-gray-100 hover:bg-orange-50 transition-all text-left group">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-bold text-gray-400 font-mono tracking-tighter">ID: {card.cardID}</span>
                                            <span className="text-[12px] font-bold text-gray-700 uppercase leading-tight">{card.name}</span>
                                        </div>
                                        <div className="bg-[#e49e1b] text-white text-[10px] px-4 py-1.5 rounded-md font-bold uppercase group-hover:scale-105 transition-transform">Select</div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default CardCommissionBoard;
