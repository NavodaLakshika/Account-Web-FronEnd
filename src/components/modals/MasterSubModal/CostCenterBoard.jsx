import React, { useState, useEffect } from 'react';
import { Target } from 'lucide-react';
import { costCenterService } from '../../../services/costcenter.service';
import { showSuccessToast, showErrorToast } from '../../../utils/toastUtils';
import { MasterFormWrapper, MasterFieldRow, MasterInput, MasterLookupInput, MasterLookupModal } from '../../MasterFormComponents';

const CostCenterBoard = ({ isOpen, onClose }) => {
    const initialState = { Code: '', Name: '', Inactive: false, CurrentUser: 'SYSTEM', Company: '' };

    const [formData, setFormData] = useState(initialState);
    const [loading, setLoading] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [showSearchModal, setShowSearchModal] = useState(false);
    const [costCentersList, setCostCentersList] = useState([]);
    
    const [ccSearch, setCcSearch] = useState('');

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
            } else if (data.message === 'updated') {
                showSuccessToast('Cost Center updated successfully');
            }
        } catch (error) {
            showErrorToast(error.error || error.message || (typeof error === 'string' ? error : 'Failed to save'), { duration: 5000 });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!isEditMode || !formData.Code) return;
        if (!window.confirm(`Are you sure you want to delete cost center "${formData.Name}"?`)) return;
        setLoading(true);
        try {
            await costCenterService.delete(formData.Code, formData.Company);
            showSuccessToast('Cost Center deleted');
            handleClear();
        } catch (error) {
            showErrorToast(error.error || error.message || 'Deletion failed');
        } finally {
            setLoading(false);
        }
    };

    const openSearch = async () => {
        setLoading(true);
        try {
            const data = await costCenterService.getAll(formData.Company);
            setCostCentersList(data);
            setShowSearchModal(true);
        } catch (error) { showErrorToast('Failed to load cost centers'); } finally { setLoading(false); }
    };

    const selectCostCenter = (item) => {
        setFormData({ Code: item.code || item.Code, Name: item.name || item.Name, Inactive: item.inactive || item.Inactive, CurrentUser: formData.CurrentUser, Company: formData.Company });
        setIsEditMode(true);
        setShowSearchModal(false);
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
                maxWidth="max-w-2xl"
                isEditMode={isEditMode}
                loading={loading}
                onClear={handleClear}
                onSave={handleSave}
                onDelete={handleDelete}
            >
                <MasterFieldRow label="Cost Center ID" colSpan="col-span-12">
                    <MasterLookupInput value={formData.Code} onSearchClick={openSearch} isIdField />
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

            <MasterLookupModal 
                isOpen={showSearchModal} 
                onClose={() => setShowSearchModal(false)} 
                title="Cost Center Search" 
                columns={[
                    { label: 'CODE', key: 'code', isId: true, width: 'w-[100px]', render: c => c.code || c.Code },
                    { label: 'COST CENTER NAME', key: 'name', render: c => c.name || c.Name }
                ]}
                items={costCentersList.filter(c => ((c.name || c.Name) || '').toLowerCase().includes(ccSearch.toLowerCase()) || ((c.code || c.Code) || '').toLowerCase().includes(ccSearch.toLowerCase()))}
                loading={loading} 
                onSelect={selectCostCenter}
                searchQuery={ccSearch}
                setSearchQuery={setCcSearch}
            />
        </>
    );
};

export default CostCenterBoard;
