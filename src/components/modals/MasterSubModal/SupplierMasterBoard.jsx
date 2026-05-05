import React, { useState, useEffect } from 'react';
import SimpleModal from '../../SimpleModal';
import { Search, RotateCcw, Save, Trash2, Loader2, X, Truck, Briefcase } from 'lucide-react';
import { supplierService } from '../../../services/supplier.service';
import ConfirmModal from '../../modals/ConfirmModal';
import { toast } from 'react-hot-toast';

const SupplierMasterBoard = ({ isOpen, onClose }) => {
    const initialState = {
        Code: '',
        Supplier_Name: '',
        Destibution_Name: '',
        Address1: '',
        Address2: '',
        Phone: '',
        Fax: '',
        Email: '',
        Web: '',
        Contact_Person: '',
        Credit_Period: '0',
        Bank_Name: '',
        Bank_Code: '',
        Brunch: '',
        AC_Number: '',
        VAT_Number: '',
        Vend_Typ: '',
        Locked: false,
        Company: '',
        CurrentUser: 'SYSTEM'
    };

    const [formData, setFormData] = useState(initialState);
    const [banks, setBanks] = useState([]);
    const [vendorTypes, setVendorTypes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [showSearchModal, setShowSearchModal] = useState(false);
    const [suppliersList, setSuppliersList] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [showVTModal, setShowVTModal] = useState(false);
    const [vtSearchQuery, setVtSearchQuery] = useState('');
    const [showBankModal, setShowBankModal] = useState(false);
    const [bankSearchQuery, setBankSearchQuery] = useState('');
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchLookups();
            const user = JSON.parse(localStorage.getItem('user'));
            const companyData = localStorage.getItem('selectedCompany');
            
            let companyCode = 'C001';
            if (companyData) {
                try {
                    const parsed = JSON.parse(companyData);
                    companyCode = parsed.company_Code || parsed.companyCode || parsed.CompanyCode || companyData;
                } catch (e) {
                    companyCode = companyData;
                }
            }

            if (user) {
                setFormData(prev => ({ 
                    ...prev, 
                    CurrentUser: user.emp_Name || user.empName || user.EmpName || user.Emp_Name || 'SYSTEM',
                    Company: companyCode
                }));
            }
        }
    }, [isOpen]);

    const fetchLookups = async () => {
        try {
            const [banksData, typesData] = await Promise.all([
                supplierService.getBanks(),
                supplierService.getVendorTypes()
            ]);
            setBanks(banksData);
            setVendorTypes(typesData);
        } catch (error) {
            console.error('Lookup fetch error:', error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleClear = () => {
        const user = JSON.parse(localStorage.getItem('user'));
        const companyData = localStorage.getItem('selectedCompany');
        let companyCode = 'C001';
        if (companyData) {
            try {
                const parsed = JSON.parse(companyData);
                companyCode = parsed.company_Code || parsed.companyCode || parsed.CompanyCode || companyData;
            } catch (e) {}
        }

        setFormData({
            ...initialState,
            CurrentUser: user?.emp_Name || user?.empName || 'SYSTEM',
            Company: companyCode
        });
        setIsEditMode(false);
    };

    const handleSave = async () => {
        if (!formData.Supplier_Name) {
            toast.error('Supplier Name is required');
            return;
        }
        if (!formData.Vend_Typ) {
            toast.error('Vendor Type is required');
            return;
        }

        setLoading(true);
        try {
            const payload = {
                ...formData,
                Bank_Code: String(formData.Bank_Code || ''),
                Credit_Period: String(formData.Credit_Period || '0')
            };

            if (isEditMode) {
                await supplierService.update(formData.Code, payload);
                toast.success('Supplier updated successfully');
            } else {
                const response = await supplierService.create(payload);
                setFormData(prev => ({ ...prev, Code: response.code }));
                toast.success(`Supplier created: ${response.code}`);
                setIsEditMode(true);
            }
        } catch (error) {
            toast.error(typeof error === 'string' ? error : (error.message || 'Operation failed'));
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!isEditMode || !formData.Code) return;
        setShowConfirmModal(true);
    };

    const confirmDelete = async () => {
        setLoading(true);
        try {
            await supplierService.delete(formData.Code);
            toast.success('Supplier deleted');
            handleClear();
            setShowConfirmModal(false);
        } catch (error) {
            toast.error(error);
        } finally {
            setLoading(false);
        }
    };

    const openSearch = async () => {
        setLoading(true);
        try {
            const data = await supplierService.getAll();
            setSuppliersList(data);
            setShowSearchModal(true);
        } catch (err) {
            toast.error('Failed to load suppliers');
        } finally {
            setLoading(false);
        }
    };

    const selectSupplier = async (code) => {
        setLoading(true);
        try {
            const data = await supplierService.getByCode(code);
            setFormData({
                Code: data.code || data.Code,
                Supplier_Name: data.supplier_Name || data.Supplier_Name,
                Destibution_Name: data.destibution_Name || data.Destibution_Name,
                Address1: data.address1 || data.Address1,
                Address2: data.address2 || data.Address2,
                Phone: data.phone || data.Phone,
                Fax: data.fax || data.Fax,
                Email: data.email || data.Email,
                Web: data.web || data.Web,
                Contact_Person: data.contact_Person || data.Contact_Person,
                Credit_Period: data.credit_Period || data.Credit_Period,
                Bank_Name: data.bank_Name || data.Bank_Name,
                Bank_Code: String(data.bank_Code || data.Bank_Code || ''),
                Brunch: data.brunch || data.Brunch,
                AC_Number: data.ac_Number || data.AC_Number,
                VAT_Number: data.vat_Number || data.VAT_Number,
                Vend_Typ: data.vend_Typ || data.Vend_Typ,
                Locked: (data.locked || data.Locked) === 1 || data.locked === true,
                Company: formData.Company,
                CurrentUser: formData.CurrentUser
            });
            setIsEditMode(true);
            setShowSearchModal(false);
            toast.success('Supplier loaded');
        } catch (error) {
            toast.error(error);
        } finally {
            setLoading(false);
        }
    };

    const footer = (
        <div className="bg-white px-6 py-3 w-full flex justify-end gap-3 border-t border-gray-50 mt-1 rounded-b-xl">
            <button 
                onClick={handleSave} 
                disabled={loading} 
                className={`px-8 h-9 bg-[#5cb85c] text-white text-[13px] font-bold rounded-[4px] shadow-md shadow-green-50 hover:bg-[#4cae4c] transition-all active:scale-95 flex items-center justify-center gap-2 border-none ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} 
                {isEditMode ? 'Update' : 'Save'}
            </button>
            <button 
                onClick={handleDelete} 
                disabled={!isEditMode || loading} 
                className={`px-8 h-9 bg-[#d9534f] text-white text-[13px] font-bold rounded-[4px] shadow-md shadow-red-50 hover:bg-[#c9302c] transition-all active:scale-95 flex items-center justify-center gap-2 border-none ${(!isEditMode || loading) ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
                <Trash2 size={16} /> Delete
            </button>
            <button 
                onClick={handleClear} 
                className="px-8 h-9 bg-[#42a5f5] text-white text-[13px] font-bold rounded-[4px] shadow-md shadow-blue-50 hover:bg-[#2196f3] transition-all active:scale-95 flex items-center justify-center gap-2 border-none"
            >
                <RotateCcw size={16} /> Clear
            </button>
        </div>
    );

    return (
        <>
            <SimpleModal isOpen={isOpen} onClose={onClose} title="Supplier Master Directory" maxWidth="max-w-[720px]" footer={footer} showHeaderClose={true}>
                <div className="py-2 px-1 select-none font-['Tahoma'] space-y-3 text-[12px] mt-1">
                    {/* Header Section */}
                    <div className="border-b border-gray-100 pb-3 flex items-center justify-center">
                        <h2 className="text-[15px] font-black text-slate-800 uppercase tracking-tight">Enter New Supplier Details & Update</h2>
                    </div>

                    <div className="space-y-2.5">
                        {/* Supplier ID / Name */}
                        <div className="flex items-center gap-3">
                            <label className="w-32 font-bold text-slate-600 shrink-0">Supplier ID / Name</label>
                            <div className="flex-1 flex gap-2 h-8">
                                <input 
                                    type="text" 
                                    name="Code" 
                                    value={formData.Code} 
                                    readOnly 
                                    className="w-24 border border-gray-300 px-2 bg-white rounded-[3px] outline-none font-bold text-blue-600 shadow-sm text-center" 
                                />
                                <input 
                                    type="text" 
                                    name="Supplier_Name" 
                                    value={formData.Supplier_Name} 
                                    onChange={handleInputChange} 
                                    className="flex-1 border border-gray-300 px-2 bg-[#eff4ff] rounded-[3px] outline-none focus:border-[#0285fd] shadow-sm transition-all font-medium text-slate-800" 
                                />
                                <button onClick={openSearch} className="w-9 h-8 bg-[#4285f4] text-white flex items-center justify-center hover:bg-[#3367d6] rounded-[3px] transition-all shadow-md active:scale-95 shrink-0">
                                    <Search size={18} />
                                </button>
                            </div>
                        </div>

                        {/* Distribution Company */}
                        <div className="flex items-center gap-3">
                            <label className="w-32 font-bold text-slate-600 shrink-0">Distrb. Company</label>
                            <input 
                                type="text" 
                                name="Destibution_Name" 
                                value={formData.Destibution_Name} 
                                onChange={handleInputChange} 
                                className="flex-1 h-8 border border-gray-300 px-3 bg-[#eff4ff] rounded-[3px] outline-none focus:border-[#0285fd] shadow-sm font-medium text-slate-800" 
                            />
                        </div>

                        {/* Address Lines */}
                        <div className="flex items-center gap-3">
                            <label className="w-32 font-bold text-slate-600 shrink-0">Address 1</label>
                            <input 
                                type="text" 
                                name="Address1" 
                                value={formData.Address1} 
                                onChange={handleInputChange} 
                                className="flex-1 h-8 border border-gray-300 px-3 bg-[#eff4ff] rounded-[3px] outline-none focus:border-[#0285fd] shadow-sm font-medium text-slate-800" 
                            />
                        </div>
                        <div className="flex items-center gap-3">
                            <label className="w-32 font-bold text-slate-600 shrink-0">Address 2</label>
                            <input 
                                type="text" 
                                name="Address2" 
                                value={formData.Address2} 
                                onChange={handleInputChange} 
                                className="flex-1 h-8 border border-gray-300 px-3 bg-[#eff4ff] rounded-[3px] outline-none focus:border-[#0285fd] shadow-sm font-medium text-slate-800" 
                            />
                        </div>

                        {/* Phone and Fax */}
                        <div className="flex items-center gap-3">
                            <label className="w-32 font-bold text-slate-600 shrink-0">Phone Number</label>
                            <div className="flex-1 flex items-center gap-3 h-8">
                                <input 
                                    type="text" 
                                    name="Phone" 
                                    value={formData.Phone} 
                                    onChange={handleInputChange} 
                                    className="flex-1 h-full border border-gray-300 px-3 bg-[#eff4ff] rounded-[3px] outline-none focus:border-[#0285fd] shadow-sm font-medium text-slate-800" 
                                />
                                <label className="w-16 font-bold text-slate-600 text-center">Fax</label>
                                <input 
                                    type="text" 
                                    name="Fax" 
                                    value={formData.Fax || 'N/A'} 
                                    onChange={handleInputChange} 
                                    className="flex-1 h-full border border-gray-300 px-3 bg-[#eff4ff] rounded-[3px] outline-none focus:border-[#0285fd] shadow-sm font-medium text-slate-800" 
                                />
                            </div>
                        </div>

                        {/* Email Address */}
                        <div className="flex items-center gap-3">
                            <label className="w-32 font-bold text-slate-600 shrink-0">E-Mail Address</label>
                            <input 
                                type="email" 
                                name="Email" 
                                value={formData.Email} 
                                onChange={handleInputChange} 
                                className="flex-1 h-8 border border-gray-300 px-3 bg-[#eff4ff] rounded-[3px] outline-none focus:border-[#0285fd] shadow-sm font-medium text-slate-800" 
                            />
                        </div>

                        {/* Web Site */}
                        <div className="flex items-center gap-3">
                            <label className="w-32 font-bold text-slate-600 shrink-0">Web Site</label>
                            <input 
                                type="text" 
                                name="Web" 
                                value={formData.Web} 
                                onChange={handleInputChange} 
                                className="flex-1 h-8 border border-gray-300 px-3 bg-[#eff4ff] rounded-[3px] outline-none focus:border-[#0285fd] shadow-sm font-medium text-slate-800" 
                            />
                        </div>

                        {/* Contact Person */}
                        <div className="flex items-center gap-3">
                            <label className="w-32 font-bold text-slate-600 shrink-0">Contact Person</label>
                            <input 
                                type="text" 
                                name="Contact_Person" 
                                value={formData.Contact_Person} 
                                onChange={handleInputChange} 
                                className="flex-1 h-8 border border-gray-300 px-3 bg-white rounded-[3px] outline-none focus:border-[#0285fd] shadow-sm font-medium text-slate-800" 
                            />
                        </div>

                        {/* Vendor Type and VAT */}
                        <div className="flex items-center gap-3">
                            <label className="w-32 font-bold text-slate-600 shrink-0">Vendor Type</label>
                            <div className="flex-1 flex items-center gap-3 h-8">
                                <div className="flex-1 flex gap-2 h-full">
                                    <input 
                                        type="text" 
                                        name="Vend_Typ" 
                                        value={formData.Vend_Typ} 
                                        readOnly 
                                        className="flex-1 border border-gray-300 px-3 bg-white rounded-[3px] outline-none shadow-sm cursor-default font-medium text-slate-800" 
                                    />
                                    <button 
                                        onClick={() => setShowVTModal(true)} 
                                        className="w-9 h-8 bg-[#4285f4] text-white flex items-center justify-center hover:bg-[#3367d6] rounded-[3px] transition-all shadow-md active:scale-95 shrink-0"
                                    >
                                        <Search size={18} />
                                    </button>
                                </div>
                                <label className="w-24 font-bold text-slate-600 text-center">VAT Reg. No</label>
                                <input 
                                    type="text" 
                                    name="VAT_Number" 
                                    value={formData.VAT_Number} 
                                    onChange={handleInputChange} 
                                    className="flex-1 h-full border border-gray-300 px-3 bg-white rounded-[3px] outline-none focus:border-[#0285fd] shadow-sm font-medium text-slate-800" 
                                />
                            </div>
                        </div>

                        {/* Credit Period and Status */}
                        <div className="flex items-center gap-3">
                            <label className="w-32 font-bold text-slate-600 shrink-0">Credit Period</label>
                            <div className="flex-1 flex items-center justify-between h-8">
                                <input 
                                    type="text" 
                                    name="Credit_Period" 
                                    value={formData.Credit_Period} 
                                    onChange={handleInputChange} 
                                    className="w-48 h-full border border-gray-300 px-3 bg-white rounded-[3px] outline-none focus:border-[#0285fd] text-center shadow-sm font-medium text-slate-800" 
                                />
                                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-600 group">
                                    <input 
                                        type="checkbox" 
                                        name="Locked" 
                                        checked={formData.Locked} 
                                        onChange={handleInputChange} 
                                        className="w-4 h-4 rounded-[2px] border-gray-300 text-[#0285fd] focus:ring-[#0285fd] shadow-sm transition-all" 
                                    /> 
                                    <span className={`transition-colors text-[12.5px] ${formData.Locked ? 'text-red-500' : 'text-slate-500'}`}>Supplier is Inactive</span>
                                </label>
                            </div>
                        </div>

                        {/* Bank Detail and Branch */}
                        <div className="flex items-center gap-3">
                            <label className="w-32 font-bold text-slate-600 shrink-0">Bank Detail</label>
                            <div className="flex-1 flex items-center gap-3 h-8">
                                <div className="flex-1 flex gap-2 h-full">
                                    <input 
                                        type="text" 
                                        name="Bank_Name" 
                                        value={formData.Bank_Name} 
                                        readOnly 
                                        className="flex-1 border border-gray-300 px-3 bg-white rounded-[3px] outline-none shadow-sm cursor-default font-medium text-slate-800" 
                                    />
                                    <button 
                                        onClick={() => setShowBankModal(true)} 
                                        className="w-9 h-8 bg-[#4285f4] text-white flex items-center justify-center hover:bg-[#3367d6] rounded-[3px] transition-all shadow-md active:scale-95 shrink-0"
                                    >
                                        <Search size={18} />
                                    </button>
                                </div>
                                <label className="w-16 font-bold text-slate-600 text-center">Branch</label>
                                <input 
                                    type="text" 
                                    name="Brunch" 
                                    value={formData.Brunch} 
                                    onChange={handleInputChange} 
                                    className="flex-1 h-full border border-gray-300 px-3 bg-white rounded-[3px] outline-none focus:border-[#0285fd] shadow-sm font-medium text-slate-800" 
                                />
                            </div>
                        </div>

                        {/* A/C Number */}
                        <div className="flex items-center gap-3">
                            <label className="w-32 font-bold text-slate-600 shrink-0">A/C Number</label>
                            <input 
                                type="text" 
                                name="AC_Number" 
                                value={formData.AC_Number} 
                                onChange={handleInputChange} 
                                className="flex-1 h-8 border border-gray-300 px-3 bg-[#eff4ff] rounded-[3px] outline-none focus:border-[#0285fd] shadow-sm font-medium text-slate-800" 
                            />
                        </div>
                    </div>
                </div>
            </SimpleModal>



            {/* Vendor Type Search Modal */}
            {showVTModal && (
                <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 font-['Tahoma']">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setShowVTModal(false)} />
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
                                <span className="text-[15px] font-[700] text-slate-900 uppercase tracking-[3px] font-mono truncate">Vendor Type Directory Lookup</span>
                            </div>
                            <button
                                onClick={() => setShowVTModal(false)}
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
                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest text-center">Search Facility</span>
                            </div>
                            <input 
                                type="text" 
                                placeholder="Search types..." 
                                className="h-9 border border-gray-300 px-3 text-xs rounded-[5px] w-72 focus:border-[#0285fd] outline-none shadow-sm transition-all" 
                                value={vtSearchQuery} 
                                onChange={(e) => setVtSearchQuery(e.target.value)} 
                            />
                        </div>

                        {/* Results List */}
                        <div className="p-2">
                            <div className=" px-3 py-1.5 flex text-[10px] font-bold text-gray-600 border-b border-gray-200 uppercase tracking-wider">
                                <span className="w-24 text-center">ID</span>
                                <span className="flex-1 px-3">Vendor Type</span>
                                <span className="pr-40">Payable A/C</span>
                            </div>
                            <div className="max-h-[350px] overflow-y-auto custom-scrollbar">
                                {vendorTypes.filter(v => (v.vendorTypes || v.VendorTypes || '').toLowerCase().includes(vtSearchQuery.toLowerCase())).map((v, idx) => (
                                    <button 
                                        key={idx} 
                                        onClick={() => {
                                            setFormData(prev => ({ ...prev, Vend_Typ: v.vendorTypes || v.VendorTypes }));
                                            setShowVTModal(false);
                                        }}
                                        className="w-full flex items-center justify-between px-3 py-2 text-xs border-b border-gray-100 hover:bg-blue-50 transition-all text-left group"
                                    >
                                        <div className="flex items-center gap-2 flex-1">
                                            <span className="w-24 text-center font-mono text-[11px] font-bold text-[#0078d4]">
                                                {v.id || v.Id}
                                            </span>
                                            <span className="flex-1 px-3 font-mono font-medium text-gray-700 uppercase">
                                                {v.vendorTypes || v.VendorTypes}
                                            </span>
                                            <span className="w-40 px-3 font-mono text-gray-500 text-[10px]">
                                                {v.paybleAccCode || v.PaybleAccCode}
                                            </span>
                                        </div>
                                        <div className="bg-[#e49e1b] text-white text-[10px] px-5 py-1.5 rounded-md font-bold hover:bg-[#cb9b34] shadow-sm transition-all active:scale-95 uppercase">Select</div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="bg-gray-50 px-4 py-2 border-t border-gray-200 flex justify-between items-center text-[10px] text-gray-400">
                            <span>{vendorTypes.length} Types Available</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Bank Search Modal */}
            {showBankModal && (
                <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 font-['Tahoma']">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setShowBankModal(false)} />
                    <div className="relative w-full max-w-xl bg-white shadow-2xl rounded-xl border border-gray-100 overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
                        {/* Header */}
                        <div className="bg-white px-6 py-4 flex items-center justify-between border-b border-gray-100 select-none relative overflow-hidden">
                            {/* System Color Left Accent */}
                            <div 
                                className="absolute left-0 top-0 bottom-0 w-1.5 transition-colors duration-500" 
                                style={{ backgroundColor: localStorage.getItem('topBarColor') || '#0285fd' }}
                            />
                            <div className="flex items-center gap-2">
                                <Search size={16} className="text-[#0078d4]" />
                                <span className="text-[15px] font-[700] text-slate-900 uppercase tracking-[3px] font-mono truncate">Bank Directory Lookup</span>
                            </div>
                            <button
                                onClick={() => setShowBankModal(false)}
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
                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest text-center">Search Facility</span>
                            </div>
                            <input 
                                type="text" 
                                placeholder="Select and search bank repository..." 
                                className="h-9 border border-gray-300 px-3 text-xs rounded-[5px] w-72 focus:border-[#0285fd] outline-none shadow-sm transition-all" 
                                value={bankSearchQuery} 
                                onChange={(e) => setBankSearchQuery(e.target.value)} 
                            />
                        </div>

                        {/* Results List */}
                        <div className="p-2">
                            <div className=" px-3 py-1.5 flex text-[10px] font-bold text-gray-600 border-b border-gray-200 uppercase tracking-wider">
                                <span className="w-24 text-center">Code</span>
                                <span className="flex-1 px-3">Bank Name</span>
                            </div>
                            <div className="max-h-[350px] overflow-y-auto custom-scrollbar">
                                {banks.filter(b => (b.name || b.Name || '').toLowerCase().includes(bankSearchQuery.toLowerCase()) || (b.code || b.Code || '').toLowerCase().includes(bankSearchQuery.toLowerCase())).map((b, idx) => (
                                    <button 
                                        key={idx} 
                                        onClick={() => {
                                            setFormData(prev => ({ ...prev, Bank_Code: b.code || b.Code, Bank_Name: b.name || b.Name }));
                                            setShowBankModal(false);
                                        }}
                                        className="w-full flex items-center justify-between px-3 py-2 text-xs border-b border-gray-100 hover:bg-blue-50 transition-all text-left group"
                                    >
                                        <div className="flex items-center gap-2 flex-1">
                                            <span className="w-24 text-center font-mono text-[11px] font-bold text-[#0078d4]">
                                                {b.code || b.Code}
                                            </span>
                                            <span className="flex-1 px-3 font-mono font-medium text-gray-700 uppercase">
                                                {b.name || b.Name}
                                            </span>
                                        </div>
                                        <div className="bg-[#e49e1b] text-white text-[10px] px-5 py-1.5 rounded-md font-bold hover:bg-[#cb9b34] shadow-sm transition-all active:scale-95 uppercase">Select</div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="bg-gray-50 px-4 py-2 border-t border-gray-200 flex justify-between items-center text-[10px] text-gray-400">
                            <span>{banks.length} Banks Registered</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Supplier Search Modal */}
            {showSearchModal && (
                <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 font-['Tahoma']">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setShowSearchModal(false)} />
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
                                <span className="text-[15px] font-[700] text-slate-900 uppercase tracking-[3px] font-mono truncate">Supplier Records Lookup</span>
                            </div>
                            <button
                                onClick={() => setShowSearchModal(false)}
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
                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest text-center">Search Facility</span>
                            </div>
                            <input 
                                type="text" 
                                placeholder="Find by Name, Code or Phone..." 
                                className="h-10 border border-gray-300 px-4 text-sm rounded-md w-80 focus:border-[#0285fd] outline-none shadow-sm transition-all" 
                                value={searchQuery} 
                                onChange={(e) => setSearchQuery(e.target.value)} 
                            />
                        </div>

                        {/* Results List */}
                        <div className="p-2">
                            <div className=" px-3 py-1.5 flex text-[10px] font-bold text-gray-600 border-b border-gray-200 uppercase tracking-wider">
                                <span className="w-24 text-center">Code</span>
                                <span className="flex-1 px-5">Supplier Name</span>
                                <span className="pr-40">Phone</span>
                            </div>
                            <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                                {suppliersList.filter(s => (s.supplier_Name || s.Supplier_Name || '').toLowerCase().includes(searchQuery.toLowerCase()) || (s.code || s.Code || '').toLowerCase().includes(searchQuery.toLowerCase())).map(s => (
                                    <button 
                                        key={s.code || s.Code} 
                                        onClick={() => selectSupplier(s.code || s.Code)}
                                        className="w-full flex items-center justify-between px-3 py-2 text-xs border-b border-gray-100 hover:bg-blue-50 transition-all text-left group"
                                    >
                                        <div className="flex items-center gap-2 flex-1">
                                            <span className="w-24 text-center font-mono text-[11px] font-bold text-[#0078d4]">
                                                {s.code || s.Code}
                                            </span>
                                            <span className="flex-1 px-3 font-mono font-medium text-gray-700 uppercase">
                                                {s.supplier_Name || s.Supplier_Name}
                                            </span>
                                            <span className="w-32 px-3 font-mono text-gray-500">
                                                {s.phone || s.Phone}
                                            </span>
                                        </div>
                                        <div className="bg-[#e49e1b] text-white text-[10px] px-5 py-1.5 rounded-md font-bold hover:bg-[#cb9b34] shadow-sm transition-all active:scale-95 uppercase">Select</div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="bg-gray-50 px-4 py-2 border-t border-gray-200 flex justify-between items-center text-[10px] text-gray-400">
                            <span>{suppliersList.length} Result(s) Found</span>
                        </div>
                    </div>
                </div>
            )}

            <ConfirmModal 
                isOpen={showConfirmModal} 
                onClose={() => setShowConfirmModal(false)} 
                onConfirm={confirmDelete} 
                title="Delete Supplier" 
                message={`Are you sure you want to delete supplier ${formData.Supplier_Name}? This action cannot be undone.`} 
                variant="danger" 
                loading={loading} 
                confirmText="Delete Now"
            />
        </>
    );
};

export default SupplierMasterBoard;
