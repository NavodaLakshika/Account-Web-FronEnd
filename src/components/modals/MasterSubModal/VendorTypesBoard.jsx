import React, { useState, useEffect } from 'react';
import { RotateCcw, Save, Loader2, AlertTriangle, Building2, BookOpen } from 'lucide-react';
import { vendorTypeService } from '../../../services/vendorType.service';
import { showSuccessToast, showErrorToast } from '../../../utils/toastUtils';
import { MasterFormWrapper, MasterFieldRow, MasterInput, MasterLookupInput, MasterLookupModal } from '../../MasterFormComponents';

const VendorTypesBoard = ({ isOpen, onClose }) => {
    const initialState = { VendorType: '', PaybleAccCode: '', PaybleAccName: '', CurrentUser: '', Company: '', Loca: '01' };

    const [formData, setFormData] = useState(initialState);
    const [loading, setLoading] = useState(false);
    const [showVendorModal, setShowVendorModal] = useState(false);
    const [showAccModal, setShowAccModal] = useState(false);
    const [vendors, setVendors] = useState([]);
    const [accounts, setAccounts] = useState([]);
    const [showSaveConfirm, setShowSaveConfirm] = useState(false);

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
        setShowVendorModal(false);
    };

    const handleAccSelect = (acc) => {
        setFormData(prev => ({ ...prev, PaybleAccCode: acc.sub_Code, PaybleAccName: acc.sub_Acc_Name }));
        setShowAccModal(false);
    };

    const handleSave = () => {
        if (!formData.VendorType.trim()) { showErrorToast('Vendor Type is required'); return; }
        setShowSaveConfirm(true);
    };

    const confirmSave = async () => {
        setShowSaveConfirm(false);
        setLoading(true);
        try {
            await vendorTypeService.save(formData);
            showSuccessToast('Vendor Type saved successfully');
            setFormData({ ...initialState, CurrentUser: formData.CurrentUser, Company: formData.Company });
            fetchInitialData();
        } catch (error) { showErrorToast(typeof error === 'string' ? error : (error.message || 'Failed to save')); } finally { setLoading(false); }
    };

    const handleClear = () => {
        setFormData({ ...initialState, CurrentUser: formData.CurrentUser, Company: formData.Company });
    };

    return (
        <>
            <MasterFormWrapper
                isOpen={isOpen}
                onClose={onClose}
                title="Vendor Types Master"
                subtitle="Manage vendor type classifications"
                icon={Building2}
                maxWidth="max-w-[700px]"
                isEditMode={false}
                loading={loading}
                onClear={handleClear}
                onSave={handleSave}
                saveLabel="SAVE"
            >
                <MasterFieldRow label="Vendor Type" colSpan="col-span-12">
                    <MasterLookupInput value={formData.VendorType} onSearchClick={() => setShowVendorModal(true)} placeholder="Enter vendor type" />
                </MasterFieldRow>
                <MasterFieldRow label="Payable Account" colSpan="col-span-12">
                    <MasterLookupInput value={formData.PaybleAccName || formData.PaybleAccCode} onSearchClick={() => setShowAccModal(true)} placeholder="Select account..." />
                </MasterFieldRow>
            </MasterFormWrapper>

            <MasterLookupModal
                isOpen={showVendorModal}
                onClose={() => setShowVendorModal(false)}
                title="Vendor Type Lookup"
                columns={[
                    { label: 'VENDOR TYPE', key: 'vendorTypes', render: (item) => <span className="font-bold text-slate-700 uppercase text-[11px]">{item.vendorTypes}</span> },
                ]}
                items={vendors}
                onSelect={handleVendorSelect}
                emptyMsg="No vendor types found"
            />

            <MasterLookupModal
                isOpen={showAccModal}
                onClose={() => setShowAccModal(false)}
                title="Chart of Accounts Lookup"
                columns={[
                    { label: 'CODE', key: 'sub_Code', isId: true, width: 'w-[100px]', render: (item) => <span className="font-mono text-[11px] font-bold text-[#0285fd]">{item.sub_Code}</span> },
                    { label: 'ACCOUNT NAME', key: 'sub_Acc_Name', render: (item) => <span className="font-bold text-slate-700 uppercase text-[11px]">{item.sub_Acc_Name}</span> },
                ]}
                items={accounts}
                onSelect={handleAccSelect}
                emptyMsg="No accounts found"
            />

            {showSaveConfirm && (
                <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm" onClick={() => !loading && setShowSaveConfirm(false)} />
 <div className="relative w-full max-w-md bg-white rounded-sm shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="p-8 text-center">
                            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-white shadow-lg"><AlertTriangle size={40} className="text-emerald-500" /></div>
                            <h3 className="text-lg font-black text-slate-800 mb-2 uppercase tracking-wider">Confirm Save</h3>
                            <p className="text-slate-500 text-[12px] font-medium leading-relaxed mb-8">
                                Are you sure you want to save vendor type <span className="font-bold text-slate-800 uppercase">"{formData.VendorType}"</span>?
                                <br />This will link it to account <span className="font-black text-[#0285fd]">{formData.PaybleAccCode}</span>.
                            </p>
                            <div className="flex gap-3">
                                <button onClick={() => setShowSaveConfirm(false)} disabled={loading} className="flex-1 h-11 bg-slate-100 text-slate-600 text-[11px] font-black rounded-[3px] hover:bg-slate-200 transition-all uppercase tracking-widest disabled:opacity-50">Cancel</button>
                                <button onClick={confirmSave} disabled={loading} className="flex-1 h-11 bg-emerald-500 text-white text-[11px] font-black rounded-[3px] hover:bg-emerald-600 shadow-lg shadow-emerald-200 transition-all flex items-center justify-center gap-2 uppercase tracking-widest disabled:opacity-50">{loading ? <Loader2 size={16} className="animate-spin" /> : 'Continue Save'}</button>
                            </div>
                        </div>
                        <div className="bg-slate-50 py-3 border-t border-slate-100"><span className="text-[9px] text-slate-400 font-black uppercase tracking-[0.2em] block text-center">Transaction Integrity Guaranteed</span></div>
                    </div>
                </div>
            )}
        </>
    );
};

export default VendorTypesBoard;
