import React, { useState, useEffect } from 'react';
import SimpleModal from '../../../components/SimpleModal';
import TransactionFormWrapper from '../../../components/TransactionFormWrapper';
import { Search, Save, RotateCcw, Trash2, CheckCircle, AlertTriangle, Loader2, FileText } from 'lucide-react';
import { supplierService } from '../../../services/supplier.service';
import { showSuccessToast, showErrorToast } from '../../../utils/toastUtils';

const SupplierMasterBoard = ({ isOpen, onClose }) => {
    const initialState = {
        Code: '', Supplier_Name: '', Destibution_Name: '', Address1: '', Address2: '', Phone: '', Fax: '',
        Email: '', Web: '', Contact_Person: '', Credit_Period: '0', Bank_Name: '', Bank_Code: '', Brunch: '',
        AC_Number: '', VAT_Number: '', Vend_Typ: '', Locked: false, Company: '', CurrentUser: 'SYSTEM'
    };

    const [formData, setFormData] = useState(initialState);
    const [banks, setBanks] = useState([]);
    const [vendorTypes, setVendorTypes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const [showSearchModal, setShowSearchModal] = useState(false);
    const [suppliersList, setSuppliersList] = useState([]);
    const [showVTModal, setShowVTModal] = useState(false);
    const [showBankModal, setShowBankModal] = useState(false);

    const [supSearch, setSupSearch] = useState('');
    const [bankSearch, setBankSearch] = useState('');
    const [vtSearch, setVtSearch] = useState('');

    useEffect(() => {
        if (isOpen) {
            handleClear();
            fetchLookups();
            const user = JSON.parse(localStorage.getItem('user'));
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
                setFormData(prev => ({ ...prev, CurrentUser: user.emp_Name || user.empName || user.EmpName || user.Emp_Name || 'SYSTEM', Company: companyCode }));
            }
        }
    }, [isOpen]);

    const fetchLookups = async () => {
        try {
            const [banksData, typesData] = await Promise.all([supplierService.getBanks(), supplierService.getVendorTypes()]);
            setBanks(banksData); setVendorTypes(typesData);
        } catch (error) { console.error('Lookup fetch error:', error); }
    };

    const handleInput = (e) => {
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

    const handleSave = async () => {
        if (!formData.Supplier_Name) { showErrorToast('Supplier Name is required'); return; }
        if (!formData.Vend_Typ) { showErrorToast('Vendor Type is required'); return; }
        setLoading(true);
        try {
            const payload = { ...formData, Bank_Code: String(formData.Bank_Code || ''), Credit_Period: String(formData.Credit_Period || '0') };
            if (isEditMode) {
                await supplierService.update(formData.Code, payload);
                showSuccessToast('Supplier updated successfully');
            } else {
                const response = await supplierService.create(payload);
                setFormData(prev => ({ ...prev, Code: response.code }));
                showSuccessToast(`Supplier created: ${response.code}`);
                setIsEditMode(true);
            }
        } catch (error) {
            showErrorToast(typeof error === 'string' ? error : (error.message || 'Operation failed'));
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
            await supplierService.delete(formData.Code);
            showSuccessToast('Supplier deleted successfully');
            handleClear();
            setShowDeleteConfirm(false);
        } catch (error) {
            showErrorToast(error.toString());
        } finally {
            setLoading(false);
        }
    };

    const openSearch = async () => {
        setLoading(true);
        try {
            setSuppliersList(await supplierService.getAll());
            setShowSearchModal(true);
        } catch (err) {
            showErrorToast('Failed to load suppliers');
        } finally {
            setLoading(false);
        }
    };

    const selectSupplier = async (code) => {
        setLoading(true);
        try {
            const d = await supplierService.getByCode(code);
            setFormData({
                Code: d.code || d.Code,
                Supplier_Name: d.supplier_Name || d.Supplier_Name,
                Destibution_Name: d.destibution_Name || d.Destibution_Name,
                Address1: d.address1 || d.Address1,
                Address2: d.address2 || d.Address2,
                Phone: d.phone || d.Phone,
                Fax: d.fax || d.Fax,
                Email: d.email || d.Email,
                Web: d.web || d.Web,
                Contact_Person: d.contact_Person || d.Contact_Person,
                Credit_Period: d.credit_Period || d.Credit_Period,
                Bank_Name: d.bank_Name || d.Bank_Name,
                Bank_Code: String(d.bank_Code || d.Bank_Code || ''),
                Brunch: d.brunch || d.Brunch,
                AC_Number: d.ac_Number || d.aC_Number || d.AC_Number || d.ac_number || '',
                VAT_Number: d.vat_Number || d.vaT_Number || d.VAT_Number || d.vat_number || '',
                Vend_Typ: d.vend_Typ || d.Vend_Typ,
                Locked: (d.locked || d.Locked) === 1 || d.locked === true,
                Company: formData.Company,
                CurrentUser: formData.CurrentUser
            });
            setIsEditMode(true);
            setShowSearchModal(false);
        } catch (error) {
            showErrorToast(error.toString());
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <style>{`@keyframes toastProgress{0%{width:100%}100%{width:0%}}`}</style>
            <TransactionFormWrapper subtitle="Supplier Master" icon={FileText}
                isOpen={isOpen}
                onClose={onClose}
                title="Supplier Master"
                footer={
                    <div className="bg-slate-50 px-6 py-4 w-full flex justify-between items-center border-t border-slate-200 rounded-b-[5px]">
                        <div className="flex gap-3">
                            <button
                                onClick={handleDelete}
                                disabled={!isEditMode || loading}
                                className={`px-6 h-10 border border-red-300 text-red-600 bg-white hover:bg-red-50 font-semibold rounded-[3px] shadow-sm text-[13px] transition-all flex items-center gap-2 ${(!isEditMode || loading) ? 'opacity-40 cursor-not-allowed' : ''}`}
                            >
                                <Trash2 size={14} /> DELETE
                            </button>
                            <button
                                onClick={handleClear}
                                className="px-6 h-10 border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 font-semibold rounded-[3px] shadow-sm text-[13px] transition-all flex items-center gap-2"
                            >
                                <RotateCcw size={14} /> CLEAR
                            </button>
                        </div>
                        <button
                            onClick={handleSave}
                            disabled={loading}
                            className={`px-6 h-10 bg-[#0285fd] hover:bg-[#0073ff] text-white font-semibold rounded-[3px] shadow-sm text-[13px] transition-all flex items-center gap-2 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
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
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Supplier Code</label>
                                <div className="relative">
                                    <input
                                        type="text" name="Code"
                                        value={formData.Code}
                                        onChange={handleInput}
                                        className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-blue-600 font-bold cursor-pointer pr-10"
                                        placeholder="Auto Gen"
                                        readOnly
                                        onClick={openSearch}
                                    />
                                    <button onClick={openSearch} className="absolute right-1 top-1 bottom-1 w-8 flex items-center justify-center text-gray-500 hover:text-gray-800 bg-transparent border-none cursor-pointer">
                                        <Search size={16} />
                                    </button>
                                </div>
                            </div>

                            <div className="col-span-8">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Supplier Name</label>
                                <input type="text" name="Supplier_Name" value={formData.Supplier_Name} onChange={handleInput} className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700" />
                            </div>

                            <div className="col-span-4">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Distrb. Company</label>
                                <input type="text" name="Destibution_Name" value={formData.Destibution_Name} onChange={handleInput} className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700" />
                            </div>

                            <div className="col-span-4">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Vendor Type</label>
                                <div className="relative">
                                    <input
                                        type="text" readOnly
                                        value={formData.Vend_Typ}
                                        onClick={() => setShowVTModal(true)}
                                        className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] cursor-pointer pr-10 text-gray-700 truncate"
                                        placeholder="Select Type..."
                                    />
                                    <button onClick={() => setShowVTModal(true)} className="absolute right-1 top-1 bottom-1 w-8 flex items-center justify-center text-gray-500 hover:text-gray-800 bg-transparent border-none cursor-pointer">
                                        <Search size={16} />
                                    </button>
                                </div>
                            </div>

                            <div className="col-span-4">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Contact Person</label>
                                <input type="text" name="Contact_Person" value={formData.Contact_Person} onChange={handleInput} className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700" />
                            </div>

                            <div className="col-span-4">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Phone Number</label>
                                <input type="text" name="Phone" value={formData.Phone} onChange={handleInput} className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700" />
                            </div>

                            <div className="col-span-4">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Address Line 1</label>
                                <input type="text" name="Address1" value={formData.Address1} onChange={handleInput} className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700" />
                            </div>

                            <div className="col-span-4">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Fax</label>
                                <input type="text" name="Fax" value={formData.Fax} onChange={handleInput} className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700" />
                            </div>

                            <div className="col-span-4">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Address Line 2</label>
                                <input type="text" name="Address2" value={formData.Address2} onChange={handleInput} className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700" />
                            </div>

                            <div className="col-span-4">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Email Address</label>
                                <input type="email" name="Email" value={formData.Email} onChange={handleInput} className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700" />
                            </div>

                            <div className="col-span-4">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Website URL</label>
                                <input type="text" name="Web" value={formData.Web} onChange={handleInput} className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700" />
                            </div>

                            <div className="col-span-4">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">VAT Reg No</label>
                                <input type="text" name="VAT_Number" value={formData.VAT_Number} onChange={handleInput} className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700" />
                            </div>

                            <div className="col-span-4">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Bank Name</label>
                                <div className="relative">
                                    <input
                                        type="text" readOnly
                                        value={formData.Bank_Name}
                                        onClick={() => setShowBankModal(true)}
                                        className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] cursor-pointer pr-10 text-gray-700 truncate"
                                        placeholder="Select Bank..."
                                    />
                                    <button onClick={() => setShowBankModal(true)} className="absolute right-1 top-1 bottom-1 w-8 flex items-center justify-center text-gray-500 hover:text-gray-800 bg-transparent border-none cursor-pointer">
                                        <Search size={16} />
                                    </button>
                                </div>
                            </div>

                            <div className="col-span-4">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Branch Name</label>
                                <input type="text" name="Brunch" value={formData.Brunch} onChange={handleInput} className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700" />
                            </div>

                            <div className="col-span-4">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">A/C Number</label>
                                <input type="text" name="AC_Number" value={formData.AC_Number} onChange={handleInput} className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700" />
                            </div>

                            <div className="col-span-4">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Credit Period</label>
                                <input type="number" name="Credit_Period" value={formData.Credit_Period} onChange={handleInput} className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700 text-right font-mono" />
                            </div>

                            <div className="col-span-4 flex items-end">
                                <label className="flex items-center gap-2 cursor-pointer select-none">
                                    <input type="checkbox" name="Locked" checked={formData.Locked} onChange={handleInput} className="w-4 h-4 rounded border-gray-300 text-[#0285fd] focus:ring-[#0285fd]" />
                                    <span className="text-[13px] font-medium text-gray-700">Supplier Account Locked</span>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
            </TransactionFormWrapper>

            {/* Supplier Search */}
            <SimpleModal
                isOpen={showSearchModal}
                onClose={() => setShowSearchModal(false)}
                title="Supplier Directory Lookup"
            >
                <div className="space-y-4">
                    <div className="p-4 bg-slate-50 border-b border-gray-200">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <input
                                type="text"
                                placeholder="Find supplier..."
                                className="w-full h-10 pl-10 pr-4 border border-gray-300 rounded-[3px] outline-none text-[13px] focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] shadow-sm bg-white"
                                value={supSearch}
                                onChange={(e) => setSupSearch(e.target.value)}
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
                                        <th className=" px-5 py-3">Supplier Name</th>
                                    <th className="text-right px-5 py-3">Action</th></tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {suppliersList
                                        .filter(c => ((c.supplier_Name || c.Supplier_Name || c.name || c.Name) || '').toLowerCase().includes(supSearch.toLowerCase()) || ((c.code || c.Code) || '').toLowerCase().includes(supSearch.toLowerCase()))
                                        .map((c, i) => (
                                        <tr key={i} className="group hover:bg-blue-50/50  transition-all cursor-pointer group border-b border-gray-50" onClick={() => selectSupplier(c.code || c.Code)}>
                                            <td className="font-mono text-[12px] font-bold text-blue-600 px-5 py-3">{c.code || c.Code}</td>
                                            <td className="text-[12px] font-bold text-slate-700 uppercase group-hover:text-blue-600 transition-colors px-5 py-3">{c.supplier_Name || c.Supplier_Name || c.name || c.Name}</td>
                                        
                                            <td className="text-right px-5 py-3"><button className="bg-white text-[#0285fd] border border-[#0285fd] hover:bg-blue-50 text-[10px] px-5 py-2 rounded-[3px] font-black shadow-sm transition-all active:scale-95 uppercase">SELECT</button></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </SimpleModal>

            {/* Vendor Type Modal */}
            <SimpleModal
                isOpen={showVTModal}
                onClose={() => setShowVTModal(false)}
                title="Vendor Type Directory"
            >
                <div className="space-y-4">
                    <div className="p-4 bg-slate-50 border-b border-gray-200">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <input
                                type="text"
                                placeholder="Find vendor type..."
                                className="w-full h-10 pl-10 pr-4 border border-gray-300 rounded-[3px] outline-none text-[13px] focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] shadow-sm bg-white"
                                value={vtSearch}
                                onChange={(e) => setVtSearch(e.target.value)}
                                autoFocus
                            />
                        </div>
                    </div>
                    <div className="border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                        <div className="max-h-[300px] overflow-y-auto no-scrollbar">
                            <table className="w-full text-left">
                                <thead className="bg-[#f8fafc] sticky top-0 text-[11px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 shadow-sm z-10">
                                    <tr>
                                        <th className=" px-5 py-3">Vendor Type</th>
                                    <th className="text-right px-5 py-3">Action</th></tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {vendorTypes
                                        .filter(c => ((c.vendorTypes || c.VendorTypes || c.vend_Typ || c.Vend_Typ) || '').toLowerCase().includes(vtSearch.toLowerCase()))
                                        .map((v, i) => (
                                        <tr key={i} className="group hover:bg-blue-50/50  transition-all cursor-pointer group border-b border-gray-50" onClick={() => { setFormData(prev => ({ ...prev, Vend_Typ: v.vendorTypes || v.VendorTypes || v.vend_Typ || v.Vend_Typ })); setShowVTModal(false); }}>
                                            <td className="text-[12px] font-bold text-slate-700 uppercase group-hover:text-blue-600 transition-colors px-5 py-3">{v.vendorTypes || v.VendorTypes || v.vend_Typ || v.Vend_Typ}</td>
                                        
                                            <td className="text-right px-5 py-3"><button className="bg-white text-[#0285fd] border border-[#0285fd] hover:bg-blue-50 text-[10px] px-5 py-2 rounded-[3px] font-black shadow-sm transition-all active:scale-95 uppercase">SELECT</button></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </SimpleModal>

            {/* Bank Modal */}
            <SimpleModal
                isOpen={showBankModal}
                onClose={() => setShowBankModal(false)}
                title="Bank Directory Lookup"
            >
                <div className="space-y-4">
                    <div className="p-4 bg-slate-50 border-b border-gray-200">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <input
                                type="text"
                                placeholder="Find bank..."
                                className="w-full h-10 pl-10 pr-4 border border-gray-300 rounded-[3px] outline-none text-[13px] focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] shadow-sm bg-white"
                                value={bankSearch}
                                onChange={(e) => setBankSearch(e.target.value)}
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
                                        <th className=" px-5 py-3">Bank Name</th>
                                    <th className="text-right px-5 py-3">Action</th></tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {banks
                                        .filter(c => ((c.name || c.Name) || '').toLowerCase().includes(bankSearch.toLowerCase()) || ((c.code || c.Code) || '').toLowerCase().includes(bankSearch.toLowerCase()))
                                        .map((b, i) => (
                                        <tr key={i} className="group hover:bg-blue-50/50  transition-all cursor-pointer group border-b border-gray-50" onClick={() => { setFormData(prev => ({ ...prev, Bank_Code: b.code || b.Code, Bank_Name: b.name || b.Name })); setShowBankModal(false); }}>
                                            <td className="font-mono text-[12px] font-bold text-blue-600 px-5 py-3">{b.code || b.Code}</td>
                                            <td className="text-[12px] font-bold text-slate-700 uppercase group-hover:text-blue-600 transition-colors px-5 py-3">{b.name || b.Name}</td>
                                        
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
                            <p className="text-slate-500 text-[12px] font-medium leading-relaxed mb-8">Are you sure you want to delete <span className="font-bold text-slate-800 uppercase">"{formData.Supplier_Name || formData.Code}"</span>?<br />This action is permanent and cannot be undone.</p>
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

export default SupplierMasterBoard;
