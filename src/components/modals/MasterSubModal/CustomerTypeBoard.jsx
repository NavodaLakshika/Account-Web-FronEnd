import React, { useState, useEffect } from 'react';
import { RotateCcw, Save, Trash2, Loader2, AlertTriangle, Users } from 'lucide-react';
import { customerTypeService } from '../../../services/customerType.service';
import { showSuccessToast, showErrorToast } from '../../../utils/toastUtils';
import { MasterFormWrapper, MasterFieldRow, MasterInput, MasterLookupInput, MasterLookupModal } from '../../MasterFormComponents';

const CustomerTypeBoard = ({ isOpen, onClose }) => {
    const initialState = { Code: '', Type_Name: '', Company: '', CurrentUser: '' };

    const [formData, setFormData] = useState(initialState);
    const [loading, setLoading] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [showSearch, setShowSearch] = useState(false);
    const [typeList, setTypeList] = useState([]);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    useEffect(() => {
        if (isOpen) {
            handleClear();
            const user = JSON.parse(localStorage.getItem('user'));
            const companyData = localStorage.getItem('selectedCompany');
            let companyCode = '';
            if (companyData) {
                try { const p = JSON.parse(companyData); companyCode = p.companyCode || p.CompanyCode || p.code || p.Code || companyData; } catch (e) { companyCode = companyData; }
            }
            if (user) {
                setFormData(prev => ({ ...prev, CurrentUser: user.empName || user.EmpName || user.Emp_Name || user.emp_Name || user.username || '', Company: companyCode }));
            }
        }
    }, [isOpen]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleClear = () => {
        setFormData({ ...initialState, Company: formData.Company, CurrentUser: formData.CurrentUser });
        setIsEditMode(false);
    };

    const handleSave = async () => {
        if (!formData.Type_Name) { showErrorToast('Type Name is required'); return; }
        setLoading(true);
        try {
            const data = await customerTypeService.save(formData);
            if (data.message === 'inserted') {
                showSuccessToast('Customer Type created');
                setFormData(prev => ({ ...prev, Code: data.code }));
                setIsEditMode(true);
            } else { showSuccessToast('Customer Type updated'); }
        } catch (err) { showErrorToast(err.error || err.message || (typeof err === 'string' ? err : 'Failed to save'), { duration: 5000 }); } finally { setLoading(false); }
    };

    const handleDelete = () => {
        if (!isEditMode || !formData.Code) return;
        setShowDeleteConfirm(true);
    };

    const confirmDelete = async () => {
        setLoading(true);
        try {
            await customerTypeService.delete(formData.Code);
            showSuccessToast('Customer Type deleted');
            handleClear();
            setShowDeleteConfirm(false);
        } catch (err) { showErrorToast(err.message || err); } finally { setLoading(false); }
    };

    const openSearch = async () => {
        setLoading(true);
        try {
            const data = await customerTypeService.getAll();
            setTypeList(data || []);
            setShowSearch(true);
        } catch (err) { showErrorToast('Failed to load customer types'); } finally { setLoading(false); }
    };

    const selectType = (type) => {
        setFormData(prev => ({ ...prev, Code: type.code, Type_Name: type.name }));
        setIsEditMode(true);
        setShowSearch(false);
    };

    return (
        <>
            <MasterFormWrapper
                isOpen={isOpen}
                onClose={onClose}
                title="Customer Type Profile"
                subtitle="Manage customer classification types"
                icon={Users}
                maxWidth="max-w-2xl"
                isEditMode={isEditMode}
                loading={loading}
                onClear={handleClear}
                onSave={handleSave}
                onDelete={handleDelete}
            >
                <MasterFieldRow label="Type ID" colSpan="col-span-12">
                    <MasterLookupInput value={formData.Code || ''} onSearchClick={openSearch} isIdField />
                </MasterFieldRow>
                <MasterFieldRow label="Type Name" colSpan="col-span-12">
                    <MasterInput name="Type_Name" value={formData.Type_Name} onChange={handleInputChange} placeholder="Enter customer type name" />
                </MasterFieldRow>
            </MasterFormWrapper>

            <MasterLookupModal
                isOpen={showSearch}
                onClose={() => setShowSearch(false)}
                title="Customer Types"
                columns={[
                    { label: 'CODE', key: 'code', isId: true, width: 'w-[100px]', render: (item) => <span className="font-mono text-[11px] font-bold text-[#0285fd]">{item.code}</span> },
                    { label: 'TYPE NAME', key: 'name', render: (item) => <span className="font-bold text-slate-700 uppercase text-[11px]">{item.name}</span> },
                ]}
                items={typeList}
                loading={loading}
                onSelect={selectType}
                emptyMsg="No customer types found"
            />

            {showDeleteConfirm && (
                <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm" onClick={() => !loading && setShowDeleteConfirm(false)} />
                    <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-white/10 overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="p-8 text-center">
                            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-white shadow-lg"><AlertTriangle size={40} className="text-red-500" /></div>
                            <h3 className="text-lg font-black text-slate-800 mb-2 uppercase tracking-wider">Confirm Deletion</h3>
                            <p className="text-slate-500 text-[12px] font-medium leading-relaxed mb-8">Are you sure you want to delete <span className="font-bold text-slate-800 uppercase">"{formData.Type_Name || formData.Code}"</span>?<br />This action is permanent and cannot be undone.</p>
                            <div className="flex gap-3">
                                <button onClick={() => setShowDeleteConfirm(false)} disabled={loading} className="flex-1 h-11 bg-slate-100 text-slate-600 text-[11px] font-black rounded-xl hover:bg-slate-200 transition-all uppercase tracking-widest disabled:opacity-50">Cancel</button>
                                <button onClick={confirmDelete} disabled={loading} className="flex-1 h-11 bg-red-500 text-white text-[11px] font-black rounded-xl hover:bg-red-600 shadow-lg shadow-red-200 transition-all flex items-center justify-center gap-2 uppercase tracking-widest disabled:opacity-50">{loading ? <Loader2 size={16} className="animate-spin" /> : 'Delete Now'}</button>
                            </div>
                        </div>
                        <div className="bg-slate-50 py-3 border-t border-slate-100"><span className="text-[9px] text-slate-400 font-black uppercase tracking-[0.2em] block text-center">Security Verification Required</span></div>
                    </div>
                </div>
            )}
        </>
    );
};

export default CustomerTypeBoard;
