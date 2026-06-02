import React, { useState, useEffect } from 'react';
import SimpleModal from '../../../components/SimpleModal';
import { Search, Save, RotateCcw, Trash2, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';
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

    // Open Lookups
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

    const inputClass = "flex-1 min-w-0 h-8 border border-slate-200 rounded px-3 text-[12px] font-bold text-gray-700 bg-slate-50 outline-none transition-all focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20";
    const labelClass = "text-[11px] font-bold text-gray-500 uppercase w-32 shrink-0";

    return (
        <>
            <SimpleModal
                isOpen={isOpen}
                onClose={onClose}
                title="Customer Profile & Directory"
                maxWidth="max-w-[1050px]"
                footer={
                    <div className="bg-slate-50 px-6 py-4 w-full flex justify-between items-center border-t border-slate-200 rounded-b-xl">
                        <div className="flex gap-3">
                            <button
                                onClick={handleDelete}
                                disabled={!isEditMode || loading}
                                className={`px-6 py-3 font-mono font-bold text-sm uppercase tracking-widest rounded-[5px] transition-all flex items-center justify-center gap-2 border-none ${(!isEditMode || loading) ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-[#ff3b30] hover:bg-[#e03127] text-white shadow-md shadow-red-100 active:scale-95'}`}
                            >
                                <Trash2 size={14} /> DELETE DOC
                            </button>
                            <button
                                onClick={handleClear}
                                className="px-6 py-3 bg-[#00adff] hover:bg-[#0099e6] text-white font-mono font-bold text-sm uppercase tracking-widest rounded-[5px] transition-all active:scale-95 flex items-center justify-center gap-2 border-none"
                            >
                                <RotateCcw size={14} /> CLEAR FORM
                            </button>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={handleSave}
                                disabled={loading}
                                className="px-6 py-3 bg-[#2bb744] hover:bg-[#259b3a] text-white font-mono font-bold text-sm uppercase tracking-widest rounded-[5px] shadow-md shadow-green-100 transition-all active:scale-95 flex items-center justify-center gap-2 border-none"
                            >
                                <CheckCircle size={14} /> {isEditMode ? 'UPDATE & SAVE' : 'SAVE & APPLY'}
                            </button>
                        </div>
                    </div>
                }
            >
                <div className="space-y-4 overflow-y-auto no-scrollbar font-['Tahoma']">
                    <div className="bg-white p-4 border border-slate-200 rounded-[5px] space-y-4">
                        <div className="grid grid-cols-12 gap-x-6 gap-y-4">
                            
                            {/* Row 1 */}
                            <div className="col-span-6 flex items-center gap-2">
                                <label className={labelClass}>Cust Code</label>
                                <div className="flex-1 flex gap-1 h-8 min-w-0">
                                    <input 
                                        type="text" 
                                        name="Code" 
                                        value={formData.Code} 
                                        onChange={handleInput} 
                                        className="flex-1 min-w-0 h-8 border border-slate-200 px-3 text-[12px] font-bold text-blue-600 bg-slate-50 rounded outline-none transition-all focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20" 
                                        placeholder="Auto Gen"
                                        readOnly
                                    />
                                    <button onClick={openCustomerSearch} className="w-10 h-8 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[5px] transition-all shadow-md active:scale-95 shrink-0">
                                        <Search size={16} />
                                    </button>
                                </div>
                            </div>
                            
                            <div className="col-span-6 flex items-center gap-2">
                                <label className={labelClass}>Customer Name</label>
                                <input type="text" name="Name" value={formData.Name} onChange={handleInput} className={inputClass} />
                            </div>

                            {/* Row 2 */}
                            <div className="col-span-6 flex items-center gap-2">
                                <label className={labelClass}>Customer Type</label>
                                <div className="flex-1 flex gap-1 h-8 min-w-0">
                                    <input
                                        type="text"
                                        readOnly
                                        value={formData.Type_Name}
                                        placeholder="Select Type..."
                                        className="flex-1 min-w-0 h-8 border border-slate-200 px-3 text-[12px] font-bold text-red-600 bg-slate-50 rounded outline-none cursor-pointer transition-all focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20"
                                        onClick={openTypeSearch}
                                    />
                                    <button onClick={openTypeSearch} className="w-10 h-8 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[5px] transition-all shadow-md active:scale-95 shrink-0">
                                        <Search size={16} />
                                    </button>
                                </div>
                            </div>

                            <div className="col-span-6 flex items-center gap-2">
                                <label className={labelClass}>Phone Number</label>
                                <input type="text" name="Phone_No" value={formData.Phone_No} onChange={handleInput} className={inputClass} />
                            </div>

                            {/* Row 3 */}
                            <div className="col-span-6 flex items-center gap-2">
                                <label className={labelClass}>Address Line 1</label>
                                <input type="text" name="Address1" value={formData.Address1} onChange={handleInput} className={inputClass} />
                            </div>
                            
                            <div className="col-span-6 flex items-center gap-2">
                                <label className={labelClass}>Area</label>
                                <div className="flex-1 flex gap-1 h-8 min-w-0">
                                    <input
                                        type="text"
                                        readOnly
                                        value={formData.AreaName}
                                        placeholder="Select Area..."
                                        className="flex-1 min-w-0 h-8 border border-slate-200 px-3 text-[12px] font-bold text-red-600 bg-slate-50 rounded outline-none cursor-pointer transition-all focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20"
                                        onClick={openAreaSearch}
                                    />
                                    <button onClick={openAreaSearch} className="w-10 h-8 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[5px] transition-all shadow-md active:scale-95 shrink-0">
                                        <Search size={16} />
                                    </button>
                                </div>
                            </div>

                            {/* Row 4 */}
                            <div className="col-span-6 flex items-center gap-2">
                                <label className={labelClass}>Address Line 2</label>
                                <input type="text" name="Address2" value={formData.Address2} onChange={handleInput} className={inputClass} />
                            </div>

                            <div className="col-span-6 flex items-center gap-2">
                                <label className={labelClass}>Email Address</label>
                                <input type="email" name="Email" value={formData.Email} onChange={handleInput} className={inputClass} />
                            </div>

                            {/* Row 5 */}
                            <div className="col-span-6 flex items-center gap-2">
                                <label className={labelClass}>Web URL</label>
                                <input type="text" name="Web" value={formData.Web} onChange={handleInput} className={inputClass} />
                            </div>

                            <div className="col-span-6 flex items-center gap-2">
                                <label className={labelClass}>VAT Reg No</label>
                                <input type="text" name="Vat_Reg_No" value={formData.Vat_Reg_No} onChange={handleInput} className={inputClass} />
                            </div>

                            {/* Row 6 */}
                            <div className="col-span-4 flex items-center gap-2">
                                <label className={labelClass}>Credit Limit</label>
                                <input type="number" name="Credit_Limit" value={formData.Credit_Limit} onChange={handleInput} className={`${inputClass} text-right font-mono`} />
                            </div>

                            <div className="col-span-4 flex items-center gap-2">
                                <label className={labelClass}>Credit Period</label>
                                <input type="number" name="Credit_Period" value={formData.Credit_Period} onChange={handleInput} className={`${inputClass} text-right font-mono`} />
                            </div>

                            <div className="col-span-4 flex items-center justify-end">
                                <label className="flex items-center gap-3 cursor-pointer p-1.5 border border-slate-200 rounded-[5px] bg-slate-50 px-3 hover:bg-slate-100 transition-colors">
                                    <input type="checkbox" name="Inactive" checked={formData.Inactive} onChange={handleInput} className="w-4 h-4 text-[#0285fd] border-slate-300 rounded focus:ring-[#00D1FF]" />
                                    <span className="text-[11px] font-bold text-gray-600 select-none uppercase tracking-widest">Mark as Inactive</span>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
            </SimpleModal>

            {/* Lookups Modals */}
            
            {/* Customer Search */}
            <SimpleModal
                isOpen={showSearchModal}
                onClose={() => setShowSearchModal(false)}
                title="Customer Directory Lookup"
                maxWidth="max-w-[600px]"
            >
                <div className="space-y-4 font-['Tahoma']">
                    <div className="flex items-center gap-4 p-3 rounded-[5px] border border-slate-200 bg-white mb-2">
                        <span className="text-[12px] font-bold text-gray-500 uppercase tracking-widest">Search Facility</span>
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                            <input
                                type="text"
                                placeholder="Find customer by name or code..."
                                className="w-full h-9 pl-10 pr-4 border border-slate-200 rounded outline-none text-sm bg-slate-50 transition-all focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20"
                                value={custSearch}
                                onChange={(e) => setCustSearch(e.target.value)}
                                autoFocus
                            />
                        </div>
                    </div>
                    <div className="border border-slate-200 rounded-[5px] overflow-hidden shadow-sm">
                        <div className="max-h-[400px] overflow-y-auto no-scrollbar">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50/80 sticky top-0 text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest border-b border-slate-200">
                                    <tr>
                                        <th className="px-5 py-3">Code</th>
                                        <th className="px-5 py-3">Customer Name</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 bg-white">
                                    {customerList
                                        .filter(c => ((c.cust_Name || c.Cust_Name || c.name || c.Name) || '').toLowerCase().includes(custSearch.toLowerCase()) || ((c.code || c.Code) || '').toLowerCase().includes(custSearch.toLowerCase()))
                                        .map((c, i) => (
                                        <tr key={i} className="group hover:bg-blue-50/50 cursor-pointer transition-colors" onClick={() => loadCustomer(c)}>
                                            <td className="px-5 py-3 font-mono text-[12px] text-gray-700">{c.code || c.Code}</td>
                                            <td className="px-5 py-3 text-[12px] font-bold text-gray-700 group-hover:text-blue-600">{c.cust_Name || c.Cust_Name || c.name || c.Name}</td>
                                        </tr>
                                    ))}
                                    {customerList.length === 0 && (
                                        <tr>
                                            <td colSpan="2" className="text-center py-6 text-gray-300 text-[12px] font-bold uppercase tracking-widest">No records found</td>
                                        </tr>
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
                maxWidth="max-w-[500px]"
            >
                <div className="space-y-4 font-['Tahoma']">
                    <div className="flex items-center gap-4 p-3 rounded-[5px] border border-slate-200 bg-white mb-2">
                        <span className="text-[12px] font-bold text-gray-500 uppercase tracking-widest">Search Facility</span>
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                            <input
                                type="text"
                                placeholder="Find customer type..."
                                className="w-full h-9 pl-10 pr-4 border border-slate-200 rounded outline-none text-sm bg-slate-50 transition-all focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20"
                                value={typeSearch}
                                onChange={(e) => setTypeSearch(e.target.value)}
                                autoFocus
                            />
                        </div>
                    </div>
                    <div className="border border-slate-200 rounded-[5px] overflow-hidden shadow-sm">
                        <div className="max-h-[300px] overflow-y-auto no-scrollbar">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50/80 sticky top-0 text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest border-b border-slate-200">
                                    <tr>
                                        <th className="px-5 py-3">Code</th>
                                        <th className="px-5 py-3">Type Name</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 bg-white">
                                    {typeList
                                        .filter(t => ((t.name || t.Name) || '').toLowerCase().includes(typeSearch.toLowerCase()) || ((t.code || t.Code) || '').toLowerCase().includes(typeSearch.toLowerCase()))
                                        .map((t, i) => (
                                        <tr key={i} className="group hover:bg-blue-50/50 cursor-pointer transition-colors" onClick={() => { setFormData(prev => ({ ...prev, Type_Code: t.code || t.Code, Type_Name: t.name || t.Name })); setShowTypeModal(false); setTypeSearch(''); }}>
                                            <td className="px-5 py-3 font-mono text-[12px] text-gray-700">{t.code || t.Code}</td>
                                            <td className="px-5 py-3 text-[12px] font-bold text-gray-700 group-hover:text-blue-600">{t.name || t.Name}</td>
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
                maxWidth="max-w-[500px]"
            >
                <div className="space-y-4 font-['Tahoma']">
                    <div className="flex items-center gap-4 p-3 rounded-[5px] border border-slate-200 bg-white mb-2">
                        <span className="text-[12px] font-bold text-gray-500 uppercase tracking-widest">Search Facility</span>
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                            <input
                                type="text"
                                placeholder="Find area..."
                                className="w-full h-9 pl-10 pr-4 border border-slate-200 rounded outline-none text-sm bg-slate-50 transition-all focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20"
                                value={areaSearch}
                                onChange={(e) => setAreaSearch(e.target.value)}
                                autoFocus
                            />
                        </div>
                    </div>
                    <div className="border border-slate-200 rounded-[5px] overflow-hidden shadow-sm">
                        <div className="max-h-[300px] overflow-y-auto no-scrollbar">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50/80 sticky top-0 text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest border-b border-slate-200">
                                    <tr>
                                        <th className="px-5 py-3">Code</th>
                                        <th className="px-5 py-3">Area Name</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 bg-white">
                                    {areaList
                                        .filter(a => ((a.name || a.Name) || '').toLowerCase().includes(areaSearch.toLowerCase()) || ((a.code || a.Code) || '').toLowerCase().includes(areaSearch.toLowerCase()))
                                        .map((a, i) => (
                                        <tr key={i} className="group hover:bg-blue-50/50 cursor-pointer transition-colors" onClick={() => { setFormData(prev => ({ ...prev, Area: a.code || a.Code, AreaName: a.name || a.Name })); setShowAreaModal(false); setAreaSearch(''); }}>
                                            <td className="px-5 py-3 font-mono text-[12px] text-gray-700">{a.code || a.Code}</td>
                                            <td className="px-5 py-3 text-[12px] font-bold text-gray-700 group-hover:text-blue-600">{a.name || a.Name}</td>
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
                    <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm" onClick={() => !loading && setShowDeleteConfirm(false)} />
 <div className="relative w-full max-w-md bg-white rounded-sm shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="p-8 text-center">
                            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-white shadow-lg"><AlertTriangle size={40} className="text-red-500" /></div>
                            <h3 className="text-lg font-black text-slate-800 mb-2 uppercase tracking-wider">Confirm Deletion</h3>
                            <p className="text-slate-500 text-[12px] font-medium leading-relaxed mb-8">Are you sure you want to delete <span className="font-bold text-slate-800 uppercase">"{formData.Name || formData.Code}"</span>?<br />This action is permanent and cannot be undone.</p>
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

export default CustomerMasterBoard;
