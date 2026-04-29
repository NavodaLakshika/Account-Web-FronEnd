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
        <div className="bg-slate-50 px-6  w-full flex justify-end gap-3 border-t border-gray-100 mt-4 rounded-b-xl">
            <button 
                onClick={handleSave} 
                disabled={loading} 
                className={`px-6 h-10 bg-[#50af60] text-white text-[13px] font-bold rounded-[5px] shadow-md shadow-green-200 hover:bg-[#24db4e] transition-all active:scale-95 flex items-center justify-center gap-2 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
                {loading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} 
                {isEditMode ? 'Update' : 'Save'}
            </button>
            <button 
                onClick={handleDelete} 
                disabled={!isEditMode || loading} 
                className={`px-6 h-10 bg-[#d13438] text-white text-[13px] font-bold rounded-[5px] shadow-md shadow-red-200 hover:bg-[#a4262c] transition-all active:scale-95 flex items-center justify-center gap-2 ${(!isEditMode || loading) ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
                <Trash2 size={14} /> Delete
            </button>
            <button 
                onClick={handleClear} 
                className="px-6 h-10 bg-[#00adff] text-white text-[13px] font-bold rounded-[5px] hover:bg-[#0099e6] shadow-md shadow-blue-200 transition-all active:scale-95 border-none flex items-center justify-center gap-2"
            >
                <RotateCcw size={14} /> Clear
            </button>
        </div>
    );

    return (
        <>
            <SimpleModal isOpen={isOpen} onClose={onClose} title="Category Selection" maxWidth="max-w-xl" footer={footer}>
                <div className="py-2 select-none font-['Tahoma'] space-y-4 text-[12.5px] mt-1">
                    <div className="space-y-3">
                        {/* Department ID Row */}
                        <div className="flex items-center gap-6">
                            <label className="w-32 font-bold text-gray-700">Department ID</label>
                            <div className="flex-1 flex gap-3">
                                <input 
                                    type="text" 
                                    name="Dept_Code" 
                                    value={formData.Dept_Code} 
                                    readOnly 
                                    className="w-32 h-8 border border-gray-300 px-2 bg-white rounded-[5px] outline-none font-bold text-blue-600 shadow-sm text-center" 
                                />
                                <button 
                                    onClick={openDeptSearch} 
                                    className="w-10 h-8 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[5px] transition-all shadow-md active:scale-95"
                                >
                                    <Search size={18} />
                                </button>
                                <input 
                                    type="text" 
                                    value={formData.Dept_Name} 
                                    readOnly 
                                    className="flex-1 h-8 font-mono border border-gray-300 px-3 bg-gray-50 rounded-[5px] outline-none shadow-sm cursor-default" 
                                    placeholder="" 
                                />
                            </div>
                        </div>

                        {/* Category ID Row */}
                        <div className="flex items-center gap-6">
                            <label className="w-32 font-bold text-gray-700">Category ID</label>
                            <div className="flex-1 flex gap-3">
                                <input 
                                    type="text" 
                                    name="Code" 
                                    value={formData.Code || ''} 
                                    readOnly 
                                    className="w-32 h-8 border border-gray-300 px-2 bg-white rounded-[5px] outline-none font-bold text-blue-600 shadow-sm text-center" 
                                />
                                <button 
                                    onClick={openCatSearch} 
                                    className="w-10 h-8 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[5px] transition-all shadow-md active:scale-95"
                                >
                                    <Search size={18} />
                                </button>
                            </div>
                        </div>

                        {/* Category Name Row */}
                        <div className="flex items-center gap-6">
                            <label className="w-32 font-bold text-gray-700">Category Name</label>
                            <input 
                                type="text" 
                                name="Cat_Name" 
                                value={formData.Cat_Name} 
                                onChange={handleInputChange} 
                                className="flex-1 h-8 font-mono border border-gray-300 px-3 bg-white rounded-[5px] outline-none focus:border-blue-400 shadow-sm transition-all focus:shadow-md" 
                                placeholder="" 
                            />
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
        <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 font-['Tahoma']">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={onClose} />
            <div className="relative w-full max-w-2xl bg-white shadow-2xl rounded-xl border border-gray-100 overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="bg-white px-6 py-4 flex items-center justify-between border-b border-gray-100 select-none relative overflow-hidden">
                    {/* System Color Left Accent */}
                    <div 
                        className="absolute left-0 top-0 bottom-0 w-1.5 transition-colors duration-500" 
                        style={{ backgroundColor: localStorage.getItem('topBarColor') || '#0285fd' }}
                    />
                    <div className="flex items-center gap-2">
                        <Search size={16} className="text-[#0078d4]" />
                        <span className="text-[15px] font-[700] text-slate-900 uppercase tracking-[3px] font-mono truncate">{title} Lookup</span>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-9 h-8 flex items-center justify-center bg-[#ff3b30] hover:bg-[#e03127] text-white rounded-[8px] shadow-[0_4px_12px_rgba(255,59,48,0.3)] hover:shadow-[0_6px_20px_rgba(255,59,48,0.4)] transition-all active:scale-90 outline-none border-none group"
                        title="Close"
                    >
                        <X size={18} strokeWidth={4} className="group-hover:scale-110 transition-transform" />
                    </button>
                </div>

                {/* Search Input Area */}
                <div className="p-3 bg-slate-50 border-b border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Search size={14} className="text-gray-400" />
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Search Facility</span>
                    </div>
                    <input 
                        type="text" 
                        placeholder={placeholder} 
                        className="h-8 border border-gray-300 px-3 text-xs rounded-md w-60 focus:border-[#0285fd] outline-none shadow-sm transition-all" 
                        value={query} 
                        onChange={(e) => setQuery(e.target.value)} 
                    />
                </div>

                {/* Results List */}
                <div className="p-2">
                    <div className=" px-3 py-1.5 flex text-[10px] font-bold text-gray-600 border-b border-gray-200 uppercase tracking-wider">
                        <span className="w-24 text-center">Code</span>
                        <span className="flex-1 px-3">Display Name</span>
                    </div>
                    <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                        {list.filter(x => (x.name || '').toLowerCase().includes(query.toLowerCase()) || (x.code || '').toLowerCase().includes(query.toLowerCase())).map(x => (
                            <button 
                                key={x.code} 
                                onClick={() => onSelect(x)}
                                className="w-full flex items-center justify-between px-3 py-2 text-xs border-b border-gray-100 hover:bg-blue-50 transition-all text-left group"
                            >
                                <div className="flex items-center gap-2 flex-1">
                                    <span className="w-24 text-center font-mono text-[11px] font-bold text-[#0078d4]">
                                        {x.code}
                                    </span>
                                    <span className="flex-1 px-3 font-mono font-medium text-gray-700 uppercase">
                                        {x.name}
                                    </span>
                                </div>
                                <div className="bg-[#e49e1b] text-white text-[10px] px-5 py-1.5 rounded-md font-bold hover:bg-[#cb9b34] shadow-sm transition-all active:scale-95 uppercase">Select</div>
                            </button>
                        ))}
                        {list.length === 0 && (
                            <div className="p-8 text-center text-gray-400 italic text-sm">No results found.</div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="bg-gray-50 px-4 py-2 border-t border-gray-200 flex justify-between items-center text-[10px] text-gray-400">
                    <span>{list.length} Result(s)</span>
                </div>
            </div>
        </div>
    );
};

export default CategoryBoard;
