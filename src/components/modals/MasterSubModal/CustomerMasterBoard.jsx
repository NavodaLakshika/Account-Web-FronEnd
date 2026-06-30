import React, { useState, useEffect } from 'react';
import SimpleModal from '../../../components/SimpleModal';
import TransactionFormWrapper from '../../../components/TransactionFormWrapper';
import { Search, Save, RotateCcw, Trash2, CheckCircle, AlertTriangle, Loader2, FileText } from 'lucide-react';
import { customerService } from '../../../services/customer.service';
import { authService } from '../../../services/auth.service';
import { showSuccessToast, showErrorToast } from '../../../utils/toastUtils';

const CustomerMasterBoard = ({ isOpen, onClose }) => {
    const initialState = {
        Code: '', Name: '', Type_Code: '', Type_Name: '', Address1: '', Address2: '',
        Email: '', Web: '', Phone_No: '', Area: '', AreaName: '', Credit_Limit: 0,
        Credit_Period: 0, Vat_Reg_No: '', Inactive: false, CurrentUser: 'SYSTEM', Company: ''
    };

    const [formData, setFormData] = useState(initialState);
    const [loading, setLoading] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    // Lookups
    const [showSearchModal, setShowSearchModal] = useState(false);
    const [customerList, setCustomerList] = useState([]);
    const [custSearch, setCustSearch] = useState('');

    const [showTypeModal, setShowTypeModal] = useState(false);
    const [typeList, setTypeList] = useState([]);
    const [typeSearch, setTypeSearch] = useState('');

    const [showAreaModal, setShowAreaModal] = useState(false);
    const [areaList, setAreaList] = useState([]);
    const [areaSearch, setAreaSearch] = useState('');

    useEffect(() => {
        if (isOpen) {
            handleClear();
            const user = authService.getCurrentUser();
            const companyData = localStorage.getItem('selectedCompany');
            let companyCode = 'C001';
            if (companyData) {
                try {
                    const p = JSON.parse(companyData);
                    companyCode = p.company_Code || p.companyCode || p.CompanyCode || companyData;
                } catch (e) {
                    companyCode = companyData;
                }
            }
            if (user) {
                setFormData(prev => ({ ...prev, CurrentUser: user.empName || user.username || 'SYSTEM', Company: companyCode }));
            }
        }
    }, [isOpen]);

    const handleInput = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleClear = () => {
        const user = authService.getCurrentUser();
        const companyData = localStorage.getItem('selectedCompany');
        let companyCode = 'C001';
        if (companyData) {
            try {
                const p = JSON.parse(companyData);
                companyCode = p.company_Code || p.companyCode || p.CompanyCode || companyData;
            } catch (e) {}
        }
        setFormData({ ...initialState, CurrentUser: user?.empName || user?.username || 'SYSTEM', Company: companyCode });
        setIsEditMode(false);
    };

    const handleSave = async () => {
        if (!formData.Name) return showErrorToast('Customer Name is required');
        if (!formData.Type_Code) return showErrorToast('Customer Type is required');

        const payload = {
            Code: formData.Code || 'AUTO',
            Cust_Name: formData.Name,
            Address1: formData.Address1,
            Address2: formData.Address2,
            Phone: formData.Phone_No,
            Email: formData.Email,
            Web: formData.Web,
            Credit_Period: formData.Credit_Period?.toString(),
            Credit_Limit: Number(formData.Credit_Limit) || 0,
            VAT_Number: formData.Vat_Reg_No,
            Type: formData.Type_Code,
            Area_Code: formData.Area,
            Locked: formData.Inactive,
            CurrentUser: formData.CurrentUser
        };

        setLoading(true);
        try {
            if (isEditMode && formData.Code) {
                await customerService.update(formData.Code, payload);
                showSuccessToast('Customer updated successfully');
            } else {
                const data = await customerService.create(payload);
                showSuccessToast('Customer created successfully');
                setFormData(prev => ({ ...prev, Code: data.code }));
                setIsEditMode(true);
            }
        } catch (error) {
            showErrorToast(error.error || error.message || (typeof error === 'string' ? error : 'Failed to save'));
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
            await customerService.delete(formData.Code, formData.Company);
            showSuccessToast('Customer deleted');
            handleClear();
            setShowDeleteConfirm(false);
        } catch (error) {
            showErrorToast(error.error || error.message || 'Deletion failed');
        } finally {
            setLoading(false);
        }
    };

    const openCustomerSearch = async () => {
        try {
            const data = await customerService.getAll(formData.Company);
            setCustomerList(data);
            setShowSearchModal(true);
        } catch (error) { showErrorToast('Failed to load customers'); }
    };

    const openTypeSearch = async () => {
        try {
            const data = await customerService.getTypes(formData.Company);
            setTypeList(data);
            setShowTypeModal(true);
        } catch (error) { showErrorToast('Failed to load types'); }
    };

    const openAreaSearch = async () => {
        try {
            const data = await customerService.getAreas(formData.Company);
            setAreaList(data);
            setShowAreaModal(true);
        } catch (error) { showErrorToast('Failed to load areas'); }
    };

    const loadCustomer = async (item) => {
        try {
            const fullItem = await customerService.getByCode(item.code || item.Code);
            setFormData({
                Code: fullItem.code || fullItem.Code || '',
                Name: fullItem.cust_Name || fullItem.Cust_Name || '',
                Type_Code: fullItem.type || fullItem.Type || '',
                Type_Name: fullItem.type_Name || fullItem.Type_Name || '',
                Address1: fullItem.address1 || fullItem.Address1 || '',
                Address2: fullItem.address2 || fullItem.Address2 || '',
                Email: fullItem.email || fullItem.Email || '',
                Web: fullItem.web || fullItem.Web || '',
                Phone_No: fullItem.phone || fullItem.Phone || '',
                Area: fullItem.area_Code || fullItem.Area_Code || '',
                AreaName: fullItem.areaName || fullItem.AreaName || '',
                Credit_Limit: fullItem.credit_Limit || fullItem.Credit_Limit || 0,
                Credit_Period: fullItem.credit_Period || fullItem.Credit_Period || 0,
                Vat_Reg_No: fullItem.vat_Number || fullItem.Vat_Number || '',
                Inactive: fullItem.locked === 1 || fullItem.Locked === 1 || false,
                CurrentUser: formData.CurrentUser,
                Company: formData.Company
            });
            setIsEditMode(true);
            setShowSearchModal(false);
        } catch (error) {
            showErrorToast('Failed to load customer details');
        }
    };

    return (
        <>
            <style>{`@keyframes toastProgress{0%{width:100%}100%{width:0%}}`}</style>
            <TransactionFormWrapper subtitle="Customer Master" icon={FileText}
                isOpen={isOpen}
                onClose={onClose}
                title="Customer Master"
                footer={
                    <div className="bg-slate-50 px-6 py-4 w-full flex justify-between items-center border-t border-slate-200 rounded-b-[5px]">
                        <div className="flex gap-3">
                            <button
                                onClick={handleDelete}
                                disabled={!isEditMode || loading}
                                className={`px-6 py-2 border border-red-300 text-red-600 bg-white hover:bg-red-50 font-semibold rounded-[3px] shadow-sm text-[13px] transition-all flex items-center gap-2 ${(!isEditMode || loading) ? 'opacity-40 cursor-not-allowed' : ''}`}
                            >
                                <Trash2 size={14} /> DELETE
                            </button>
                            <button
                                onClick={handleClear}
                                className="px-6 py-2 border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 font-semibold rounded-[3px] shadow-sm text-[13px] transition-all flex items-center gap-2"
                            >
                                <RotateCcw size={14} /> CLEAR
                            </button>
                        </div>
                        <button
                            onClick={handleSave}
                            disabled={loading}
                            className={`px-6 py-2 bg-[#0285fd] hover:bg-[#0073ff] text-white font-semibold rounded-[3px] shadow-sm text-[13px] transition-all flex items-center gap-2 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            <CheckCircle size={14} /> {isEditMode ? 'UPDATE & SAVE' : 'SAVE & APPLY'}
                        </button>
                    </div>
                }
            >
                <div className="space-y-4 overflow-y-auto no-scrollbar">
                    <div className="bg-white p-4 border border-slate-200 rounded-[3px] space-y-4">
                        <div className="grid grid-cols-12 gap-x-6 gap-y-3.5">

                            <div className="col-span-4">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Cust Code</label>
                                <div className="relative">
                                    <input
                                        type="text" name="Code"
                                        value={formData.Code}
                                        onChange={handleInput}
                                        className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-blue-600 font-bold cursor-pointer pr-10"
                                        placeholder="Auto Gen"
                                        readOnly
                                        onClick={openCustomerSearch}
                                    />
                                    <button onClick={openCustomerSearch} className="absolute right-1 top-1 bottom-1 w-8 flex items-center justify-center text-gray-500 hover:text-gray-800 bg-transparent border-none cursor-pointer">
                                        <Search size={16} />
                                    </button>
                                </div>
                            </div>

                            <div className="col-span-8">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Customer Name</label>
                                <input type="text" name="Name" value={formData.Name} onChange={handleInput} className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700" />
                            </div>

                            <div className="col-span-4">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Customer Type</label>
                                <div className="relative">
                                    <input
                                        type="text" readOnly
                                        value={formData.Type_Name}
                                        onClick={openTypeSearch}
                                        className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] cursor-pointer pr-10 text-gray-700 truncate"
                                        placeholder="Select Type..."
                                    />
                                    <button onClick={openTypeSearch} className="absolute right-1 top-1 bottom-1 w-8 flex items-center justify-center text-gray-500 hover:text-gray-800 bg-transparent border-none cursor-pointer">
                                        <Search size={16} />
                                    </button>
                                </div>
                            </div>

                            <div className="col-span-4">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Phone Number</label>
                                <input type="text" name="Phone_No" value={formData.Phone_No} onChange={handleInput} className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700" />
                            </div>

                            <div className="col-span-4">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Email Address</label>
                                <input type="email" name="Email" value={formData.Email} onChange={handleInput} className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700" />
                            </div>

                            <div className="col-span-4">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Address Line 1</label>
                                <input type="text" name="Address1" value={formData.Address1} onChange={handleInput} className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700" />
                            </div>

                            <div className="col-span-4">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Area</label>
                                <div className="relative">
                                    <input
                                        type="text" readOnly
                                        value={formData.AreaName}
                                        onClick={openAreaSearch}
                                        className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] cursor-pointer pr-10 text-gray-700 truncate"
                                        placeholder="Select Area..."
                                    />
                                    <button onClick={openAreaSearch} className="absolute right-1 top-1 bottom-1 w-8 flex items-center justify-center text-gray-500 hover:text-gray-800 bg-transparent border-none cursor-pointer">
                                        <Search size={16} />
                                    </button>
                                </div>
                            </div>

                            <div className="col-span-4">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Address Line 2</label>
                                <input type="text" name="Address2" value={formData.Address2} onChange={handleInput} className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700" />
                            </div>

                            <div className="col-span-4">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Web URL</label>
                                <input type="text" name="Web" value={formData.Web} onChange={handleInput} className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700" />
                            </div>

                            <div className="col-span-4">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">VAT Reg No</label>
                                <input type="text" name="Vat_Reg_No" value={formData.Vat_Reg_No} onChange={handleInput} className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700" />
                            </div>

                            <div className="col-span-4">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Credit Limit</label>
                                <input type="number" name="Credit_Limit" value={formData.Credit_Limit} onChange={handleInput} className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700 text-right font-mono" />
                            </div>

                            <div className="col-span-4">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Credit Period</label>
                                <input type="number" name="Credit_Period" value={formData.Credit_Period} onChange={handleInput} className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700 text-right font-mono" />
                            </div>

                            <div className="col-span-4 flex items-end">
                                <label className="flex items-center gap-2 cursor-pointer select-none">
                                    <input type="checkbox" name="Inactive" checked={formData.Inactive} onChange={handleInput} className="w-4 h-4 rounded border-gray-300 text-[#0285fd] focus:ring-[#0285fd]" />
                                    <span className="text-[13px] font-medium text-gray-700">Mark as Inactive</span>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
            </TransactionFormWrapper>

            {/* Customer Search */}
            <SimpleModal
                isOpen={showSearchModal}
                onClose={() => setShowSearchModal(false)}
                title="Customer Directory Lookup"
            >
                <div className="space-y-4">
                    <div className="p-4 bg-slate-50 border-b border-gray-200">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <input
                                type="text"
                                placeholder="Find customer by name or code..."
                                className="w-full h-10 pl-10 pr-4 border border-gray-300 rounded-[3px] outline-none text-[13px] focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] shadow-sm bg-white"
                                value={custSearch}
                                onChange={(e) => setCustSearch(e.target.value)}
                                autoFocus
                            />
                        </div>
                    </div>
                    <div className="border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                        <div className="max-h-[400px] overflow-y-auto no-scrollbar">
                            <table className="w-full text-left">
                                <thead className="bg-[#f8fafc] sticky top-0 text-[11px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 shadow-sm z-10">
                                    <tr>
                                        <th className=" px-5 py-3">Code</th>
                                        <th className=" px-5 py-3">Customer Name</th>
                                    <th className="text-right px-5 py-3">Action</th></tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {customerList
                                        .filter(c => ((c.cust_Name || c.Cust_Name || c.name || c.Name) || '').toLowerCase().includes(custSearch.toLowerCase()) || ((c.code || c.Code) || '').toLowerCase().includes(custSearch.toLowerCase()))
                                        .map((c, i) => (
                                        <tr key={i} className="group hover:bg-blue-50/50  transition-all cursor-pointer group border-b border-gray-50" onClick={() => loadCustomer(c)}>
                                            <td className="font-mono text-[12px] font-bold text-blue-600 px-5 py-3">{c.code || c.Code}</td>
                                            <td className="text-[12px] font-bold text-slate-700 uppercase group-hover:text-blue-600 transition-colors px-5 py-3">{c.cust_Name || c.Cust_Name || c.name || c.Name}</td>
                                        
                                            <td className="text-right px-5 py-3"><button className="bg-white text-[#0285fd] border border-[#0285fd] hover:bg-blue-50 text-[10px] px-5 py-2 rounded-[3px] font-black shadow-sm transition-all active:scale-95 uppercase">SELECT</button></td>
                                        </tr>
                                    ))}
                                    {customerList.length === 0 && (
                                        <tr><td colSpan="2" className="text-center py-16 text-gray-400 text-[11px] font-bold uppercase tracking-widest">No records found</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </SimpleModal>

            {/* Type Search */}
            <SimpleModal
                isOpen={showTypeModal}
                onClose={() => setShowTypeModal(false)}
                title="Customer Type Directory"
            >
                <div className="space-y-4">
                    <div className="p-4 bg-slate-50 border-b border-gray-200">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <input
                                type="text"
                                placeholder="Find customer type..."
                                className="w-full h-10 pl-10 pr-4 border border-gray-300 rounded-[3px] outline-none text-[13px] focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] shadow-sm bg-white"
                                value={typeSearch}
                                onChange={(e) => setTypeSearch(e.target.value)}
                                autoFocus
                            />
                        </div>
                    </div>
                    <div className="border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                        <div className="max-h-[300px] overflow-y-auto no-scrollbar">
                            <table className="w-full text-left">
                                <thead className="bg-[#f8fafc] sticky top-0 text-[11px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 shadow-sm z-10">
                                    <tr>
                                        <th className=" px-5 py-3">Code</th>
                                        <th className=" px-5 py-3">Type Name</th>
                                    <th className="text-right px-5 py-3">Action</th></tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {typeList
                                        .filter(t => ((t.name || t.Name) || '').toLowerCase().includes(typeSearch.toLowerCase()) || ((t.code || t.Code) || '').toLowerCase().includes(typeSearch.toLowerCase()))
                                        .map((t, i) => (
                                        <tr key={i} className="group hover:bg-blue-50/50  transition-all cursor-pointer group border-b border-gray-50" onClick={() => { setFormData(prev => ({ ...prev, Type_Code: t.code || t.Code, Type_Name: t.name || t.Name })); setShowTypeModal(false); setTypeSearch(''); }}>
                                            <td className="font-mono text-[12px] font-bold text-blue-600 px-5 py-3">{t.code || t.Code}</td>
                                            <td className="text-[12px] font-bold text-slate-700 uppercase group-hover:text-blue-600 transition-colors px-5 py-3">{t.name || t.Name}</td>
                                        
                                            <td className="text-right px-5 py-3"><button className="bg-white text-[#0285fd] border border-[#0285fd] hover:bg-blue-50 text-[10px] px-5 py-2 rounded-[3px] font-black shadow-sm transition-all active:scale-95 uppercase">SELECT</button></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </SimpleModal>

            {/* Area Search */}
            <SimpleModal
                isOpen={showAreaModal}
                onClose={() => setShowAreaModal(false)}
                title="Area Directory Lookup"
            >
                <div className="space-y-4">
                    <div className="p-4 bg-slate-50 border-b border-gray-200">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <input
                                type="text"
                                placeholder="Find area..."
                                className="w-full h-10 pl-10 pr-4 border border-gray-300 rounded-[3px] outline-none text-[13px] focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] shadow-sm bg-white"
                                value={areaSearch}
                                onChange={(e) => setAreaSearch(e.target.value)}
                                autoFocus
                            />
                        </div>
                    </div>
                    <div className="border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                        <div className="max-h-[300px] overflow-y-auto no-scrollbar">
                            <table className="w-full text-left">
                                <thead className="bg-[#f8fafc] sticky top-0 text-[11px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 shadow-sm z-10">
                                    <tr>
                                        <th className=" px-5 py-3">Code</th>
                                        <th className=" px-5 py-3">Area Name</th>
                                    <th className="text-right px-5 py-3">Action</th></tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {areaList
                                        .filter(a => ((a.name || a.Name) || '').toLowerCase().includes(areaSearch.toLowerCase()) || ((a.code || a.Code) || '').toLowerCase().includes(areaSearch.toLowerCase()))
                                        .map((a, i) => (
                                        <tr key={i} className="group hover:bg-blue-50/50  transition-all cursor-pointer group border-b border-gray-50" onClick={() => { setFormData(prev => ({ ...prev, Area: a.code || a.Code, AreaName: a.name || a.Name })); setShowAreaModal(false); setAreaSearch(''); }}>
                                            <td className="font-mono text-[12px] font-bold text-blue-600 px-5 py-3">{a.code || a.Code}</td>
                                            <td className="text-[12px] font-bold text-slate-700 uppercase group-hover:text-blue-600 transition-colors px-5 py-3">{a.name || a.Name}</td>
                                        
                                            <td className="text-right px-5 py-3"><button className="bg-white text-[#0285fd] border border-[#0285fd] hover:bg-blue-50 text-[10px] px-5 py-2 rounded-[3px] font-black shadow-sm transition-all active:scale-95 uppercase">SELECT</button></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </SimpleModal>

            {showDeleteConfirm && (
                <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => !loading && setShowDeleteConfirm(false)} />
                    <div className="relative w-full max-w-md bg-white rounded-[3px] shadow-2xl overflow-hidden">
                        <div className="p-8 text-center">
                            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-white shadow-lg"><AlertTriangle size={40} className="text-red-500" /></div>
                            <h3 className="text-lg font-bold text-slate-800 mb-2 uppercase tracking-wider">Confirm Deletion</h3>
                            <p className="text-slate-500 text-[12px] font-medium leading-relaxed mb-8">Are you sure you want to delete <span className="font-bold text-slate-800 uppercase">"{formData.Name || formData.Code}"</span>?<br />This action is permanent and cannot be undone.</p>
                            <div className="flex gap-3">
                                <button onClick={() => setShowDeleteConfirm(false)} disabled={loading} className="flex-1 h-11 bg-gray-100 text-gray-600 text-[11px] font-bold hover:bg-gray-200 transition-all uppercase tracking-widest rounded-full disabled:opacity-50">Cancel</button>
                                <button onClick={confirmDelete} disabled={loading} className="flex-1 h-11 bg-red-500 text-white text-[11px] font-bold hover:bg-red-600 shadow-lg transition-all flex items-center justify-center gap-2 uppercase tracking-widest rounded-full disabled:opacity-50">{loading ? <Loader2 size={16} className="animate-spin" /> : 'Delete Now'}</button>
                            </div>
                        </div>
                        <div className="bg-gray-50 py-3 border-t border-gray-200"><span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest block text-center">Security Verification Required</span></div>
                    </div>
                </div>
            )}
        </>
    );
};

export default CustomerMasterBoard;
