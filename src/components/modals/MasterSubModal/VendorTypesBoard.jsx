import React, { useState, useEffect } from 'react';
import SimpleModal from '../../SimpleModal';
import ConfirmModal from '../ConfirmModal';
import { Search, Save, RotateCcw, X, Loader2, CheckCircle2, Layout } from 'lucide-react';
import { vendorTypeService } from '../../../services/vendorType.service';
import { toast } from 'react-hot-toast';

const VendorTypesBoard = ({ isOpen, onClose }) => {
    const initialState = {
        VendorType: '',
        PaybleAccCode: '',
        PaybleAccName: '',
        CurrentUser: '',
        Company: '',
        Loca: '01'
    };

    const [formData, setFormData] = useState(initialState);
    const [loading, setLoading] = useState(false);
    const [showVendorModal, setShowVendorModal] = useState(false);
    const [showAccModal, setShowAccModal] = useState(false);
    const [vendorSearchQuery, setVendorSearchQuery] = useState('');
    const [accSearchQuery, setAccSearchQuery] = useState('');
    const [vendors, setVendors] = useState([]);
    const [accounts, setAccounts] = useState([]);
    const [showSaveConfirm, setShowSaveConfirm] = useState(false);

    useEffect(() => {
        if (isOpen) {
            const user = JSON.parse(localStorage.getItem('user'));
            const companyData = localStorage.getItem('selectedCompany');
            let companyCode = 'C001';
            if (companyData) {
                try {
                    const parsed = JSON.parse(companyData);
                    companyCode = parsed.company_Code || parsed.companyCode || parsed.CompanyCode || companyData;
                } catch (e) { companyCode = companyData; }
            }

            setFormData(prev => ({
                ...prev,
                CurrentUser: user?.emp_Name || 'SYSTEM',
                Company: companyCode
            }));
            fetchInitialData();
        }
    }, [isOpen]);

    const fetchInitialData = async () => {
        try {
            const [vendorList, accountList] = await Promise.all([
                vendorTypeService.getVendors(),
                vendorTypeService.searchAccounts()
            ]);
            setVendors(vendorList);
            setAccounts(accountList);
        } catch (error) {
            console.error('Data etch error:', error);
        }
    };

    const handleVendorSelect = async (vt) => {
        setFormData(prev => ({
            ...prev,
            VendorType: vt.vendorTypes,
            PaybleAccCode: vt.paybleAccCode
        }));
        
        try {
            const details = await vendorTypeService.getDetails(vt.vendorTypes);
            setFormData(prev => ({
                ...prev,
                PaybleAccName: details.paybleAccName
            }));
        } catch (e) {
            setFormData(prev => ({ ...prev, PaybleAccName: '' }));
        }
        setShowVendorModal(false);
    };

    const handleAccSelect = (acc) => {
        setFormData(prev => ({
            ...prev,
            PaybleAccCode: acc.sub_Code,
            PaybleAccName: acc.sub_Acc_Name
        }));
        setShowAccModal(false);
    };

    const handleSave = () => {
        if (!formData.VendorType.trim()) {
            toast.error('Vendor Type is required');
            return;
        }
        setShowSaveConfirm(true);
    };

    const confirmSave = async () => {
        setShowSaveConfirm(false);
        setLoading(true);
        try {
            await vendorTypeService.save(formData);
            toast.success('Vendor Type saved successfully');
            setFormData({ ...initialState, CurrentUser: formData.CurrentUser, Company: formData.Company });
            fetchInitialData();
        } catch (error) {
            toast.error(typeof error === 'string' ? error : (error.message || 'Failed to save'));
        } finally {
            setLoading(false);
        }
    };

    const handleClear = () => {
        setFormData({ ...initialState, CurrentUser: formData.CurrentUser, Company: formData.Company });
    };

    return (
        <>
            <SimpleModal
                isOpen={isOpen}
                onClose={onClose}
                title="Vendor Types Master"
                maxWidth="max-w-xl"
                footer={
                    <div className="bg-slate-50 px-6  w-full flex justify-end gap-3 border-t border-gray-100 mt-4 rounded-b-xl">
                        <button 
                            onClick={handleSave} 
                            disabled={loading} 
                            className={`px-6 h-10 bg-[#50af60] text-white text-[13px] font-bold rounded-[5px] shadow-md shadow-green-200 hover:bg-[#24db4e] transition-all active:scale-95 flex items-center justify-center gap-2 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {loading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} 
                            Save
                        </button>
                        <button 
                            onClick={handleClear} 
                            className="px-6 h-10 bg-[#00adff] text-white text-[13px] font-bold rounded-[5px] hover:bg-[#0099e6] shadow-md shadow-blue-200 transition-all active:scale-95 flex items-center justify-center gap-2 border-none"
                        >
                            <RotateCcw size={14} /> Clear
                        </button>
                    </div>
                }
            >
                <div className="py-2 select-none font-['Tahoma'] space-y-4 text-[12.5px] mt-1">
                    <div className="space-y-4">
                        {/* Vendor Type Selection */}
                        <div className="flex items-center gap-6">
                            <label className="w-[119px] font-bold text-gray-700">Vendor Type</label>
                            <div className="flex-1 flex gap-3">
                                <input 
                                    type="text" 
                                    value={formData.VendorType} 
                                    onChange={(e) => setFormData(prev => ({ ...prev, VendorType: e.target.value }))}
                                    className="flex-1 h-8 border border-gray-300 px-3 text-[12.5px] bg-white rounded-[5px] outline-none focus:border-blue-400 font-bold text-gray-700 shadow-sm transition-all focus:shadow-md" 
                                />
                                <button 
                                    onClick={() => setShowVendorModal(true)} 
                                    className="w-10 h-8 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[5px] transition-all shadow-md active:scale-95"
                                >
                                    <Search size={18} />
                                </button>
                            </div>
                        </div>

                        {/* Account Selection */}
                        <div className="flex items-center gap-6">
                            <label className="w-32 font-bold text-gray-700">Payable Account</label>
                            <div className="flex-1 space-y-3">
                                <div className="flex gap-3">
                                    <input 
                                        type="text" 
                                        value={formData.PaybleAccCode} 
                                        readOnly
                                        className="w-32 h-8 border border-gray-300 px-2 bg-white rounded-[5px] outline-none font-bold text-blue-600 shadow-sm text-center cursor-default" 
                                    />
                                    <div className="flex-1 flex gap-3">
                                        <input 
                                            type="text" 
                                            value={formData.PaybleAccName} 
                                            readOnly 
                                            className="flex-1 h-8 border border-gray-300 px-3 bg-gray-50 rounded-[5px] outline-none text-gray-600 font-bold shadow-sm cursor-default" 
                                        />
                                        <button 
                                            onClick={() => setShowAccModal(true)} 
                                            className="w-10 h-8 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[5px] transition-all shadow-md active:scale-95"
                                        >
                                            <Search size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </SimpleModal>

            {/* Vendor List Modal */}
            <SimpleModal
                isOpen={showVendorModal}
                onClose={() => setShowVendorModal(false)}
                title="Vendor Type Lookup"
                maxWidth="max-w-lg"
            >
                <div className="space-y-4 font-['Tahoma']">
                    {/* Search Input Area */}
                    <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-lg border border-gray-100 mb-2">
                        <div className="flex items-center gap-2">
                            <Search size={14} className="text-gray-400" />
                            <span className="text-[10px] font-[900] text-gray-500 uppercase tracking-[0.2em] text-center">Search Facility</span>
                        </div>
                        <div className="relative flex-1">
                            <input 
                                type="text" 
                                placeholder="Find by Vendor Type..." 
                                className="w-full h-9 border border-gray-300 px-3 text-xs rounded-md focus:border-[#0285fd] outline-none shadow-sm transition-all bg-white" 
                                value={vendorSearchQuery} 
                                onChange={(e) => setVendorSearchQuery(e.target.value)} 
                                autoFocus
                            />
                        </div>
                    </div>

                    {/* Results List */}
                    <div className="border border-gray-100 rounded-xl overflow-hidden shadow-sm bg-white">
                        <div className="bg-[#f8fafd] px-4 py-2.5 flex text-[10px] font-[900] text-gray-400 border-b border-gray-100 uppercase tracking-[0.15em]">
                            <span className="flex-1 px-3">Identity Title / Portfolio</span>
                        </div>
                        <div className="max-h-[350px] overflow-y-auto no-scrollbar">
                            {vendors.filter(v => v.vendorTypes.toLowerCase().includes(vendorSearchQuery.toLowerCase())).length === 0 ? (
                                <div className="p-12 text-center">
                                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <Search size={24} className="text-slate-300" />
                                    </div>
                                    <p className="text-slate-400 text-[11px] font-bold uppercase tracking-widest">No matching records found</p>
                                </div>
                            ) : (
                                vendors.filter(v => v.vendorTypes.toLowerCase().includes(vendorSearchQuery.toLowerCase())).map((v, i) => (
                                    <button 
                                        key={i} 
                                        onClick={() => handleVendorSelect(v)}
                                        className="w-full flex items-center justify-between px-4 py-3 text-xs border-b border-gray-50 hover:bg-blue-50/50 transition-all text-left group"
                                    >
                                        <div className="flex items-center gap-2 flex-1">
                                            <span className="flex-1 px-3 font-bold text-slate-700 uppercase tracking-tight group-hover:text-blue-600 transition-colors">
                                                {v.vendorTypes}
                                            </span>
                                        </div>
                                        <div className="bg-[#e49e1b] text-white text-[10px] px-6 py-1.5 rounded-[5px] font-black hover:bg-[#cb9b34] shadow-md transition-all active:scale-95 uppercase tracking-wider">Select</div>
                                    </button>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </SimpleModal>

            {/* Account List Modal */}
            <SimpleModal
                isOpen={showAccModal}
                onClose={() => setShowAccModal(false)}
                title="Chart of Accounts Lookup"
                maxWidth="max-w-xl"
            >
                <div className="space-y-4 font-['Tahoma']">
                    {/* Search Input Area */}
                    <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-lg border border-gray-100 mb-2">
                        <div className="flex items-center gap-2">
                            <Search size={14} className="text-gray-400" />
                            <span className="text-[10px] font-[900] text-gray-500 uppercase tracking-[0.2em] text-center">Search Facility</span>
                        </div>
                        <div className="relative flex-1">
                            <input 
                                type="text" 
                                placeholder="Search by name or code..." 
                                className="w-full h-9 border border-gray-300 px-3 text-xs rounded-md focus:border-[#0285fd] outline-none shadow-sm transition-all bg-white" 
                                value={accSearchQuery} 
                                onChange={(e) => setAccSearchQuery(e.target.value)} 
                                autoFocus
                            />
                        </div>
                    </div>

                    {/* Results List */}
                    <div className="border border-gray-100 rounded-xl overflow-hidden shadow-sm bg-white">
                        <div className="bg-[#f8fafd] px-4 py-2.5 flex text-[10px] font-[900] text-gray-400 border-b border-gray-100 uppercase tracking-[0.15em]">
                            <span className="w-32 text-center">Reference ID</span>
                            <span className="flex-1 px-3">Identity Title / Description</span>
                        </div>
                        <div className="max-h-[350px] overflow-y-auto no-scrollbar">
                            {accounts.filter(a => a.sub_Acc_Name.toLowerCase().includes(accSearchQuery.toLowerCase()) || a.sub_Code.includes(accSearchQuery)).length === 0 ? (
                                <div className="p-12 text-center">
                                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <Search size={24} className="text-slate-300" />
                                    </div>
                                    <p className="text-slate-400 text-[11px] font-bold uppercase tracking-widest">No matching records found</p>
                                </div>
                            ) : (
                                accounts.filter(a => a.sub_Acc_Name.toLowerCase().includes(accSearchQuery.toLowerCase()) || a.sub_Code.includes(accSearchQuery)).map((a, i) => (
                                    <button 
                                        key={i} 
                                        onClick={() => handleAccSelect(a)}
                                        className="w-full flex items-center justify-between px-4 py-3 text-xs border-b border-gray-50 hover:bg-blue-50/50 transition-all text-left group"
                                    >
                                        <div className="flex items-center gap-2 flex-1">
                                            <span className="w-32 text-center font-mono text-[12px] font-bold text-[#0078d4]">
                                                {a.sub_Code}
                                            </span>
                                            <span className="flex-1 px-3 font-bold text-slate-700 uppercase tracking-tight group-hover:text-blue-600 transition-colors">
                                                {a.sub_Acc_Name}
                                            </span>
                                        </div>
                                        <div className="bg-[#e49e1b] text-white text-[10px] px-6 py-1.5 rounded-[5px] font-black hover:bg-[#cb9b34] shadow-md transition-all active:scale-95 uppercase tracking-wider">Select</div>
                                    </button>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </SimpleModal>

            {/* Save Confirmation Modal */}
            <ConfirmModal
                isOpen={showSaveConfirm}
                onClose={() => setShowSaveConfirm(false)}
                onConfirm={confirmSave}
                title="Confirm Save"
                message={
                    <>
                        Are you sure you want to save <span className="font-bold text-[#0078d4] uppercase">"{formData.VendorType}"</span>?
                        <br />This will link it to account <span className="font-black text-slate-800">{formData.PaybleAccCode}</span>.
                    </>
                }
                loading={loading}
                confirmText="Continue Save"
                cancelText="Cancel"
            />
        </>
    );
};

export default VendorTypesBoard;
