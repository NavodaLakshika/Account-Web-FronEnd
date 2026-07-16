import React, { useState, useEffect } from 'react';
import { Search, RotateCcw, Save, Users, Loader2, AlertTriangle, Trash2 } from 'lucide-react';
import TransactionFormWrapper from '../components/TransactionFormWrapper';
import SimpleModal from '../components/SimpleModal';
import { customerTypeService } from '../services/customerType.service';
import { showSuccessToast, showErrorToast } from '../utils/toastUtils';

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
                    <div className="bg-[#fcfcfc] px-6 py-5 w-full flex justify-between items-center border-t border-gray-200 rounded-b-[10px] shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]">
                        <div className="flex gap-3">
                            {isEditMode && <button onClick={handleDelete} className="px-6 h-10 border-2 border-red-500 text-red-600 bg-white hover:bg-red-50 font-semibold rounded-[3px] shadow-sm text-[13px] transition-all flex items-center justify-center gap-2"><Trash2 size={14} /> DELETE</button>}
                            <button onClick={handleClear} className="px-6 h-10 border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 font-semibold rounded-[3px] shadow-sm text-[13px] transition-all flex items-center justify-center gap-2"><RotateCcw size={14} /> CLEAR</button>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={handleSave} disabled={loading} className="px-6 h-10 bg-[#0285fd] hover:bg-[#0073ff] text-white font-semibold rounded-[3px] shadow-sm text-[13px] transition-all flex items-center justify-center gap-2 disabled:opacity-50"><Save size={14} /> {isEditMode ? 'UPDATE' : 'SAVE'}</button>
                        </div>
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



            {showDeleteConfirm && (
                <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm" onClick={() => !loading && setShowDeleteConfirm(false)} />
                    <div className="relative w-full max-w-md bg-white rounded-sm shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="p-8 text-center">
                            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-white shadow-lg"><AlertTriangle size={40} className="text-red-500" /></div>
                            <h3 className="text-lg font-black text-slate-800 mb-2 uppercase tracking-wider">Confirm Deletion</h3>
                            <p className="text-slate-500 text-[12px] font-medium leading-relaxed mb-8">Are you sure you want to delete <span className="font-bold text-slate-800 uppercase">"{formData.Type_Name || formData.Code}"</span>?<br />This action is permanent and cannot be undone.</p>
                            <div className="flex gap-3">
                                <button onClick={() => setShowDeleteConfirm(false)} disabled={loading} className="flex-1 h-11 bg-slate-100 text-slate-600 text-[11px] font-black rounded-[3px] hover:bg-slate-200 transition-all uppercase tracking-widest disabled:opacity-50">Cancel</button>
                                <button onClick={confirmDelete} disabled={loading} className="flex-1 h-11 bg-red-500 text-white text-[11px] font-black rounded-[3px] hover:bg-red-600 shadow-lg shadow-red-200 transition-all flex items-center justify-center gap-2 uppercase tracking-widest disabled:opacity-50">{loading ? <Loader2 size={16} className="animate-spin" /> : 'Delete Now'}</button>
                            </div>
                        </div>
                        <div className="bg-slate-50 py-3 border-t border-slate-100"><span className="text-[9px] text-slate-400 font-black uppercase tracking-[0.2em] block text-center">Security Verification Required</span></div>
                    </div>
                </div>
            )}
        </>
    );
};

export default CustomerTypeProfileBoard;
