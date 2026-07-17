import React, { useState, useEffect } from 'react';
import SimpleModal from '../components/SimpleModal';
import { Search, RotateCcw, Save, Trash2, Plus } from 'lucide-react';
import { areaService } from '../services/area.service';
import { routeService } from '../services/route.service';
import { showSuccessToast, showErrorToast } from '../utils/toastUtils';
import TransactionFormWrapper from '../components/TransactionFormWrapper';
import RouteProfileBoard from './RouteProfileBoard';
import ConfirmModal from '../components/modals/ConfirmModal';

const AreaProfileBoard = ({ isOpen, onClose }) => {
    const initialState = { Code: '', Area_Name: '', Route_Code: '', Route_Name: '', Company: '', CurrentUser: '' };

    const [formData, setFormData] = useState(initialState);
    const [loading, setLoading] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [routeList, setRouteList] = useState([]);
    const [areaList, setAreaList] = useState([]);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showRouteModal, setShowRouteModal] = useState(false);

    const handleRouteModalClose = async () => {
        setShowRouteModal(false);
        try {
            const routes = await routeService.getAll(formData.Company);
            setRouteList(routes || []);
        } catch (error) { console.error('Lookup fetch error:', error); }
    };

    useEffect(() => {
        if (isOpen) {
            const user = JSON.parse(localStorage.getItem('user'));
            const companyData = localStorage.getItem('selectedCompany');
            let companyCode = '';
            if (companyData) { try { const p = JSON.parse(companyData); companyCode = p.companyCode || p.CompanyCode || p.code || p.Code || companyData; } catch (e) { companyCode = companyData; } }
            setFormData(prev => ({ ...prev, CurrentUser: user?.empName || user?.EmpName || user?.Emp_Name || user?.emp_Name || user?.username || '', Company: companyCode }));
            fetchRoutes(companyCode);
        }
    }, [isOpen]);

    const fetchRoutes = async (compCode) => {
        try {
            const data = await routeService.getAll(compCode);
            setRouteList(data || []);
        } catch(e) { console.error(e) }
    };

    const handleInputChange = (e) => { const { name, value } = e.target; setFormData(prev => ({ ...prev, [name]: value })); };

    const handleClear = () => { setFormData({ ...initialState, Company: formData.Company, CurrentUser: formData.CurrentUser }); setIsEditMode(false); setAreaList([]); };

    const handleSave = async () => {
        if (!formData.Route_Code || !formData.Area_Name) { showErrorToast('Route and Area Name are required'); return; }
        setLoading(true);
        try {
            const data = await areaService.save(formData);
            if (data.message === 'inserted') { showSuccessToast('Area created'); setFormData(prev => ({ ...prev, Code: data.code })); setIsEditMode(true); }
            else { showSuccessToast('Area updated'); }
            
            const freshAreas = await areaService.searchAreas(formData.Route_Code, formData.Company, ''); 
            setAreaList(freshAreas || []); 
        } catch (err) { showErrorToast(err.error || err.message || (typeof err === 'string' ? err : 'Failed to save'), { duration: 5000 }); } finally { setLoading(false); }
    };

    const handleDelete = () => { if (!isEditMode || !formData.Code) return; setShowDeleteConfirm(true); };

    const confirmDelete = async () => {
        setLoading(true);
        try { await areaService.delete(formData.Code, formData.Company); showSuccessToast('Area deleted'); handleClear(); setShowDeleteConfirm(false); } catch (err) { showErrorToast(err.message || err); } finally { setLoading(false); }
    };

    const handleRouteSelect = async (e) => {
        const routeCode = e.target.value;
        const route = routeList.find(r => r.code === routeCode);
        setFormData(prev => ({ ...prev, Route_Code: routeCode, Route_Name: route ? route.name : '', Code: '', Area_Name: '' }));
        setIsEditMode(false);
        if (routeCode) {
            setLoading(true);
            try { 
                const data = await areaService.searchAreas(routeCode, formData.Company, ''); 
                setAreaList(data || []); 
            } catch (err) { 
                showErrorToast('Failed to load areas'); 
            } finally { 
                setLoading(false); 
            }
        } else {
            setAreaList([]);
        }
    };

    const handleAreaSelect = (e) => {
        const areaCode = e.target.value;
        const area = areaList.find(a => a.code === areaCode);
        if (area) {
            setFormData(prev => ({ ...prev, Code: area.code, Area_Name: area.name }));
            setIsEditMode(true);
        } else {
            setFormData(prev => ({ ...prev, Code: '', Area_Name: '' }));
            setIsEditMode(false);
        }
    };

    return (
        <>
            <TransactionFormWrapper subtitle="Manage route area definitions" icon={null}
                isOpen={isOpen} onClose={onClose} title="Area Profile"
                footer={
                    <div className="bg-[#fcfcfc] px-6 py-5 w-full flex justify-between items-center border-t border-gray-200 rounded-b-[10px] shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]">
                        <div className="flex gap-3">
                            {isEditMode && <button onClick={handleDelete} disabled={loading} className={`px-6 h-10 border border-transparent text-white bg-[#ef4444] hover:bg-[#dc2626] font-semibold rounded-[3px] shadow-[0_2px_10px_rgba(239,68,68,0.2)] hover:shadow-[0_4px_15px_rgba(239,68,68,0.3)] text-[13px] transition-all flex items-center justify-center gap-2 ${loading ? 'opacity-40 cursor-not-allowed' : ''}`}><Trash2 size={14} /> DELETE</button>}
                            <button type="button" onClick={handleClear} className="px-6 h-10 border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 font-semibold rounded-[3px] shadow-sm text-[13px] transition-all flex items-center justify-center gap-2"><RotateCcw size={14} /> CLEAR</button>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={handleSave} disabled={loading} className="px-6 h-10 bg-[#0285fd] hover:bg-[#0073ff] text-white font-semibold rounded-[3px] shadow-sm text-[13px] transition-all flex items-center justify-center gap-2 disabled:opacity-50"><Save size={14} /> SAVE</button>
                        </div>
                    </div>
                }
            >
                <div className="space-y-3 overflow-y-auto no-scrollbar font-['Tahoma']">
                    <div className="bg-white p-4 border border-slate-200 rounded-[3px] space-y-4">
                        <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Contextual Metadata</div>
                        <p className="text-[12px] text-gray-500 font-medium leading-relaxed">
                            Create and manage Route Area definitions to effectively categorize and organize your geographic territories.
                        </p>
                    </div>
                    <div className="bg-white p-4 border border-slate-200 rounded-[3px] space-y-4">
                        <div className="grid grid-cols-12 gap-x-6 gap-y-3.5">
                            <div className="col-span-12">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Route</label>
                                <div className="flex gap-2 relative group">
                                    <select value={formData.Route_Code} onChange={handleRouteSelect} className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700 cursor-pointer appearance-none" style={{ backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.5rem center', backgroundSize: '1em' }}>
                                        <option value="">Select route...</option>
                                        {routeList.map(r => <option key={r.code} value={r.code}>{r.code} - {r.name}</option>)}
                                    </select>
                                    <button 
                                        type="button"
                                        onClick={() => setShowRouteModal(true)}
                                        className="h-10 w-10 flex-shrink-0 bg-emerald-100 text-emerald-600 hover:bg-emerald-500 hover:text-white rounded-[3px] flex items-center justify-center transition-colors relative"
                                        title="Create Route"
                                    >
                                        <Plus size={18} strokeWidth={3} />
                                    </button>
                                </div>
                            </div>
                            <div className="col-span-6">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Area ID</label>
                                <div className="relative">
                                    <select value={formData.Code} onChange={handleAreaSelect} disabled={!formData.Route_Code} className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700 font-mono cursor-pointer appearance-none disabled:bg-gray-50 disabled:cursor-not-allowed" style={{ backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.5rem center', backgroundSize: '1em' }}>
                                        <option value="">Auto Gen (New Area)</option>
                                        {areaList.map(a => <option key={a.code} value={a.code}>{a.code} - {a.name}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="col-span-6">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Area Name</label>
                                <input type="text" name="Area_Name" value={formData.Area_Name} onChange={handleInputChange} placeholder="Enter area name" className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700" />
                            </div>
                        </div>
                    </div>
                </div>
            </TransactionFormWrapper>

            {/* Search Modals Removed */}

            <ConfirmModal
                isOpen={showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(false)}
                onConfirm={confirmDelete}
                title="Confirm Deletion"
                message={`Are you sure you want to delete area "${formData.Area_Name || formData.Code}"?\nThis action cannot be undone.`}
                loading={loading}
                confirmText="Delete Now"
                variant="danger"
            />

            <RouteProfileBoard
                isOpen={showRouteModal}
                onClose={handleRouteModalClose}
            />
        </>
    );
};

export default AreaProfileBoard;
