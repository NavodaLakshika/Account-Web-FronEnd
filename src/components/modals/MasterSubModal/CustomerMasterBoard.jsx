import React, { useState, useEffect } from 'react';
import SimpleModal from '../../SimpleModal';
import { Search, RotateCcw, Save, Trash2, RefreshCcw, UserCircle, Loader2, X, Briefcase, MapPin, Navigation } from 'lucide-react';
import { customerService } from '../../../services/customer.service';
import { toast } from 'react-hot-toast';

const CustomerMasterBoard = ({ isOpen, onClose }) => {
    const initialState = {
        Code: '',
        Cust_Name: '',
        Address1: '',
        Address2: '',
        Phone: '',
        Fax: '',
        Email: '',
        Web: '',
        Contact_Person: '',
        NIC_No: '',
        Credit_Limit: '0.00',
        Credit_Period: '0',
        Bank_Name: '',
        Bank_Code: '',
        Brunch: '',
        AC_Number: '',
        VAT_Number: '',
        Cust_Typ: '',
        Area_Code: '',
        Area_Name: '',
        Route_Code: '',
        Route_Name: '',
        Locked: false,
        Company: '',
        CurrentUser: 'SYSTEM'
    };

    const [formData, setFormData] = useState(initialState);
    const [banks, setBanks] = useState([]);
    const [customerTypes, setCustomerTypes] = useState([]);
    const [areas, setAreas] = useState([]);
    const [routes, setRoutes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [showSearchModal, setShowSearchModal] = useState(false);
    const [customersList, setCustomersList] = useState([]);
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
            const [banksData, typesData, areasData, routesData] = await Promise.all([
                customerService.getBanks(),
                customerService.getTypes(),
                customerService.getAreas(),
                customerService.getRoutes()
            ]);
            setBanks(banksData || []);
            setCustomerTypes(typesData || []);
            setAreas(areasData || []);
            setRoutes(routesData || []);
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
        if (!formData.Cust_Name) {
            toast.error('Customer Name is required');
            return;
        }

        setLoading(true);
        try {
            const payload = {
                ...formData,
                Credit_Limit: formData.Credit_Limit.toString(),
                Credit_Period: formData.Credit_Period.toString(),
                Bank_Code: String(formData.Bank_Code || '')
            };

            if (isEditMode) {
                await customerService.update(formData.Code, payload);
                toast.success('Customer updated successfully');
            } else {
                const response = await customerService.create(payload);
                setFormData(prev => ({ ...prev, Code: response.code }));
                toast.success(`Customer created: ${response.code}`);
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
        if (!window.confirm('Are you sure you want to delete this customer?')) return;

        setLoading(true);
        try {
            await customerService.delete(formData.Code);
            toast.success('Customer deleted');
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
            const data = await customerService.getAll();
            setCustomersList(data);
            setShowSearchModal(true);
        } catch (err) {
            toast.error('Failed to load customers');
        } finally {
            setLoading(false);
        }
    };

    const selectCustomer = async (code) => {
        setLoading(true);
        try {
            const data = await customerService.getByCode(code);
            setFormData({
                Code: data.code || data.Code,
                Cust_Name: data.cust_Name || data.Cust_Name,
                Address1: data.address1 || data.Address1,
                Address2: data.address2 || data.Address2,
                Phone: data.phone || data.Phone,
                Fax: data.fax || data.Fax,
                Email: data.email || data.Email,
                Web: data.web || data.Web,
                Contact_Person: data.contact_Person || data.Contact_Person,
                NIC_No: data.niC_No || data.NIC_No,
                Credit_Limit: data.credit_Limit || data.Credit_Limit,
                Credit_Period: data.credit_Period || data.Credit_Period,
                Bank_Name: data.bank_Name || data.Bank_Name,
                Bank_Code: String(data.bank_Code || data.Bank_Code || ''),
                Brunch: data.brunch || data.Brunch,
                AC_Number: data.ac_Number || data.AC_Number,
                VAT_Number: data.vat_Number || data.VAT_Number,
                Cust_Typ: data.cust_Typ || data.Cust_Typ,
                Area_Code: data.area_Code || data.Area_Code,
                Area_Name: data.area_Name || data.Area_Name,
                Route_Code: data.route_Code || data.Route_Code,
                Route_Name: data.route_Name || data.Route_Name,
                Locked: (data.locked || data.Locked) === 1 || data.locked === true,
                Company: formData.Company,
                CurrentUser: formData.CurrentUser
            });
            setIsEditMode(true);
            setShowSearchModal(false);
            toast.success('Customer loaded');
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
            <button onClick={handleDelete} disabled={!isEditMode || loading} className="w-32 h-8 bg-[#d13438] text-white text-sm font-medium rounded-sm border border-[#a4262c] hover:bg-[#a4262c] flex items-center justify-center gap-2">
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
            <SimpleModal isOpen={isOpen} onClose={onClose} title="Customer Master File" maxWidth="max-w-4xl" footer={footer}>
                <div className="space-y-4 py-2 font-['Plus_Jakarta_Sans']">
                    <div className="border-b border-gray-200 pb-2 mb-4 flex items-center gap-2">
                        <UserCircle size={18} className="text-[#0078d4]" />
                        <h2 className="text-sm font-bold text-gray-800 uppercase">Enter New Customer Details & Update</h2>
                    </div>

                    <div className="space-y-3">
                        {/* ID and Name */}
                        <div className="space-y-2 border border-blue-100 p-4 rounded-sm bg-blue-50/20">
                            <div className="grid grid-cols-12 gap-3 items-center">
                                <label className="col-span-3 text-sm font-bold text-gray-600">Customer ID / Name</label>
                                <div className="col-span-3">
                                    <input type="text" name="Code" value={formData.Code} readOnly className="w-full h-8 border border-gray-300 px-2 text-sm bg-white font-bold text-blue-600 rounded-sm" placeholder="AUTO" />
                                </div>
                                <div className="col-span-12 md:col-span-5 relative">
                                    <input type="text" name="Cust_Name" value={formData.Cust_Name} onChange={handleInputChange} placeholder="Enter Customer Name" className="w-full h-8 border border-gray-300 px-2 text-sm focus:border-blue-500 outline-none rounded-sm bg-white font-medium" />
                                </div>
                                <button onClick={openSearch} className="col-span-1 w-8 h-8 bg-[#0078d4] text-white flex items-center justify-center hover:bg-[#005a9e] rounded-sm transition-colors shadow-sm"><Search size={16} /></button>
                            </div>
                        </div>

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
                            <FormRow label="NIC No"><input type="text" name="NIC_No" value={formData.NIC_No} onChange={handleInputChange} className="flex-1 h-8 border border-gray-300 px-2 text-sm rounded-sm bg-white" /></FormRow>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-center gap-2">
                                <label className="text-xs font-semibold text-gray-600 w-40 shrink-0">Credit Limit</label>
                                <input type="text" name="Credit_Limit" value={formData.Credit_Limit} onChange={handleInputChange} className="flex-1 h-8 border border-gray-300 px-2 text-sm text-right focus:border-blue-500 outline-none rounded-sm bg-white font-bold" />
                            </div>
                            <div className="flex items-center gap-2">
                                <label className="text-xs font-semibold text-gray-600 w-[100px] shrink-0 text-right pr-2">Credit Period</label>
                                <div className="flex-1 flex items-center gap-2">
                                    <input type="text" name="Credit_Period" value={formData.Credit_Period} onChange={handleInputChange} className="flex-1 h-8 border border-gray-300 px-2 text-sm focus:border-blue-500 outline-none rounded-sm text-center bg-white" />
                                    <span className="text-xs font-bold text-gray-700">Days</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-slate-50 p-4 border border-slate-200 rounded-sm space-y-3">
                            <h3 className="text-xs font-bold text-slate-700 uppercase flex items-center gap-2 border-b pb-1 border-slate-200">
                                <Briefcase size={14} className="text-[#0078d4]" /> Bank Detail
                            </h3>
                            <div className="grid grid-cols-12 gap-3 items-center">
                                <label className="col-span-3 text-xs font-semibold text-gray-600">Bank Detail</label>
                                <select name="Bank_Code" value={formData.Bank_Code} onChange={(e) => {
                                    const selectedBank = banks.find(b => b.code === e.target.value);
                                    setFormData(prev => ({...prev, Bank_Code: e.target.value, Bank_Name: selectedBank ? selectedBank.name : ''}));
                                }} className="col-span-9 h-8 border border-gray-300 px-2 text-sm bg-white rounded-sm">
                                    <option value="">&lt; Select Bank... &gt;</option>
                                    {banks.map(bank => (<option key={bank.code} value={bank.code}>{bank.name}</option>))}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <FormRow label="Branch"><input type="text" name="Brunch" value={formData.Brunch} onChange={handleInputChange} className="flex-1 h-8 border border-gray-300 px-2 text-sm rounded-sm bg-white" /></FormRow>
                                <div className="flex items-center gap-2">
                                    <label className="text-xs font-semibold text-gray-600 w-20 text-right pr-2">A/C No</label>
                                    <input type="text" name="AC_Number" value={formData.AC_Number} onChange={handleInputChange} className="flex-1 h-8 border border-gray-300 px-2 text-sm rounded-sm bg-white" />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <FormRow label="VAT Reg. No"><input type="text" name="VAT_Number" value={formData.VAT_Number} onChange={handleInputChange} className="flex-1 h-8 border border-gray-300 px-2 text-sm rounded-sm bg-white" /></FormRow>
                            <div className="flex items-center gap-3">
                                <label className="text-xs font-semibold text-gray-600 shrink-0">Customer Type</label>
                                <select name="Cust_Typ" value={formData.Cust_Typ} onChange={handleInputChange} className="flex-1 h-8 border border-gray-300 px-2 text-sm bg-white rounded-sm">
                                    <option value="">&lt; Type New... &gt;</option>
                                    {customerTypes.map(type => (<option key={type.v_Typ_Code || type.code} value={type.v_Typ_Code || type.code}>{type.v_Type || type.name}</option>))}
                                </select>
                            </div>
                        </div>

                        <div className="space-y-2.5">
                            <div className="flex items-center gap-2">
                                <label className="text-xs font-semibold text-gray-600 w-40 shrink-0">Area</label>
                                <button className="w-9 h-8 bg-white border border-gray-300 flex items-center justify-center hover:bg-gray-50 rounded-sm shadow-sm transition-colors text-blue-500"><RefreshCcw size={14} /></button>
                                <div className="flex-1 flex gap-1">
                                    <input type="text" name="Area_Code" value={formData.Area_Code} readOnly className="w-32 h-8 border border-gray-300 px-2 text-sm bg-gray-50 rounded-sm" />
                                    <select name="Area_Code" value={formData.Area_Code} onChange={(e) => {
                                        const selected = areas.find(a => a.code === e.target.value);
                                        setFormData(prev => ({...prev, Area_Code: e.target.value, Area_Name: selected ? selected.name : ''}));
                                    }} className="flex-1 h-8 border border-gray-300 px-2 text-sm bg-white rounded-sm">
                                        <option value=""></option>
                                        {areas.map(a => (<option key={a.code} value={a.code}>{a.name}</option>))}
                                    </select>
                                    <button className="w-8 h-8 bg-[#0078d4] text-white flex items-center justify-center hover:bg-[#005a9e] rounded-sm shadow-sm transition-colors"><Search size={14} /></button>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <label className="text-xs font-semibold text-gray-600 w-40 shrink-0">Route</label>
                                <button className="w-9 h-8 bg-white border border-gray-300 flex items-center justify-center hover:bg-gray-50 rounded-sm shadow-sm transition-colors text-blue-500"><RefreshCcw size={14} /></button>
                                <div className="flex-1 flex gap-1">
                                    <input type="text" name="Route_Code" value={formData.Route_Code} readOnly className="w-32 h-8 border border-gray-300 px-2 text-sm bg-gray-50 rounded-sm" />
                                    <select name="Route_Code" value={formData.Route_Code} onChange={(e) => {
                                        const selected = routes.find(r => r.code === e.target.value);
                                        setFormData(prev => ({...prev, Route_Code: e.target.value, Route_Name: selected ? selected.name : ''}));
                                    }} className="flex-1 h-8 border border-gray-300 px-2 text-sm bg-white rounded-sm">
                                        <option value=""></option>
                                        {routes.map(r => (<option key={r.code} value={r.code}>{r.name}</option>))}
                                    </select>
                                    <button className="w-8 h-8 bg-[#0078d4] text-white flex items-center justify-center hover:bg-[#005a9e] rounded-sm shadow-sm transition-colors"><Search size={14} /></button>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end pt-2">
                             <label className="flex items-center gap-2 cursor-pointer group">
                                <input type="checkbox" name="Locked" checked={formData.Locked} onChange={handleInputChange} className="w-4 h-4 rounded-sm border-gray-300 text-[#0078d4] focus:ring-[#0078d4]" />
                                <span className={`text-xs font-bold transition-colors ${formData.Locked ? 'text-red-500' : 'text-gray-600'}`}>Customer is Inactive</span>
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
                            <h3 className="font-bold text-gray-700">Search Customers - {customersList.length} Found</h3>
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
                                        <th className="p-3 border-b">Customer Name</th>
                                        <th className="p-3 border-b">Phone</th>
                                        <th className="p-3 border-b text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {customersList.filter(c => (c.cust_Name || '').toLowerCase().includes(searchQuery.toLowerCase()) || (c.code || '').toLowerCase().includes(searchQuery.toLowerCase())).map(c => (
                                        <tr key={c.code} className="hover:bg-blue-50 transition-colors">
                                            <td className="p-3 border-b text-center font-bold text-blue-600">{c.code || c.Code}</td>
                                            <td className="p-3 border-b font-medium uppercase text-gray-700">{c.cust_Name || c.Cust_Name}</td>
                                            <td className="p-3 border-b text-gray-500">{c.phone || c.Phone}</td>
                                            <td className="p-3 border-b text-center">
                                                <button onClick={() => selectCustomer(c.code || c.Code)} className="bg-[#0078d4] text-white text-[10px] px-3 py-1.5 rounded-sm font-bold hover:bg-[#005a9e]">SELECT</button>
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

export default CustomerMasterBoard;
