import React, { useState, useEffect } from 'react';
import SimpleModal from '../components/SimpleModal';
import TransactionFormWrapper from '../components/TransactionFormWrapper';
import { Save, RotateCcw, X, ChevronDown, List, AlertCircle, Info, Search, ChevronRight, FileText } from 'lucide-react';
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

        try {
            const nextId = await accountService.getNextId(parent.code);
            setFormData(prev => ({ ...prev, accountId: nextId }));

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

        if (codeVal >= 10000 && codeVal < 40000) return 'Balance Sheet';
        if (codeVal >= 40000 && codeVal < 70000) return 'Profit & Loss';
        return '';
    };

    return (
        <>
            <style>{`@keyframes toastProgress{0%{width:100%}100%{width:0%}}`}</style>
            <TransactionFormWrapper subtitle="Account Master" icon={FileText}
                isOpen={isOpen}
                onClose={onClose}
                title="Account Master Configuration — Definition Portal"
                footer={
                    <div className="bg-slate-50 px-6 py-4 w-full flex justify-between items-center border-t border-slate-200 rounded-b-[5px]">
                        <button
                            onClick={() => setFormData({ ...formData, accountId: '', accountName: '', description: '', note: '' })}
                            className="px-6 py-2 border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 font-semibold rounded-[3px] shadow-sm text-[13px] transition-all flex items-center gap-2"
                        >
                            <RotateCcw size={14} /> CLEAR
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={loading}
                            className={`px-6 py-2 bg-[#0285fd] hover:bg-[#0073ff] text-white font-semibold rounded-[3px] shadow-sm text-[13px] transition-all flex items-center gap-2 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {loading ? <RotateCcw className="animate-spin" size={14} /> : <Save size={14} />} SAVE
                        </button>
                    </div>
                }
            >
                <div className="space-y-4 overflow-y-auto no-scrollbar">
                    <div className="bg-white p-4 border border-slate-200 rounded-[3px] space-y-4">
                        <div className="grid grid-cols-12 gap-x-6 gap-y-3.5">
                            <div className="col-span-6">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Primary Category</label>
                                <div className="relative">
                                    <input
                                        type="text" readOnly
                                        value={formData.accountType}
                                        onClick={() => setShowTypeModal(true)}
                                        className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] cursor-pointer pr-10 text-gray-700"
                                    />
                                    <button onClick={() => setShowTypeModal(true)} className="absolute right-1 top-1 bottom-1 w-8 flex items-center justify-center text-gray-500 hover:text-gray-800 bg-transparent border-none cursor-pointer">
                                        <Search size={16} />
                                    </button>
                                </div>
                                <div className={`mt-1.5 px-3 h-7 rounded-[3px] flex items-center text-[10px] font-bold uppercase tracking-wider border ${
                                    getReportType(formData.accountId) === 'Balance Sheet'
                                    ? 'bg-blue-50 text-blue-600 border-blue-100'
                                    : getReportType(formData.accountId) === 'Profit & Loss'
                                    ? 'bg-blue-50 text-blue-600 border-green-100'
                                    : 'bg-gray-50 text-gray-400 border-gray-200'
                                }`}>
                                    {getReportType(formData.accountId) || 'Pending Class'}
                                </div>
                            </div>

                            <div className="col-span-6">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Parent Identifier</label>
                                <div className="relative">
                                    <input
                                        type="text" readOnly
                                        value={formData.subAccountOfName ? `${formData.subAccountOfCode} - ${formData.subAccountOfName}` : ''}
                                        onClick={() => setShowParentModal(true)}
                                        className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] cursor-pointer pr-10 text-gray-700 truncate"
                                        placeholder="Select parent account..."
                                    />
                                    <button onClick={() => setShowParentModal(true)} className="absolute right-1 top-1 bottom-1 w-8 flex items-center justify-center text-gray-500 hover:text-gray-800 bg-transparent border-none cursor-pointer">
                                        <Search size={16} />
                                    </button>
                                </div>
                            </div>

                            <div className="col-span-6">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">A/C Code</label>
                                <input
                                    type="text"
                                    className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700"
                                    value={formData.accountId}
                                    onChange={(e) => setFormData({ ...formData, accountId: e.target.value })}
                                />
                            </div>

                            <div className="col-span-6">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">A/C Title</label>
                                <input
                                    type="text"
                                    className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700"
                                    value={formData.accountName}
                                    onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
                                />
                            </div>

                            <div className="col-span-12 flex items-center gap-8">
                                <label className="flex items-center gap-2 cursor-pointer select-none">
                                    <input
                                        type="checkbox"
                                        checked={!formData.inactiveAcc}
                                        onChange={(e) => setFormData({ ...formData, inactiveAcc: !e.target.checked })}
                                        className="w-4 h-4 rounded border-gray-300 text-[#0285fd] focus:ring-[#0285fd]"
                                    />
                                    <span className="text-[13px] font-medium text-gray-700">Active in Ledger</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer select-none">
                                    <input
                                        type="checkbox"
                                        checked={formData.editSubAccount}
                                        onChange={(e) => setFormData({ ...formData, editSubAccount: e.target.checked })}
                                        className="w-4 h-4 rounded border-gray-300 text-[#0285fd] focus:ring-[#0285fd]"
                                    />
                                    <span className="text-[13px] font-medium text-gray-700">Modifier Mode</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Metadata Section */}
                    <div className="bg-white p-4 border border-slate-200 rounded-[3px] space-y-4">
                        <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Contextual Metadata</div>
                        <div className="grid grid-cols-12 gap-x-6 gap-y-3.5">
                            <div className="col-span-6">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Description</label>
                                <textarea
                                    rows={2}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-[3px] text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] resize-none text-gray-700"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>
                            <div className="col-span-6">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Internal Note</label>
                                <input
                                    type="text"
                                    className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700"
                                    value={formData.note}
                                    onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Hierarchy Visualizer */}
                    <div className="border border-slate-200 rounded-[3px] bg-white">
                        <div className="flex items-center justify-between px-4 py-2 bg-slate-50 border-b border-slate-200">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Account Hierarchy</span>
                            <span className="text-[10px] font-bold text-blue-400 uppercase">{customerAccounts.length} Records Found</span>
                        </div>
                        <div className="max-h-[180px] overflow-y-auto no-scrollbar">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 sticky top-0 z-10 text-[10px] font-black text-gray-400 uppercase tracking-widest leading-10">
                                    <tr>
                                        <th className="px-4 border-r border-gray-200">Reference ID</th>
                                        <th className="px-4">Account Nomenclature</th>
                                    <th className="text-right px-5 py-3">Action</th></tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {customerAccounts.length > 0 ? (
                                        customerAccounts.map((cust, i) => (
                                            <tr key={i} className="hover:bg-gray-50 transition-colors group text-[12px]">
                                                <td className="px-4 py-2.5 font-mono font-bold text-blue-600 border-r border-gray-200">{cust.sub_Cust_Acc_Code}</td>
                                                <td className="px-4 py-2.5 font-bold text-slate-700 uppercase">{cust.sub_Cust_Acc_Name}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr><td colSpan="2" className="py-16 text-center text-gray-300 text-[11px] font-bold uppercase tracking-widest">No hierarchy records yet</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </TransactionFormWrapper>

            {/* Type Modal */}
            <SimpleModal
                isOpen={showTypeModal}
                onClose={() => setShowTypeModal(false)}
                title="Category Registry Discovery"
            >
                <div className="space-y-4">
                    <div className="flex items-center gap-4 bg-slate-50 p-4 border-b border-gray-100 mb-2">
                        <span className="text-[12px] font-bold text-gray-500 uppercase tracking-wider shrink-0">Search</span>
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                            <input
                                type="text"
                                placeholder="Find nomenclature..."
                                className="w-full h-10 pl-10 pr-4 border border-gray-300 rounded-[3px] outline-none text-[13px] focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] shadow-sm bg-white"
                                value={typeSearchQuery}
                                onChange={(e) => setTypeSearchQuery(e.target.value)}
                                autoFocus
                            />
                        </div>
                    </div>
                    <div className="border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                        <div className="max-h-[350px] overflow-y-auto no-scrollbar">
                            <table className="w-full text-left">
                            <thead className="bg-[#f8fafc] sticky top-0 text-[11px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 shadow-sm z-10">
                                <tr>
                                    <th className=" px-5 py-3">Code</th>
                                    <th className=" px-5 py-3">Category Title</th>
                                    <th className="text-right px-5 py-3">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {mainAccountTypes
                                    .filter(t => t.main_Acc_Name.toLowerCase().includes(typeSearchQuery.toLowerCase()))
                                    .map((type, i) => (
                                    <tr key={i} className="group hover:bg-blue-50/50  transition-all cursor-pointer group border-b border-gray-50" onClick={() => handleSelectType(type)}>
                                        <td className="font-mono text-[12px] font-bold text-blue-600 px-5 py-3">{type.main_Acc_Code}</td>
                                        <td className="text-[12px] font-bold text-slate-700 uppercase group-hover:text-blue-600 transition-colors px-5 py-3">{type.main_Acc_Name}</td>
                                        <td className="text-right px-5 py-3">
                                            <button className="bg-white text-[#0285fd] border border-[#0285fd] hover:bg-blue-50 text-[10px] px-5 py-2 rounded-[3px] font-black shadow-sm transition-all active:scale-95 uppercase">Select</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        </div>
                    </div>
                </div>
            </SimpleModal>

            {/* Parent Modal */}
            <SimpleModal
                isOpen={showParentModal}
                onClose={() => setShowParentModal(false)}
                title="Parent Hierarchy Discovery"
            >
                <div className="space-y-4">
                    <div className="flex items-center gap-4 bg-slate-50 p-4 border-b border-gray-100 mb-2">
                        <span className="text-[12px] font-bold text-gray-500 uppercase tracking-wider shrink-0">Search</span>
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                            <input
                                type="text"
                                placeholder="Search hierarchy names or codes..."
                                className="w-full h-10 pl-10 pr-4 border border-gray-300 rounded-[3px] outline-none text-[13px] focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] shadow-sm bg-white"
                                value={parentSearchQuery}
                                onChange={(e) => setParentSearchQuery(e.target.value)}
                                autoFocus
                            />
                        </div>
                    </div>
                    <div className="border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                        <div className="max-h-[350px] overflow-y-auto no-scrollbar">
                            <table className="w-full text-left">
                                <thead className="bg-[#f8fafc] sticky top-0 text-[11px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 shadow-sm z-10">
                                    <tr>
                                        <th className=" px-5 py-3">Reference</th>
                                        <th className=" px-5 py-3">Credential Name</th>
                                        <th className="text-right px-5 py-3">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {parentAccounts
                                        .filter(p => p.name.toLowerCase().includes(parentSearchQuery.toLowerCase()) || p.code.toLowerCase().includes(parentSearchQuery.toLowerCase()))
                                        .map((parent, i) => (
                                        <tr key={i} className="group hover:bg-blue-50/50  transition-all cursor-pointer group border-b border-gray-50" onClick={() => handleSelectParent(parent)}>
                                            <td className="font-mono text-[12px] font-bold text-blue-600 px-5 py-3">{parent.code}</td>
                                            <td className="text-[12px] font-bold text-slate-700 uppercase group-hover:text-blue-600 transition-colors px-5 py-3">{parent.name}</td>
                                            <td className="text-right px-5 py-3">
                                                <button className="bg-white text-[#0285fd] border border-[#0285fd] hover:bg-blue-50 text-[10px] px-5 py-2 rounded-[3px] font-black shadow-sm transition-all active:scale-95 uppercase">Select</button>
                                            </td>
                                        </tr>
                                    ))}
                                    {parentAccounts.length === 0 && (
                                        <tr>
                                            <td colSpan="3" className="text-center py-16 text-gray-400 text-[11px] font-bold uppercase tracking-widest">No branches detected for this class</td>
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
