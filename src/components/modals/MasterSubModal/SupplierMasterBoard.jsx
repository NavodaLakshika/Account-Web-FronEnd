import React, { useState, useEffect } from 'react';
import SimpleModal from '../../SimpleModal';
import { Search, RotateCcw, Save, Trash2, Loader2, X, Truck, Briefcase } from 'lucide-react';
import { supplierService } from '../../../services/supplier.service';
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
        <div className="flex justify-center gap-3 w-full border-t border-gray-300 pt-3 mt-2 bg-[#f0f0f0]">
            <button onClick={handleSave} disabled={loading} className="w-32 h-8 bg-[#0078d4] text-white text-sm font-medium rounded-sm border hover:bg-[#005a9e] flex items-center justify-center gap-2">
                {loading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} 
                {isEditMode ? 'Update' : 'Save'}
            </button>
            <button onClick={handleDelete} disabled={!isEditMode || loading} className="w-32 h-8 bg-[#d13438] text-white text-sm font-medium rounded-sm border hover:bg-[#a4262c] flex items-center justify-center gap-2">
                <Trash2 size={14} /> Delete
            </button>
            <button onClick={handleClear} className="w-32 h-8 bg-white text-gray-700 text-sm font-medium rounded-sm border border-gray-400 hover:bg-gray-100 flex items-center justify-center gap-2">
                <RotateCcw size={14} /> Clear
            </button>
            <button onClick={onClose} className="w-32 h-8 bg-white text-gray-700 text-sm font-medium rounded-sm border border-gray-400 hover:bg-gray-100 flex items-center justify-center">Exit</button>
        </div>
    );

    return (
        <>
            <SimpleModal isOpen={isOpen} onClose={onClose} title="Supplier Master File" maxWidth="max-w-4xl" footer={footer}>
                <div className="space-y-4 py-2 font-['Plus_Jakarta_Sans']">
                    <div className="border-b border-gray-200 pb-2 mb-4 flex items-center gap-2">
                        <Truck size={18} className="text-[#0078d4]" />
                        <h2 className="text-sm font-bold text-gray-800 uppercase">Enter New Supplier Details & Update</h2>
                    </div>

                    <div className="space-y-3">
                        <div className="space-y-2 border border-blue-100 p-4 rounded-sm bg-blue-50/20">
                            <div className="grid grid-cols-12 gap-3 items-center">
                                <label className="col-span-3 text-sm font-bold text-gray-600">Supplier ID / Name</label>
                                <div className="col-span-3">
                                    <input type="text" name="Code" value={formData.Code} readOnly className="w-full h-8 border border-gray-300 px-2 text-sm bg-white font-bold text-blue-600 rounded-sm" placeholder="AUTO" />
                                </div>
                                <div className="col-span-12 md:col-span-5 relative">
                                    <input type="text" name="Supplier_Name" value={formData.Supplier_Name} onChange={handleInputChange} placeholder="Enter Supplier Name" className="w-full h-8 border border-gray-300 px-2 text-sm focus:border-blue-500 outline-none rounded-sm bg-white font-medium" />
                                </div>
                                <button onClick={openSearch} className="col-span-1 w-8 h-8 bg-[#0078d4] text-white flex items-center justify-center hover:bg-[#005a9e] rounded-sm transition-colors shadow-sm"><Search size={16} /></button>
                            </div>
                        </div>

                        <FormRow label="Distribution Company">
                            <input type="text" name="Destibution_Name" value={formData.Destibution_Name} onChange={handleInputChange} className="flex-1 h-8 border border-gray-300 px-2 text-sm focus:border-blue-500 outline-none rounded-sm bg-white" />
                        </FormRow>

                        <div className="grid grid-cols-2 gap-4">
                            <FormRow label="Address 1">
                                <input type="text" name="Address1" value={formData.Address1} onChange={handleInputChange} className="flex-1 h-8 border border-gray-300 px-2 text-sm rounded-sm bg-white" />
                            </FormRow>
                            <FormRow label="Address 2">
                                <input type="text" name="Address2" value={formData.Address2} onChange={handleInputChange} className="flex-1 h-8 border border-gray-300 px-2 text-sm rounded-sm bg-white" />
                            </FormRow>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <FormRow label="Phone" labelWidth="w-24"><input type="text" name="Phone" value={formData.Phone} onChange={handleInputChange} className="flex-1 h-8 border border-gray-300 px-2 text-sm rounded-sm bg-white" /></FormRow>
                            <FormRow label="Fax" labelWidth="w-16"><input type="text" name="Fax" value={formData.Fax} onChange={handleInputChange} className="flex-1 h-8 border border-gray-300 px-2 text-sm rounded-sm bg-white" /></FormRow>
                            <FormRow label="Email" labelWidth="w-16"><input type="email" name="Email" value={formData.Email} onChange={handleInputChange} className="flex-1 h-8 border border-gray-300 px-2 text-sm rounded-sm bg-white" /></FormRow>
                        </div>

                        <FormRow label="Web Site">
                            <input type="text" name="Web" value={formData.Web} onChange={handleInputChange} className="flex-1 h-8 border border-gray-300 px-2 text-sm rounded-sm bg-white" />
                        </FormRow>

                        <div className="grid grid-cols-2 gap-4">
                            <FormRow label="Contact Person"><input type="text" name="Contact_Person" value={formData.Contact_Person} onChange={handleInputChange} className="flex-1 h-8 border border-gray-300 px-2 text-sm rounded-sm bg-white" /></FormRow>
                            <div className="flex items-center gap-2">
                                <label className="text-xs font-semibold text-gray-600 w-[100px] shrink-0 text-right pr-2">Credit Period</label>
                                <div className="flex-1 flex items-center gap-2">
                                    <input type="text" name="Credit_Period" value={formData.Credit_Period} onChange={handleInputChange} className="flex-1 h-8 border border-gray-300 px-2 text-sm rounded-sm bg-white" />
                                    <span className="text-xs font-bold text-gray-700">Days</span>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <FormRow label="Vendor Type">
                                <select name="Vend_Typ" value={formData.Vend_Typ} onChange={handleInputChange} className="flex-1 h-8 border border-gray-300 px-2 text-sm bg-white focus:border-blue-500 outline-none rounded-sm">
                                    <option value="">Select Vendor Type</option>
                                    {vendorTypes.map(type => (<option key={type.v_Typ_Code} value={type.v_Typ_Code}>{type.v_Type}</option>))}
                                </select>
                            </FormRow>
                            <FormRow label="VAT Reg. No"><input type="text" name="VAT_Number" value={formData.VAT_Number} onChange={handleInputChange} className="flex-1 h-8 border border-gray-300 px-2 text-sm rounded-sm bg-white" /></FormRow>
                        </div>

                        <div className="bg-slate-50 p-4 border border-slate-200 rounded-sm space-y-3">
                            <h3 className="text-xs font-bold text-slate-700 uppercase flex items-center gap-2 border-b pb-1 border-slate-200">
                                <Briefcase size={14} className="text-[#0078d4]" /> Bank Account Details
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <FormRow label="Bank Detail">
                                    <select name="Bank_Code" value={formData.Bank_Code} onChange={(e) => {
                                        const selectedBank = banks.find(b => b.code === e.target.value);
                                        setFormData(prev => ({...prev, Bank_Code: e.target.value, Bank_Name: selectedBank ? selectedBank.name : ''}));
                                    }} className="flex-1 h-8 border border-gray-300 px-2 text-sm bg-white rounded-sm">
                                        <option value="">Select Bank</option>
                                        {banks.map(bank => (<option key={bank.code} value={bank.code}>{bank.name}</option>))}
                                    </select>
                                </FormRow>
                                <FormRow label="Branch"><input type="text" name="Brunch" value={formData.Brunch} onChange={handleInputChange} className="flex-1 h-8 border border-gray-300 px-2 text-sm rounded-sm bg-white" /></FormRow>
                            </div>
                            <FormRow label="A/C Number"><input type="text" name="AC_Number" value={formData.AC_Number} onChange={handleInputChange} className="flex-1 h-8 border border-gray-300 px-2 text-sm rounded-sm bg-white" /></FormRow>
                        </div>

                        <div className="flex justify-end pt-2">
                             <label className="flex items-center gap-2 cursor-pointer group">
                                <input type="checkbox" name="Locked" checked={formData.Locked} onChange={handleInputChange} className="w-4 h-4 rounded-sm border-gray-300 text-[#0078d4] focus:ring-[#0078d4]" />
                                <span className={`text-xs font-bold transition-colors ${formData.Locked ? 'text-red-500' : 'text-gray-600'}`}>Supplier is Inactive</span>
                            </label>
                        </div>
                    </div>
                </div>
            </SimpleModal>

            {showSearchModal && (
                <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowSearchModal(false)} />
                    <div className="relative w-full max-w-4xl bg-white shadow-2xl rounded-lg overflow-hidden flex flex-col max-h-[85vh]">
                        <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50 font-['Plus_Jakarta_Sans']">
                            <h3 className="font-bold text-gray-700">Search Suppliers - {suppliersList.length} Found</h3>
                            <div className="flex gap-4">
                                <input type="text" placeholder="Search by name, code..." className="h-9 border border-gray-300 px-3 text-sm rounded-md w-64 focus:border-blue-500 outline-none" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                                <button onClick={() => setShowSearchModal(false)} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
                            </div>
                        </div>
                        <div className="overflow-y-auto p-2 font-['Plus_Jakarta_Sans']">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-[#f0f0f0] sticky top-0 text-gray-600 font-bold uppercase text-[11px] tracking-wider">
                                    <tr>
                                        <th className="p-3 border-b text-center">Code</th>
                                        <th className="p-3 border-b">Supplier Name</th>
                                        <th className="p-3 border-b">Phone</th>
                                        <th className="p-3 border-b text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {suppliersList.filter(s => (s.supplier_Name || '').toLowerCase().includes(searchQuery.toLowerCase()) || (s.code || '').toLowerCase().includes(searchQuery.toLowerCase())).map(s => (
                                        <tr key={s.code} className="hover:bg-blue-50 transition-colors">
                                            <td className="p-3 border-b text-center font-bold text-blue-600">{s.code}</td>
                                            <td className="p-3 border-b font-medium uppercase text-gray-700">{s.supplier_Name}</td>
                                            <td className="p-3 border-b text-gray-500">{s.phone}</td>
                                            <td className="p-3 border-b text-center">
                                                <button onClick={() => selectSupplier(s.code)} className="bg-[#0078d4] text-white text-[10px] px-3 py-1.5 rounded-sm font-bold hover:bg-[#005a9e]">SELECT</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

const FormRow = ({ label, children, labelWidth = "w-40" }) => (
    <div className="flex items-center gap-3">
        <label className={`text-xs font-semibold text-gray-600 ${labelWidth} shrink-0`}>{label}</label>
        {children}
    </div>
);

export default SupplierMasterBoard;
