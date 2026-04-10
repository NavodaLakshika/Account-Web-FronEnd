import React, { useState, useEffect } from 'react';
import SimpleModal from '../../SimpleModal';
import { Save, RotateCcw, Loader2 , X, Search, CheckCircle2, AlertCircle } from 'lucide-react';
import { cardCommissionService } from '../../../services/cardCommission.service';
import { toast } from 'react-hot-toast';

const CardCommissionBoard = ({ isOpen, onClose }) => {
    const initialState = {
        BankAccCode: '',
        BankAccName: '',
        CardID: '',
        CardType: '',
        Rate: '0.0'
    };

    const [formData, setFormData] = useState(initialState);
    const [cardTypes, setCardTypes] = useState([]);
    const [bankAccounts, setBankAccounts] = useState([]);
    const [loading, setLoading] = useState(false);
    
    // Modal states
    const [showBankModal, setShowBankModal] = useState(false);
    const [bankSearchQuery, setBankSearchQuery] = useState('');
    const [showCardModal, setShowCardModal] = useState(false);
    const [cardSearchQuery, setCardSearchQuery] = useState('');
    const [showSaveConfirm, setShowSaveConfirm] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchLookups();
        }
    }, [isOpen]);

    const fetchLookups = async () => {
        try {
            const data = await cardCommissionService.getLookups();
            setCardTypes(data.cardTypes || []);
            setBankAccounts(data.bankAccounts || []);
        } catch (error) {
            toast.error('Failed to load lookup data');
        }
    };

    
        const handleCardSelect = async (id, name) => {
            setFormData(prev => ({
                ...prev,
                CardID: id,
                CardType: name
            }));
            
            if (id && formData.BankAccCode) {
                try {
                    const rate = await cardCommissionService.getRate(formData.BankAccCode, id);
                    setFormData(prev => ({ ...prev, CardID: id, CardType: name, Rate: rate.toString() }));
                } catch (error) {
                    setFormData(prev => ({ ...prev, CardID: id, CardType: name, Rate: '0.0' }));
                }
            }
            setShowCardModal(false);
        };
        
        const handleBankSelect = async (code, name) => {
            setFormData(prev => ({
                ...prev,
                BankAccCode: code,
                BankAccName: name
            }));
            
            if (formData.CardID && code) {
                try {
                    const rate = await cardCommissionService.getRate(code, formData.CardID);
                    setFormData(prev => ({ ...prev, BankAccCode: code, BankAccName: name, Rate: rate.toString() }));
                } catch (error) {
                    setFormData(prev => ({ ...prev, BankAccCode: code, BankAccName: name, Rate: '0.0' }));
                }
            }
            setShowBankModal(false);
        };
