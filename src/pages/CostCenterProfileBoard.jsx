import React, { useState, useEffect } from 'react';
import SimpleModal from '../components/SimpleModal';
import { Target, Search, Trash2, RotateCcw, Save } from 'lucide-react';
import { costCenterService } from '../services/costcenter.service';
import { showSuccessToast, showErrorToast } from '../utils/toastUtils';
import TransactionFormWrapper from '../components/TransactionFormWrapper';

const CostCenterProfileBoard = ({ isOpen, onClose }) => {
    const initialState = {
        Code: '', Name: '', Inactive: false, CurrentUser: 'SYSTEM', Company: ''
    };

    const [formData, setFormData] = useState(initialState);
    const [loading, setLoading] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [showSearchModal, setShowSearchModal] = useState(false);
    const [costCentersList, setCostCentersList] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');

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

    const handleSearch = async () => {
        setLoading(true);
        setShowSearchModal(true);
        try {
            const data = await costCenterService.getAll(formData.Company);
            setCostCentersList(data);
        } catch (error) {
            showErrorToast('Failed to load cost centers');
        } finally {
            setLoading(false);
        }
    };

    const handleSelect = (item) => {
        setFormData({
            Code: item.code || item.Code,
            Name: item.name || item.Name,
            Inactive: item.inactive || item.Inactive,
            CurrentUser: formData.CurrentUser,
            Company: formData.Company
        });
        setIsEditMode(true);
        setShowSearchModal(false);
    };

    const handleSave = async () => {
        if (!formData.Name) { showErrorToast('Cost Center Name is required'); return; }
        setLoading(true);
        try {
            const data = await costCenterService.save({
                Code: formData.Code, Name: formData.Name, Inactive: formData.Inactive,
                CurrentUser: formData.CurrentUser, Company: formData.Company
            });
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

    return (
        <>
            <TransactionFormWrapper subtitle="Manage cost center codes & details" icon={Target}
                isOpen={isOpen}
                onClose={onClose}
                title="Cost Center Profile"
                footer={
                    <div className="bg-[#fcfcfc] px-6 py-5 w-full flex justify-between items-center border-t border-gray-200 rounded-b-[10px] shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]">
                        <div className="flex gap-3">
                            {isEditMode && (
                                <button onClick={handleDelete} className="px-6 h-10 border-2 border-red-500 text-red-600 bg-white hover:bg-red-50 font-semibold rounded-[3px] shadow-sm text-[13px] transition-all flex items-center justify-center gap-2">
                                    <Trash2 size={14} /> DELETE
                                </button>
                            )}
                            <button type="button" onClick={handleClear} className="px-6 h-10 border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 font-semibold rounded-[3px] shadow-sm text-[13px] transition-all flex items-center justify-center gap-2">
                                <RotateCcw size={14} /> CLEAR
                            </button>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={handleSave} disabled={loading} className="px-6 h-10 bg-[#0285fd] hover:bg-[#0073ff] text-white font-semibold rounded-[3px] shadow-sm text-[13px] transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                                <Save size={14} /> SAVE
                            </button>
                        </div>
                    </div>
                }
            >
                <div className="space-y-3 overflow-y-auto no-scrollbar font-['Tahoma']">
                    <div className="bg-white p-4 border border-slate-200 rounded-[3px] space-y-4">
                        <div className="grid grid-cols-12 gap-x-6 gap-y-3.5">
                            <div className="col-span-12 mb-2">
                                <div className="bg-blue-50/50 border border-blue-100 rounded-[3px] p-3">
                                    <h4 className="text-[13px] font-bold text-blue-900 mb-0.5">Note</h4>
                                    <p className="text-[12px] text-blue-700/80">The Cost Center ID is auto-generated by the system upon saving.</p>
                                </div>
                            </div>
                            <div className="col-span-6">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Cost Center ID</label>
                                <div className="relative">
                                    <input type="text" readOnly value={formData.Code} onClick={handleSearch} className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] pr-10 text-gray-700 font-mono cursor-pointer" />
                                    <button onClick={handleSearch} className="absolute right-1 top-1 bottom-1 w-8 flex items-center justify-center text-gray-500 hover:text-gray-800 bg-transparent border-none cursor-pointer">
                                        <Search size={16} />
                                    </button>
                                </div>
                            </div>
                            <div className="col-span-6">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Cost Center Name</label>
                                <input type="text" name="Name" value={formData.Name} onChange={handleInputChange} placeholder="Enter cost center name" maxLength={50} className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700" />
                            </div>
                            <div className="col-span-12 mt-1">
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input type="checkbox" name="Inactive" checked={formData.Inactive} onChange={handleInputChange} className="w-4 h-4 text-[#0285fd] border-gray-300 rounded focus:ring-[#0285fd] cursor-pointer" />
                                    <span className="text-[12px] font-bold text-slate-600 select-none">Cost Center Inactive</span>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
            </TransactionFormWrapper>

            <SimpleModal isOpen={showSearchModal} onClose={() => setShowSearchModal(false)} title="Cost Center Search" maxWidth="max-w-[700px]">
                <div className="space-y-4 font-['Tahoma']">
                    <div className="flex items-center gap-4 bg-slate-50 p-4 border-b border-gray-100 mb-2">
                        <span className="text-[12px] font-bold text-gray-500 uppercase tracking-wider">Search</span>
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                            <input type="text" placeholder="Find cost center..." className="w-full h-10 pl-10 pr-4 border border-gray-300 rounded-[3px] outline-none text-[13px] focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] shadow-sm bg-white" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} autoFocus />
                        </div>
                    </div>
                    <div className="border border-gray-200 rounded-[3px] overflow-hidden shadow-sm max-h-[400px] overflow-y-auto no-scrollbar">
                        <table className="w-full text-left">
                            <thead className="bg-[#f8fafc] sticky top-0 text-[11px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 shadow-sm z-10">
                                <tr><th className=" px-5 py-3">Code</th><th className=" px-5 py-3">Cost Center Name</th><th className="text-right px-5 py-3">Action</th></tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {costCentersList.filter(c => ((c.name || c.Name) || '').toLowerCase().includes(searchQuery.toLowerCase()) || ((c.code || c.Code) || '').toLowerCase().includes(searchQuery.toLowerCase())).map((c, i) => (
                                    <tr key={i} className="group hover:bg-blue-50/50  transition-all cursor-pointer group border-b border-gray-50" onClick={() => handleSelect(c)}>
                                        <td className="font-mono text-[12px] font-bold text-blue-600 px-5 py-3">{c.code || c.Code}</td>
                                        <td className="text-[12px] font-bold text-slate-700 uppercase group-hover:text-blue-600 transition-colors px-5 py-3">{c.name || c.Name}</td>
                                        <td className="text-right px-5 py-3">
                                            <button className="bg-white text-[#0285fd] border border-[#0285fd] hover:bg-blue-50 text-[10px] px-5 py-2 rounded-[3px] font-black shadow-sm transition-all active:scale-95 uppercase">SELECT</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </SimpleModal>
        </>
    );
};

export default CostCenterProfileBoard;
