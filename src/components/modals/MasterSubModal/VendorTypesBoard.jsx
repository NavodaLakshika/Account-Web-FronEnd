import React, { useState, useEffect } from 'react';
import SimpleModal from '../../SimpleModal';
import { Search, Save, RotateCcw, X, Loader2, CheckCircle2 } from 'lucide-react';
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
            {showVendorModal && (
                <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 font-['Tahoma']">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setShowVendorModal(false)} />
                    <div className="relative w-full max-w-lg bg-white shadow-2xl rounded-xl border border-gray-100 overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
                        {/* Header */}
                        <div className="bg-[#0078d4] px-4 py-2 flex items-center justify-between text-white">
                            <div className="flex items-center gap-2">
                                <Search size={16} />
                                <span className="text-sm font-bold uppercase tracking-tight">Vendor Type Lookup</span>
                            </div>
                            <button
                                onClick={() => setShowVendorModal(false)}
                                className="w-9 h-8 flex items-center justify-center bg-[#ff3b30] hover:bg-[#e03127] text-white rounded-[8px] shadow-[0_4px_12px_rgba(255,59,48,0.3)] hover:shadow-[0_6px_20px_rgba(255,59,48,0.4)] transition-all active:scale-90 outline-none border-none group"
                                title="Close"
                            >
                                <X size={18} strokeWidth={4} className="group-hover:scale-110 transition-transform" />
                            </button>
                        </div>

                        {/* Search Input Area */}
                        <div className="p-3 bg-slate-50 border-b border-gray-100 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Search size={14} className="text-gray-400" />
                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest text-center">Search Facility</span>
                            </div>
                            <input 
                                type="text" 
                                placeholder="Find by Vendor Type..." 
                                className="h-9 border border-gray-300 px-3 text-xs rounded-md w-72 focus:border-[#0285fd] outline-none shadow-sm transition-all" 
                                value={vendorSearchQuery} 
                                onChange={(e) => setVendorSearchQuery(e.target.value)} 
                            />
                        </div>

                        {/* Results List */}
                        <div className="p-2">
                            <div className="bg-gray-100 px-3 py-1.5 flex text-[10px] font-bold text-gray-600 border-b border-gray-200 uppercase tracking-wider">
                                <span className="flex-1 px-3">Vendor Type</span>
                            </div>
                            <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                                {vendors.filter(v => v.vendorTypes.toLowerCase().includes(vendorSearchQuery.toLowerCase())).map((v, i) => (
                                    <button 
                                        key={i} 
                                        onClick={() => handleVendorSelect(v)}
                                        className="w-full flex items-center justify-between px-3 py-2 text-xs border-b border-gray-100 hover:bg-blue-50 transition-all text-left group"
                                    >
                                        <div className="flex items-center gap-2 flex-1">
                                            <span className="flex-1 px-3 font-mono font-medium text-gray-700 uppercase">
                                                {v.vendorTypes}
                                            </span>
                                        </div>
                                        <div className="bg-[#e49e1b] text-white text-[10px] px-5 py-1.5 rounded-md font-bold hover:bg-[#cb9b34] shadow-sm transition-all active:scale-95 uppercase">Select</div>
                                    </button>
                                ))}
                                {vendors.length === 0 && (
                                    <div className="p-8 text-center text-gray-400 italic text-sm">No vendor types found.</div>
                                )}
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="bg-gray-50 px-4 py-2 border-t border-gray-200 flex justify-between items-center text-[10px] text-gray-400">
                            <span>{vendors.length} Result(s)</span>
                            <span className="italic font-bold text-[#0078d4]">ACCOUNT CLOUD INFRASTRUCTURE</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Account List Modal */}
            {showAccModal && (
                <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 font-['Tahoma']">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setShowAccModal(false)} />
                    <div className="relative w-full max-w-xl bg-white shadow-2xl rounded-xl border border-gray-100 overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
                        {/* Header */}
                        <div className="bg-[#0078d4] px-4 py-2 flex items-center justify-between text-white">
                            <div className="flex items-center gap-2">
                                <Search size={16} />
                                <span className="text-sm font-bold uppercase tracking-tight">Chart of Accounts Lookup</span>
                            </div>
                            <button
                                onClick={() => setShowAccModal(false)}
                                className="w-9 h-8 flex items-center justify-center bg-[#ff3b30] hover:bg-[#e03127] text-white rounded-[8px] shadow-[0_4px_12px_rgba(255,59,48,0.3)] hover:shadow-[0_6px_20px_rgba(255,59,48,0.4)] transition-all active:scale-90 outline-none border-none group"
                                title="Close"
                            >
                                <X size={18} strokeWidth={4} className="group-hover:scale-110 transition-transform" />
                            </button>
                        </div>

                        {/* Search Input Area */}
                        <div className="p-3 bg-slate-50 border-b border-gray-100 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Search size={14} className="text-gray-400" />
                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest text-center">Search Facility</span>
                            </div>
                            <input 
                                type="text" 
                                placeholder="Search by name or code..." 
                                className="h-9 border border-gray-300 px-3 text-xs rounded-md w-72 focus:border-[#0285fd] outline-none shadow-sm transition-all" 
                                value={accSearchQuery} 
                                onChange={(e) => setAccSearchQuery(e.target.value)} 
                            />
                        </div>

                        {/* Results List */}
                        <div className="p-2">
                            <div className="bg-gray-100 px-3 py-1.5 flex text-[10px] font-bold text-gray-600 border-b border-gray-200 uppercase tracking-wider">
                                <span className="w-32 text-center">Code</span>
                                <span className="flex-1 px-3">Account Name</span>
                            </div>
                            <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                                {accounts.filter(a => a.sub_Acc_Name.toLowerCase().includes(accSearchQuery.toLowerCase()) || a.sub_Code.includes(accSearchQuery)).map((a, i) => (
                                    <button 
                                        key={i} 
                                        onClick={() => handleAccSelect(a)}
                                        className="w-full flex items-center justify-between px-3 py-2 text-xs border-b border-gray-100 hover:bg-blue-50 transition-all text-left group"
                                    >
                                        <div className="flex items-center gap-2 flex-1">
                                            <span className="w-32 text-center font-mono text-[11px] font-bold text-[#0078d4]">
                                                {a.sub_Code}
                                            </span>
                                            <span className="flex-1 px-3 font-mono font-medium text-gray-700 uppercase">
                                                {a.sub_Acc_Name}
                                            </span>
                                        </div>
                                        <div className="bg-[#e49e1b] text-white text-[10px] px-5 py-1.5 rounded-md font-bold hover:bg-[#cb9b34] shadow-sm transition-all active:scale-95 uppercase">Select</div>
                                    </button>
                                ))}
                                {accounts.length === 0 && (
                                    <div className="p-8 text-center text-gray-400 italic text-sm">No accounts found.</div>
                                )}
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="bg-gray-50 px-4 py-2 border-t border-gray-200 flex justify-between items-center text-[10px] text-gray-400">
                            <span>{accounts.length} Result(s)</span>
                            <span className="italic font-bold text-[#0078d4]">ACCOUNT CLOUD INFRASTRUCTURE</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Save Confirmation Modal */}
            {showSaveConfirm && (
                <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 font-['Plus_Jakarta_Sans']">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setShowSaveConfirm(false)} />
                    <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-8 text-center">
                            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-white shadow-lg">
                                <CheckCircle2 size={40} className="text-[#0078d4]" />
                            </div>
                            <h3 className="text-xl font-black text-slate-800 mb-2">Confirm Save</h3>
                            <p className="text-slate-500 text-sm leading-relaxed mb-8">
                                Are you sure you want to save <span className="font-bold text-[#0078d4] uppercase">"{formData.VendorType}"</span>?
                                <br />This will link it to account <span className="font-black text-slate-800">{formData.PaybleAccCode}</span>.
                            </p>
                            <div className="flex gap-3">
                                <button onClick={() => setShowSaveConfirm(false)} className="flex-1 h-12 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-all active:scale-95">Cancel</button>
                                <button onClick={confirmSave} className="flex-1 h-12 bg-[#0078d4] text-white font-bold rounded-xl hover:bg-[#005a9e] shadow-lg shadow-blue-200 transition-all active:scale-95 flex items-center justify-center gap-2">
                                    Continue Save
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default VendorTypesBoard;
