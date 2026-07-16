import React, { useState, useEffect } from 'react';
import SimpleModal from '../components/SimpleModal';
import { Search, RotateCcw, Save, Trash2 } from 'lucide-react';
import { areaService } from '../services/area.service';
import { routeService } from '../services/route.service';
import { showSuccessToast, showErrorToast } from '../utils/toastUtils';
import TransactionFormWrapper from '../components/TransactionFormWrapper';

const AreaProfileBoard = ({ isOpen, onClose }) => {
    const initialState = { Code: '', Area_Name: '', Route_Code: '', Route_Name: '', Company: '', CurrentUser: '' };

    const [formData, setFormData] = useState(initialState);
    const [loading, setLoading] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [showRouteSearch, setShowRouteSearch] = useState(false);
    const [routeList, setRouteList] = useState([]);
    const [showAreaSearch, setShowAreaSearch] = useState(false);
    const [areaList, setAreaList] = useState([]);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const [routeSearchTerm, setRouteSearchTerm] = useState('');
    const [areaSearchTerm, setAreaSearchTerm] = useState('');

    useEffect(() => {
        if (isOpen) {
            const user = JSON.parse(localStorage.getItem('user'));
            const companyData = localStorage.getItem('selectedCompany');
            let companyCode = '';
            if (companyData) { try { const p = JSON.parse(companyData); companyCode = p.companyCode || p.CompanyCode || p.code || p.Code || companyData; } catch (e) { companyCode = companyData; } }
            setFormData(prev => ({ ...prev, CurrentUser: user?.empName || user?.EmpName || user?.Emp_Name || user?.emp_Name || user?.username || '', Company: companyCode }));
        }
    }, [isOpen]);

    const handleInputChange = (e) => { const { name, value } = e.target; setFormData(prev => ({ ...prev, [name]: value })); };

    const handleClear = () => { setFormData({ ...initialState, Company: formData.Company, CurrentUser: formData.CurrentUser }); setIsEditMode(false); };

    const handleSave = async () => {
        if (!formData.Route_Code || !formData.Area_Name) { showErrorToast('Route and Area Name are required'); return; }
        setLoading(true);
        try {
            const data = await areaService.save(formData);
            if (data.message === 'inserted') { showSuccessToast('Area created'); setFormData(prev => ({ ...prev, Code: data.code })); setIsEditMode(true); }
            else { showSuccessToast('Area updated'); }
        } catch (err) { showErrorToast(err.error || err.message || (typeof err === 'string' ? err : 'Failed to save'), { duration: 5000 }); } finally { setLoading(false); }
    };

    const handleDelete = () => { if (!isEditMode || !formData.Code) return; setShowDeleteConfirm(true); };

    const confirmDelete = async () => {
        setLoading(true);
        try { await areaService.delete(formData.Code, formData.Company); showSuccessToast('Area deleted'); handleClear(); setShowDeleteConfirm(false); } catch (err) { showErrorToast(err.message || err); } finally { setLoading(false); }
    };

    const openRouteSearch = async () => {
        if (!formData.Company) { showErrorToast('Company not identified'); return; }
        setLoading(true);
        try { const data = await routeService.getAll(formData.Company); setRouteList(data || []); setShowRouteSearch(true); } catch (err) { showErrorToast('Failed to load routes'); } finally { setLoading(false); }
    };

    const selectRoute = (route) => { setFormData(prev => ({ ...prev, Route_Code: route.code, Route_Name: route.name, Code: '' })); setIsEditMode(false); setShowRouteSearch(false); };

    const openAreaSearch = async () => {
        if (!formData.Route_Code) { showErrorToast('Select a route first'); return; }
        setLoading(true);
        try { const data = await areaService.searchAreas(formData.Route_Code, formData.Company, ''); setAreaList(data || []); setShowAreaSearch(true); } catch (err) { showErrorToast('Failed to load areas'); } finally { setLoading(false); }
    };

    const selectArea = (area) => { setFormData(prev => ({ ...prev, Code: area.code, Area_Name: area.name })); setIsEditMode(true); setShowAreaSearch(false); };

    return (
        <>
            <TransactionFormWrapper subtitle="Manage route area definitions" icon={null}
                isOpen={isOpen} onClose={onClose} title="Area Profile"
                footer={
                    <div className="bg-[#fcfcfc] px-6 py-5 w-full flex justify-between items-center border-t border-gray-200 rounded-b-[10px] shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]">
                        <div className="flex gap-3">
                            {isEditMode && <button onClick={handleDelete} className="px-6 h-10 border-2 border-red-500 text-red-600 bg-white hover:bg-red-50 font-semibold rounded-[3px] shadow-sm text-[13px] transition-all flex items-center justify-center gap-2"><Trash2 size={14} /> DELETE</button>}
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
                        <div className="grid grid-cols-12 gap-x-6 gap-y-3.5">
                            <div className="col-span-12">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Route</label>
                                <div className="relative">
                                    <input type="text" readOnly value={formData.Route_Name || formData.Route_Code} onClick={openRouteSearch} placeholder="Select route..." className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700 cursor-pointer appearance-none"  style={{ backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.5rem center', backgroundSize: '1em' }} />
                                </div>
                            </div>
                            <div className="col-span-6">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Area ID</label>
                                <div className="relative">
                                    <input type="text" readOnly value={formData.Code || ''} onClick={openAreaSearch} className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700 font-mono cursor-pointer appearance-none"  style={{ backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.5rem center', backgroundSize: '1em' }} />
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

            <SimpleModal isOpen={showRouteSearch} onClose={() => setShowRouteSearch(false)} title="Route Search" maxWidth="max-w-[700px]">
                <div className="space-y-4 font-['Tahoma']">
                    <div className="flex items-center gap-4 bg-slate-50 p-4 border-b border-gray-100 mb-2">
                        <span className="text-[12px] font-bold text-gray-500 uppercase tracking-wider">Search</span>
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                            <input type="text" placeholder="Find route..." className="w-full h-10 pl-10 pr-4 border border-gray-300 rounded-[3px] outline-none text-[13px] focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] shadow-sm bg-white" value={routeSearchTerm} onChange={(e) => setRouteSearchTerm(e.target.value)} autoFocus />
                        </div>
                    </div>
                    <div className="border border-gray-200 rounded-[3px] overflow-hidden shadow-sm max-h-[400px] overflow-y-auto no-scrollbar">
                        <table className="w-full text-left">
                            <thead className="bg-[#f8fafc] sticky top-0 text-[11px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 shadow-sm z-10">
                                <tr><th className=" px-5 py-3">CODE</th><th className=" px-5 py-3">ROUTE NAME</th><th className="text-right px-5 py-3">Action</th></tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {routeList.filter(r => (r.name || '').toLowerCase().includes(routeSearchTerm.toLowerCase()) || (r.code || '').toLowerCase().includes(routeSearchTerm.toLowerCase())).map((r, i) => (
                                    <tr key={i} className="group hover:bg-blue-50/50  transition-all cursor-pointer group border-b border-gray-50" onClick={() => selectRoute(r)}>
                                        <td className="font-mono text-[12px] font-bold text-blue-600 px-5 py-3">{r.code}</td>
                                        <td className="text-[12px] font-bold text-slate-700 uppercase group-hover:text-blue-600 transition-colors px-5 py-3">{r.name}</td>
                                        <td className="text-right px-5 py-3"><button className="bg-white text-[#0285fd] border border-[#0285fd] hover:bg-blue-50 text-[10px] px-5 py-2 rounded-[3px] font-black shadow-sm transition-all active:scale-95 uppercase">SELECT</button></td>
                                    </tr>
                                ))}
                                {routeList.length === 0 && <tr><td colSpan="3" className="text-center py-16 text-gray-400 text-[11px] font-bold uppercase tracking-widest">No routes found.</td></tr>}
                            </tbody>
                        </table>
                    </div>
                </div>
            </SimpleModal>

            <SimpleModal isOpen={showAreaSearch} onClose={() => setShowAreaSearch(false)} title="Area Search" maxWidth="max-w-[700px]">
                <div className="space-y-4 font-['Tahoma']">
                    <div className="flex items-center gap-4 bg-slate-50 p-4 border-b border-gray-100 mb-2">
                        <span className="text-[12px] font-bold text-gray-500 uppercase tracking-wider">Search</span>
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                            <input type="text" placeholder="Find area..." className="w-full h-10 pl-10 pr-4 border border-gray-300 rounded-[3px] outline-none text-[13px] focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] shadow-sm bg-white" value={areaSearchTerm} onChange={(e) => setAreaSearchTerm(e.target.value)} autoFocus />
                        </div>
                    </div>
                    <div className="border border-gray-200 rounded-[3px] overflow-hidden shadow-sm max-h-[400px] overflow-y-auto no-scrollbar">
                        <table className="w-full text-left">
                            <thead className="bg-[#f8fafc] sticky top-0 text-[11px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 shadow-sm z-10">
                                <tr><th className=" px-5 py-3">CODE</th><th className=" px-5 py-3">AREA NAME</th><th className="text-right px-5 py-3">Action</th></tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {areaList.filter(a => (a.name || '').toLowerCase().includes(areaSearchTerm.toLowerCase()) || (a.code || '').toLowerCase().includes(areaSearchTerm.toLowerCase())).map((a, i) => (
                                    <tr key={i} className="group hover:bg-blue-50/50  transition-all cursor-pointer group border-b border-gray-50" onClick={() => selectArea(a)}>
                                        <td className="font-mono text-[12px] font-bold text-blue-600 px-5 py-3">{a.code}</td>
                                        <td className="text-[12px] font-bold text-slate-700 uppercase group-hover:text-blue-600 transition-colors px-5 py-3">{a.name}</td>
                                        <td className="text-right px-5 py-3"><button className="bg-white text-[#0285fd] border border-[#0285fd] hover:bg-blue-50 text-[10px] px-5 py-2 rounded-[3px] font-black shadow-sm transition-all active:scale-95 uppercase">SELECT</button></td>
                                    </tr>
                                ))}
                                {areaList.length === 0 && <tr><td colSpan="3" className="text-center py-16 text-gray-400 text-[11px] font-bold uppercase tracking-widest">No areas found.</td></tr>}
                            </tbody>
                        </table>
                    </div>
                </div>
            </SimpleModal>

            {showDeleteConfirm && (
                <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm" onClick={() => !loading && setShowDeleteConfirm(false)} />
                    <div className="relative w-full max-w-md bg-white rounded-sm shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="p-8 text-center">
                            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-white shadow-lg"><Trash2 size={40} className="text-red-500" /></div>
                            <h3 className="text-lg font-black text-slate-800 mb-2 uppercase tracking-wider">Confirm Deletion</h3>
                            <p className="text-slate-500 text-[12px] font-medium leading-relaxed mb-8">Are you sure you want to delete area <span className="font-bold text-slate-800 uppercase">"{formData.Area_Name || formData.Code}"</span>?<br />This action cannot be undone.</p>
                            <div className="flex gap-3">
                                <button onClick={() => setShowDeleteConfirm(false)} disabled={loading} className="flex-1 h-11 bg-slate-100 text-slate-600 text-[11px] font-black rounded-[3px] hover:bg-slate-200 transition-all uppercase tracking-widest disabled:opacity-50">Cancel</button>
                                <button onClick={confirmDelete} disabled={loading} className="flex-1 h-11 bg-red-500 text-white text-[11px] font-black rounded-[3px] hover:bg-red-600 shadow-lg shadow-red-200 transition-all flex items-center justify-center gap-2 uppercase tracking-widest disabled:opacity-50">{loading ? 'DELETING...' : 'Delete Now'}</button>
                            </div>
                        </div>
                        <div className="bg-slate-50 py-3 border-t border-slate-100"><span className="text-[9px] text-slate-400 font-black uppercase tracking-[0.2em] block text-center">Security Verification Required</span></div>
                    </div>
                </div>
            )}
        </>
    );
};

export default AreaProfileBoard;
