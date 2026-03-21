import React, { useState, useEffect } from 'react';
import SimpleModal from '../../SimpleModal';
import { Search, RotateCcw, Save, Trash2, Loader2, X, MapPin, Building2 } from 'lucide-react';
import { departmentService } from '../../../services/department.service';
import { toast } from 'react-hot-toast';

const DepartmentBoard = ({ isOpen, onClose }) => {
    const initialState = {
        Code: '',
        Dept_Name: '',
        Loca_Id: '',
        Loca_Name: '',
        Company: '',
        CurrentUser: 'SYSTEM'
    };

    const [formData, setFormData] = useState(initialState);
    const [loading, setLoading] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);

    // Lookups
    const [showLocaSearch, setShowLocaSearch] = useState(false);
    const [locationsList, setLocationsList] = useState([]);
    const [showDeptSearch, setShowDeptSearch] = useState(false);
    const [deptList, setDeptList] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        if (isOpen) {
            const user = JSON.parse(localStorage.getItem('user'));
            const companyData = localStorage.getItem('selectedCompany');

            let companyCode = 'C001';
            if (companyData) {
                try {
                    const parsed = JSON.parse(companyData);
                    // Support multiple casing from different API versions
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
        if (!formData.Loca_Id || !formData.Dept_Name) {
            toast.error('Location and Department Name are required');
            return;
        }

        setLoading(true);
        try {
            const data = await departmentService.save(formData);
            if (data.message === 'inserted') {
                toast.success('Department created');
                setFormData(prev => ({ ...prev, Code: data.code }));
                setIsEditMode(true);
            } else {
                toast.success('Department updated');
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
        if (!window.confirm('Delete this department?')) return;

        setLoading(true);
        try {
            await departmentService.delete(formData.Code, formData.Loca_Id, formData.Company);
            toast.success('Department deleted');
            handleClear();
        } catch (err) {
            toast.error(err.message || err);
        } finally {
            setLoading(false);
        }
    };

    const openLocaSearch = async () => {
        if (!formData.Company) {
            toast.error('Company not identified');
            return;
        }
        setLoading(true);
        try {
            const data = await departmentService.getAllLocations(formData.Company);
            setLocationsList(data || []);
            setShowLocaSearch(true);
        } catch (err) {
            toast.error('Failed to load locations');
        } finally {
            setLoading(false);
        }
    };

    const selectLocation = (loc) => {
        setFormData(prev => ({ ...prev, Loca_Id: loc.code, Loca_Name: loc.name }));
        setShowLocaSearch(false);
    };

    const openDeptSearch = async () => {
        if (!formData.Loca_Id) {
            toast.error('Select a location first');
            return;
        }
        setLoading(true);
        try {
            const data = await departmentService.searchDepartments(formData.Loca_Id, formData.Company, searchQuery);
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
            Code: dept.code,
            Dept_Name: dept.name
        }));
        setIsEditMode(true);
        setShowDeptSearch(false);
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
            <SimpleModal isOpen={isOpen} onClose={onClose} title="Department Selection" maxWidth="max-w-xl" footer={footer}>
                <div className="space-y-4 py-2 font-['Plus_Jakarta_Sans']">
                    <h2 className="text-sm font-bold text-gray-800 border-b pb-2 mb-4 uppercase">Department Details Profile</h2>

                    <div className="space-y-3">
                        {/* Location ID Row */}
                        <div className="flex items-center gap-3">
                            <label className="text-xs font-semibold text-gray-600 w-32 shrink-0">Location ID</label>
                            <div className="flex-1 flex gap-2">
                                <input type="text" name="Loca_Id" value={formData.Loca_Id} readOnly className="w-32 h-8 border border-gray-300 px-2 text-sm bg-gray-50 focus:border-blue-500 outline-none rounded-sm" />
                                <button onClick={openLocaSearch} className="w-8 h-8 bg-[#0078d4] text-white flex items-center justify-center hover:bg-[#005a9e] rounded-sm transition-colors"><Search size={14} /></button>
                                <input type="text" value={formData.Loca_Name} readOnly className="flex-1 h-8 border border-gray-300 px-2 text-sm bg-gray-50 text-gray-500 rounded-sm" placeholder="Location Name" />
                            </div>
                        </div>

                        {/* Department ID Row */}
                        <div className="flex items-center gap-3">
                            <label className="text-xs font-semibold text-gray-600 w-32 shrink-0">Department ID</label>
                            <div className="flex-1 flex gap-2">
                                <input type="text" name="Code" value={formData.Code} readOnly className="w-32 h-8 border border-gray-300 px-2 text-sm bg-gray-50 rounded-sm" placeholder="Auto Generated" />
                                <button onClick={openDeptSearch} className="w-8 h-8 bg-[#0078d4] text-white flex items-center justify-center hover:bg-[#005a9e] rounded-sm transition-colors"><Search size={14} /></button>
                            </div>
                        </div>

                        {/* Department Name Row */}
                        <div className="flex items-center gap-3">
                            <label className="text-xs font-semibold text-gray-600 w-32 shrink-0">Department Name</label>
                            <input type="text" name="Dept_Name" value={formData.Dept_Name} onChange={handleInputChange} className="flex-1 h-8 border border-gray-300 px-2 text-sm focus:border-blue-500 outline-none rounded-sm" placeholder="Enter Department Name" />
                        </div>
                    </div>
                </div>
            </SimpleModal>

            {/* Location Search Modal */}
            {showLocaSearch && (
                <SearchModal
                    title="Search Locations"
                    list={locationsList}
                    onSelect={selectLocation}
                    onClose={() => setShowLocaSearch(false)}
                    placeholder="Search by code or name..."
                />
            )}

            {/* Dept Search Modal */}
            {showDeptSearch && (
                <SearchModal
                    title="Search Departments"
                    list={deptList}
                    onSelect={selectDept}
                    onClose={() => setShowDeptSearch(false)}
                    placeholder="Search by code or name..."
                />
            )}
        </>
    );
};

const SearchModal = ({ title, list, onSelect, onClose, placeholder }) => {
    const [query, setQuery] = useState('');
    return (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={onClose} />
            <div className="relative w-full max-w-lg bg-white shadow-2xl rounded-xl border border-gray-100 overflow-hidden flex flex-col max-h-[80vh]">
                <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50/50">
                    <h3 className="text-lg font-bold text-slate-800 tracking-tight">{title}</h3>
                    <div className="flex gap-2">
                        <input type="text" placeholder={placeholder} className="h-8 border border-gray-300 px-3 text-sm rounded-md w-48 focus:border-blue-500 outline-none" value={query} onChange={(e) => setQuery(e.target.value)} />
                        <button onClick={onClose} className="w-8 h-8 flex items-center justify-center hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors rounded-full outline-none"><X size={20} /></button>
                    </div>
                </div>
                <div className="overflow-y-auto p-2">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-[#f8f9fa] sticky top-0 font-bold text-gray-600 font-mono">
                            <tr><th className="p-3 border-b text-center w-24">Code</th><th className="p-3 border-b">Display Name</th><th className="p-3 border-b text-center w-24">Action</th></tr>
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

export default DepartmentBoard;
