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
            showErrorToast('Failed to load registered depreciation rates.');
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
                title="Depreciation Rate"
                maxWidth="max-w-[700px]"
                footer={
                    <div className="bg-slate-50 px-6 py-4 w-full flex justify-end gap-4 border-t border-slate-200 mt-1 rounded-b-[5px]">
                        <button 
                            onClick={handleSave} 
                            disabled={loading} 
                            className={`px-8 h-10 text-white font-mono font-bold text-[13px] uppercase tracking-widest rounded-[3px] transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 shadow-md bg-[#2bb744] hover:bg-[#259b3a] shadow-green-100 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {loading ? <Loader2 size={14} className="animate-spin" /> : (isEditMode ? <Edit size={14} /> : <Save size={14} />)} 
                            {isEditMode ? 'UPDATE' : 'SAVE'}
                        </button>
                        <button onClick={handleClear} className="px-8 h-10 bg-white text-[#00adff] border-2 border-[#00adff] hover:bg-blue-50 font-mono font-bold text-[13px] uppercase tracking-widest rounded-[3px] shadow-md shadow-blue-100 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50">
                            <RotateCcw size={14} /> CLEAR
                        </button>
                    </div>
                }
            >
                <div className="select-none font-['Tahoma'] space-y-4 p-2">
                    {/* Info Header */}
                    <div className="bg-[#f0f9ff] border border-[#bae6fd] p-3 rounded-[3px] shadow-sm transition-all">
                        <p className="text-[11px] font-bold text-[#0369a1] text-center leading-relaxed">
                            Depreciation is a decline in value, especially the reduction in the value of<br />
                            a fixed asset charge as an expense when calculation profit and loss.
                        </p>
                    </div>

                    {/* Input Section */}
 <div className="bg-white p-4 rounded-[3px] space-y-4 shadow-sm border-l-4 border-l-[#0078d4]">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Asset Account</label>
                                <div className="flex gap-1">
                                    <div className="relative flex-1">
                                        <input 
                                            type="text" 
                                            value={formData.AccountName} 
                                            readOnly 
                                            placeholder=""
                                            className="w-full h-8 border border-slate-200 px-3 text-[12px] bg-slate-50 rounded outline-none font-bold text-gray-700 shadow-sm cursor-not-allowed"
                                        />
                                        {formData.AccCode && (
                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-[#0285fd] bg-blue-50 border border-blue-100 px-1.5 py-0.5 rounded shadow-sm">
                                                {formData.AccCode}
                                            </span>
                                        )}
                                    </div>
                                    <button 
                                        onClick={() => setShowAccountSearch(true)} 
                                        className="w-9 h-8 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded transition-all shadow-sm active:scale-95 shrink-0 border-none"
                                    >
                                        <Search size={14} />
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Depreciation Rate (%)</label>
                                <div className="relative">
                                    <input 
                                        name="DepRate" 
                                        value={formData.DepRate} 
                                        onChange={handleInputChange} 
                                        type="number" 
                                        step="0.1"
                                        placeholder="0.0"
                                        className="w-full h-8 border border-slate-200 rounded px-3 text-[12px] font-bold outline-none shadow-sm transition-all focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20 text-orange-600 bg-white pr-8 text-center" 
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-black text-gray-400">%</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Table Section */}
 <div className=" rounded-[3px] overflow-hidden shadow-sm bg-white">
                        <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200 flex justify-between items-center">
                            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Registered Depreciation Rates</span>
                            <span className="text-[10px] font-bold text-[#0285fd] bg-blue-50 px-2 py-0.5 border border-blue-100 rounded-[3px] shadow-sm">{rateList.length} Records</span>
                        </div>
                        <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                            <table className="w-full text-left border-collapse">
                                <thead className="sticky top-0 bg-white z-10 shadow-sm">
                                    <tr className="bg-slate-50 border-b border-slate-200">
                                        <th className="text-[10px] font-bold text-gray-500 uppercase tracking-widest w-32 px-5 py-3">Account Code</th>
                                        <th className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-5 py-3">Asset Description</th>
                                        <th className="text-[10px] font-bold text-gray-500 uppercase tracking-widest text-right w-24 px-5 py-3">Rate (%)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {rateList.map((rate, idx) => (
                                        <tr 
                                            key={idx} 
                                            onClick={() => handleRowClick(rate)}
                                            className="border-b border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors group"
                                        >
                                            <td className="font-mono text-[12px] font-bold text-blue-600 px-5 py-3">{rate.accCode}</td>
                                            <td className="text-[12px] font-bold text-slate-700 uppercase group-hover:text-blue-600 transition-colors px-5 py-3">{rate.accountName}</td>
                                            <td className="text-[11px] font-black text-orange-500 text-right px-5 py-3">{rate.depRate.toFixed(1)}%</td>
                                        </tr>
                                    ))}
                                    {rateList.length === 0 && (
                                        <tr>
                                            <td colSpan="3" className="text-center py-16 text-gray-400 text-[11px] font-bold uppercase tracking-widest">
                                                No depreciation rates defined yet.
                                            </td>
                                        <th className="text-right px-5 py-3">Action</th></tr>
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
                    <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm" onClick={() => setShowAccountSearch(false)} />
 <div className="relative w-full max-w-2xl bg-white shadow-2xl rounded-sm overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
                        {/* Header */}
                        <div className="bg-white px-6 py-4 flex items-center justify-between border-b border-gray-200 select-none relative overflow-hidden">
                            <div className="absolute left-0 top-0 bottom-0 w-1.5 transition-colors duration-500" style={{ backgroundColor: localStorage.getItem('topBarColor') || '#0285fd' }} />
                            <div className="flex items-center gap-2">
                                <Search size={16} className="text-[#0078d4]" />
                                <span className="text-[15px] font-[700] text-slate-900 uppercase tracking-[3px] font-mono truncate">Asset Accounts Lookup</span>
                            </div>
                            <button onClick={() => setShowAccountSearch(false)} className="w-9 h-8 flex items-center justify-center bg-red-50 hover:bg-red-100 text-red-600 rounded-[8px] transition-all active:scale-90 outline-none border-none group">
                                <X size={28} strokeWidth={1.5} className="group-hover:scale-110 transition-transform" />
                            </button>
                        </div>
                        <div className="p-3 bg-slate-50 border-b border-gray-200 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Search size={14} className="text-gray-400" />
                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Search Facility</span>
                            </div>
                            <input 
                                type="text" 
                                placeholder="Find by Account Name or Code..." 
                                className="h-9 border border-slate-200 px-3 text-xs rounded-[3px] w-72 focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20 outline-none shadow-sm transition-all" 
                                value={accSearchQuery} 
                                onChange={(e) => setAccSearchQuery(e.target.value)} 
                            />
                        </div>
                        <div className="border border-gray-200 overflow-hidden bg-white">
                            <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-[#f8fafd] text-[11px] font-black text-gray-400 uppercase tracking-widest border-b border-slate-200 sticky top-0 z-10">
                                        <tr>
                                            <th className="px-5 py-3">Account Code</th>
                                            <th className="px-5 py-3">Account Description</th>
                                            <th className="px-5 py-3 text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 bg-white">
                                        {lookups.filter(a => 
                                            ((a.name || '').toLowerCase().includes(accSearchQuery.toLowerCase())) || 
                                            ((a.code || '').toLowerCase().includes(accSearchQuery.toLowerCase()))
                                        ).map((acc, idx) => (
                                            <tr 
                                                key={idx} 
                                                onClick={() => handleAccountSelect(acc)}
                                                className="group hover:bg-blue-50/50 cursor-pointer transition-colors"
                                            >
                                                <td className="px-5 py-3 font-mono text-[13px] text-gray-600">{acc.code}</td>
                                                <td className="px-5 py-3 text-[13px] font-mono text-gray-600 uppercase font-bold group-hover:text-blue-600 transition-colors">{acc.name}</td>
                                                <td className="px-5 py-3 text-right">
                                                    <button className="bg-[#e49e1b] text-white text-[10px] px-5 py-2 rounded-[3px] font-black hover:bg-[#cb9b34] shadow-md transition-all active:scale-95 uppercase tracking-widest border-none">SELECT</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default DepreciationBoard;
