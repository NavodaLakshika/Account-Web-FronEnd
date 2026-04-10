import React, { useState, useEffect } from 'react';
import SimpleModal from '../components/SimpleModal';
import { Search, RotateCcw, Save, Trash2, Loader2, X } from 'lucide-react';
import { supplierService } from '../services/supplier.service';
import { toast } from 'react-hot-toast';

const VendorBoard = ({ isOpen, onClose }) => {
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

    useEffect(() => {
        if (isOpen) {
            fetchLookups();
            const user = JSON.parse(localStorage.getItem('user'));
            const company = JSON.parse(localStorage.getItem('selectedCompany'));
            if (user) {
                setFormData(prev => ({ 
                    ...prev, 
                    CurrentUser: user.emp_Name || 'SYSTEM',
                    Company: company?.company_Code || ''
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
        setFormData({
            ...initialState,
            CurrentUser: formData.CurrentUser,
            Company: formData.Company
        });
        setIsEditMode(false);
        toast.success('Form cleared');
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
            // Ensure data types match DTO (Credit_Period and Bank_Code must be strings)
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
        if (!window.confirm('Are you sure you want to delete this supplier?')) return;

        setLoading(true);
        try {
            await supplierService.delete(formData.Code);
            toast.success('Supplier deleted');
            handleClear();
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
        } catch (error) {
            toast.error('Failed to load suppliers');
        } finally {
            setLoading(false);
        }
    };

    const selectSupplier = async (code) => {
        setLoading(true);
        try {
            const data = await supplierService.getByCode(code);
            // Map backend PascalCase to our PascalCase state
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
                Locked: (data.locked || data.Locked) === 1,
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
        <div className="bg-slate-50 px-6 py-4 w-full flex justify-end gap-3 border-t border-gray-100 mt-4 rounded-b-xl">
            <button 
                onClick={handleSave}
                disabled={loading}
                className={`w-32 h-8 bg-[#0078d4] text-white text-sm font-medium rounded-sm border border-[#005a9e] hover:bg-[#005a9e] flex items-center justify-center gap-2 ${loading ? 'opacity-50' : ''}`}
            >
                {loading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} 
                {isEditMode ? 'Update' : 'Save'}
            </button>
            <button 
                onClick={handleDelete}
                disabled={!isEditMode || loading}
                className={`w-32 h-8 bg-[#d13438] text-white text-sm font-medium rounded-sm border border-[#a4262c] hover:bg-[#a4262c] flex items-center justify-center gap-2 ${(!isEditMode || loading) ? 'opacity-50' : ''}`}
            >
                <Trash2 size={14} /> Delete
            </button>
            <button 
                onClick={handleClear}
                className="px-6 h-10 bg-slate-100 text-slate-600 text-sm font-bold rounded-md hover:bg-slate-200 transition-all active:scale-95 border-none flex items-center justify-center gap-2"
            >
                <RotateCcw size={14} /> Clear
            </button>
            <button 
                onClick={onClose} 
                className="px-6 h-10 bg-slate-100 text-slate-600 text-sm font-bold rounded-md hover:bg-slate-200 transition-all active:scale-95 border-none flex items-center justify-center gap-2"
            >
                <X size={14} /> Exit
            </button>
        </div>
    );

    return (
        <>
            <SimpleModal
                isOpen={isOpen}
                onClose={onClose}
                title="Supplier Master File"
                maxWidth="max-w-4xl"
                footer={footer}
            >
                <div className="space-y-4 font-['Plus_Jakarta_Sans']">
                    <h2 className="text-base font-bold text-gray-800 mb-2">Enter New Supplier Details & Update</h2>
                    
                    {/* ID and Name */}
                    <div className="space-y-2 border border-gray-200 p-4 rounded-sm bg-gray-50/30">
                        <div className="grid grid-cols-12 gap-3 items-center">
                            <label className="col-span-3 text-sm font-medium text-gray-700">Supplier ID / Name</label>
                            <div className="col-span-3">
                                <input 
                                    type="text" 
                                    name="Code"
                                    value={formData.Code}
                                    onChange={handleInputChange}
                                    placeholder="AUTO"
                                    readOnly={isEditMode}
                                    className="w-full h-8 border border-gray-300 px-2 text-sm focus:border-blue-500 outline-none rounded-sm bg-white font-mono"
                                />
                            </div>
                            <div className="col-span-12 md:col-span-5 relative">
                                <input 
                                    type="text" 
                                    name="Supplier_Name"
                                    value={formData.Supplier_Name}
                                    onChange={handleInputChange}
                                    placeholder="Enter Supplier Name"
                                    className="w-full h-8 border border-gray-300 px-2 text-sm focus:border-blue-500 outline-none rounded-sm bg-white"
                                />
                            </div>
                            <button 
                                onClick={openSearch}
                                className="col-span-1 w-8 h-8 bg-[#0078d4] text-white flex items-center justify-center hover:bg-[#005a9e] rounded-sm transition-colors shadow-sm"
                            >
                                <Search size={16} />
                            </button>
                        </div>

                        <FormRow label="Distribution Company">
                            <input 
                                type="text" 
                                name="Destibution_Name"
                                value={formData.Destibution_Name}
                                onChange={handleInputChange}
                                className="flex-1 h-8 border border-gray-300 px-2 text-sm focus:border-blue-500 outline-none rounded-sm bg-white" 
                            />
                        </FormRow>

                        <FormRow label="Address 1">
                            <input type="text" name="Address1" value={formData.Address1} onChange={handleInputChange} className="flex-1 h-8 border border-gray-300 px-2 text-sm rounded-sm bg-white" />
                        </FormRow>
                        <FormRow label="Address 2">
                            <input type="text" name="Address2" value={formData.Address2} onChange={handleInputChange} className="flex-1 h-8 border border-gray-300 px-2 text-sm rounded-sm bg-white" />
                        </FormRow>

                        <div className="grid grid-cols-2 gap-4">
                            <FormRow label="Phone Number">
                                <input type="text" name="Phone" value={formData.Phone} onChange={handleInputChange} className="flex-1 h-8 border border-gray-300 px-2 text-sm rounded-sm bg-white" />
                            </FormRow>
                            <div className="flex items-center gap-2">
                                <label className="text-sm font-medium text-gray-700 w-20 text-center">Fax</label>
                                <input type="text" name="Fax" value={formData.Fax} onChange={handleInputChange} className="flex-1 h-8 border border-gray-300 px-2 text-sm rounded-sm bg-white" />
                            </div>
                        </div>

                        <FormRow label="E-Mail Address">
                            <input type="email" name="Email" value={formData.Email} onChange={handleInputChange} className="flex-1 h-8 border border-gray-300 px-2 text-sm rounded-sm bg-white" />
                        </FormRow>

                        <FormRow label="Web Site">
                            <input type="text" name="Web" value={formData.Web} onChange={handleInputChange} className="flex-1 h-8 border border-gray-300 px-2 text-sm rounded-sm bg-white" />
                        </FormRow>

                        <div className="grid grid-cols-2 gap-4">
                            <FormRow label="Contact Person">
                                <input type="text" name="Contact_Person" value={formData.Contact_Person} onChange={handleInputChange} className="flex-1 h-8 border border-gray-300 px-2 text-sm rounded-sm bg-white" />
                            </FormRow>
                            <div className="flex items-center gap-2">
                                <label className="text-sm font-medium text-gray-700 w-32 text-center">Credit Period</label>
                                <input type="number" name="Credit_Period" value={formData.Credit_Period} onChange={handleInputChange} className="w-20 h-8 border border-gray-300 px-2 text-sm rounded-sm bg-white" />
                                <span className="text-sm font-bold text-gray-800">Days</span>
                            </div>
                        </div>

                        <FormRow label="Vender Type">
                            <select 
                                name="Vend_Typ" 
                                value={formData.Vend_Typ} 
                                onChange={handleInputChange}
                                className="flex-1 h-8 border border-gray-300 px-2 text-sm bg-white rounded-sm outline-none focus:border-blue-500"
                            >
                                <option value="">Select Type</option>
                                {vendorTypes.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </FormRow>

                        <FormRow label="Bank Detail">
                            <select 
                                name="Bank_Name" 
                                value={formData.Bank_Name} 
                                onChange={(e) => {
                                    const selected = banks.find(b => b.bank_Name === e.target.value);
                                    setFormData(prev => ({ 
                                        ...prev, 
                                        Bank_Name: e.target.value,
                                        Bank_Code: String(selected?.id || '')
                                    }));
                                }}
                                className="flex-1 h-8 border border-gray-300 px-2 text-sm bg-white rounded-sm outline-none focus:border-blue-500"
                            >
                                <option value="">Select Bank</option>
                                {banks.map(b => <option key={b.id} value={b.bank_Name}>{b.bank_Name}</option>)}
                            </select>
                        </FormRow>

                        <div className="grid grid-cols-2 gap-4">
                            <FormRow label="Branch">
                                <input type="text" name="Brunch" value={formData.Brunch} onChange={handleInputChange} className="flex-1 h-8 border border-gray-300 px-2 text-sm rounded-sm bg-white" />
                            </FormRow>
                            <div className="flex items-center gap-2">
                                <label className="text-sm font-medium text-gray-700 w-24 text-center">A/C No</label>
                                <input type="text" name="AC_Number" value={formData.AC_Number} onChange={handleInputChange} className="flex-1 h-8 border border-gray-300 px-2 text-sm rounded-sm bg-white" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <FormRow label="VAT Reg. No">
                                <input type="text" name="VAT_Number" value={formData.VAT_Number} onChange={handleInputChange} className="flex-1 h-8 border border-gray-300 px-2 text-sm rounded-sm bg-white" />
                            </FormRow>
                            <div className="flex items-center gap-2 justify-center">
                                <input 
                                    type="checkbox" 
                                    id="locked-v" 
                                    name="Locked" 
                                    checked={formData.Locked} 
                                    onChange={handleInputChange} 
                                    className="w-4 h-4 border-gray-300 rounded text-blue-600 focus:ring-blue-500"
                                />
                                <label htmlFor="locked-v" className="text-sm font-medium text-gray-700">Supplier is Inactive</label>
                            </div>
                        </div>
                    </div>
                </div>
            </SimpleModal>

            {/* Search Modal */}
            {showSearchModal && (
                <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setShowSearchModal(false)} />
                    <div className="relative w-full max-w-2xl bg-white shadow-2xl rounded-xl border border-gray-100 overflow-hidden flex flex-col max-h-[80vh] font-['Plus_Jakarta_Sans']">
                        <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50/50">
                            <h3 className="text-lg font-bold text-slate-800 tracking-tight">Search Suppliers</h3>
                            <div className="flex gap-2">
                                <input 
                                    type="text" 
                                    placeholder="Name or ID..."
                                    className="h-9 border border-gray-300 px-3 text-sm rounded-md w-64 focus:border-blue-500 outline-none"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                                <button 
                                    onClick={() => setShowSearchModal(false)} 
                                    className="w-9 h-8 flex items-center justify-center bg-[#ff3b30] hover:bg-[#e03127] text-white rounded-[8px] shadow-[0_4px_12px_rgba(255,59,48,0.3)] hover:shadow-[0_6px_20px_rgba(255,59,48,0.4)] transition-all active:scale-90 outline-none border-none group"
                                    title="Close"
                                >
                                    <X size={18} strokeWidth={4} className="group-hover:scale-110 transition-transform" />
                                </button>
                            </div>
                        </div>
                        <div className="overflow-y-auto p-2">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-[#f8f9fa] sticky top-0 font-bold text-gray-600">
                                    <tr>
                                        <th className="p-3 border-b">Code</th>
                                        <th className="p-3 border-b">Supplier Name</th>
                                        <th className="p-3 border-b w-24 text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {suppliersList
                                        .filter(s => (s.supplier_Name || s.Supplier_Name)?.toLowerCase().includes(searchQuery.toLowerCase()) || (s.code || s.Code)?.toLowerCase().includes(searchQuery.toLowerCase()))
                                        .map(s => (
                                        <tr key={s.code || s.Code} className="hover:bg-blue-50/50 transition-colors group">
                                            <td className="p-3 border-b font-mono text-xs">{s.code || s.Code}</td>
                                            <td className="p-3 border-b text-gray-700">{s.supplier_Name || s.Supplier_Name}</td>
                                            <td className="p-3 border-b text-center">
                                                <button 
                                                    onClick={() => selectSupplier(s.code || s.Code)}
                                                    className="bg-[#0078d4] text-white text-[10px] uppercase tracking-wider px-3 py-1 rounded-sm font-bold hover:bg-[#005a9e]"
                                                >
                                                    Select
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {suppliersList.length === 0 && (
                                        <tr>
                                            <td colSpan="3" className="p-8 text-center text-gray-400 italic">No suppliers found.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

const FormRow = ({ label, children }) => (
    <div className="flex items-center gap-3">
        <label className="text-sm font-medium text-gray-700 w-32 shrink-0">{label}</label>
        {children}
    </div>
);

export default VendorBoard;
