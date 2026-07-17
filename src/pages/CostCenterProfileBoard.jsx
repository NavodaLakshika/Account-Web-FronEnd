import React, { useState, useEffect } from 'react';
import SimpleModal from '../components/SimpleModal';
import { Target, Search, Trash2, RotateCcw, Save } from 'lucide-react';
import { costCenterService } from '../services/costcenter.service';
import { showSuccessToast, showErrorToast } from '../utils/toastUtils';
import TransactionFormWrapper from '../components/TransactionFormWrapper';
import ConfirmModal from '../components/modals/ConfirmModal';

const CostCenterProfileBoard = ({ isOpen, onClose }) => {
    const initialState = {
        Code: '', Name: '', Inactive: false, CurrentUser: 'SYSTEM', Company: ''
    };

    const [formData, setFormData] = useState(initialState);
    const [loading, setLoading] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [costCentersList, setCostCentersList] = useState([]);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const fetchLookups = async (compCode) => {
        try {
            const data = await costCenterService.getAll(compCode);
            setCostCentersList(data);
        } catch (error) { console.error('Failed to load cost centers:', error); }
    };

    useEffect(() => {
        if (isOpen) {
            handleClear();
            const user = JSON.parse(localStorage.getItem('user'));
            const companyData = localStorage.getItem('selectedCompany');
            let companyCode = 'C001';
            if (companyData) { try { const p = JSON.parse(companyData); companyCode = p.company_Code || p.companyCode || p.CompanyCode || companyData; } catch (e) { companyCode = companyData; } }
            if (user) {
                setFormData(prev => ({ ...prev, CurrentUser: user.emp_Name || user.empName || 'SYSTEM', Company: companyCode }));
            }
            fetchLookups(companyCode);
        }
    }, [isOpen]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleClear = () => {
        const user = JSON.parse(localStorage.getItem('user'));
        const companyData = localStorage.getItem('selectedCompany');
        let companyCode = 'C001';
        if (companyData) { try { const p = JSON.parse(companyData); companyCode = p.company_Code || p.companyCode || p.CompanyCode || companyData; } catch (e) {} }
        setFormData({ ...initialState, CurrentUser: user?.emp_Name || user?.empName || 'SYSTEM', Company: companyCode });
        setIsEditMode(false);
    };

    const selectCostCenter = (code) => {
        const item = costCentersList.find(c => (c.code || c.Code) === code);
        if (item) {
            setFormData({
                Code: item.code || item.Code,
                Name: item.name || item.Name,
                Inactive: item.inactive || item.Inactive,
                CurrentUser: formData.CurrentUser,
                Company: formData.Company
            });
            setIsEditMode(true);
        }
    };

    const handleSave = async () => {
        if (!formData.Name) { showErrorToast('Cost Center Name is required'); return; }
        setLoading(true);
        try {
            const data = await costCenterService.save({
                Code: formData.Code, Name: formData.Name, Inactive: formData.Inactive,
                CurrentUser: formData.CurrentUser, Company: formData.Company
            });
            if (data.message === 'inserted') {
                showSuccessToast('Cost Center added successfully');
                setFormData(prev => ({ ...prev, Code: data.code }));
                setIsEditMode(true);
                fetchLookups(formData.Company);
            } else if (data.message === 'updated') {
                showSuccessToast('Cost Center updated successfully');
                fetchLookups(formData.Company);
            }
        } catch (error) {
            showErrorToast(error.error || error.message || (typeof error === 'string' ? error : 'Failed to save'), { duration: 5000 });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = () => {
        if (!isEditMode || !formData.Code) return;
        setShowDeleteConfirm(true);
    };

    const confirmDelete = async () => {
        setLoading(true);
        try {
            await costCenterService.delete(formData.Code, formData.Company);
            showSuccessToast('Cost Center deleted');
            handleClear();
            fetchLookups(formData.Company);
            setShowDeleteConfirm(false);
        } catch (error) {
            showErrorToast(error.error || error.message || 'Deletion failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <TransactionFormWrapper subtitle="Manage cost center codes & details" icon={Target}
                isOpen={isOpen}
                onClose={onClose}
                title="Cost Center Profile"
                footer={
                    <div className="bg-[#fcfcfc] px-6 py-5 w-full flex justify-between items-center border-t border-gray-200 rounded-b-[10px] shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]">
                        <div className="flex gap-3">
                            <button
                                onClick={handleDelete}
                                disabled={!isEditMode || loading}
                                className={`px-6 h-10 border border-transparent text-white bg-[#ef4444] hover:bg-[#dc2626] font-semibold rounded-[3px] shadow-[0_2px_10px_rgba(239,68,68,0.2)] hover:shadow-[0_4px_15px_rgba(239,68,68,0.3)] text-[13px] transition-all flex items-center gap-2 ${(!isEditMode || loading) ? 'opacity-40 cursor-not-allowed' : ''}`}
                            >
                                <Trash2 size={14} /> DELETE
                            </button>
                            <button type="button" onClick={handleClear} className="px-6 h-10 border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 font-semibold rounded-[3px] shadow-sm text-[13px] transition-all flex items-center justify-center gap-2">
                                <RotateCcw size={14} /> CLEAR
                            </button>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={handleSave} disabled={loading} className="px-6 h-10 bg-[#0285fd] hover:bg-[#0073ff] text-white font-semibold rounded-[3px] shadow-sm text-[13px] transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                                <Save size={14} /> SAVE
                            </button>
                        </div>
                    </div>
                }
            >
                <div className="space-y-3 overflow-y-auto no-scrollbar font-['Tahoma']">
                    <div className="bg-white p-4 border border-slate-200 rounded-[3px] space-y-4">
                        <div className="grid grid-cols-12 gap-x-6 gap-y-3.5">
                            <div className="col-span-12 mb-2">
                                <div className="bg-blue-50/50 border border-blue-100 rounded-[3px] p-3">
                                    <h4 className="text-[13px] font-bold text-blue-900 mb-0.5">Note</h4>
                                    <p className="text-[12px] text-blue-700/80">The Cost Center ID is auto-generated by the system upon saving.</p>
                                </div>
                            </div>
                            <div className="col-span-6">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Cost Center ID</label>
                                <div className="relative">
                                    <select
                                        value={formData.Code}
                                        onChange={(e) => {
                                            if (e.target.value) {
                                                selectCostCenter(e.target.value);
                                            } else {
                                                handleClear();
                                            }
                                        }}
                                        className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-blue-600 font-bold cursor-pointer appearance-none"
                                        style={{ backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.5rem center', backgroundSize: '1em' }}
                                    >
                                        <option value="">Auto Gen (New Cost Center)</option>
                                        {costCentersList.map((c, i) => (
                                            <option key={i} value={c.code || c.Code}>
                                                {c.code || c.Code} - {c.name || c.Name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="col-span-6">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Cost Center Name</label>
                                <input type="text" name="Name" value={formData.Name} onChange={handleInputChange} placeholder="Enter cost center name" maxLength={50} className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700" />
                            </div>
                            <div className="col-span-12 mt-1">
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input type="checkbox" name="Inactive" checked={formData.Inactive} onChange={handleInputChange} className="w-4 h-4 text-[#0285fd] border-gray-300 rounded focus:ring-[#0285fd] cursor-pointer" />
                                    <span className="text-[12px] font-bold text-slate-600 select-none">Cost Center Inactive</span>
                                </label>
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
                message={`Are you sure you want to delete "${formData.Name || formData.Code}"?\nThis action is permanent and cannot be undone.`}
                loading={loading}
                confirmText="Delete Now"
                variant="danger"
            />
        </>
    );
};

export default CostCenterProfileBoard;
