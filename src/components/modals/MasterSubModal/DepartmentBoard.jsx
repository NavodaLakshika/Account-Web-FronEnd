import React, { useState, useEffect } from 'react';
import { RotateCcw, Save, Trash2, Loader2, AlertTriangle, Building2, MapPin } from 'lucide-react';
import { departmentService } from '../../../services/department.service';
import { showSuccessToast, showErrorToast } from '../../../utils/toastUtils';
import { MasterFormWrapper, MasterFieldRow, MasterInput, MasterLookupInput, MasterLookupModal } from '../../MasterFormComponents';

const DepartmentBoard = ({ isOpen, onClose }) => {
    const initialState = {
        Code: '', Dept_Name: '', Loca_Id: '', Loca_Name: '', Company: '', CurrentUser: 'SYSTEM'
    };

    const [formData, setFormData] = useState(initialState);
    const [loading, setLoading] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [showLocaSearch, setShowLocaSearch] = useState(false);
    const [locationsList, setLocationsList] = useState([]);
    const [showDeptSearch, setShowDeptSearch] = useState(false);
    const [deptList, setDeptList] = useState([]);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    useEffect(() => {
        if (isOpen) {
            const user = JSON.parse(localStorage.getItem('user'));
            const companyData = localStorage.getItem('selectedCompany');
            let companyCode = 'C001';
            if (companyData) {
                try { const p = JSON.parse(companyData); companyCode = p.companyCode || p.CompanyCode || p.code || p.Code || companyData; } catch (e) { companyCode = companyData; }
            }
            if (user) {
                setFormData(prev => ({
                    ...prev,
                    CurrentUser: user.empName || user.EmpName || user.Emp_Name || user.emp_Name || user.username || '',
                    Company: companyCode
                }));
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
        if (!formData.Loca_Id || !formData.Dept_Name) {
            showErrorToast('Location and Department Name are required');
            return;
        }
        setLoading(true);
        try {
            const data = await departmentService.save(formData);
            if (data.message === 'inserted') {
                showSuccessToast('Department created');
                setFormData(prev => ({ ...prev, Code: data.code }));
                setIsEditMode(true);
            } else {
                showSuccessToast('Department updated');
            }
        } catch (err) {
            showErrorToast(err.error || err.message || (typeof err === 'string' ? err : 'Failed to save'), { duration: 5000 });
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
            await departmentService.delete(formData.Code, formData.Loca_Id, formData.Company);
            showSuccessToast('Department deleted');
            handleClear();
            setShowDeleteConfirm(false);
        } catch (err) {
            showErrorToast(err.message || err);
        } finally {
            setLoading(false);
        }
    };

    const openLocaSearch = async () => {
        if (!formData.Company) { showErrorToast('Company not identified'); return; }
        setLoading(true);
        try {
            const data = await departmentService.getAllLocations(formData.Company);
            setLocationsList(data || []);
            setShowLocaSearch(true);
        } catch (err) { showErrorToast('Failed to load locations'); } finally { setLoading(false); }
    };

    const selectLocation = (loc) => {
        setFormData(prev => ({ ...prev, Loca_Id: loc.code, Loca_Name: loc.name }));
        setShowLocaSearch(false);
    };

    const openDeptSearch = async () => {
        if (!formData.Loca_Id) { showErrorToast('Select a location first'); return; }
        setLoading(true);
        try {
            const data = await departmentService.searchDepartments(formData.Loca_Id, formData.Company, '');
            setDeptList(data || []);
            setShowDeptSearch(true);
        } catch (err) { showErrorToast('Failed to load departments'); } finally { setLoading(false); }
    };

    const selectDept = (dept) => {
        setFormData(prev => ({ ...prev, Code: dept.code, Dept_Name: dept.name }));
        setIsEditMode(true);
        setShowDeptSearch(false);
    };

    return (
        <>
            <MasterFormWrapper
                isOpen={isOpen}
                onClose={onClose}
                title="Department Profile"
                subtitle="Manage department structure & locations"
                icon={Building2}
                maxWidth="max-w-2xl"
                isEditMode={isEditMode}
                loading={loading}
                onClear={handleClear}
                onSave={handleSave}
                onDelete={handleDelete}
            >
                <MasterFieldRow label="Location" colSpan="col-span-12">
                    <MasterLookupInput value={formData.Loca_Name || formData.Loca_Id} onSearchClick={openLocaSearch} placeholder="Select location..." />
                </MasterFieldRow>
                <MasterFieldRow label="Department ID" colSpan="col-span-12">
                    <MasterLookupInput value={formData.Code || ''} onSearchClick={openDeptSearch} isIdField />
                </MasterFieldRow>
                <MasterFieldRow label="Dept. Name" colSpan="col-span-12">
                    <MasterInput name="Dept_Name" value={formData.Dept_Name} onChange={handleInputChange} placeholder="Enter department name" />
                </MasterFieldRow>
            </MasterFormWrapper>

            <MasterLookupModal
                isOpen={showLocaSearch}
                onClose={() => setShowLocaSearch(false)}
                title="Location Search"
                columns={[
                    { label: 'CODE', key: 'code', isId: true, width: 'w-[100px]', render: (item) => <span className="font-mono text-[11px] font-bold text-[#0285fd]">{item.code}</span> },
                    { label: 'LOCATION NAME', key: 'name', render: (item) => <span className="font-bold text-slate-700 uppercase text-[11px]">{item.name}</span> },
                ]}
                items={locationsList}
                loading={loading}
                onSelect={selectLocation}
                emptyMsg="No locations found"
            />

            <MasterLookupModal
                isOpen={showDeptSearch}
                onClose={() => setShowDeptSearch(false)}
                title="Department Search"
                columns={[
                    { label: 'CODE', key: 'code', isId: true, width: 'w-[100px]', render: (item) => <span className="font-mono text-[11px] font-bold text-[#0285fd]">{item.code}</span> },
                    { label: 'DEPARTMENT NAME', key: 'name', render: (item) => <span className="font-bold text-slate-700 uppercase text-[11px]">{item.name}</span> },
                ]}
                items={deptList}
                loading={loading}
                onSelect={selectDept}
                emptyMsg="No departments found"
            />

            {showDeleteConfirm && (
                <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm" onClick={() => !loading && setShowDeleteConfirm(false)} />
 <div className="relative w-full max-w-md bg-white rounded-sm shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="p-8 text-center">
                            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-white shadow-lg"><AlertTriangle size={40} className="text-red-500" /></div>
                            <h3 className="text-lg font-black text-slate-800 mb-2 uppercase tracking-wider">Confirm Deletion</h3>
                            <p className="text-slate-500 text-[12px] font-medium leading-relaxed mb-8">Are you sure you want to delete department <span className="font-bold text-slate-800 uppercase">"{formData.Dept_Name || formData.Code}"</span>?<br />This action cannot be undone.</p>
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

export default DepartmentBoard;
