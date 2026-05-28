import React, { useState, useEffect } from 'react';
import { RotateCcw, Save, Trash2, Loader2, AlertTriangle, MapPin, Navigation } from 'lucide-react';
import { areaService } from '../../../services/area.service';
import { routeService } from '../../../services/route.service';
import { showSuccessToast, showErrorToast } from '../../../utils/toastUtils';
import { MasterFormWrapper, MasterFieldRow, MasterInput, MasterLookupInput, MasterLookupModal } from '../../MasterFormComponents';

const AreaBoard = ({ isOpen, onClose }) => {
    const initialState = { Code: '', Area_Name: '', Route_Code: '', Route_Name: '', Company: '', CurrentUser: '' };

    const [formData, setFormData] = useState(initialState);
    const [loading, setLoading] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [showRouteSearch, setShowRouteSearch] = useState(false);
    const [routeList, setRouteList] = useState([]);
    const [showAreaSearch, setShowAreaSearch] = useState(false);
    const [areaList, setAreaList] = useState([]);
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
        if (!formData.Route_Code || !formData.Area_Name) { showErrorToast('Route and Area Name are required'); return; }
        setLoading(true);
        try {
            const data = await areaService.save(formData);
            if (data.message === 'inserted') {
                showSuccessToast('Area created');
                setFormData(prev => ({ ...prev, Code: data.code }));
                setIsEditMode(true);
            } else { showSuccessToast('Area updated'); }
        } catch (err) { showErrorToast(err.error || err.message || (typeof err === 'string' ? err : 'Failed to save'), { duration: 5000 }); } finally { setLoading(false); }
    };

    const handleDelete = () => {
        if (!isEditMode || !formData.Code) return;
        setShowDeleteConfirm(true);
    };

    const confirmDelete = async () => {
        setLoading(true);
        try {
            await areaService.delete(formData.Code, formData.Company);
            showSuccessToast('Area deleted');
            handleClear();
            setShowDeleteConfirm(false);
        } catch (err) { showErrorToast(err.message || err); } finally { setLoading(false); }
    };

    const openRouteSearch = async () => {
        if (!formData.Company) { showErrorToast('Company not identified'); return; }
        setLoading(true);
        try {
            const data = await routeService.getAll(formData.Company);
            setRouteList(data || []);
            setShowRouteSearch(true);
        } catch (err) { showErrorToast('Failed to load routes'); } finally { setLoading(false); }
    };

    const selectRoute = (route) => {
        setFormData(prev => ({ ...prev, Route_Code: route.code, Route_Name: route.name, Code: '' }));
        setIsEditMode(false);
        setShowRouteSearch(false);
    };

    const openAreaSearch = async () => {
        if (!formData.Route_Code) { showErrorToast('Select a route first'); return; }
        setLoading(true);
        try {
            const data = await areaService.searchAreas(formData.Route_Code, formData.Company, '');
            setAreaList(data || []);
            setShowAreaSearch(true);
        } catch (err) { showErrorToast('Failed to load areas'); } finally { setLoading(false); }
    };

    const selectArea = (area) => {
        setFormData(prev => ({ ...prev, Code: area.code, Area_Name: area.name }));
        setIsEditMode(true);
        setShowAreaSearch(false);
    };

    return (
        <>
            <MasterFormWrapper
                isOpen={isOpen}
                onClose={onClose}
                title="Area Profile"
                subtitle="Manage route area definitions"
                icon={Navigation}
                maxWidth="max-w-2xl"
                isEditMode={isEditMode}
                loading={loading}
                onClear={handleClear}
                onSave={handleSave}
                onDelete={handleDelete}
            >
                <MasterFieldRow label="Route" colSpan="col-span-12">
                    <MasterLookupInput value={formData.Route_Name || formData.Route_Code} onSearchClick={openRouteSearch} placeholder="Select route..." />
                </MasterFieldRow>
                <MasterFieldRow label="Area ID" colSpan="col-span-12">
                    <MasterLookupInput value={formData.Code || ''} onSearchClick={openAreaSearch} isIdField />
                </MasterFieldRow>
                <MasterFieldRow label="Area Name" colSpan="col-span-12">
                    <MasterInput name="Area_Name" value={formData.Area_Name} onChange={handleInputChange} placeholder="Enter area name" />
                </MasterFieldRow>
            </MasterFormWrapper>

            <MasterLookupModal
                isOpen={showRouteSearch}
                onClose={() => setShowRouteSearch(false)}
                title="Route Search"
                columns={[
                    { label: 'CODE', key: 'code', isId: true, width: 'w-[100px]', render: (item) => <span className="font-mono text-[11px] font-bold text-[#0285fd]">{item.code}</span> },
                    { label: 'ROUTE NAME', key: 'name', render: (item) => <span className="font-bold text-slate-700 uppercase text-[11px]">{item.name}</span> },
                ]}
                items={routeList}
                loading={loading}
                onSelect={selectRoute}
                emptyMsg="No routes found"
            />

            <MasterLookupModal
                isOpen={showAreaSearch}
                onClose={() => setShowAreaSearch(false)}
                title="Area Search"
                columns={[
                    { label: 'CODE', key: 'code', isId: true, width: 'w-[100px]', render: (item) => <span className="font-mono text-[11px] font-bold text-[#0285fd]">{item.code}</span> },
                    { label: 'AREA NAME', key: 'name', render: (item) => <span className="font-bold text-slate-700 uppercase text-[11px]">{item.name}</span> },
                ]}
                items={areaList}
                loading={loading}
                onSelect={selectArea}
                emptyMsg="No areas found"
            />

            {showDeleteConfirm && (
                <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm" onClick={() => !loading && setShowDeleteConfirm(false)} />
                    <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-white/10 overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="p-8 text-center">
                            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-white shadow-lg"><AlertTriangle size={40} className="text-red-500" /></div>
                            <h3 className="text-lg font-black text-slate-800 mb-2 uppercase tracking-wider">Confirm Deletion</h3>
                            <p className="text-slate-500 text-[12px] font-medium leading-relaxed mb-8">Are you sure you want to delete area <span className="font-bold text-slate-800 uppercase">"{formData.Area_Name || formData.Code}"</span>?<br />This action cannot be undone.</p>
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

export default AreaBoard;
