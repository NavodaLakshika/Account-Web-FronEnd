import React, { useState, useEffect } from 'react';
import SimpleModal from '../components/SimpleModal';
import { Save, RotateCcw, X, ChevronDown, List, AlertCircle, Info, Search, ChevronRight } from 'lucide-react';
import { accountService } from '../services/account.service';


import { getSessionData } from '../utils/session';
import { showSuccessToast, showErrorToast } from '../utils/toastUtils';


const AccountBoard = ({ isOpen, onClose, selectedType, initialData }) => {
    const [loading, setLoading] = useState(false);
    const getInitialFormData = () => ({
        accountType: selectedType || 'Assets',
        subAccountOfCode: '',
        subAccountOfName: '',
        accountId: '',
        accountName: '',
        shortId: '',
        isSubAccount: false,
        description: '',
        note: '',
        user: '',
        inactiveAcc: false,
        editSubAccount: false
    });

    const [formData, setFormData] = useState(getInitialFormData());
    const [companyCode, setCompanyCode] = useState('');

    const [parentAccounts, setParentAccounts] = useState([]);
    const [mainAccountTypes, setMainAccountTypes] = useState([]);
    const [customerAccounts, setCustomerAccounts] = useState([]);
    const [showTypeModal, setShowTypeModal] = useState(false);
    const [showParentModal, setShowParentModal] = useState(false);
    const [typeSearchQuery, setTypeSearchQuery] = useState('');
    const [parentSearchQuery, setParentSearchQuery] = useState('');

    useEffect(() => {
        if (isOpen) {
            setFormData(getInitialFormData());
            const { companyCode: comp, userName: user } = getSessionData();
            setCompanyCode(comp);
            setFormData(prev => ({ ...prev, user }));
            loadMainAccountTypes(comp);
        }
    }, [isOpen]);

    const loadMainAccountTypes = async (comp) => {
        try {
            const data = await accountService.getMainTypes(comp || companyCode);
            setMainAccountTypes(data);
        } catch (error) {
            console.error('Failed to load main types', error);
        }
    };

    useEffect(() => {
        if (isOpen) {
            const { companyCode: comp } = getSessionData();
            setFormData(prev => ({ ...prev, accountType: selectedType }));
            loadParentAccounts(selectedType, comp);
        }
    }, [isOpen, selectedType]);

    const loadParentAccounts = async (type, comp) => {
        setLoading(true);
        try {
            const data = await accountService.getParentAccounts(type, comp || companyCode);
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
        const codeVal = parseInt(code);
        if (isNaN(codeVal)) return '';
        
        // 10000 - Assets, 20000 - Liabilities, 30000 - Equity
        if (codeVal >= 10000 && codeVal < 40000) return 'Balance Sheet';
        // 40000 - Income, 50000 - COS, 60000 - Expenses
        if (codeVal >= 40000 && codeVal < 70000) return 'Profit & Loss';
        return '';
    };

    // --- PURCHASE ORDER STYLE CONSTANTS ---
    const labelStyle = "text-[11px] font-bold text-gray-500 uppercase w-36 shrink-0";
    const inputStyle = "flex-1 min-w-0 h-8 border border-slate-200 px-3 text-[12px] font-bold text-gray-700 bg-white rounded outline-none transition-all focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20";
    const pickerStyle = "flex-1 min-w-0 h-8 border border-slate-200 px-3 text-[12px] font-bold text-blue-600 bg-slate-50 rounded outline-none transition-all focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20 cursor-pointer flex items-center justify-between overflow-hidden";
    const iconBtnStyle = "w-10 h-8 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[5px] transition-all shadow-md active:scale-95 shrink-0";

    const footer = (
        <div className="bg-slate-50 px-6 py-4 w-full flex justify-between items-center border-t border-slate-200 rounded-b-xl">
            <div className="flex gap-3">
                <button
                    onClick={() => setFormData({ ...formData, accountId: '', accountName: '', description: '', note: '' })}
                    className="px-6 py-3 bg-[#00adff] hover:bg-[#0099e6] text-white font-mono font-bold text-sm uppercase tracking-widest rounded-[5px] transition-all active:scale-95 flex items-center justify-center gap-2 border-none"
                >
                    <RotateCcw size={14} /> CLEAR
                </button>
            </div>
            <div className="flex gap-3">
                <button
                    onClick={handleSave}
                    disabled={loading}
                    className="px-8 py-3 bg-[#2bb744] hover:bg-[#259b3a] text-white font-mono font-bold text-sm uppercase tracking-widest rounded-[5px] shadow-md shadow-green-100 transition-all active:scale-95 flex items-center justify-center gap-2 border-none disabled:opacity-50"
                >
                    {loading ? <RotateCcw className="animate-spin" size={14} /> : <Save size={14} />} SAVE
                </button>
            </div>
        </div>
    );

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
                title="Account Master Configuration — Definition Portal"
                maxWidth="max-w-[750px]"
                footer={footer}
            >
                <div className="p-1 space-y-4 font-['Tahoma'] select-none">
                    {/* Header Section */}
                    <div className="bg-white p-4 rounded-[5px] border border-slate-200 shadow-sm space-y-4">
                        <div className="flex items-center gap-4">
                            <label className={labelStyle}>Primary Category</label>
                            <div className="flex-1 flex gap-1 h-8">
                                <div onClick={() => setShowTypeModal(true)} className={pickerStyle}>
                                    <span className="truncate">{formData.accountType}</span>
                                </div>
                                <button onClick={() => setShowTypeModal(true)} className={iconBtnStyle}><Search size={16} /></button>
                            </div>
                            <div className={`px-4 h-8 rounded-[5px] flex items-center text-[10px] font-black uppercase tracking-[0.1em] border ${
                                getReportType(formData.accountId) === 'Balance Sheet' 
                                ? 'bg-blue-50 text-blue-600 border-blue-100' 
                                : getReportType(formData.accountId) === 'Profit & Loss'
                                ? 'bg-green-50 text-green-600 border-green-100'
                                : 'bg-slate-50 text-slate-400 border-slate-200'
                            }`}>
                                {getReportType(formData.accountId) || 'Pending Class'}
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <label className={labelStyle}>Parent Identifier</label>
                            <div className="flex-1 flex gap-1 h-8">
                                <div onClick={() => setShowParentModal(true)} className={pickerStyle}>
                                    <span className="truncate">{formData.subAccountOfName ? `${formData.subAccountOfCode} - ${formData.subAccountOfName}` : ''}</span>
                                </div>
                                <button onClick={() => setShowParentModal(true)} className={iconBtnStyle}><List size={16} /></button>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <label className={labelStyle}>A/C Code & Title</label>
                            <div className="flex gap-2 flex-1">
                                <input
                                    type="text"
                                    className="w-32 h-8 border border-slate-200 px-3 text-[12px] font-mono font-black text-blue-600 bg-white rounded outline-none transition-all focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20"
                                    value={formData.accountId}
                                    onChange={(e) => setFormData({ ...formData, accountId: e.target.value })}
                                />
                                <input
                                    type="text"
                                    placeholder=""
                                    className={inputStyle}
                                    value={formData.accountName}
                                    onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className={labelStyle}></div>
                            <div className="flex-1 flex items-center gap-8">
                                <label className="flex items-center gap-2.5 cursor-pointer group">
                                    <div className={`w-4 h-4 rounded border-2 transition-all flex items-center justify-center ${!formData.inactiveAcc ? 'border-[#2bb744] bg-[#2bb744]' : 'border-gray-300 bg-white group-hover:border-gray-400'}`}>
                                        {!formData.inactiveAcc && <Save size={8} className="text-white" />}
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={!formData.inactiveAcc}
                                        onChange={(e) => setFormData({ ...formData, inactiveAcc: !e.target.checked })}
                                        className="hidden"
                                    />
                                    <span className="text-[12.5px] font-bold text-gray-600 uppercase tracking-wide">Active in Ledger</span>
                                </label>
                                <label className="flex items-center gap-2.5 cursor-pointer group">
                                    <div className={`w-4 h-4 rounded border-2 transition-all flex items-center justify-center ${formData.editSubAccount ? 'border-[#0285fd] bg-[#0285fd]' : 'border-gray-300 bg-white group-hover:border-gray-400'}`}>
                                        {formData.editSubAccount && <Save size={8} className="text-white" />}
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={formData.editSubAccount}
                                        onChange={(e) => setFormData({ ...formData, editSubAccount: e.target.checked })}
                                        className="hidden"
                                    />
                                    <span className="text-[12.5px] font-bold text-gray-600 uppercase tracking-wide">Modifier Mode</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Metadata Section */}
                    <div className="border border-slate-200 rounded-[5px] overflow-hidden bg-white mt-4">
                        <div className="bg-slate-50 px-5 py-2.5 border-b border-slate-200 flex items-center gap-2">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Contextual Metadata</span>
                        </div>
                        <div className="p-4 space-y-4">
                            <div className="flex gap-4">
                                <label className="text-[11px] font-bold text-gray-500 uppercase w-36 pt-1">Description</label>
                                <textarea
                                    rows={2}
                                    placeholder=""
                                    className="flex-1 px-3 py-2 border border-slate-200 rounded text-[12px] font-bold text-gray-700 bg-white outline-none transition-all focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20 resize-none"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>
                            <div className="flex gap-4 items-center">
                                <label className="text-[11px] font-bold text-gray-500 uppercase w-36">Internal Note</label>
                                <input
                                    type="text"
                                    placeholder=""
                                    className="flex-1 h-8 px-3 border border-slate-200 rounded text-[12px] font-bold text-gray-700 bg-white outline-none transition-all focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20"
                                    value={formData.note}
                                    onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Hierarchy Visualizer */}
                    <div className="border border-slate-200 rounded-[5px] overflow-hidden bg-white mt-4">
                        <div className="bg-slate-50 px-5 py-2.5 border-b border-slate-200 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Account Hierarchy</span>
                            </div>
                            <span className="text-[10px] font-black text-blue-400 uppercase">{customerAccounts.length} Records Found</span>
                        </div>
                        <div className="h-[180px] overflow-y-auto no-scrollbar">
                            <table className="w-full text-left border-collapse">
                                <thead className="sticky top-0 bg-white border-b border-gray-100 z-10">
                                    <tr>
                                        <th className="px-6 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest border-r border-gray-50 w-[150px]">Reference ID</th>
                                        <th className="px-6 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Account Nomenclature</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {customerAccounts.length > 0 ? (
                                        customerAccounts.map((cust, i) => (
                                            <tr key={i} className="hover:bg-blue-50/40 transition-colors group">
                                                <td className="px-6 py-2.5 text-[11px] font-mono font-black text-blue-600 border-r border-gray-50">{cust.sub_Cust_Acc_Code}</td>
                                                <td className="px-6 py-2.5 text-[12px] font-bold text-slate-700 uppercase">{cust.sub_Cust_Acc_Name}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        [1, 2, 3, 4].map(i => (
                                            <tr key={i} className="opacity-10 h-10"><td colSpan={2}></td></tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </SimpleModal>

            {/* Lookups - PO Style */}
            <SimpleModal
                isOpen={showTypeModal}
                onClose={() => setShowTypeModal(false)}
                title="Category Registry Discovery"
                maxWidth="max-w-[500px]"
            >
                <div className="space-y-4 font-['Tahoma']">
                    <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-lg border border-gray-100">
                        <span className="text-[12px] font-black text-gray-400 uppercase tracking-widest">Search Facility</span>
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                            <input 
                                type="text" 
                                placeholder="Find nomenclature.." 
                                className="w-full h-9 pl-10 pr-4 border border-gray-300 rounded-[5px] outline-none text-[12px] font-bold focus:border-[#0285fd] bg-white shadow-sm"
                                value={typeSearchQuery}
                                onChange={(e) => setTypeSearchQuery(e.target.value)}
                                autoFocus
                            />
                        </div>
                    </div>
                    <div className="border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                        <table className="w-full text-left">
                            <thead className="bg-[#f8fafd] text-[11px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
                                <tr>
                                    <th className="px-5 py-3">Code</th>
                                    <th className="px-5 py-3">Category Title</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {mainAccountTypes
                                    .filter(t => t.main_Acc_Name.toLowerCase().includes(typeSearchQuery.toLowerCase()))
                                    .map((type, i) => (
                                    <tr key={i} className="group hover:bg-blue-50/50 cursor-pointer transition-colors" onClick={() => handleSelectType(type)}>
                                        <td className="px-5 py-3 font-mono text-[13px] font-black text-slate-500">{type.main_Acc_Code}</td>
                                        <td className="px-5 py-3 text-[13px] font-bold text-slate-700 uppercase group-hover:text-blue-600">{type.main_Acc_Name}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </SimpleModal>

            <SimpleModal
                isOpen={showParentModal}
                onClose={() => setShowParentModal(false)}
                title="Parent Hierarchy Discovery"
                maxWidth="max-w-[650px]"
            >
                <div className="space-y-4 font-['Tahoma']">
                    <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-lg border border-gray-100">
                        <span className="text-[12px] font-black text-gray-400 uppercase tracking-widest">Search Facility</span>
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                            <input 
                                type="text" 
                                placeholder="Scan hierarchy names or codes.." 
                                className="w-full h-9 pl-10 pr-4 border border-gray-300 rounded-[5px] outline-none text-[12px] font-bold focus:border-[#0285fd] bg-white shadow-sm"
                                value={parentSearchQuery}
                                onChange={(e) => setParentSearchQuery(e.target.value)}
                                autoFocus
                            />
                        </div>
                    </div>
                    <div className="border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                        <div className="max-h-[350px] overflow-y-auto no-scrollbar">
                            <table className="w-full text-left border-separate border-spacing-0">
                                <thead className="bg-[#f8fafd] text-[11px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 sticky top-0 z-10">
                                    <tr>
                                        <th className="px-6 py-4">Reference</th>
                                        <th className="px-6 py-4">Credential Name</th>
                                        <th className="px-6 py-4 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {parentAccounts
                                        .filter(p => p.name.toLowerCase().includes(parentSearchQuery.toLowerCase()) || p.code.toLowerCase().includes(parentSearchQuery.toLowerCase()))
                                        .map((parent, i) => (
                                        <tr key={i} className="group hover:bg-blue-50/50 cursor-pointer transition-all" onClick={() => handleSelectParent(parent)}>
                                            <td className="px-6 py-3 font-mono text-[13px] font-black text-blue-600">{parent.code}</td>
                                            <td className="px-6 py-3 text-[13px] font-bold text-slate-700 uppercase group-hover:text-blue-600 transition-colors">{parent.name}</td>
                                            <td className="px-6 py-3 text-right">
                                                <button className="bg-[#e49e1b] text-white text-[10px] px-5 py-2 rounded-[5px] font-black hover:bg-[#cb9b34] shadow-md transition-all active:scale-95 uppercase">Select</button>
                                            </td>
                                        </tr>
                                    ))}
                                    {parentAccounts.length === 0 && (
                                        <tr>
                                            <td colSpan="3" className="text-center py-20 text-slate-300 text-[10px] font-black uppercase tracking-[0.3em] ">No branches detected for this class</td>
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