const handleSave = async () => {
        if (!formData.BankAccCode) {
            toast.error('Please select a Bank Account');
            return;
        }
        if (!formData.CardID) {
            toast.error('Card Type Not Found.');
            return;
        }
        if (parseFloat(formData.Rate) === 0) {
            toast.error('Commission Rate cannot be zero.');
            return;
        }

        setShowSaveConfirm(true);
        return;
        try {
            await cardCommissionService.save({
                ...formData,
                Rate: parseFloat(formData.Rate)
            });
            toast.success('Commission Rate Saved Successfully.');
            setFormData(prev => ({ ...prev, CardID: '', CardType: '', Rate: '0.0' }));
        } catch (error) {
            toast.error(error);
        } finally {
            setLoading(false);
        }
    };

    
    const confirmSave = async () => {
        setShowSaveConfirm(false);
        setLoading(true);
        try {
            await cardCommissionService.save({
                ...formData,
                Rate: parseFloat(formData.Rate)
            });
            toast.success('Commission Rate Saved Successfully.');
            setFormData(prev => ({ ...prev, CardID: '', CardType: '', Rate: '0.0' }));
        } catch (error) {
            toast.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleClear = () => {
        setFormData(initialState);
    };

    return (
        <>
        <SimpleModal
            isOpen={isOpen}
            onClose={onClose}
            title="Card Sale Commission Rate"
            maxWidth="max-w-xl"
            footer={
                <div className="bg-slate-50 px-6 py-4 w-full flex justify-end gap-3 border-t border-gray-100 mt-4 rounded-b-xl">
                    <button 
                        onClick={handleSave} 
                        disabled={loading} 
                        className={`px-6 h-10 bg-[#0078d4] text-white text-sm font-bold rounded-md shadow-md shadow-blue-200 hover:bg-[#005a9e] transition-all active:scale-95 flex items-center justify-center gap-2 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {loading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} 
                        Save
                    </button>
                    <button 
                        onClick={handleClear} 
                        className="px-6 h-10 bg-slate-100 text-slate-600 text-sm font-bold rounded-md hover:bg-slate-200 transition-all active:scale-95 flex items-center justify-center gap-2 border-none"
                    >
                        <RotateCcw size={14} /> Clear
                    </button>
                    <button 
                        onClick={onClose} 
                        className="px-6 h-10 bg-slate-100 text-slate-600 text-sm font-bold rounded-md hover:bg-slate-200 transition-all active:scale-95 flex items-center justify-center gap-2 border-none"
                    >
                        <X size={14} /> Exit
                    </button>
                </div>
            }
        >
            <div className="space-y-6 py-4 font-['Plus_Jakarta_Sans']">
                <div className="space-y-3">
                    {/* Bank Selection */}
                    <div className="flex items-center gap-3">
                        <label className="text-[12.5px] font-bold text-gray-700 w-32 shrink-0">Bank Account</label>
                        <div className="flex-1 flex gap-2">
                            <input 
                                type="text" 
                                value={formData.BankAccName || formData.BankAccCode} 
                                readOnly 
                                placeholder="Search Bank Account..." 
                                className="flex-1 h-8 border border-gray-300 px-2 text-[12.5px] bg-gray-50 rounded-sm outline-none font-bold text-blue-600" 
                            />
                            <button 
                                onClick={() => setShowBankModal(true)} 
                                className="w-9 h-8 bg-[#0078d4] text-white flex items-center justify-center hover:bg-[#005a9e] rounded-sm transition-colors shadow-sm"
                            >
                                <Search size={18} />
                            </button>
                        </div>
                    </div>

                    {/* Card Type Selection */}
                    <div className="flex items-center gap-3">
                        <label className="text-[12.5px] font-bold text-gray-700 w-32 shrink-0">Card Type</label>
                        <div className="flex-1 flex gap-2">
                            <input 
                                type="text" 
                                value={formData.CardType || formData.CardID} 
                                readOnly 
                                placeholder="Search Card Type..." 
                                className="flex-1 h-8 border border-gray-300 px-2 text-[12.5px] bg-gray-50 rounded-sm outline-none font-medium text-gray-700" 
                            />
                            <button 
                                onClick={() => setShowCardModal(true)} 
                                className="w-9 h-8 bg-[#0078d4] text-white flex items-center justify-center hover:bg-[#005a9e] rounded-sm transition-colors shadow-sm"
                            >
                                <Search size={18} />
                            </button>
                        </div>
                    </div>

                    {/* Commission Rate Input */}
                    <div className="flex items-center gap-3 pt-2">
                        <label className="text-[12.5px] font-bold text-gray-700 w-32 shrink-0">Commission Rate</label>
                        <div className="flex items-center gap-2 flex-1">
                            <input 
                                type="number" 
                                step="0.1"
                                value={formData.Rate}
                                onChange={(e) => setFormData(prev => ({ ...prev, Rate: e.target.value }))}
                                className="w-32 h-8 border border-gray-300 px-3 text-[12.5px] text-right outline-none focus:border-blue-400 rounded-sm bg-white font-bold"
                                placeholder="0.0"
                            />
                            <span className="text-sm font-black text-gray-700">%</span>
                        </div>
                    </div>
                </div>
            </div>

        </SimpleModal>

            {/* Custom Save Confirmation Modal */}
            {showSaveConfirm && (
                <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => !loading && setShowSaveConfirm(false)} />
                    <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-8 text-center">
                            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-white shadow-lg">
                                <CheckCircle2 size={40} className="text-[#0078d4]" />
                            </div>
                            <h3 className="text-xl font-black text-slate-800 mb-2">Confirm Save</h3>
                            <p className="text-slate-500 text-sm leading-relaxed mb-8">
                                Do you want to save this commission record for <span className="font-bold text-[#0078d4] uppercase">"{formData.CardType || formData.CardID}"</span>?
                                <br />This will update the rate to <span className="font-bold text-slate-800">{formData.Rate}%</span>.
                            </p>
                            
                            <div className="flex gap-3">
                                <button 
                                    onClick={() => setShowSaveConfirm(false)}
                                    disabled={loading}
                                    className="flex-1 h-12 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-all active:scale-95 disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={confirmSave}
                                    disabled={loading}
                                    className="flex-1 h-12 bg-[#0078d4] text-white font-bold rounded-xl hover:bg-[#005a9e] shadow-lg shadow-blue-200 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {loading ? <Loader2 size={18} className="animate-spin" /> : "Save Record"}
                                </button>
                            </div>
                        </div>
                        
                        <div className="bg-slate-50 py-3 border-t border-slate-100">
                            <span className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] block text-center italic">Transaction Integrity Guaranteed</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Bank Search Modal */}
            {showBankModal && (
                <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setShowBankModal(false)} />
                    <div className="relative w-full max-w-2xl bg-white shadow-2xl rounded-xl border border-gray-100 overflow-hidden flex flex-col max-h-[85vh]">
                        <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50 font-['Plus_Jakarta_Sans']">
                            <h3 className="text-lg font-bold text-slate-800 tracking-tight">Search Bank Account</h3>
                            <div className="flex gap-4">
                                <input type="text" placeholder="Search accounts..." className="h-9 border border-gray-300 px-3 text-sm rounded-md w-64 focus:border-blue-500 outline-none" value={bankSearchQuery} onChange={(e) => setBankSearchQuery(e.target.value)} />
                                <button
                                    onClick={() => setShowBankModal(false)}
                                    className="w-9 h-8 flex items-center justify-center bg-[#ff3b30] hover:bg-[#e03127] text-white rounded-[8px] shadow-[0_4px_12px_rgba(255,59,48,0.3)] hover:shadow-[0_6px_20px_rgba(255,59,48,0.4)] transition-all active:scale-90 outline-none border-none group"
                                    title="Close"
                                >
                                    <X size={18} strokeWidth={4} className="group-hover:scale-110 transition-transform" />
                                </button>
                            </div>
                        </div>
                        <div className="overflow-y-auto p-2 font-['Plus_Jakarta_Sans']">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50 sticky top-0 text-gray-600 font-bold uppercase text-[11px] tracking-wider">
                                    <tr>
                                        <th className="p-3 border-b text-center w-32">Sub Code</th>
                                        <th className="p-3 border-b">Account Name</th>
                                        <th className="p-3 border-b text-center w-24">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {bankAccounts.filter(b => (b.sub_Acc_Name || '').toLowerCase().includes(bankSearchQuery.toLowerCase()) || (b.sub_Code || '').toLowerCase().includes(bankSearchQuery.toLowerCase())).map(b => (
                                        <tr key={b.sub_Code} className="hover:bg-blue-50 transition-colors">
                                            <td className="p-3 border-b text-center font-bold text-gray-600">{b.sub_Code}</td>
                                            <td className="p-3 border-b font-medium text-blue-600">{b.sub_Acc_Name}</td>
                                            <td className="p-3 border-b text-center">
                                                <button onClick={() => handleBankSelect(b.sub_Code, b.sub_Acc_Name)} className="bg-[#0078d4] text-white text-[10px] px-3 py-1.5 rounded-sm font-bold hover:bg-[#005a9e]">SELECT</button>
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
            {showCardModal && (
                <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setShowCardModal(false)} />
                    <div className="relative w-full max-w-2xl bg-white shadow-2xl rounded-xl border border-gray-100 overflow-hidden flex flex-col max-h-[85vh]">
                        <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50 font-['Plus_Jakarta_Sans']">
                            <h3 className="text-lg font-bold text-slate-800 tracking-tight">Search Card Type</h3>
                            <div className="flex gap-4">
                                <input type="text" placeholder="Search cards..." className="h-9 border border-gray-300 px-3 text-sm rounded-md w-64 focus:border-blue-500 outline-none" value={cardSearchQuery} onChange={(e) => setCardSearchQuery(e.target.value)} />
                                <button
                                    onClick={() => setShowCardModal(false)}
                                    className="w-9 h-8 flex items-center justify-center bg-[#ff3b30] hover:bg-[#e03127] text-white rounded-[8px] shadow-[0_4px_12px_rgba(255,59,48,0.3)] hover:shadow-[0_6px_20px_rgba(255,59,48,0.4)] transition-all active:scale-90 outline-none border-none group"
                                    title="Close"
                                >
                                    <X size={18} strokeWidth={4} className="group-hover:scale-110 transition-transform" />
                                </button>
                            </div>
                        </div>
                        <div className="overflow-y-auto p-2 font-['Plus_Jakarta_Sans']">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50 sticky top-0 text-gray-600 font-bold uppercase text-[11px] tracking-wider">
                                    <tr>
                                        <th className="p-3 border-b text-center w-32">Card ID</th>
                                        <th className="p-3 border-b">Card Name</th>
                                        <th className="p-3 border-b text-center w-24">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {cardTypes.filter(c => (c.cardName || '').toLowerCase().includes(cardSearchQuery.toLowerCase()) || (c.cardID || '').toLowerCase().includes(cardSearchQuery.toLowerCase())).map(c => (
                                        <tr key={c.cardID} className="hover:bg-blue-50 transition-colors">
                                            <td className="p-3 border-b text-center font-bold text-gray-600">{c.cardID}</td>
                                            <td className="p-3 border-b font-medium text-blue-600">{c.cardName}</td>
                                            <td className="p-3 border-b text-center">
                                                <button onClick={() => handleCardSelect(c.cardID, c.cardName)} className="bg-[#0078d4] text-white text-[10px] px-3 py-1.5 rounded-sm font-bold hover:bg-[#005a9e]">SELECT</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default CardCommissionBoard;

