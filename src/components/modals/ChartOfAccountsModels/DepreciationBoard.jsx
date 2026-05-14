import React, { useState, useEffect } from 'react';
import SimpleModal from '../../SimpleModal';
import { Search, RotateCcw, Save, Edit, Loader2, X, PlusCircle } from 'lucide-react';
import { depRateService } from '../../../services/depRate.service';
import { showSuccessToast, showErrorToast } from '../../../utils/toastUtils';

const DepreciationBoard = ({ isOpen, onClose }) => {
    const initialState = {
        AccCode: '',
        AccountName: '',
        DepRate: '',
        CreateUser: 'SYSTEM'
    };

    const [formData, setFormData] = useState(initialState);
    const [lookups, setLookups] = useState([]);
    const [rateList, setRateList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [showAccountSearch, setShowAccountSearch] = useState(false);
    const [accSearchQuery, setAccSearchQuery] = useState('');

    useEffect(() => {
        if (isOpen) {
            const user = JSON.parse(localStorage.getItem('user'));
            setFormData(prev => ({ 
                ...prev, 
                CreateUser: user?.emp_Name || user?.empName || 'SYSTEM'
            }));
            fetchLookups();
            fetchList();
        }
    }, [isOpen]);

    const fetchLookups = async () => {
        try {
            const data = await depRateService.getLookups();
            setLookups(data || []);
        } catch (error) {
            console.error('Lookup fetch error:', error);
        }
    };

    const fetchList = async () => {
        try {
            const data = await depRateService.getList();
            setRateList(data || []);
        } catch (error) {
            console.error('List fetch error:', error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleClear = () => {
        setFormData({
            ...initialState,
            CreateUser: formData.CreateUser
        });
        setIsEditMode(false);
    };

    const handleAccountSelect = (item) => {
        setFormData(prev => ({ 
            ...prev, 
            AccCode: item.code,
            AccountName: item.name
        }));
        setShowAccountSearch(false);
        
        // Check if rate already exists for this account
        const existing = rateList.find(r => r.accCode === item.code);
        if (existing) {
            setFormData(prev => ({ ...prev, DepRate: existing.depRate }));
            setIsEditMode(true);
        } else {
            setFormData(prev => ({ ...prev, DepRate: '' }));
            setIsEditMode(false);
        }
    };

    const handleSave = async () => {
        if (!formData.AccCode) {
            showErrorToast('Please select an account.');
            return;
        }
        if (formData.DepRate === '' || isNaN(formData.DepRate)) {
            showErrorToast('Please enter a valid depreciation rate.');
            return;
        }

        setLoading(true);
        try {
            if (isEditMode) {
                await depRateService.edit({
                    ...formData,
                    DepRate: parseFloat(formData.DepRate)
                });
                showSuccessToast('Record updated successfully.');
            } else {
                await depRateService.save({
                    ...formData,
                    DepRate: parseFloat(formData.DepRate)
                });
                showSuccessToast('Record saved successfully.');
            }
            handleClear();
            fetchList();
        } catch (error) {
            showErrorToast(error.message || 'Failed to save record.');
        } finally {
            setLoading(false);
        }
    };

    const handleRowClick = (rate) => {
        setFormData({
            AccCode: rate.accCode,
            AccountName: rate.accountName,
            DepRate: rate.depRate,
            CreateUser: formData.CreateUser
        });
        setIsEditMode(true);
    };

    return (
        <>
            <SimpleModal
                isOpen={isOpen}
                onClose={onClose}
                title="Assets Depreciation Rate Registry"
                maxWidth="max-w-[550px]"
                footer={
                    <div className="bg-slate-50 px-6 py-3 w-full flex justify-end gap-3 border-t border-gray-100 mt-1 rounded-b-xl">
                        <button 
                            onClick={handleSave} 
                            disabled={loading} 
                            className={`px-6 h-10 bg-[#50af60] text-white text-[13px] font-bold rounded-[5px] shadow-md shadow-green-200 hover:bg-[#24db4e] transition-all active:scale-95 flex items-center justify-center gap-2 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {loading ? <Loader2 size={14} className="animate-spin" /> : (isEditMode ? <Edit size={14} /> : <Save size={14} />)} 
                            {isEditMode ? 'Update' : 'Save'}
                        </button>
                        <button onClick={handleClear} className="px-6 h-10 bg-[#00adff] text-white text-[13px] font-bold rounded-[5px] hover:bg-[#0099e6] shadow-md shadow-blue-200 transition-all active:scale-95 flex items-center justify-center gap-2 border-none">
                            <RotateCcw size={14} /> Clear
                        </button>
                    </div>
                }
            >
                <div className="select-none font-['Tahoma'] space-y-4 p-2">
                    {/* Info Header */}
                    <div className="bg-[#f0f9ff] border border-[#bae6fd] p-3 rounded-[5px] shadow-sm transition-all">
                        <p className="text-[11px] font-bold text-[#0369a1] text-center leading-relaxed">
                            Depreciation is a decline in value, especially the reduction in the value of<br />
                            a fixed asset charge as an expense when calculation profit and loss.
                        </p>
                    </div>

                    {/* Input Section */}
                    <div className="bg-white p-5 border border-gray-200 rounded-[5px] space-y-4 shadow-sm border-l-4 border-l-[#0078d4]">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-gray-700 uppercase tracking-wider">Asset Account</label>
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <input 
                                            type="text" 
                                            value={formData.AccountName} 
                                            readOnly 
                                            placeholder=""
                                            className="w-full h-9 border border-gray-300 px-3 text-[12.5px] bg-gray-50 rounded-[5px] outline-none font-bold text-blue-600 shadow-sm cursor-default"
                                        />
                                        {formData.AccCode && (
                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                                                {formData.AccCode}
                                            </span>
                                        )}
                                    </div>
                                    <button 
                                        onClick={() => setShowAccountSearch(true)} 
                                        className="w-10 h-9 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[5px] transition-all shadow-md active:scale-95 shrink-0"
                                    >
                                        <Search size={18} />
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-gray-700 uppercase tracking-wider">Depreciation Rate (%)</label>
                                <div className="relative">
                                    <input 
                                        name="DepRate" 
                                        value={formData.DepRate} 
                                        onChange={handleInputChange} 
                                        type="number" 
                                        step="0.1"
                                        placeholder="0.0"
                                        className="w-full h-9 border border-gray-300 px-3 text-sm focus:border-blue-500 outline-none rounded-[5px] font-bold text-blue-600 shadow-sm pr-8" 
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-black text-gray-400">%</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Table Section */}
                    <div className="border border-gray-200 rounded-[5px] overflow-hidden shadow-sm bg-white">
                        <div className="bg-gray-50 px-4 py-2.5 border-b border-gray-200 flex justify-between items-center">
                            <span className="text-[11px] font-bold text-[#0078d4] uppercase tracking-widest">Registered Depreciation Rates</span>
                            <span className="text-[10px] font-bold text-gray-400 bg-white px-2 py-0.5 border rounded-full">{rateList.length} Records</span>
                        </div>
                        <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                            <table className="w-full text-left border-collapse">
                                <thead className="sticky top-0 bg-white z-10">
                                    <tr className="bg-slate-100 border-b border-gray-200">
                                        <th className="px-4 py-2 text-[10px] font-bold text-gray-600 uppercase w-32">Account Code</th>
                                        <th className="px-4 py-2 text-[10px] font-bold text-gray-600 uppercase">Asset Description</th>
                                        <th className="px-4 py-2 text-[10px] font-bold text-gray-600 uppercase text-right w-24">Rate (%)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {rateList.map((rate, idx) => (
                                        <tr 
                                            key={idx} 
                                            onClick={() => handleRowClick(rate)}
                                            className="border-b border-gray-50 hover:bg-blue-50 cursor-pointer transition-colors group"
                                        >
                                            <td className="px-4 py-2.5 text-[11px] font-bold text-[#0078d4] font-mono">{rate.accCode}</td>
                                            <td className="px-4 py-2.5 text-[12px] font-medium text-gray-700 uppercase">{rate.accountName}</td>
                                            <td className="px-4 py-2.5 text-[12px] font-black text-orange-600 text-right">{rate.depRate.toFixed(1)}%</td>
                                        </tr>
                                    ))}
                                    {rateList.length === 0 && (
                                        <tr>
                                            <td colSpan="3" className="px-4 py-10 text-center text-gray-400  text-[11px]">
                                                No depreciation rates defined yet.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </SimpleModal>

            {/* Account Search Modal */}
            {showAccountSearch && (
                <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 font-['Tahoma']">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setShowAccountSearch(false)} />
                    <div className="relative w-full max-w-2xl bg-white shadow-2xl rounded-xl border border-gray-100 overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
                        <div className="bg-white px-6 py-4 flex items-center justify-between border-b border-gray-100 select-none relative overflow-hidden">
                            <div className="absolute left-0 top-0 bottom-0 w-1.5 transition-colors duration-500" style={{ backgroundColor: localStorage.getItem('topBarColor') || '#0285fd' }} />
                            <div className="flex items-center gap-2">
                                <Search size={16} className="text-[#0078d4]" />
                                <span className="text-[15px] font-[700] text-slate-900 uppercase tracking-[3px] font-mono truncate">Asset Accounts Lookup</span>
                            </div>
                            <button onClick={() => setShowAccountSearch(false)} className="w-9 h-8 flex items-center justify-center bg-[#ff3b30] hover:bg-[#e03127] text-white rounded-[8px] shadow-sm active:scale-90"><X size={18} strokeWidth={4} /></button>
                        </div>
                        <div className="p-3 bg-slate-50 border-b border-gray-100 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Search size={14} className="text-gray-400" />
                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Search Facility</span>
                            </div>
                            <input 
                                type="text" 
                                placeholder="Find by Account Name or Code..." 
                                className="h-9 border border-gray-300 px-3 text-xs rounded-md w-72 focus:border-[#0285fd] outline-none shadow-sm" 
                                value={accSearchQuery} 
                                onChange={(e) => setAccSearchQuery(e.target.value)} 
                            />
                        </div>
                        <div className="p-2">
                            <div className="px-3 py-1.5 flex text-[10px] font-bold text-gray-600 border-b border-gray-200 uppercase">
                                <span className="w-32 text-center">Account Code</span>
                                <span className="flex-1 px-3">Account Description</span>
                            </div>
                            <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                                {lookups.filter(a => 
                                    ((a.name || '').toLowerCase().includes(accSearchQuery.toLowerCase())) || 
                                    ((a.code || '').toLowerCase().includes(accSearchQuery.toLowerCase()))
                                ).map((acc, idx) => (
                                    <button key={idx} onClick={() => handleAccountSelect(acc)} className="w-full flex items-center justify-between px-3 py-2 text-xs border-b border-gray-100 hover:bg-blue-50 transition-all text-left group">
                                        <div className="flex items-center gap-2 flex-1">
                                            <span className="w-32 text-center font-mono text-[11px] font-bold text-[#0078d4]">{acc.code}</span>
                                            <span className="flex-1 px-3 font-mono font-medium text-gray-700 uppercase">{acc.name}</span>
                                        </div>
                                        <div className="bg-[#e49e1b] text-white text-[10px] px-5 py-1.5 rounded-md font-bold uppercase hover:bg-[#cb9b34] transition-all active:scale-95">Select</div>
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

export default DepreciationBoard;
