import React, { useState, useEffect } from 'react';
import { Search, RotateCcw, Save, Users, Loader2, Trash2, CheckCircle } from 'lucide-react';
import TransactionFormWrapper from '../components/TransactionFormWrapper';
import SimpleModal from '../components/SimpleModal';
import { customerTypeService } from '../services/customerType.service';
import { showSuccessToast, showErrorToast } from '../utils/toastUtils';
import ConfirmModal from '../components/modals/ConfirmModal';

const CustomerTypeProfileBoard = ({ isOpen, onClose }) => {
    const initialState = { Code: '', Type_Name: '', Company: '', CurrentUser: '' };

    const [formData, setFormData] = useState(initialState);
    const [loading, setLoading] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
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
            fetchInitialData();
        }
    }, [isOpen]);

    const fetchInitialData = async () => {
        try {
            const data = await customerTypeService.getAll();
            setTypeList(data || []);
        } catch (error) {
            console.error('Failed to load customer types', error);
        }
    };

    const handleInputChange = (e) => { const { name, value } = e.target; setFormData(prev => ({ ...prev, [name]: value })); };

    const handleClear = () => { setFormData({ ...initialState, Company: formData.Company, CurrentUser: formData.CurrentUser }); setIsEditMode(false); };

    const handleSave = async () => {
        if (!formData.Type_Name) { showErrorToast('Type Name is required'); return; }
        setLoading(true);
        try {
            const data = await customerTypeService.save(formData);
            if (data.message === 'inserted') { showSuccessToast('Customer Type created'); setFormData(prev => ({ ...prev, Code: data.code })); setIsEditMode(true); }
            else { showSuccessToast('Customer Type updated'); }
            fetchInitialData();
        } catch (err) { showErrorToast(err.error || err.message || (typeof err === 'string' ? err : 'Failed to save'), { duration: 5000 }); } finally { setLoading(false); }
    };

    const handleDelete = () => { if (!isEditMode || !formData.Code) return; setShowDeleteConfirm(true); };

    const confirmDelete = async () => {
        setLoading(true);
        try { await customerTypeService.delete(formData.Code); showSuccessToast('Customer Type deleted'); handleClear(); setShowDeleteConfirm(false); fetchInitialData(); } catch (err) { showErrorToast(err.message || err); } finally { setLoading(false); }
    };



    return (
        <>
            <TransactionFormWrapper subtitle="Manage customer classification types" icon={null}
                isOpen={isOpen} onClose={onClose} title="Customer Type Profile"
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
                        <button onClick={handleSave} disabled={loading} className="px-6 h-10 bg-[#0285fd] hover:bg-[#0073ff] text-white font-semibold rounded-[3px] shadow-sm text-[13px] transition-all flex items-center gap-2 disabled:opacity-50"><CheckCircle size={14} /> {isEditMode ? 'UPDATE & SAVE' : 'SAVE & APPLY'}</button>
                    </div>
                }
            >
                <div className="space-y-3 overflow-y-auto no-scrollbar font-['Tahoma']">
                    <div className="bg-white p-4 border border-slate-200 rounded-[3px] space-y-4">
                        <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Contextual Metadata</div>
                        <p className="text-[12px] text-gray-500 font-medium leading-relaxed">
                            Create and manage Customer Type classifications to effectively categorize and organize your customer base.
                        </p>
                    </div>
                    <div className="bg-white p-4 border border-slate-200 rounded-[3px] space-y-4">
                        <div className="grid grid-cols-12 gap-x-6 gap-y-3.5">
                            <div className="col-span-6">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Type ID</label>
                                <div className="relative">
                                    <input type="text" readOnly value={formData.Code || ''} className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-slate-50 outline-none text-gray-500 font-mono" />
                                </div>
                            </div>
                            <div className="col-span-6">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Customer Type Name</label>
                                <div className="relative">
                                    <input 
                                        type="text" 
                                        list="customerTypesList"
                                        name="Type_Name" 
                                        value={formData.Type_Name} 
                                        onChange={(e) => {
                                            const val = e.target.value.toUpperCase();
                                            const found = typeList.find(t => (t.name || t.Type_Name || t.Name || '').toUpperCase() === val);
                                            setFormData(prev => ({ ...prev, Type_Name: val, Code: found ? (found.code || found.Code) : '' }));
                                            setIsEditMode(!!found);
                                        }} 
                                        placeholder="Select or enter customer type name" 
                                        className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700 uppercase" 
                                    />
                                    <datalist id="customerTypesList">
                                        {typeList.map((t, i) => (
                                            <option key={i} value={t.name || t.Type_Name || t.Name}>
                                                {(t.code || t.Code || '') ? `${t.code || t.Code} - ` : ''}{t.name || t.Type_Name || t.Name}
                                            </option>
                                        ))}
                                    </datalist>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </TransactionFormWrapper>

            <ConfirmModal
                isOpen={showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(false)}
                onConfirm={confirmDelete}
                title="Confirm Deletion"
                message={`Are you sure you want to delete "${formData.Type_Name || formData.Code}"?\nThis action is permanent and cannot be undone.`}
                loading={loading}
                confirmText="Delete Now"
                variant="danger"
            />
        </>
    );
};

export default CustomerTypeProfileBoard;