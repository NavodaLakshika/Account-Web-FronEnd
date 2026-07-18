import React, { useState, useEffect } from 'react';
import { Search, RotateCcw, Save, Trash2, Loader2, Layers, AlertTriangle, MapPin } from 'lucide-react';
import { routeService } from '../../../services/route.service';
import { showSuccessToast, showErrorToast } from '../../../utils/toastUtils';
import { MasterFormWrapper, MasterFieldRow, MasterInput, MasterSelect } from '../../MasterFormComponents';

const RouteBoard = ({ isOpen, onClose }) => {
    const initialState = { Code: '', Route_Name: '', Company: '', CurrentUser: '' };

    const [formData, setFormData] = useState(initialState);
    const [loading, setLoading] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [routeList, setRouteList] = useState([]);
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
            loadRoutes(companyCode);
        }
    }, [isOpen]);

    const loadRoutes = async (companyCode) => {
        if (!companyCode) return;
        try {
            const data = await routeService.searchRoutes(companyCode, '');
            setRouteList(data || []);
        } catch (err) { showErrorToast('Failed to load routes'); }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleRouteChange = (e) => {
        const val = e.target.value;
        const route = routeList.find(r => r.code === val);
        setFormData(prev => ({ ...prev, Code: val, Route_Name: route ? route.name : '' }));
        setIsEditMode(!!val);
    };

    const handleClear = () => {
        setFormData({ ...initialState, Company: formData.Company, CurrentUser: formData.CurrentUser });
        setIsEditMode(false);
    };

    const handleSave = async () => {
        if (!formData.Route_Name) { showErrorToast('Route Name is required'); return; }
        setLoading(true);
        try {
            const data = await routeService.save(formData);
            if (data.message === 'inserted') {
                showSuccessToast('Route created');
                setFormData(prev => ({ ...prev, Code: data.code }));
                setIsEditMode(true);
            } else { showSuccessToast('Route updated'); }
        } catch (err) { showErrorToast(err.error || err.message || (typeof err === 'string' ? err : 'Failed to save'), { duration: 5000 }); } finally { setLoading(false); }
    };

    const handleDelete = () => {
        if (!isEditMode || !formData.Code) return;
        setShowDeleteConfirm(true);
    };

    const confirmDelete = async () => {
        setLoading(true);
        try {
            await routeService.delete(formData.Code, formData.Company);
            showSuccessToast('Route deleted');
            handleClear();
            setShowDeleteConfirm(false);
        } catch (err) { showErrorToast(err.message || err); } finally { setLoading(false); }
    };

    return (
        <>
            <MasterFormWrapper
                isOpen={isOpen}
                onClose={onClose}
                title="Route Profile"
                subtitle="Manage delivery route master data"
                icon={MapPin}
                maxWidth="max-w-[700px]"
                isEditMode={isEditMode}
                loading={loading}
                onClear={handleClear}
                onSave={handleSave}
                onDelete={handleDelete}
            >
                <MasterFieldRow label="Route ID" colSpan="col-span-12">
                    <MasterSelect
                        name="Code"
                        value={formData.Code}
                        onChange={handleRouteChange}
                        placeholder="Select route..."
                        options={routeList.map(r => ({ value: r.code, label: `${r.code} - ${r.name}` }))}
                    />
                </MasterFieldRow>
                <MasterFieldRow label="Route Name" colSpan="col-span-12">
                    <MasterInput name="Route_Name" value={formData.Route_Name} onChange={handleInputChange} placeholder="Enter route name" />
                </MasterFieldRow>
            </MasterFormWrapper>

            {showDeleteConfirm && (
                <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm" onClick={() => !loading && setShowDeleteConfirm(false)} />
                    <div className="relative w-full max-w-md bg-white rounded-sm shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="p-8 text-center">
                            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-white shadow-lg"><AlertTriangle size={40} className="text-red-500" /></div>
                            <h3 className="text-lg font-black text-slate-800 mb-2 uppercase tracking-wider">Confirm Deletion</h3>
                            <p className="text-slate-500 text-[12px] font-medium leading-relaxed mb-8">Are you sure you want to delete route <span className="font-bold text-slate-800 uppercase">"{formData.Route_Name || formData.Code}"</span>?<br />This action cannot be undone.</p>
                            <div className="flex gap-3">
                                <button onClick={() => setShowDeleteConfirm(false)} disabled={loading} className={`px-6 h-10 bg-red-50 text-red-600 text-sm font-bold rounded-[3px] hover:bg-red-100 transition-all active:scale-95 flex items-center justify-center gap-2 border border-red-100 ${(loading) ? 'opacity-50 cursor-not-allowed' : ''}`}>Cancel</button>
                                <button onClick={confirmDelete} disabled={loading} className={`px-6 h-10 bg-red-50 text-red-600 text-sm font-bold rounded-[3px] hover:bg-red-100 transition-all active:scale-95 flex items-center justify-center gap-2 border border-red-100 ${(loading) ? 'opacity-50 cursor-not-allowed' : ''}`}>{loading ? <Loader2 size={16} className="animate-spin" /> : 'Delete Now'}</button>
                            </div>
                        </div>
                        <div className="bg-slate-50 py-3 border-t border-slate-100"><span className="text-[9px] text-slate-400 font-black uppercase tracking-[0.2em] block text-center">Security Verification Required</span></div>
                    </div>
                </div>
            )}
        </>
    );
};

export default RouteBoard;
