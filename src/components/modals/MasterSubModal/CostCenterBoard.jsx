import React, { useState, useEffect } from 'react';
import { Target } from 'lucide-react';
import { costCenterService } from '../../../services/costcenter.service';
import { showSuccessToast, showErrorToast } from '../../../utils/toastUtils';
import { MasterFormWrapper, MasterFieldRow, MasterInput, MasterLookupInput, MasterLookupModal } from '../../MasterFormComponents';
import ConfirmModal from '../../../components/modals/ConfirmModal';

const CostCenterBoard = ({ isOpen, onClose }) => {
    const initialState = { Code: '', Name: '', Inactive: false, CurrentUser: 'SYSTEM', Company: '' };

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

    const handleSave = async () => {
        if (!formData.Name) { showErrorToast('Cost Center Name is required'); return; }
        setLoading(true);
        try {
            const data = await costCenterService.save({ Code: formData.Code, Name: formData.Name, Inactive: formData.Inactive, CurrentUser: formData.CurrentUser, Company: formData.Company });
            if (data.message === 'inserted') {
                showSuccessToast('Cost Center added successfully');
                setFormData(prev => ({ ...prev, Code: data.code }));
                setIsEditMode(true);
                fetchLookups(formData.Company);
            } else if (data.message === 'updated') {
                showSuccessToast('Cost Center updated successfully');
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

    const selectCostCenter = (code) => {
        const item = costCentersList.find(c => (c.code || c.Code) === code);
        if (item) {
            setFormData({ Code: item.code || item.Code, Name: item.name || item.Name, Inactive: item.inactive || item.Inactive, CurrentUser: formData.CurrentUser, Company: formData.Company });
            setIsEditMode(true);
        }
    };

    if (!isOpen) return null;

    return (
        <>
            <MasterFormWrapper
                isOpen={isOpen}
                onClose={onClose}
                title="Cost Center Profile"
                subtitle="Manage cost center codes & details"
                icon={Target}
                maxWidth="max-w-[700px]"
                isEditMode={isEditMode}
                loading={loading}
                onClear={handleClear}
                onSave={handleSave}
                onDelete={handleDelete}
            >
                <div className="col-span-12 mb-2">
                    <div className="bg-blue-50/50 border border-blue-100 rounded-[3px] p-3">
                        <h4 className="text-[13px] font-bold text-blue-900 mb-0.5">Note</h4>
                        <p className="text-[12px] text-blue-700/80">The Cost Center ID is auto-generated by the system upon saving.</p>
                    </div>
                </div>

                <MasterFieldRow label="Cost Center ID" colSpan="col-span-12">
                    <select
                        value={formData.Code}
                        onChange={(e) => {
                            if (e.target.value) {
                                selectCostCenter(e.target.value);
                            } else {
                                handleClear();
                            }
                        }}
                        className="flex-1 min-w-0 h-8 border border-slate-200 rounded-[3px] px-3 text-[12px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-blue-600 font-bold cursor-pointer appearance-none"
                        style={{ backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.5rem center', backgroundSize: '1em' }}
                    >
                        <option value="">Auto Gen (New Cost Center)</option>
                        {costCentersList.map((c, i) => (
                            <option key={i} value={c.code || c.Code}>
                                {c.code || c.Code} - {c.name || c.Name}
                            </option>
                        ))}
                    </select>
                </MasterFieldRow>
                <MasterFieldRow label="Cost Center Name" colSpan="col-span-12">
                    <MasterInput name="Name" value={formData.Name} onChange={handleInputChange} placeholder="Enter cost center name" />
                </MasterFieldRow>

                <div className="col-span-12 mt-2">
                    <label className="flex items-center gap-3 cursor-pointer">
                        <MasterInput type="checkbox" name="Inactive" checked={formData.Inactive} onChange={handleInputChange} />
                        <span className="text-[12px] font-bold text-slate-600 select-none">Cost Center Inactive</span>
                    </label>
                </div>
            </MasterFormWrapper>

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

export default CostCenterBoard;
