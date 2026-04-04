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
    const [showVTModal, setShowVTModal] = useState(false);
    const [vtSearchQuery, setVtSearchQuery] = useState('');
    const [showBankModal, setShowBankModal] = useState(false);
    const [bankSearchQuery, setBankSearchQuery] = useState('');

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
        <div className="bg-slate-50 px-6 py-4 w-full flex justify-end gap-3 border-t border-gray-100 mt-4 rounded-b-xl">
            <button onClick={handleSave} disabled={loading} className={`px-6 h-10 bg-[#0078d4] text-white text-sm font-bold rounded-md shadow-md shadow-blue-200 hover:bg-[#005a9e] transition-all active:scale-95 flex items-center justify-center gap-2 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                {loading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} 
                {isEditMode ? 'Update' : 'Save'}
            </button>
            <button onClick={handleDelete} disabled={!isEditMode || loading} className={`px-6 h-10 bg-[#d13438] text-white text-sm font-bold rounded-md shadow-md shadow-red-200 hover:bg-[#a4262c] transition-all active:scale-95 flex items-center justify-center gap-2 ${(!isEditMode || loading) ? 'opacity-50 cursor-not-allowed' : ''}`}>
                <Trash2 size={14} /> Delete
            </button>
            <button onClick={handleClear} className="px-6 h-10 bg-slate-100 text-slate-600 text-sm font-bold rounded-md hover:bg-slate-200 transition-all active:scale-95 flex items-center justify-center gap-2 border-none">
                <RotateCcw size={14} /> Clear
            </button>
            <button onClick={onClose} className="px-6 h-10 bg-slate-100 text-slate-600 text-sm font-bold rounded-md hover:bg-slate-200 transition-all active:scale-95 flex items-center justify-center gap-2 border-none">
                <X size={14} /> Exit
            </button>
        </div>
    );

    return (
        <>
            <SimpleModal isOpen={isOpen} onClose={onClose} title="Supplier Master File" maxWidth="max-w-[1000px]" footer={footer}>
                <div className="space-y-4 py-2 font-['Plus_Jakarta_Sans']">
                    <div className="border-b border-gray-200 pb-2 mb-4 flex items-center gap-2">
                        <Truck size={18} className="text-[#0078d4]" />
                        <h2 className="text-sm font-bold text-gray-800 uppercase">Enter New Supplier Details & Update</h2>
                    </div>

                    <div className="space-y-2 text-[12.5px]">
                        {/* ID and Name */}
                        <div className="flex items-center gap-3">
                            <label className="w-32 font-bold text-gray-700">Supplier ID / Name</label>
                            <div className="flex-1 flex gap-2">
                                <input type="text" name="Code" value={formData.Code} readOnly className="w-32 h-8 border border-gray-300 px-2 bg-white rounded-sm outline-none focus:border-blue-400 font-bold text-blue-600" placeholder="AUTO" />
                                <input type="text" name="Supplier_Name" value={formData.Supplier_Name} onChange={handleInputChange} placeholder="Enter Supplier Name" className="flex-1 h-8 border border-gray-300 px-2 bg-white rounded-sm outline-none focus:border-blue-400" />
                                <button onClick={openSearch} className="w-9 h-8 bg-[#0078d4] text-white flex items-center justify-center hover:bg-[#005a9e] rounded-sm transition-colors shadow-sm">
                                    <Search size={18} />
                                </button>
                            </div>
                        </div>

                        {/* Distribution Company */}
                        <div className="flex items-center gap-3">
                            <label className="w-32 font-bold text-gray-700">Distrb. Company</label>
                            <input type="text" name="Destibution_Name" value={formData.Destibution_Name} onChange={handleInputChange} className="flex-1 h-8 border border-gray-300 px-2 bg-white rounded-sm outline-none focus:border-blue-400" />
                        </div>

                        {/* Address Lines */}
                        <div className="flex items-center gap-3">
                            <label className="w-32 font-bold text-gray-700">Address 1</label>
                            <input type="text" name="Address1" value={formData.Address1} onChange={handleInputChange} className="flex-1 h-8 border border-gray-300 px-2 bg-white rounded-sm outline-none focus:border-blue-400" />
                        </div>
                        <div className="flex items-center gap-3">
                            <label className="w-32 font-bold text-gray-700">Address 2</label>
                            <input type="text" name="Address2" value={formData.Address2} onChange={handleInputChange} className="flex-1 h-8 border border-gray-300 px-2 bg-white rounded-sm outline-none focus:border-blue-400" />
                        </div>

                        {/* Phone and Fax */}
                        <div className="flex items-center gap-3">
                            <label className="w-32 font-bold text-gray-700">Phone Number</label>
                            <div className="flex-1 flex items-center gap-4">
                                <input type="text" name="Phone" value={formData.Phone} onChange={handleInputChange} className="flex-1 h-8 border border-gray-300 px-2 bg-white rounded-sm outline-none focus:border-blue-400" />
                                <label className="w-16 font-bold text-gray-700 text-center">Fax</label>
                                <input type="text" name="Fax" value={formData.Fax} onChange={handleInputChange} className="flex-1 h-8 border border-gray-300 px-2 bg-white rounded-sm outline-none focus:border-blue-400" />
                            </div>
                        </div>

                        {/* Email */}
                        <div className="flex items-center gap-3">
                            <label className="w-32 font-bold text-gray-700">E-Mail Address</label>
                            <input type="email" name="Email" value={formData.Email} onChange={handleInputChange} className="flex-1 h-8 border border-gray-300 px-2 bg-white rounded-sm outline-none focus:border-blue-400" />
                        </div>

                        {/* Web Site */}
                        <div className="flex items-center gap-3">
                            <label className="w-32 font-bold text-gray-700">Web Site</label>
                            <input type="text" name="Web" value={formData.Web} onChange={handleInputChange} className="flex-1 h-8 border border-gray-300 px-2 bg-white rounded-sm outline-none focus:border-blue-400" />
                        </div>

                        {/* Contact Person */}
                        <div className="flex items-center gap-3">
                            <label className="w-32 font-bold text-gray-700">Contact Person</label>
                            <input type="text" name="Contact_Person" value={formData.Contact_Person} onChange={handleInputChange} className="flex-1 h-8 border border-gray-300 px-2 bg-white rounded-sm outline-none focus:border-blue-400" />
                        </div>

                        {/* Vendor Type and VAT */}
                        <div className="flex items-center gap-3">
                            <label className="w-32 font-bold text-gray-700">Vendor Type</label>
                            <div className="flex-1 flex items-center gap-4">
                                <div className="flex-1 flex gap-2">
                                    <input type="text" name="Vend_Typ" value={formData.Vend_Typ} readOnly placeholder="Search Vendor Type..." className="flex-1 h-8 border border-gray-300 px-2 bg-gray-50 rounded-sm outline-none" />
                                    <button onClick={() => setShowVTModal(true)} className="w-9 h-8 bg-[#0078d4] text-white flex items-center justify-center hover:bg-[#005a9e] rounded-sm transition-colors shadow-sm">
                                        <Search size={18} />
                                    </button>
                                </div>
                                <label className="w-24 font-bold text-gray-700 text-center whitespace-nowrap">VAT Reg. No</label>
                                <input type="text" name="VAT_Number" value={formData.VAT_Number} onChange={handleInputChange} className="flex-1 h-8 border border-gray-300 px-2 bg-white rounded-sm outline-none focus:border-blue-400" />
                            </div>
                        </div>

                        {/* Credit Limit / Status */}
                        <div className="flex items-center gap-3">
                            <label className="w-32 font-bold text-gray-700">Credit Period</label>
                            <div className="flex-1 flex items-center gap-4 text-left">
                                <div className="w-56 flex items-center gap-2">
                                    <input type="text" name="Credit_Period" value={formData.Credit_Period} onChange={handleInputChange} className="flex-1 h-8 border border-gray-300 px-2 bg-white rounded-sm outline-none focus:border-blue-400 text-center" />
                                </div>
                                <label className="flex items-center gap-2 cursor-pointer font-bold text-gray-700 ml-4 group">
                                    <input type="checkbox" name="Locked" checked={formData.Locked} onChange={handleInputChange} className="w-4 h-4 rounded-sm border-gray-300 text-[#0078d4] focus:ring-[#0078d4]" /> 
                                    <span className={`transition-colors ${formData.Locked ? 'text-red-500' : 'text-gray-600'}`}>Supplier is Inactive</span>
                                </label>
                            </div>
                        </div>

                        {/* Bank Detail */}
                        <div className="flex items-center gap-3">
                            <label className="w-32 font-bold text-gray-700">Bank Detail</label>
                            <div className="flex-1 flex items-center gap-2">
                                <div className="flex-[2] flex gap-2">
                                    <input type="text" name="Bank_Name" value={formData.Bank_Name} readOnly placeholder="Search Bank..." className="flex-1 h-8 border border-gray-300 px-2 bg-gray-50 rounded-sm outline-none" />
                                    <button onClick={() => setShowBankModal(true)} className="w-9 h-8 bg-[#0078d4] text-white flex items-center justify-center hover:bg-[#005a9e] rounded-sm transition-colors shadow-sm">
                                        <Search size={18} />
                                    </button>
                                </div>
                                <label className="w-16 font-bold text-gray-700 text-center">Branch</label>
                                <input type="text" name="Brunch" value={formData.Brunch} onChange={handleInputChange} placeholder="Branch Name" className="flex-1 h-8 border border-gray-300 px-2 bg-white rounded-sm outline-none focus:border-blue-400" />
                            </div>
                        </div>

                        {/* AC Number */}
                        <div className="flex items-center gap-3">
                            <label className="w-32 font-bold text-gray-700">A/C Number</label>
                            <input type="text" name="AC_Number" value={formData.AC_Number} onChange={handleInputChange} className="flex-1 h-8 border border-gray-300 px-2 bg-white rounded-sm outline-none focus:border-blue-400" />
                        </div>
                    </div>
                </div>
            </SimpleModal>

            {/* Vendor Type Search Modal */}
            {showVTModal && (
                <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setShowVTModal(false)} />
                    <div className="relative w-full max-w-2xl bg-white shadow-2xl rounded-xl border border-gray-100 overflow-hidden flex flex-col max-h-[85vh]">
                        <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50 font-['Plus_Jakarta_Sans']">
                            <h3 className="text-lg font-bold text-slate-800 tracking-tight">Search Vendor Types</h3>
                            <div className="flex gap-4">
                                <input type="text" placeholder="Search type..." className="h-9 border border-gray-300 px-3 text-sm rounded-md w-64 focus:border-blue-500 outline-none" value={vtSearchQuery} onChange={(e) => setVtSearchQuery(e.target.value)} />
                                <button onClick={() => setShowVTModal(false)} className="w-8 h-8 flex items-center justify-center hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors rounded-full outline-none"><X size={24} /></button>
                            </div>
                        </div>
                        <div className="overflow-y-auto p-2 font-['Plus_Jakarta_Sans']">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50 sticky top-0 text-gray-600 font-bold uppercase text-[11px] tracking-wider">
                                    <tr>
                                        <th className="p-3 border-b text-center">ID</th>
                                        <th className="p-3 border-b">Vendor Type</th>
                                        <th className="p-3 border-b">Payable A/C</th>
                                        <th className="p-3 border-b text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {vendorTypes.filter(v => (v.vendorTypes || '').toLowerCase().includes(vtSearchQuery.toLowerCase())).map((v, idx) => (
                                        <tr key={idx} className="hover:bg-blue-50 transition-colors">
                                            <td className="p-3 border-b text-center font-bold text-blue-600">{v.id}</td>
                                            <td className="p-3 border-b font-medium uppercase text-gray-700">{v.vendorTypes}</td>
                                            <td className="p-3 border-b text-gray-500">{v.paybleAccCode}</td>
                                            <td className="p-3 border-b text-center">
                                                <button onClick={() => {
                                                    setFormData(prev => ({ ...prev, Vend_Typ: v.vendorTypes }));
                                                    setShowVTModal(false);
                                                }} className="bg-[#0078d4] text-white text-[10px] px-3 py-1.5 rounded-sm font-bold hover:bg-[#005a9e]">SELECT</button>
                                            </td>
                                        </tr>
                                    ))}
                                    {vendorTypes.length === 0 && (
                                        <tr>
                                            <td colSpan="4" className="p-6 text-center text-gray-400">No vendor types available.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* Bank Search Modal */}
            {showBankModal && (
                <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setShowBankModal(false)} />
                    <div className="relative w-full max-w-2xl bg-white shadow-2xl rounded-xl border border-gray-100 overflow-hidden flex flex-col max-h-[85vh]">
                        <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50 font-['Plus_Jakarta_Sans']">
                            <h3 className="text-lg font-bold text-slate-800 tracking-tight">Search Banks</h3>
                            <div className="flex gap-4">
                                <input type="text" placeholder="Search by name or code..." className="h-9 border border-gray-300 px-3 text-sm rounded-md w-64 focus:border-blue-500 outline-none" value={bankSearchQuery} onChange={(e) => setBankSearchQuery(e.target.value)} />
                                <button onClick={() => setShowBankModal(false)} className="w-8 h-8 flex items-center justify-center hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors rounded-full outline-none"><X size={24} /></button>
                            </div>
                        </div>
                        <div className="overflow-y-auto p-2 font-['Plus_Jakarta_Sans']">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50 sticky top-0 text-gray-600 font-bold uppercase text-[11px] tracking-wider">
                                    <tr>
                                        <th className="p-3 border-b">Code</th>
                                        <th className="p-3 border-b">Bank Name</th>
                                        <th className="p-3 border-b text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {banks.filter(b => (b.name || '').toLowerCase().includes(bankSearchQuery.toLowerCase()) || (b.code || '').toLowerCase().includes(bankSearchQuery.toLowerCase())).map((b, idx) => (
                                        <tr key={idx} className="hover:bg-blue-50 transition-colors">
                                            <td className="p-3 border-b font-medium text-gray-700">{b.code}</td>
                                            <td className="p-3 border-b font-medium uppercase text-blue-600">{b.name}</td>
                                            <td className="p-3 border-b text-center">
                                                <button onClick={() => {
                                                    setFormData(prev => ({ ...prev, Bank_Code: b.code, Bank_Name: b.name }));
                                                    setShowBankModal(false);
                                                }} className="bg-[#0078d4] text-white text-[10px] px-3 py-1.5 rounded-sm font-bold hover:bg-[#005a9e]">SELECT</button>
                                            </td>
                                        </tr>
                                    ))}
                                    {banks.length === 0 && (
                                        <tr>
                                            <td colSpan="3" className="p-6 text-center text-gray-400">No banks found.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {showSearchModal && (
                <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4">
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

export default SupplierMasterBoard;
