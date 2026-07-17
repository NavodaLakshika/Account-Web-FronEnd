import React, { useState, useEffect } from 'react';
import SimpleModal from '../components/SimpleModal';
import { Search, RotateCcw, Trash2, Loader2, CheckCircle } from 'lucide-react';
import { departmentService } from '../services/department.service';
import { showSuccessToast, showErrorToast } from '../utils/toastUtils';
import TransactionFormWrapper from '../components/TransactionFormWrapper';
import ConfirmModal from '../components/modals/ConfirmModal';

const DepartmentProfileBoard = ({ isOpen, onClose }) => {
    const initialState = { Code: '', Dept_Name: '', Company: '', CurrentUser: 'SYSTEM' };

    const [formData, setFormData] = useState(initialState);
    const [loading, setLoading] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [deptList, setDeptList] = useState([]);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    useEffect(() => {
        if (isOpen) {
            const user = JSON.parse(localStorage.getItem('user'));
            const companyData = localStorage.getItem('selectedCompany');
            let companyCode = 'C001';
            if (companyData) { try { const p = JSON.parse(companyData); companyCode = p.companyCode || p.CompanyCode || p.code || p.Code || companyData; } catch (e) { companyCode = companyData; } }
            setFormData(prev => ({ ...prev, CurrentUser: user?.empName || user?.EmpName || user?.Emp_Name || user?.emp_Name || user?.username || '', Company: companyCode }));
            fetchDepartments(companyCode);
        }
    }, [isOpen]);

    const fetchDepartments = async (company) => {
        try { const data = await departmentService.searchDepartments(company, ''); setDeptList(data || []); } catch (err) { console.error('Failed to load departments'); }
    };

    const handleInputChange = (e) => { const { name, value } = e.target; setFormData(prev => ({ ...prev, [name]: value })); };

    const handleClear = () => { setFormData({ ...initialState, Company: formData.Company, CurrentUser: formData.CurrentUser }); setIsEditMode(false); };

    const handleSave = async () => {
        if (!formData.Dept_Name) { showErrorToast('Department Name is required'); return; }
        setLoading(true);
        try {
            const data = await departmentService.save(formData);
            if (data.message === 'inserted') { showSuccessToast('Department created'); setFormData(prev => ({ ...prev, Code: data.code })); setIsEditMode(true); fetchDepartments(formData.Company); }
            else { showSuccessToast('Department updated'); fetchDepartments(formData.Company); }
        } catch (err) { showErrorToast(err.error || err.message || (typeof err === 'string' ? err : 'Failed to save'), { duration: 5000 }); } finally { setLoading(false); }
    };

    const handleDelete = () => { if (!isEditMode || !formData.Code) return; setShowDeleteConfirm(true); };

    const confirmDelete = async () => {
        setLoading(true);
        try { await departmentService.delete(formData.Code, formData.Company); showSuccessToast('Department deleted'); handleClear(); setShowDeleteConfirm(false); fetchDepartments(formData.Company); } catch (err) { showErrorToast(err.message || err); } finally { setLoading(false); }
    };

    const handleDeptSelect = (code) => {
        if (!code) {
            handleClear();
            return;
        }
        const dept = deptList.find(d => d.code === code);
        if (dept) {
            setFormData(prev => ({ ...prev, Code: dept.code, Dept_Name: dept.name }));
            setIsEditMode(true);
        }
    };

    return (
        <>
            <TransactionFormWrapper subtitle="Manage department structure & locations" icon={null}
                isOpen={isOpen} onClose={onClose} title="Department Profile"
                footer={
                    <div className="bg-slate-50 px-6 py-4 w-full flex justify-between items-center border-t border-slate-200 rounded-b-[5px]">
                        <div className="flex gap-3">
                            <button
                                onClick={handleDelete}
                                disabled={!isEditMode || loading}
                                className={`px-6 h-10 border border-transparent text-white bg-[#ef4444] hover:bg-[#dc2626] font-semibold rounded-[3px] shadow-[0_2px_10px_rgba(239,68,68,0.2)] hover:shadow-[0_4px_15px_rgba(239,68,68,0.3)] text-[13px] transition-all flex items-center gap-2 ${(!isEditMode || loading) ? 'opacity-40 cursor-not-allowed' : ''}`}
                            >
                                <Trash2 size={14} /> DELETE
                            </button>
                            <button type="button" onClick={handleClear} className="px-6 h-10 border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 font-semibold rounded-[3px] shadow-sm text-[13px] transition-all flex items-center gap-2"><RotateCcw size={14} /> CLEAR</button>
                        </div>
                        <button onClick={handleSave} disabled={loading} className="px-6 h-10 bg-[#0285fd] hover:bg-[#0073ff] text-white font-semibold rounded-[3px] shadow-sm text-[13px] transition-all flex items-center gap-2 disabled:opacity-50"><CheckCircle size={14} /> {isEditMode ? 'UPDATE & SAVE' : 'SAVE & APPLY'}</button>
                    </div>
                }
            >
                <div className="space-y-3 overflow-y-auto no-scrollbar font-['Tahoma']">
                    <div className="bg-white p-4 border border-slate-200 rounded-[3px] space-y-4">
                        <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Contextual Metadata</div>
                        <p className="text-[12px] text-gray-500 font-medium leading-relaxed">
                            Create and manage Department classifications to effectively categorize and organize your company structure.
                        </p>
                    </div>
                    <div className="bg-white p-4 border border-slate-200 rounded-[3px] space-y-4">
                        <div className="grid grid-cols-12 gap-x-6 gap-y-3.5">
                            <div className="col-span-6">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Department ID</label>
                                <div className="relative">
                                    <select
                                        value={formData.Code}
                                        onChange={(e) => handleDeptSelect(e.target.value)}
                                        className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-blue-600 font-bold cursor-pointer appearance-none"
                                        style={{ backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.5rem center', backgroundSize: '1em' }}
                                    >
                                        <option value="">Auto Gen (New Department)</option>
                                        {deptList.map((d, i) => (
                                            <option key={i} value={d.code}>{d.code} - {d.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="col-span-6">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Dept. Name</label>
                                <input type="text" name="Dept_Name" value={formData.Dept_Name} onChange={handleInputChange} placeholder="Enter department name" className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700" />
                            </div>
                        </div>
                    </div>
                </div>
            </TransactionFormWrapper>

            {/* Search modals removed */}

            <ConfirmModal
                isOpen={showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(false)}
                onConfirm={confirmDelete}
                title="Confirm Deletion"
                message={`Are you sure you want to delete department "${formData.Dept_Name || formData.Code}"?\nThis action is permanent and cannot be undone.`}
                loading={loading}
                confirmText="Delete Now"
                variant="danger"
            />
        </>
    );
};

export default DepartmentProfileBoard;
