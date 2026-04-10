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
                <div className="space-y-4 py-4 font-['Plus_Jakarta_Sans']">
                    <div className="space-y-4">
                        {/* Vendor Type Selection */}
                        <div className="flex items-center gap-3">
                            <label className="text-[12.5px] font-bold text-gray-700 w-32 shrink-0">Vendor Type</label>
                            <div className="flex-1 flex gap-2">
                                <input 
                                    type="text" 
                                    value={formData.VendorType} 
                                    onChange={(e) => setFormData(prev => ({ ...prev, VendorType: e.target.value }))}
                                    placeholder="Enter or Search Vendor Type..." 
                                    className="flex-1 h-8 border border-gray-300 px-2 text-[12.5px] bg-white rounded-sm outline-none focus:border-blue-400 font-medium text-gray-700 shadow-sm" 
                                />
                                <button 
                                    onClick={() => setShowVendorModal(true)} 
                                    className="w-9 h-8 bg-[#0078d4] text-white flex items-center justify-center hover:bg-[#005a9e] rounded-sm transition-colors shadow-sm"
                                >
                                    <Search size={18} />
                                </button>
                            </div>
                        </div>

                        {/* Account Selection */}
                        <div className="flex items-start gap-3">
                            <label className="text-[12.5px] font-bold text-gray-700 w-32 shrink-0 mt-2">Payable Account</label>
                            <div className="flex-1 space-y-2">
                                <div className="flex gap-2">
                                    <input 
                                        type="text" 
                                        value={formData.PaybleAccCode} 
                                        readOnly
                                        placeholder="Acc Code" 
                                        className="w-32 h-8 border border-gray-300 px-2 text-[12.5px] bg-gray-50 rounded-sm outline-none font-bold text-blue-600 shadow-sm" 
                                    />
                                    <div className="flex-1 flex gap-2">
                                        <input 
                                            type="text" 
                                            value={formData.PaybleAccName} 
                                            readOnly 
                                            placeholder="Account Name..." 
                                            className="flex-1 h-8 border border-gray-300 px-2 text-[12.5px] bg-gray-50 rounded-sm outline-none text-gray-600 font-medium shadow-sm" 
                                        />
                                        <button 
                                            onClick={() => setShowAccModal(true)} 
                                            className="w-9 h-8 bg-[#0078d4] text-white flex items-center justify-center hover:bg-[#005a9e] rounded-sm transition-colors shadow-sm"
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
                <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 font-['Plus_Jakarta_Sans']">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setShowVendorModal(false)} />
                    <div className="relative w-full max-w-lg bg-white shadow-2xl rounded-xl border border-gray-100 overflow-hidden flex flex-col max-h-[80vh]">
                        <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                            <h3 className="text-lg font-bold text-slate-800 tracking-tight">Search Vendor Types</h3>
                            <button
                                onClick={() => setShowVendorModal(false)}
                                className="w-9 h-8 flex items-center justify-center bg-[#ff3b30] hover:bg-[#e03127] text-white rounded-[8px] shadow-[0_4px_12px_rgba(255,59,48,0.3)] hover:shadow-[0_6px_20px_rgba(255,59,48,0.4)] transition-all active:scale-90 outline-none border-none group"
                                title="Close"
                            >
                                <X size={18} strokeWidth={4} className="group-hover:scale-110 transition-transform" />
                            </button>
                        </div>
                        <div className="p-4 bg-white border-b border-gray-100">
                           <input type="text" placeholder="Search vendor types..." className="w-full h-10 border border-gray-300 px-3 text-sm rounded-md focus:border-blue-500 outline-none" value={vendorSearchQuery} onChange={(e) => setVendorSearchQuery(e.target.value)} />
                        </div>
                        <div className="overflow-y-auto p-2">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50 sticky top-0 text-gray-500 font-bold uppercase text-[11px]">
                                    <tr>
                                        <th className="p-3 border-b">Vendor Type</th>
                                        <th className="p-3 border-b text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {vendors.filter(v => v.vendorTypes.toLowerCase().includes(vendorSearchQuery.toLowerCase())).map((v, i) => (
                                        <tr key={i} className="hover:bg-blue-50 transition-colors">
                                            <td className="p-3 border-b font-medium text-gray-700 uppercase">{v.vendorTypes}</td>
                                            <td className="p-3 border-b text-center">
                                                <button onClick={() => handleVendorSelect(v)} className="bg-[#0078d4] text-white text-[10px] px-3 py-1 rounded-sm font-bold">SELECT</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* Account List Modal */}
            {showAccModal && (
                <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 font-['Plus_Jakarta_Sans']">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setShowAccModal(false)} />
                    <div className="relative w-full max-w-xl bg-white shadow-2xl rounded-xl border border-gray-100 overflow-hidden flex flex-col max-h-[80vh]">
                        <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                            <h3 className="text-lg font-bold text-slate-800 tracking-tight">Search Chart of Accounts</h3>
                            <button
                                onClick={() => setShowAccModal(false)}
                                className="w-9 h-8 flex items-center justify-center bg-[#ff3b30] hover:bg-[#e03127] text-white rounded-[8px] shadow-[0_4px_12px_rgba(255,59,48,0.3)] hover:shadow-[0_6px_20px_rgba(255,59,48,0.4)] transition-all active:scale-90 outline-none border-none group"
                                title="Close"
                            >
                                <X size={18} strokeWidth={4} className="group-hover:scale-110 transition-transform" />
                            </button>
                        </div>
                        <div className="p-4 bg-white border-b border-gray-100">
                           <input type="text" placeholder="Search by name or code..." className="w-full h-10 border border-gray-300 px-3 text-sm rounded-md focus:border-blue-500 outline-none" value={accSearchQuery} onChange={(e) => setAccSearchQuery(e.target.value)} />
                        </div>
                        <div className="overflow-y-auto p-2">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50 sticky top-0 text-gray-500 font-bold uppercase text-[11px]">
                                    <tr>
                                        <th className="p-3 border-b">Code</th>
                                        <th className="p-3 border-b">Account Name</th>
                                        <th className="p-3 border-b text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {accounts.filter(a => a.sub_Acc_Name.toLowerCase().includes(accSearchQuery.toLowerCase()) || a.sub_Code.includes(accSearchQuery)).map((a, i) => (
                                        <tr key={i} className="hover:bg-blue-50 transition-colors">
                                            <td className="p-3 border-b font-bold text-gray-600">{a.sub_Code}</td>
                                            <td className="p-3 border-b font-medium text-blue-600">{a.sub_Acc_Name}</td>
                                            <td className="p-3 border-b text-center">
                                                <button onClick={() => handleAccSelect(a)} className="bg-[#0078d4] text-white text-[10px] px-3 py-1 rounded-sm font-bold">SELECT</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
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
