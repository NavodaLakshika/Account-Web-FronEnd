import React, { useState, useEffect } from 'react';
import SimpleModal from '../components/SimpleModal';
import { Search, RotateCcw, Save, Trash2 } from 'lucide-react';
import { categoryService } from '../services/category.service';
import { departmentService } from '../services/department.service';
import { showSuccessToast, showErrorToast } from '../utils/toastUtils';
import TransactionFormWrapper from '../components/TransactionFormWrapper';

const CategoryProfileBoard = ({ isOpen, onClose }) => {
    const initialState = { Code: '', Cat_Name: '', Dept_Code: '', Dept_Name: '', Company: '', CurrentUser: '' };

    const [formData, setFormData] = useState(initialState);
    const [loading, setLoading] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [showDeptSearch, setShowDeptSearch] = useState(false);
    const [deptList, setDeptList] = useState([]);
    const [showCatSearch, setShowCatSearch] = useState(false);
    const [catList, setCatList] = useState([]);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const [deptSearchTerm, setDeptSearchTerm] = useState('');
    const [catSearchTerm, setCatSearchTerm] = useState('');

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
        if (!formData.Dept_Code || !formData.Cat_Name) { showErrorToast('Department and Category Name are required'); return; }
        setLoading(true);
        try {
            const data = await categoryService.save(formData);
            if (data.message === 'inserted') { showSuccessToast('Category created'); setFormData(prev => ({ ...prev, Code: data.code })); setIsEditMode(true); }
            else { showSuccessToast('Category updated'); }
        } catch (err) { showErrorToast(err.error || err.message || (typeof err === 'string' ? err : 'Failed to save'), { duration: 5000 }); } finally { setLoading(false); }
    };

    const handleDelete = () => { if (!isEditMode || !formData.Code) return; setShowDeleteConfirm(true); };

    const confirmDelete = async () => {
        setLoading(true);
        try { await categoryService.delete(formData.Code, formData.Company); showSuccessToast('Category deleted'); handleClear(); setShowDeleteConfirm(false); } catch (err) { showErrorToast(err.error || err.message || 'Failed to delete'); } finally { setLoading(false); }
    };

    const openDeptSearch = async () => {
        if (!formData.Company) { showErrorToast('Company not identified'); return; }
        setLoading(true);
        try { const data = await departmentService.getAll(formData.Company); setDeptList(data || []); setShowDeptSearch(true); } catch (err) { showErrorToast('Failed to load departments'); } finally { setLoading(false); }
    };

    const selectDept = (dept) => { setFormData(prev => ({ ...prev, Dept_Code: dept.code, Dept_Name: dept.name, Code: '' })); setIsEditMode(false); setShowDeptSearch(false); };

    const openCatSearch = async () => {
        if (!formData.Dept_Code) { showErrorToast('Select a department first'); return; }
        setLoading(true);
        try { const data = await categoryService.searchCategories(formData.Dept_Code, formData.Company, ''); setCatList(data || []); setShowCatSearch(true); } catch (err) { showErrorToast('Failed to load categories'); } finally { setLoading(false); }
    };

    const selectCat = (cat) => { setFormData(prev => ({ ...prev, Code: cat.code, Cat_Name: cat.name })); setIsEditMode(true); setShowCatSearch(false); };

    return (
        <>
            <TransactionFormWrapper subtitle="Manage item categories & classification" icon={null}
                isOpen={isOpen} onClose={onClose} title="Category Profile"
                footer={
                    <div className="bg-[#fcfcfc] px-6 py-5 w-full flex justify-between items-center border-t border-gray-200 rounded-b-[10px] shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]">
                        <div className="flex gap-3">
                            {isEditMode && <button onClick={handleDelete} className="px-6 h-10 bg-red-50 text-red-600 text-sm font-bold rounded-[3px] hover:bg-red-100 transition-all active:scale-95 flex items-center justify-center gap-2 border border-red-100"><Trash2 size={14} /> DELETE</button>}
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
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Department</label>
                                <div className="relative">
                                    <input type="text" readOnly value={formData.Dept_Name || formData.Dept_Code} onClick={openDeptSearch} placeholder="Select department..." className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700 cursor-pointer appearance-none"  style={{ backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.5rem center', backgroundSize: '1em' }} />
                                </div>
                            </div>
                            <div className="col-span-6">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Category ID</label>
                                <div className="relative">
                                    <input type="text" readOnly value={formData.Code || ''} onClick={openCatSearch} className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700 font-mono cursor-pointer appearance-none"  style={{ backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.5rem center', backgroundSize: '1em' }} />
                                </div>
                            </div>
                            <div className="col-span-6">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Category Name</label>
                                <input type="text" name="Cat_Name" value={formData.Cat_Name} onChange={handleInputChange} placeholder="Enter category name" className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700" />
                            </div>
                        </div>
                    </div>
                </div>
            </TransactionFormWrapper>

            <SimpleModal isOpen={showDeptSearch} onClose={() => setShowDeptSearch(false)} title="Department Search" maxWidth="max-w-[700px]">
                <div className="space-y-4 font-['Tahoma']">
                    <div className="flex items-center gap-4 bg-slate-50 p-4 border-b border-gray-100 mb-2">
                        <span className="text-[12px] font-bold text-gray-500 uppercase tracking-wider">Search</span>
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                            <input type="text" placeholder="Find department..." className="w-full h-10 pl-10 pr-4 border border-gray-300 rounded-[3px] outline-none text-[13px] focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] shadow-sm bg-white" value={deptSearchTerm} onChange={(e) => setDeptSearchTerm(e.target.value)} autoFocus />
                        </div>
                    </div>
                    <div className="border border-gray-200 rounded-[3px] overflow-hidden shadow-sm max-h-[400px] overflow-y-auto no-scrollbar">
                        <table className="w-full text-left">
                            <thead className="bg-[#f8fafc] sticky top-0 text-[11px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 shadow-sm z-10">
                                <tr><th className=" px-5 py-3">CODE</th><th className=" px-5 py-3">DEPARTMENT NAME</th><th className="text-right px-5 py-3">Action</th></tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {deptList.filter(d => (d.name || '').toLowerCase().includes(deptSearchTerm.toLowerCase()) || (d.code || '').toLowerCase().includes(deptSearchTerm.toLowerCase())).map((d, i) => (
                                    <tr key={i} className="group hover:bg-blue-50/50  transition-all cursor-pointer group border-b border-gray-50" onClick={() => selectDept(d)}>
                                        <td className="font-mono text-[12px] font-bold text-blue-600 px-5 py-3">{d.code}</td>
                                        <td className="text-[12px] font-bold text-slate-700 uppercase group-hover:text-blue-600 transition-colors px-5 py-3">{d.name}</td>
                                        <td className="text-right px-5 py-3"><button className="bg-white text-[#0285fd] border border-[#0285fd] hover:bg-blue-50 text-[10px] px-5 py-2 rounded-[3px] font-black shadow-sm transition-all active:scale-95 uppercase">SELECT</button></td>
                                    </tr>
                                ))}
                                {deptList.length === 0 && <tr><td colSpan="3" className="text-center py-16 text-gray-400 text-[11px] font-bold uppercase tracking-widest">No departments found.</td></tr>}
                            </tbody>
                        </table>
                    </div>
                </div>
            </SimpleModal>

            <SimpleModal isOpen={showCatSearch} onClose={() => setShowCatSearch(false)} title="Category Search" maxWidth="max-w-[700px]">
                <div className="space-y-4 font-['Tahoma']">
                    <div className="flex items-center gap-4 bg-slate-50 p-4 border-b border-gray-100 mb-2">
                        <span className="text-[12px] font-bold text-gray-500 uppercase tracking-wider">Search</span>
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                            <input type="text" placeholder="Find category..." className="w-full h-10 pl-10 pr-4 border border-gray-300 rounded-[3px] outline-none text-[13px] focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] shadow-sm bg-white" value={catSearchTerm} onChange={(e) => setCatSearchTerm(e.target.value)} autoFocus />
                        </div>
                    </div>
                    <div className="border border-gray-200 rounded-[3px] overflow-hidden shadow-sm max-h-[400px] overflow-y-auto no-scrollbar">
                        <table className="w-full text-left">
                            <thead className="bg-[#f8fafc] sticky top-0 text-[11px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 shadow-sm z-10">
                                <tr><th className=" px-5 py-3">CODE</th><th className=" px-5 py-3">CATEGORY NAME</th><th className="text-right px-5 py-3">Action</th></tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {catList.filter(c => (c.name || '').toLowerCase().includes(catSearchTerm.toLowerCase()) || (c.code || '').toLowerCase().includes(catSearchTerm.toLowerCase())).map((c, i) => (
                                    <tr key={i} className="group hover:bg-blue-50/50  transition-all cursor-pointer group border-b border-gray-50" onClick={() => selectCat(c)}>
                                        <td className="font-mono text-[12px] font-bold text-blue-600 px-5 py-3">{c.code}</td>
                                        <td className="text-[12px] font-bold text-slate-700 uppercase group-hover:text-blue-600 transition-colors px-5 py-3">{c.name}</td>
                                        <td className="text-right px-5 py-3"><button className="bg-white text-[#0285fd] border border-[#0285fd] hover:bg-blue-50 text-[10px] px-5 py-2 rounded-[3px] font-black shadow-sm transition-all active:scale-95 uppercase">SELECT</button></td>
                                    </tr>
                                ))}
                                {catList.length === 0 && <tr><td colSpan="3" className="text-center py-16 text-gray-400 text-[11px] font-bold uppercase tracking-widest">No categories found.</td></tr>}
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
                            <p className="text-slate-500 text-[12px] font-medium leading-relaxed mb-8">Are you sure you want to delete category <span className="font-bold text-slate-800 uppercase">"{formData.Cat_Name || formData.Code}"</span>?<br />This action cannot be undone.</p>
                            <div className="flex gap-3">
                                <button onClick={() => setShowDeleteConfirm(false)} disabled={loading} className={`px-6 h-10 bg-red-50 text-red-600 text-sm font-bold rounded-[3px] hover:bg-red-100 transition-all active:scale-95 flex items-center justify-center gap-2 border border-red-100 ${(loading) ? 'opacity-50 cursor-not-allowed' : ''}`}>Cancel</button>
                                <button onClick={confirmDelete} disabled={loading} className={`px-6 h-10 bg-red-50 text-red-600 text-sm font-bold rounded-[3px] hover:bg-red-100 transition-all active:scale-95 flex items-center justify-center gap-2 border border-red-100 ${(loading) ? 'opacity-50 cursor-not-allowed' : ''}`}>{loading ? 'DELETING...' : 'Delete Now'}</button>
                            </div>
                        </div>
                        <div className="bg-slate-50 py-3 border-t border-slate-100"><span className="text-[9px] text-slate-400 font-black uppercase tracking-[0.2em] block text-center">Security Verification Required</span></div>
                    </div>
                </div>
            )}
        </>
    );
};

export default CategoryProfileBoard;
