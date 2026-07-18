import React, { useState, useEffect } from 'react';
import { Search, RotateCcw, Save, Building2, Loader2, Trash2, CheckCircle } from 'lucide-react';
import TransactionFormWrapper from '../components/TransactionFormWrapper';
import SimpleModal from '../components/SimpleModal';
import { vendorTypeService } from '../services/vendorType.service';
import { showSuccessToast, showErrorToast } from '../utils/toastUtils';
import SearchableSelect from '../components/SearchableSelect';
import ConfirmModal from '../components/modals/ConfirmModal';

const VendorTypesMasterBoard = ({ isOpen, onClose }) => {
    const initialState = { VendorType: '', PaybleAccCode: '', PaybleAccName: '', CurrentUser: '', Company: '', Loca: '01' };

    const [formData, setFormData] = useState(initialState);
    const [loading, setLoading] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showVendorModal, setShowVendorModal] = useState(false);
    const [showAccModal, setShowAccModal] = useState(false);
    const [vendors, setVendors] = useState([]);
    const [accounts, setAccounts] = useState([]);
    const [vendorSearchTerm, setVendorSearchTerm] = useState('');
    const [accSearchTerm, setAccSearchTerm] = useState('');

    useEffect(() => {
        if (isOpen) {
            const user = JSON.parse(localStorage.getItem('user'));
            const companyData = localStorage.getItem('selectedCompany');
            let companyCode = 'C001';
            if (companyData) { try { const p = JSON.parse(companyData); companyCode = p.company_Code || p.companyCode || p.CompanyCode || companyData; } catch (e) { companyCode = companyData; } }
            setFormData(prev => ({ ...prev, CurrentUser: user ? (user.empName || user.EmpName || user.Emp_Name || user.emp_Name || user.username || '') : '', Company: companyCode }));
            fetchInitialData();
        }
    }, [isOpen]);

    const fetchInitialData = async () => {
        try {
            const [vendorList, accountList] = await Promise.all([vendorTypeService.getVendors(), vendorTypeService.searchAccounts()]);
            setVendors(vendorList);
            setAccounts(accountList);
        } catch (error) { console.error('Data fetch error:', error); }
    };

    const handleVendorSelect = async (vt) => {
        setFormData(prev => ({ ...prev, VendorType: vt.vendorTypes, PaybleAccCode: vt.paybleAccCode }));
        try {
            const details = await vendorTypeService.getDetails(vt.vendorTypes);
            setFormData(prev => ({ ...prev, PaybleAccName: details.paybleAccName }));
        } catch (e) { setFormData(prev => ({ ...prev, PaybleAccName: '' })); }
        setIsEditMode(true);
        setShowVendorModal(false);
    };

    const handleAccSelect = (acc) => {
        setFormData(prev => ({ ...prev, PaybleAccCode: acc.sub_Code, PaybleAccName: acc.sub_Acc_Name }));
        setShowAccModal(false);
    };

    const handleSave = async () => {
        if (!formData.VendorType.trim()) { showErrorToast('Vendor Type is required'); return; }
        
        setLoading(true);
        try {
            await vendorTypeService.save(formData);
            showSuccessToast('Vendor Type saved successfully');
            setFormData({ ...initialState, CurrentUser: formData.CurrentUser, Company: formData.Company });
            fetchInitialData();
        } catch (error) { showErrorToast(typeof error === 'string' ? error : (error.message || 'Failed to save')); } finally { setLoading(false); }
    };

    const handleClear = () => { setFormData({ ...initialState, CurrentUser: formData.CurrentUser, Company: formData.Company }); setIsEditMode(false); };

    const handleDelete = () => { if (!isEditMode || !formData.VendorType) return; setShowDeleteConfirm(true); };

    const confirmDelete = async () => {
        setLoading(true);
        try { await vendorTypeService.delete(formData.VendorType); showSuccessToast('Vendor Type deleted'); handleClear(); setShowDeleteConfirm(false); fetchInitialData(); } catch (err) { showErrorToast(err.message || err); } finally { setLoading(false); }
    };

    const filteredVendors = vendors.filter(v => (v.vendorTypes || '').toLowerCase().includes(vendorSearchTerm.toLowerCase()));
    const filteredAccounts = accounts.filter(a => (a.sub_Acc_Name || '').toLowerCase().includes(accSearchTerm.toLowerCase()) || (a.sub_Code || '').toLowerCase().includes(accSearchTerm.toLowerCase()));

    return (
        <>
            <TransactionFormWrapper subtitle="Manage vendor type classifications" icon={null}
                isOpen={isOpen} onClose={onClose} title="Vendor Types Master"
                footer={
                    <div className="bg-slate-50 px-6 py-4 w-full flex justify-between items-center border-t border-slate-200 rounded-b-[5px]">
                        <div className="flex gap-3">
                            <button
                                onClick={handleDelete}
                                disabled={!isEditMode || loading}
                                className={`px-6 h-10 bg-red-50 text-red-600 text-sm font-bold rounded-[3px] hover:bg-red-100 transition-all active:scale-95 flex items-center justify-center gap-2 border border-red-100 ${(!isEditMode || loading) ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                <Trash2 size={14} /> DELETE
                            </button>
                            <button onClick={handleClear} className="px-6 h-10 border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 font-semibold rounded-[3px] shadow-sm text-[13px] transition-all flex items-center gap-2"><RotateCcw size={14} /> CLEAR</button>
                        </div>
                        <button onClick={handleSave} disabled={loading} className="px-6 h-10 bg-[#0285fd] hover:bg-[#0073ff] text-white font-semibold rounded-[3px] shadow-sm text-[13px] transition-all flex items-center gap-2 disabled:opacity-50"><CheckCircle size={14} /> SAVE</button>
                    </div>
                }
            >
                <div className="space-y-3 overflow-y-auto no-scrollbar font-['Tahoma']">
                    <div className="bg-white p-4 border border-slate-200 rounded-[3px] space-y-4">
                        <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Contextual Metadata</div>
                        <p className="text-[12px] text-gray-500 font-medium leading-relaxed">
                            Create and manage Vendor Type classifications. Ensure you assign the correct Payable Account to link these vendors to the general ledger.
                        </p>
                    </div>
                    <div className="bg-white p-4 border border-slate-200 rounded-[3px] space-y-4">
                        <div className="grid grid-cols-12 gap-x-6 gap-y-3.5">
                            <div className="col-span-6">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Vendor Type</label>
                                <div className="relative">
                                    <input 
                                        type="text"
                                        list="vendorTypesList"
                                        value={formData.VendorType} 
                                        onChange={(e) => {
                                            const val = e.target.value.toUpperCase();
                                            const found = vendors.find(v => (v.vendorTypes || '').toUpperCase() === val);
                                            setFormData(prev => ({ ...prev, VendorType: val }));
                                            setIsEditMode(!!found);
                                            if (found) {
                                                setFormData(prev => ({ ...prev, VendorType: found.vendorTypes, PaybleAccCode: found.paybleAccCode }));
                                                vendorTypeService.getDetails(found.vendorTypes).then(details => {
                                                    setFormData(prev => ({ ...prev, PaybleAccName: details.paybleAccName }));
                                                }).catch(() => {});
                                            }
                                        }}
                                        placeholder="Select or type vendor type..."
                                        className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700 uppercase"
                                    />
                                    <datalist id="vendorTypesList">
                                        {vendors.map((v, i) => (
                                            <option key={i} value={v.vendorTypes}>
                                                {(v.id || v.ID || '') ? `${v.id || v.ID} - ` : ''}{v.vendorTypes}
                                            </option>
                                        ))}
                                    </datalist>
                                </div>
                            </div>
                            <div className="col-span-6">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Payable Account</label>
                                <div className="relative">
                                    <select 
                                        value={formData.PaybleAccCode} 
                                        onChange={(e) => {
                                            const acc = accounts.find(a => a.sub_Code === e.target.value);
                                            if (acc) {
                                                setFormData(prev => ({ ...prev, PaybleAccCode: acc.sub_Code, PaybleAccName: acc.sub_Acc_Name }));
                                            } else {
                                                setFormData(prev => ({ ...prev, PaybleAccCode: '', PaybleAccName: '' }));
                                            }
                                        }}
                                        className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700 cursor-pointer appearance-none"  
                                        style={{ backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.5rem center', backgroundSize: '1em' }}
                                    >
                                        <option value="">Select account...</option>
                                        {accounts.map((a, i) => (
                                            <option key={i} value={a.sub_Code}>{a.sub_Code} - {a.sub_Acc_Name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </TransactionFormWrapper>

            <SimpleModal isOpen={showVendorModal} onClose={() => setShowVendorModal(false)} title="Vendor Type Lookup" maxWidth="max-w-[700px]">
                <div className="space-y-4 font-['Tahoma']">
                    <div className="flex items-center gap-4 bg-slate-50 p-4 border-b border-gray-100 mb-2">
                        <span className="text-[12px] font-bold text-gray-500 uppercase tracking-wider">Search</span>
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                            <input type="text" placeholder="Find vendor type..." className="w-full h-10 pl-10 pr-4 border border-gray-300 rounded-[3px] outline-none text-[13px] focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] shadow-sm bg-white" value={vendorSearchTerm} onChange={(e) => setVendorSearchTerm(e.target.value)} autoFocus />
                        </div>
                    </div>
                    <div className="border border-gray-200 rounded-[3px] overflow-hidden shadow-sm max-h-[400px] overflow-y-auto no-scrollbar">
                        <table className="w-full text-left">
                            <thead className="bg-[#f8fafc] sticky top-0 text-[11px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 shadow-sm z-10">
                                <tr><th className=" px-5 py-3">CODE</th><th className=" px-5 py-3">VENDOR TYPE</th><th className="text-right px-5 py-3">Action</th></tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filteredVendors.map((v, i) => (
                                    <tr key={i} className="group hover:bg-blue-50/50  transition-all cursor-pointer group border-b border-gray-50" onClick={() => handleVendorSelect(v)}>
                                        <td className="font-mono text-[12px] font-bold text-blue-600 px-5 py-3">{v.id || v.ID}</td>
                                        <td className="text-[12px] font-bold text-slate-700 uppercase group-hover:text-blue-600 transition-colors px-5 py-3">{v.vendorTypes}</td>
                                        <td className="text-right px-5 py-3"><button className="bg-white text-[#0285fd] border border-[#0285fd] hover:bg-blue-50 text-[10px] px-5 py-2 rounded-[3px] font-black shadow-sm transition-all active:scale-95 uppercase">SELECT</button></td>
                                    </tr>
                                ))}
                                {filteredVendors.length === 0 && <tr><td colSpan="3" className="text-center py-16 text-gray-400 text-[11px] font-bold uppercase tracking-widest">No vendor types found.</td></tr>}
                            </tbody>
                        </table>
                    </div>
                </div>
            </SimpleModal>

            <SimpleModal isOpen={showAccModal} onClose={() => setShowAccModal(false)} title="Chart of Accounts Lookup" maxWidth="max-w-[700px]">
                <div className="space-y-4 font-['Tahoma']">
                    <div className="flex items-center gap-4 bg-slate-50 p-4 border-b border-gray-100 mb-2">
                        <span className="text-[12px] font-bold text-gray-500 uppercase tracking-wider">Search</span>
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                            <input type="text" placeholder="Find account..." className="w-full h-10 pl-10 pr-4 border border-gray-300 rounded-[3px] outline-none text-[13px] focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] shadow-sm bg-white" value={accSearchTerm} onChange={(e) => setAccSearchTerm(e.target.value)} autoFocus />
                        </div>
                    </div>
                    <div className="border border-gray-200 rounded-[3px] overflow-hidden shadow-sm max-h-[400px] overflow-y-auto no-scrollbar">
                        <table className="w-full text-left">
                            <thead className="bg-[#f8fafc] sticky top-0 text-[11px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 shadow-sm z-10">
                                <tr><th className=" px-5 py-3">CODE</th><th className=" px-5 py-3">ACCOUNT NAME</th><th className="text-right px-5 py-3">Action</th></tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filteredAccounts.map((a, i) => (
                                    <tr key={i} className="group hover:bg-blue-50/50  transition-all cursor-pointer group border-b border-gray-50" onClick={() => handleAccSelect(a)}>
                                        <td className="font-mono text-[12px] font-bold text-blue-600 px-5 py-3">{a.sub_Code}</td>
                                        <td className="text-[12px] font-bold text-slate-700 uppercase group-hover:text-blue-600 transition-colors px-5 py-3">{a.sub_Acc_Name}</td>
                                        <td className="text-right px-5 py-3"><button className="bg-white text-[#0285fd] border border-[#0285fd] hover:bg-blue-50 text-[10px] px-5 py-2 rounded-[3px] font-black shadow-sm transition-all active:scale-95 uppercase">SELECT</button></td>
                                    </tr>
                                ))}
                                {filteredAccounts.length === 0 && <tr><td colSpan="3" className="text-center py-16 text-gray-400 text-[11px] font-bold uppercase tracking-widest">No accounts found.</td></tr>}
                            </tbody>
                        </table>
                    </div>
                </div>
            </SimpleModal>

            <ConfirmModal
                isOpen={showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(false)}
                onConfirm={confirmDelete}
                title="Confirm Deletion"
                message={`Are you sure you want to delete "${formData.VendorType}"?\nThis action is permanent and cannot be undone.`}
                loading={loading}
                confirmText="Delete Now"
                variant="danger"
            />
        </>
    );
};

export default VendorTypesMasterBoard;
