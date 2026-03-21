import React, { useState, useEffect } from 'react';
import SimpleModal from '../../SimpleModal';
import { Search, RotateCcw, Save, Trash2, Loader2, X, Layers } from 'lucide-react';
import { categoryService } from '../../../services/category.service';
import { departmentService } from '../../../services/department.service';
import { toast } from 'react-hot-toast';

const CategoryBoard = ({ isOpen, onClose }) => {
    const initialState = {
        Code: '',
        Cat_Name: '',
        Dept_Code: '',
        Dept_Name: '',
        Company: '',
        CurrentUser: ''
    };

    const [formData, setFormData] = useState(initialState);
    const [loading, setLoading] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    
    // Lookups
    const [showDeptSearch, setShowDeptSearch] = useState(false);
    const [deptList, setDeptList] = useState([]);
    const [showCatSearch, setShowCatSearch] = useState(false);
    const [catList, setCatList] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        if (isOpen) {
            const user = JSON.parse(localStorage.getItem('user'));
            const companyData = localStorage.getItem('selectedCompany');
            
            let companyCode = '';
            if (companyData) {
                try {
                    const parsed = JSON.parse(companyData);
                    companyCode = parsed.companyCode || parsed.CompanyCode || parsed.code || parsed.Code || companyData;
                } catch (e) {
                    companyCode = companyData;
                }
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
        setFormData({
            ...initialState,
            Company: formData.Company,
            CurrentUser: formData.CurrentUser
        });
        setIsEditMode(false);
    };

    const handleSave = async () => {
        if (!formData.Dept_Code || !formData.Cat_Name) {
            toast.error('Department and Category Name are required');
            return;
        }

        setLoading(true);
        try {
            const data = await categoryService.save(formData);
            if (data.message === 'inserted') {
                toast.success('Category created');
                setFormData(prev => ({ ...prev, Code: data.code }));
                setIsEditMode(true);
            } else {
                toast.success('Category updated');
            }
        } catch (err) {
            const errorMsg = err.error || err.message || (typeof err === 'string' ? err : 'Failed to save');
            toast.error(errorMsg, { duration: 5000 });
            console.error('Save Error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!isEditMode || !formData.Code) return;
        if (!window.confirm('Delete this category?')) return;

        setLoading(true);
        try {
            await categoryService.delete(formData.Code, formData.Company);
            toast.success('Category deleted');
            handleClear();
        } catch (err) {
            const errorMsg = err.error || err.message || (typeof err === 'string' ? err : 'Failed to delete');
            toast.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const openDeptSearch = async () => {
        if (!formData.Company) {
            toast.error('Company not identified');
            return;
        }
        setLoading(true);
        try {
            const data = await departmentService.getAll(formData.Company);
            setDeptList(data || []);
            setShowDeptSearch(true);
        } catch (err) {
            toast.error('Failed to load departments');
        } finally {
            setLoading(false);
        }
    };

    const selectDept = (dept) => {
        setFormData(prev => ({ 
            ...prev, 
            Dept_Code: dept.code, 
            Dept_Name: dept.name, 
            Code: '' 
        }));
        setIsEditMode(false);
        setShowDeptSearch(false);
    };

    const openCatSearch = async () => {
        if (!formData.Dept_Code) {
            toast.error('Select a department first');
            return;
        }
        setLoading(true);
        try {
            const data = await categoryService.searchCategories(formData.Dept_Code, formData.Company, searchQuery);
            setCatList(data || []);
            setShowCatSearch(true);
        } catch (err) {
            toast.error('Failed to load categories');
        } finally {
            setLoading(false);
        }
    };

    const selectCat = (cat) => {
        setFormData(prev => ({ 
            ...prev, 
            Code: cat.code, 
            Cat_Name: cat.name 
        }));
        setIsEditMode(true);
        setShowCatSearch(false);
    };

    const footer = (
        <div className="bg-slate-50 px-6 py-4 w-full flex justify-end gap-3 border-t border-gray-100 mt-4 rounded-b-xl">
            <button onClick={handleSave} disabled={loading} className={`px-6 h-10 bg-[#0078d4] text-white text-sm font-bold rounded-md shadow-md shadow-blue-200 hover:bg-[#005a9e] transition-all active:scale-95 flex items-center justify-center gap-2 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                {loading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} 
                {isEditMode ? 'Update' : 'Save'}
            </button>
            <button onClick={handleDelete} disabled={!isEditMode || loading} className={`px-6 h-10 bg-[#d13438] text-white text-sm font-bold rounded-md shadow-md shadow-red-200 hover:bg-[#a4262c] transition-all active:scale-95 flex items-center justify-center gap-2 ${(!isEditMode || loading) ? 'opacity-50 cursor-not-allowed' : ''}`}>
                <Trash2 size={14} /> Delete
            </button>
            <button onClick={handleClear} className="px-6 h-10 bg-slate-100 text-slate-600 text-sm font-bold rounded-md hover:bg-slate-200 transition-all active:scale-95 border-none flex items-center justify-center gap-2">
                <RotateCcw size={14} /> Clear
            </button>
            <button onClick={onClose} className="px-6 h-10 bg-slate-100 text-slate-600 text-sm font-bold rounded-md hover:bg-slate-200 transition-all active:scale-95 border-none flex items-center justify-center gap-2"><X size={14} /> Exit</button>
        </div>
    );

    return (
        <>
            <SimpleModal isOpen={isOpen} onClose={onClose} title="Category Selection" maxWidth="max-w-xl" footer={footer}>
                <div className="space-y-4 py-2 font-['Plus_Jakarta_Sans']">
                    <h2 className="text-sm font-bold text-gray-800 border-b pb-2 mb-4 uppercase flex items-center gap-2">
                        <Layers size={16} className="text-[#0078d4]" />
                        Category Details Profile
                    </h2>
                    
                    <div className="space-y-3">
                        {/* Department ID Row */}
                        <div className="flex items-center gap-3">
                            <label className="text-xs font-semibold text-gray-600 w-32 shrink-0">Department ID</label>
                            <div className="flex-1 flex gap-2">
                                <input type="text" name="Dept_Code" value={formData.Dept_Code} readOnly className="w-32 h-8 border border-gray-300 px-2 text-sm bg-gray-50 focus:border-blue-500 outline-none rounded-sm" />
                                <button onClick={openDeptSearch} className="w-8 h-8 bg-[#0078d4] text-white flex items-center justify-center hover:bg-[#005a9e] rounded-sm transition-colors"><Search size={14} /></button>
                                <input type="text" value={formData.Dept_Name} readOnly className="flex-1 h-8 border border-gray-300 px-2 text-sm bg-gray-50 text-gray-500 rounded-sm" placeholder="Department Name" />
                            </div>
                        </div>

                        {/* Category ID Row */}
                        <div className="flex items-center gap-3">
                            <label className="text-xs font-semibold text-gray-600 w-32 shrink-0">Category ID</label>
                            <div className="flex-1 flex gap-2">
                                <input type="text" name="Code" value={formData.Code} readOnly className="w-32 h-8 border border-gray-300 px-2 text-sm bg-gray-50 rounded-sm" placeholder="Auto Generated" />
                                <button onClick={openCatSearch} className="w-8 h-8 bg-[#0078d4] text-white flex items-center justify-center hover:bg-[#005a9e] rounded-sm transition-colors"><Search size={14} /></button>
                            </div>
                        </div>

                        {/* Category Name Row */}
                        <div className="flex items-center gap-3">
                            <label className="text-xs font-semibold text-gray-600 w-32 shrink-0">Category Name</label>
                            <input type="text" name="Cat_Name" value={formData.Cat_Name} onChange={handleInputChange} className="flex-1 h-8 border border-gray-300 px-2 text-sm focus:border-blue-500 outline-none rounded-sm" placeholder="Enter Category Name" />
                        </div>
                    </div>
                </div>
            </SimpleModal>

            {/* Department Search Modal */}
            {showDeptSearch && (
                <SearchModal 
                    title="Search Departments" 
                    list={deptList} 
                    onSelect={selectDept} 
                    onClose={() => setShowDeptSearch(false)}
                    placeholder="Search by code or name..."
                    columns={['code', 'name']}
                />
            )}

            {/* Category Search Modal */}
            {showCatSearch && (
                <SearchModal 
                    title="Search Categories" 
                    list={catList} 
                    onSelect={selectCat} 
                    onClose={() => setShowCatSearch(false)}
                    placeholder="Search by code or name..."
                    columns={['code', 'name']}
                />
            )}
        </>
    );
};

const SearchModal = ({ title, list, onSelect, onClose, placeholder, columns = ['code', 'name'] }) => {
    const [query, setQuery] = useState('');
    return (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={onClose} />
            <div className="relative w-full max-w-2xl bg-white shadow-2xl rounded-xl border border-gray-100 overflow-hidden flex flex-col max-h-[80vh]">
                <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50/50">
                    <h3 className="text-lg font-bold text-slate-800 tracking-tight">{title}</h3>
                    <div className="flex gap-2">
                        <input type="text" placeholder={placeholder} className="h-8 border border-gray-300 px-3 text-sm rounded-md w-48 focus:border-blue-500 outline-none" value={query} onChange={(e) => setQuery(e.target.value)} />
                        <button onClick={onClose} className="w-8 h-8 flex items-center justify-center hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors rounded-full outline-none"><X size={20} /></button>
                    </div>
                </div>
                <div className="overflow-y-auto p-2 font-['Plus_Jakarta_Sans']">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-[#f8f9fa] sticky top-0 font-bold text-gray-600 text-[11px] uppercase tracking-wider">
                            <tr>
                                <th className="p-3 border-b text-center w-24">Code</th>
                                <th className="p-3 border-b">Display Name</th>
                                <th className="p-3 border-b text-center w-24">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {list.filter(x => (x.name || '').toLowerCase().includes(query.toLowerCase()) || (x.code || '').toLowerCase().includes(query.toLowerCase())).map(x => (
                                <tr key={x.code} className="hover:bg-blue-50 transition-colors group">
                                    <td className="p-3 border-b text-center font-bold text-[#0078d4] text-[11px]">{x.code}</td>
                                    <td className="p-3 border-b text-gray-700 font-semibold uppercase">{x.name}</td>
                                    <td className="p-3 border-b text-center"><button onClick={() => onSelect(x)} className="bg-[#0078d4] text-white text-[10px] px-3 py-1 rounded-sm font-bold hover:bg-[#005a9e]">Select</button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default CategoryBoard;
