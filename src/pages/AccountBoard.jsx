import React, { useState, useEffect } from 'react';
import SimpleModal from '../components/SimpleModal';
import { Save, RotateCcw, X, ChevronDown, List, AlertCircle, Info, Search } from 'lucide-react';
import { accountService } from '../services/account.service';
import { toast } from 'react-hot-toast';
import { DotLottiePlayer } from '@dotlottie/react-player';

const AccountBoard = ({ isOpen, onClose, selectedType, initialData }) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        accountType: selectedType || 'Assets',
        subAccountOfCode: '',
        subAccountOfName: '',
        accountId: '',
        accountName: '',
        shortId: '',
        isSubAccount: false,
        description: '',
        note: '',
        editSubAccount: false,
        user: localStorage.getItem('userName') || 'System'
    });

    const [parentAccounts, setParentAccounts] = useState([]);
    const [mainAccountTypes, setMainAccountTypes] = useState([]);
    const [customerAccounts, setCustomerAccounts] = useState([]);
    const [showTypeModal, setShowTypeModal] = useState(false);
    const [showParentModal, setShowParentModal] = useState(false);
    const [typeSearchQuery, setTypeSearchQuery] = useState('');
    const [parentSearchQuery, setParentSearchQuery] = useState('');
    const companyCode = localStorage.getItem('company') || 'C001';

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
                        <div className="flex items-center gap-1.5 mt-0.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]" />
                            <span className="text-emerald-600 text-[8px] font-mono font-bold tracking-widest uppercase">Verified</span>
                        </div>
                    </div>
                    <button onClick={() => toast.dismiss(t.id)} className="text-slate-300 hover:text-slate-500 transition-colors">
                        <X size={14} />
                    </button>
                </div>
                <div className="h-[2px] w-full bg-emerald-50">
                    <div className="h-full bg-emerald-500" style={{ animation: 'toastProgress 3s linear forwards' }} />
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
                        <DotLottiePlayer src="/lottiefile/Error Fail animation.lottie" autoplay loop={false} />
                    </div>
                    <div className="flex-grow text-left py-1">
                        <h3 className="text-slate-800 text-[12px] font-bold tracking-wider uppercase font-tahoma leading-relaxed">{message}</h3>
                        <div className="flex items-center gap-1.5 mt-0.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.3)]" />
                            <span className="text-red-600 text-[8px] font-mono font-bold tracking-widest uppercase">Failed</span>
                        </div>
                    </div>
                    <button onClick={() => toast.dismiss(t.id)} className="text-slate-300 hover:text-slate-500 transition-colors">
                        <X size={14} />
                    </button>
                </div>
                <div className="h-[2px] w-full bg-red-50">
                    <div className="h-full bg-red-500" style={{ animation: 'toastProgress 3s linear forwards' }} />
                </div>
            </div>
        ), { duration: 3000, position: 'top-right' });
    };

    useEffect(() => {
        if (isOpen) {
            loadMainAccountTypes();
        }
    }, [isOpen]);

    const loadMainAccountTypes = async () => {
        try {
            const data = await accountService.getMainTypes(companyCode);
            setMainAccountTypes(data);
        } catch (error) {
            console.error('Failed to load main types', error);
        }
    };

    useEffect(() => {
        if (isOpen) {
            setFormData(prev => ({ ...prev, accountType: selectedType }));
            loadParentAccounts(selectedType);
        }
    }, [isOpen, selectedType]);

    const loadParentAccounts = async (type) => {
        setLoading(true);
        try {
            const data = await accountService.getParentAccounts(type, companyCode);
            setParentAccounts(data);
        } catch (error) {
            console.error('Failed to load parent accounts', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectType = (type) => {
        setFormData(prev => ({ ...prev, accountType: type.main_Acc_Name }));
        loadParentAccounts(type.main_Acc_Name);
        setShowTypeModal(false);
        setTypeSearchQuery('');
    };

    const handleSelectParent = async (parent) => {
        setFormData(prev => ({ 
            ...prev, 
            subAccountOfCode: parent.code,
            subAccountOfName: parent.name
        }));

        setShowParentModal(false);
        setParentSearchQuery('');

        // Generate next ID
        try {
            const nextId = await accountService.getNextId(parent.code);
            setFormData(prev => ({ ...prev, accountId: nextId }));
            
            // Load customer accounts for this parent
            const customers = await accountService.getCustomerAccounts(parent.code);
            setCustomerAccounts(customers);
        } catch (error) {
            console.error('Failed to generate next ID or customers', error);
        }
    };


    const handleSave = async () => {
        if (!formData.accountId || !formData.accountName) {
            showErrorToast('Please enter Account ID and Name');
            return;
        }

        setLoading(true);
        try {
            await accountService.createAccount({ ...formData, companyCode });
            showSuccessToast('Account Saved Successfully');
            onClose();
        } catch (error) {
            showErrorToast('Failed to save account');
        } finally {
            setLoading(false);
        }
    };

    const getReportType = (code) => {
        if (!code) return '';
        const firstDigit = code.toString()[0];
        if (['1', '2', '3'].includes(firstDigit)) return 'Balance Sheet';
        if (['4', '5', '6', '7', '8'].includes(firstDigit)) return 'Profit & Loss';
        return '';
    };

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
                title="Add New Accounts"
                maxWidth="max-w-[700px]"
                footer={
                    <div className="bg-slate-50 px-4 py-3 w-full flex justify-end gap-3 border-t border-gray-100 rounded-b-xl">
                        <button
                            onClick={() => setFormData({ ...formData, accountId: '', accountName: '', description: '', note: '' })}
                            className="px-6 h-9 bg-[#00adff] text-white text-[13px] font-black rounded-[5px] hover:bg-[#0099e6] transition-all active:scale-95 flex items-center gap-2 border-none"
                        >
                            <RotateCcw size={14} /> Clear
                        </button>
                         <button
                            onClick={handleSave}
                            className="px-6 h-9 bg-[#2bb744] text-white text-[13px] font-black rounded-[5px] shadow-md shadow-green-100 hover:bg-[#24db4e] transition-all active:scale-95 flex items-center gap-2 border-none"
                        >
                            <Save size={14} /> Save
                        </button>
                    </div>
                }
            >
                <div className="p-0.5 space-y-2.5 font-['Tahoma'] select-none">
                    {/* Header Section */}
                    <div className="bg-white p-3.5 rounded-lg border border-gray-100 shadow-sm space-y-3.5">
                        <div className="grid grid-cols-12 gap-3 items-center">
                            <label className="col-span-3 text-[12.5px] font-bold text-gray-700">Account Type</label>
                            <div className="col-span-4 relative flex gap-1">
                                <input
                                    type="text"
                                    readOnly
                                    value={formData.accountType}
                                    className="flex-1 h-8 px-3 bg-gray-50 border border-gray-300 rounded-[5px] text-[12px] font-bold text-blue-600 shadow-sm outline-none cursor-pointer"
                                    onClick={() => setShowTypeModal(true)}
                                />
                                <button 
                                    onClick={() => setShowTypeModal(true)}
                                    className="w-8 h-8 bg-[#0285fd] text-white flex items-center justify-center rounded-[5px] hover:bg-blue-600 transition-all active:scale-95 shrink-0"
                                >
                                    <Search size={14} />
                                </button>
                            </div>
                            <div className="col-span-5 flex justify-end">
                                <div className={`inline-flex items-center px-3 h-8 rounded-[5px] text-[10px] font-black uppercase tracking-widest ${
                                    getReportType(formData.accountId) === 'Balance Sheet' 
                                    ? 'bg-blue-50 text-blue-600 border border-blue-100' 
                                    : getReportType(formData.accountId) === 'Profit & Loss'
                                    ? 'bg-green-50 text-green-600 border border-green-100'
                                    : 'bg-gray-50 text-gray-400 border border-gray-100'
                                }`}>
                                    {getReportType(formData.accountId) || 'Report Type'}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-12 gap-2 items-center">
                            <label className="col-span-3 text-[12.5px] font-bold text-gray-700">Sub Account Of</label>
                            <div className="col-span-9 relative flex gap-1">
                                <input
                                    type="text"
                                    readOnly
                                    value={formData.subAccountOfName ? `${formData.subAccountOfCode} - ${formData.subAccountOfName}` : ''}
                                    className="flex-1 h-8 px-3 bg-white border border-gray-300 rounded-[5px] text-[12px] font-bold text-gray-700 shadow-sm outline-none cursor-pointer"
                                    onClick={() => setShowParentModal(true)}
                                />
                                <button 
                                    onClick={() => setShowParentModal(true)}
                                    className="w-8 h-8 bg-[#0285fd] text-white flex items-center justify-center rounded-[5px] hover:bg-blue-600 transition-all active:scale-95 shrink-0"
                                >
                                    <Search size={14} />
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-12 gap-2 items-center">
                            <label className="col-span-3 text-[12.5px] font-bold text-gray-700">A/C ID and Name</label>
                            <div className="col-span-2">
                                <input
                                    type="text"
                                    placeholder=""
                                    className="w-full h-8 px-3 border border-gray-300 rounded-[5px] text-[12px] font-bold text-gray-700 shadow-sm focus:border-[#0285fd] outline-none"
                                    value={formData.accountId}
                                    onChange={(e) => setFormData({ ...formData, accountId: e.target.value })}
                                />
                            </div>
                            <div className="col-span-7">
                                <input
                                    type="text"
                                    placeholder=" "
                                    className="w-full h-8 px-3 border border-gray-300 rounded-[5px] text-[12px] font-bold text-gray-700 shadow-sm focus:border-[#0285fd] outline-none"
                                    value={formData.accountName}
                                    onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-12 gap-2 items-center">
                            {/* <label className="col-span-3 text-[12.5px] font-bold text-gray-700">Short ID / Alias</label>
                            <div className="col-span-4">
                                <input
                                    type="text"
                                    placeholder="e.g. MK"
                                    className="w-full h-8 px-3 border border-gray-300 rounded-[5px] text-[12px] font-bold text-gray-700 shadow-sm focus:border-[#0285fd] outline-none"
                                    value={formData.shortId}
                                    onChange={(e) => setFormData({ ...formData, shortId: e.target.value })}
                                />
                            </div> */}
                        </div>

                        <div className="grid grid-cols-12 gap-2 items-center">
                            <div className="col-span-3"></div>
                            <div className="col-span-9 flex items-center gap-6">
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="activeStatus"
                                        checked={!formData.inactiveAcc}
                                        onChange={(e) => setFormData({ ...formData, inactiveAcc: !e.target.checked })}
                                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <label htmlFor="activeStatus" className="text-[12.5px] font-bold text-gray-600">Active Account</label>
                                </div>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="editSub"
                                        checked={formData.editSubAccount}
                                        onChange={(e) => setFormData({ ...formData, editSubAccount: e.target.checked })}
                                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <label htmlFor="editSub" className="text-[12.5px] font-bold text-gray-600">Edit Sub Account</label>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Optional Section */}
                    <div className="border border-gray-100 rounded-lg overflow-hidden shadow-sm bg-white">
                        <div className="bg-slate-50/80 px-4 py-2.5 border-b border-gray-100 flex items-center gap-2">
                            <Info size={14} className="text-gray-400" />
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Optional Information</span>
                        </div>
                        <div className="p-4 space-y-3">
                            <div className="grid grid-cols-12 gap-4">
                                <label className="col-span-3 text-[12.5px] font-bold text-gray-700 pt-1">Description</label>
                                <div className="col-span-9">
                                    <textarea
                                        rows={2}
                                        className="w-full px-3 py-1.5 border border-gray-300 rounded-[5px] text-[12px] font-mono outline-none focus:border-[#0285fd] resize-none shadow-sm bg-gray-50/30"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-12 gap-4 items-center">
                                <label className="col-span-3 text-[12.5px] font-bold text-gray-700">Note</label>
                                <div className="col-span-9">
                                    <input
                                        type="text"
                                        className="w-full h-8 px-3 border border-gray-300 rounded-[5px] text-[12px] font-mono outline-none focus:border-[#0285fd] shadow-sm bg-gray-50/30"
                                        value={formData.note}
                                        onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sub-Accounts Registry Table */}
                    <div className="border border-gray-100 rounded-lg overflow-hidden shadow-sm bg-white">
                        <div className="bg-slate-50/80 px-4 py-2.5 border-b border-gray-100 flex items-center gap-2">
                            <List size={14} className="text-gray-400" />
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Child / Sub-Accounts Registry</span>
                        </div>
                        <div className="h-[150px] overflow-y-auto no-scrollbar">
                            <table className="w-full text-left border-collapse">
                                <thead className="sticky top-0 bg-slate-50 border-b border-gray-100 z-10">
                                    <tr>
                                        <th className="px-4 py-2.5 text-[10px] font-black text-gray-400 uppercase tracking-widest border-r border-gray-100 w-[120px]">Sub Code</th>
                                        <th className="px-4 py-2.5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Account Title</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {customerAccounts.length > 0 ? (
                                        customerAccounts.map((cust, i) => (
                                            <tr key={i} className="hover:bg-blue-50/30 transition-colors group">
                                                <td className="px-4 py-1.5 text-[11px] font-bold text-blue-600 border-r border-gray-100">{cust.sub_Cust_Acc_Code}</td>
                                                <td className="px-4 py-1.5 text-[11px] font-bold text-gray-700">{cust.sub_Cust_Acc_Name}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        [1, 2, 3].map(i => (
                                            <tr key={i} className="hover:bg-blue-50/30 transition-colors group opacity-20">
                                                <td className="px-4 py-1.5 text-[11px] font-bold text-slate-400 border-r border-gray-100 italic">...</td>
                                                <td className="px-4 py-1.5 text-[11px] font-bold text-slate-400 italic">...</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </SimpleModal>

            {/* Account Type Lookup Modal */}
            <SimpleModal
                isOpen={showTypeModal}
                onClose={() => setShowTypeModal(false)}
                title="Account Category Directory"
                maxWidth="max-w-[500px]"
            >
                <div className="space-y-4 font-['Tahoma']">
                    <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-lg border border-gray-100">
                        <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Filter</span>
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                            <input 
                                type="text" 
                                placeholder="Search main types..." 
                                className="w-full h-8 pl-9 pr-4 border border-gray-300 rounded-[5px] outline-none text-[12px] focus:border-[#0285fd] bg-white"
                                value={typeSearchQuery}
                                onChange={(e) => setTypeSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                        <table className="w-full text-left">
                            <thead className="bg-[#f8fafd] text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
                                <tr>
                                    <th className="px-5 py-2.5">Code</th>
                                    <th className="px-5 py-2.5">Category Name</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {mainAccountTypes
                                    .filter(t => t.main_Acc_Name.toLowerCase().includes(typeSearchQuery.toLowerCase()))
                                    .map((type, i) => (
                                    <tr key={i} className="group hover:bg-blue-50/50 cursor-pointer transition-colors" onClick={() => handleSelectType(type)}>
                                        <td className="px-5 py-2.5 font-mono text-[12px] text-gray-600">{type.main_Acc_Code}</td>
                                        <td className="px-5 py-2.5 text-[12px] font-bold text-gray-700 uppercase group-hover:text-blue-600">{type.main_Acc_Name}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </SimpleModal>

            {/* Parent Account Lookup Modal */}
            <SimpleModal
                isOpen={showParentModal}
                onClose={() => setShowParentModal(false)}
                title="Parent Account Registry"
                maxWidth="max-w-[600px]"
            >
                <div className="space-y-4 font-['Tahoma']">
                    <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-lg border border-gray-100">
                        <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Filter</span>
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                            <input 
                                type="text" 
                                placeholder="Search parent accounts..." 
                                className="w-full h-8 pl-9 pr-4 border border-gray-300 rounded-[5px] outline-none text-[12px] focus:border-[#0285fd] bg-white"
                                value={parentSearchQuery}
                                onChange={(e) => setParentSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                        <div className="max-h-[300px] overflow-y-auto no-scrollbar">
                            <table className="w-full text-left">
                                <thead className="bg-[#f8fafd] text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 sticky top-0 z-10">
                                    <tr>
                                        <th className="px-5 py-2.5">Acc. Code</th>
                                        <th className="px-5 py-2.5">Account Name</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {parentAccounts
                                        .filter(p => p.name.toLowerCase().includes(parentSearchQuery.toLowerCase()) || p.code.toLowerCase().includes(parentSearchQuery.toLowerCase()))
                                        .map((parent, i) => (
                                        <tr key={i} className="group hover:bg-blue-50/50 cursor-pointer transition-colors" onClick={() => handleSelectParent(parent)}>
                                            <td className="px-5 py-2.5 font-mono text-[12px] text-gray-600">{parent.code}</td>
                                            <td className="px-5 py-2.5 text-[12px] font-bold text-gray-700 uppercase group-hover:text-blue-600">{parent.name}</td>
                                        </tr>
                                    ))}
                                    {parentAccounts.length === 0 && (
                                        <tr>
                                            <td colSpan="2" className="text-center py-10 text-gray-300 text-[11px] font-bold uppercase tracking-widest">No results for {formData.accountType}</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </SimpleModal>
        </>
    );
};

export default AccountBoard;
