import React, { useState, useEffect } from 'react';
import SimpleModal from '../../SimpleModal';
import { Search, RotateCcw, Save, Trash2, RefreshCcw, UserCircle, Loader2, X, Briefcase, MapPin, Navigation, Building2, UserPlus } from 'lucide-react';
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
        CurrentUser: ''
    };

    const [formData, setFormData] = useState(initialState);
    const [banks, setBanks] = useState([]);
    const [customerTypes, setCustomerTypes] = useState([]);
    const [areas, setAreas] = useState([]);
    const [routes, setRoutes] = useState([]);
    const [showSearchModal, setShowSearchModal] = useState(false);
    const [showBankSearch, setShowBankSearch] = useState(false);
    const [showAreaSearch, setShowAreaSearch] = useState(false);
    const [showRouteSearch, setShowRouteSearch] = useState(false);
    const [customersList, setCustomersList] = useState([]);
    const [bankSearchQuery, setBankSearchQuery] = useState('');
    const [areaSearchQuery, setAreaSearchQuery] = useState('');
    const [routeSearchQuery, setRouteSearchQuery] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchLookups();
            const user = JSON.parse(localStorage.getItem('user'));
            const companyData = localStorage.getItem('selectedCompany');
            
            let companyCode = '';
            if (companyData) {
                try {
                    const parsed = JSON.parse(companyData);
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
            console.log('Lookups loaded:', { banks: banksData, areas: areasData });
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
        setFormData(prev => ({
            ...initialState,
            CurrentUser: prev.CurrentUser,
            Company: prev.Company
        }));
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
                Bank: formData.Bank_Name, // Maps to DTO Bank field
                Brunch: formData.Brunch,
                Credit_Limit: formData.Credit_Limit.toString(),
                Credit_Period: formData.Credit_Period.toString()
            };

            if (isEditMode) {
                await customerService.update(formData.Code, payload);
                toast.success('Customer updated successfully');
            } else {
                const response = await customerService.create(payload);
                setFormData(prev => ({ ...prev, Code: response.code }));
                toast.success('Customer saved');
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
                Locked: (data.locked || data.Locked) === 1 || data.locked === true || data.Locked === "1",
                Company: formData.Company,
                CurrentUser: formData.CurrentUser
            });
            setIsEditMode(true);
            setShowSearchModal(false);
        } catch (error) {
            toast.error('Failed to load customer details');
        } finally {
            setLoading(false);
        }
    };

    const selectArea = (area) => {
        setFormData(prev => ({
            ...prev,
            Area_Code: area.code,
            Area_Name: area.name
        }));
        setShowAreaSearch(false);
    };

    const selectRoute = (route) => {
        setFormData(prev => ({
            ...prev,
            Route_Code: route.code,
            Route_Name: route.name
        }));
        setShowRouteSearch(false);
    };

    const selectBank = (bank) => {
        setFormData(prev => ({
            ...prev,
            Bank_Code: bank.code,
            Bank_Name: bank.name
        }));
        setShowBankSearch(false);
        setBankSearchQuery('');
    };

    const footer = (
        <div className="flex justify-center gap-3 w-full border-t border-gray-300 pt-3 mt-4 bg-[#f0f0f0]">
            <button onClick={handleSave} disabled={loading} className="w-32 h-8 bg-[#0078d4] text-white text-[13px] font-bold rounded-sm border hover:bg-[#005a9e] shadow-sm flex items-center justify-center">
                {loading ? <Loader2 size={14} className="animate-spin mr-2" /> : null} 
                Save
            </button>
            <button onClick={handleDelete} disabled={!isEditMode || loading} className="w-32 h-8 bg-[#0078d4] text-white text-[13px] font-bold rounded-sm border hover:bg-[#005a9e] shadow-sm flex items-center justify-center">
                Delete
            </button>
            <button onClick={handleClear} className="w-32 h-8 bg-[#0078d4] text-white text-[13px] font-bold rounded-sm border hover:bg-[#005a9e] shadow-sm flex items-center justify-center">
                Clear
            </button>
            <button onClick={onClose} className="w-32 h-8 bg-[#0078d4] text-white text-[13px] font-bold rounded-sm border hover:bg-[#005a9e] shadow-sm flex items-center justify-center">
                Exit
            </button>
        </div>
    );

    return (
        <>
            <SimpleModal isOpen={isOpen} onClose={onClose} title="Customer Master File" maxWidth="max-w-[850px]" footer={footer}>
                <div className="py-2 font-['Plus_Jakarta_Sans'] select-none">
                    <h2 className="text-base font-bold text-black mb-6 flex items-center gap-2">
                        Enter New Customer Details & Update
                    </h2>
                    
                    <div className="space-y-2 text-[12.5px]">
                        {/* Row 1: ID and Name */}
                        <div className="flex items-center gap-3">
                            <label className="w-32 font-bold text-gray-700">Customer ID / Name</label>
                            <div className="flex-1 flex gap-2">
                                <input type="text" name="Code" value={formData.Code} readOnly className="w-32 h-8 border border-gray-300 px-2 bg-white rounded-sm outline-none focus:border-blue-400" />
                                <input type="text" name="Cust_Name" value={formData.Cust_Name} onChange={handleInputChange} className="flex-1 h-8 border border-gray-300 px-2 bg-white rounded-sm outline-none focus:border-blue-400" />
                                <button onClick={openSearch} className="w-9 h-8 bg-[#0078d4] text-white flex items-center justify-center hover:bg-[#005a9e] rounded-sm transition-colors shadow-sm">
                                    <Search size={18} />
                                </button>
                            </div>
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
                            <input type="text" name="Email" value={formData.Email} onChange={handleInputChange} className="flex-1 h-8 border border-gray-300 px-2 bg-white rounded-sm outline-none focus:border-blue-400" />
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

                        {/* NIC No */}
                        <div className="flex items-center gap-3">
                            <label className="w-32 font-bold text-gray-700">NIC No</label>
                            <input type="text" name="NIC_No" value={formData.NIC_No} onChange={handleInputChange} className="w-64 h-8 border border-gray-300 px-2 bg-white rounded-sm outline-none focus:border-blue-400" />
                        </div>

                        {/* Credit Limit and Period */}
                        <div className="flex items-center gap-3">
                            <label className="w-32 font-bold text-gray-700">Credit Limit</label>
                            <div className="flex-1 flex items-center gap-4 text-right">
                                <input type="text" name="Credit_Limit" value={formData.Credit_Limit} onChange={handleInputChange} className="w-56 h-8 border border-gray-300 px-2 bg-white rounded-sm outline-none focus:border-blue-400 text-right font-bold" />
                                <label className="flex-1 font-bold text-gray-700">Credit Period</label>
                                <div className="w-48 flex items-center gap-2">
                                    <input type="text" name="Credit_Period" value={formData.Credit_Period} onChange={handleInputChange} className="flex-1 h-8 border border-gray-300 px-2 bg-white rounded-sm outline-none focus:border-blue-400 text-center" />
                                    {/* <span className="font-black text-black text-[13px]">Days</span> */}
                                </div>
                            </div>
                        </div>

                        {/* Bank Detail */}
                        <div className="flex items-center gap-3">
                            <label className="w-32 font-bold text-gray-700">Bank Detail</label>
                            <div className="flex-1 flex gap-2">
                                <input 
                                    type="text" 
                                    value={formData.Bank_Name} 
                                    readOnly 
                                    placeholder="Select Bank..."
                                    className="flex-1 h-8 border border-gray-300 px-2 bg-gray-50 rounded-sm outline-none" 
                                />
                                <button 
                                    onClick={() => setShowBankSearch(true)} 
                                    className="w-9 h-8 bg-[#0078d4] text-white flex items-center justify-center hover:bg-[#005a9e] rounded-sm transition-colors shadow-sm"
                                >
                                    <Search size={18} />
                                </button>
                            </div>
                        </div>

                        {/* Branch and A/C No */}
                        <div className="flex items-center gap-3">
                            <label className="w-32 font-bold text-gray-700">Branch</label>
                            <div className="flex-1 flex items-center gap-4">
                                <input type="text" name="Brunch" value={formData.Brunch} onChange={handleInputChange} className="flex-1 h-8 border border-gray-300 px-2 bg-white rounded-sm outline-none focus:border-blue-400" />
                                <label className="w-16 font-bold text-gray-700 text-center">A/C No</label>
                                <input type="text" name="AC_Number" value={formData.AC_Number} onChange={handleInputChange} className="flex-1 h-8 border border-gray-300 px-2 bg-white rounded-sm outline-none focus:border-blue-400" />
                            </div>
                        </div>

                        {/* VAT and Customer Type */}
                        <div className="flex items-center gap-3">
                            <label className="w-32 font-bold text-gray-700">VAT Reg. No</label>
                            <div className="flex-1 flex items-center gap-4">
                                <input type="text" name="VAT_Number" value={formData.VAT_Number} onChange={handleInputChange} className="w-64 h-8 border border-gray-300 px-2 bg-white rounded-sm outline-none focus:border-blue-400" />
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <label className="w-32 font-bold text-gray-700">Customer Type</label>
                            <div className="flex-1 flex items-center justify-between">
                                <select name="Cust_Typ" value={formData.Cust_Typ} onChange={handleInputChange} className="w-64 h-8 border border-gray-300 px-2 bg-white rounded-sm outline-none focus:border-blue-400">
                                    <option value="">&lt; Type New... &gt;</option>
                                    {customerTypes.map(type => (<option key={type.v_Typ_Code || type.code} value={type.v_Typ_Code || type.code}>{type.v_Type || type.name}</option>))}
                                </select>
                                <label className="flex items-center gap-2 cursor-pointer mr-2">
                                    <input type="checkbox" name="Locked" checked={formData.Locked} onChange={handleInputChange} className="w-4 h-4 border-gray-400 text-[#0078d4] rounded-sm" />
                                    <span className="font-bold text-gray-700">Customer is Inactive</span>
                                </label>
                            </div>
                        </div>

                        {/* Area */}
                        <div className="flex items-center gap-3 pt-1">
                            <label className="w-32 font-bold text-gray-700">Area</label>
                            <div className="flex-1 flex gap-1 items-center">
                                <button onClick={fetchLookups} className="w-10 h-8 bg-white border border-gray-300 flex items-center justify-center hover:bg-gray-50 rounded-sm text-[#0078d4] shadow-sm"><RefreshCcw size={16} /></button>
                                <input type="text" value={formData.Area_Code} readOnly className="w-32 h-8 border border-gray-300 px-2 bg-gray-50 rounded-sm outline-none" />
                                <input type="text" value={formData.Area_Name} readOnly placeholder="Select Area..." className="flex-1 h-8 border border-gray-300 px-2 bg-gray-50 rounded-sm outline-none" />
                                <button onClick={() => setShowAreaSearch(true)} className="w-10 h-8 bg-[#0078d4] text-white flex items-center justify-center hover:bg-[#005a9e] rounded-sm shadow-sm"><Search size={18} /></button>
                            </div>
                        </div>

                        {/* Route */}
                        <div className="flex items-center gap-3 pt-1">
                            <label className="w-32 font-bold text-gray-700">Route</label>
                            <div className="flex-1 flex gap-1 items-center">
                                <button onClick={fetchLookups} className="w-10 h-8 bg-white border border-gray-300 flex items-center justify-center hover:bg-gray-50 rounded-sm text-[#0078d4] shadow-sm"><RefreshCcw size={16} /></button>
                                <input type="text" value={formData.Route_Code} readOnly className="w-32 h-8 border border-gray-300 px-2 bg-gray-50 rounded-sm outline-none" />
                                <input type="text" value={formData.Route_Name} readOnly placeholder="Select Route..." className="flex-1 h-8 border border-gray-300 px-2 bg-gray-50 rounded-sm outline-none" />
                                <button onClick={() => setShowRouteSearch(true)} className="w-10 h-8 bg-[#0078d4] text-white flex items-center justify-center hover:bg-[#005a9e] rounded-sm shadow-sm"><Search size={18} /></button>
                            </div>
                        </div>
                    </div>
                </div>
            </SimpleModal>

            {/* Area Search Modal */}
            {showAreaSearch && (
                <div className="fixed inset-0 z-[400] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowAreaSearch(false)} />
                    <div className="relative w-full max-w-md bg-[#f0f0f0] shadow-2xl rounded-sm border border-gray-400 overflow-hidden flex flex-col max-h-[70vh]">
                        <div className="p-3 border-b border-gray-300 flex justify-between items-center bg-white">
                            <h3 className="font-bold text-gray-700 text-sm">Select Area</h3>
                            <button onClick={() => setShowAreaSearch(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
                        </div>
                        <div className="p-3 bg-white">
                            <input 
                                type="text" 
                                placeholder="Search area..." 
                                className="w-full h-8 border border-gray-300 px-3 text-sm rounded-sm outline-none" 
                                value={areaSearchQuery} 
                                onChange={(e) => setAreaSearchQuery(e.target.value)} 
                            />
                        </div>
                        <div className="overflow-y-auto p-1 bg-white m-1 border border-gray-300">
                            <table className="w-full text-[12.5px] text-left">
                                <thead className="bg-[#f0f0f0] h-8 font-bold text-gray-600 text-[10px] uppercase">
                                    <tr>
                                        <th className="px-3 border-b">Code</th>
                                        <th className="px-3 border-b">Area Name</th>
                                        <th className="px-3 border-b text-center w-20">Select</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {areas.filter(a => (a.name || '').toLowerCase().includes(areaSearchQuery.toLowerCase()) || (a.code || '').toLowerCase().includes(areaSearchQuery.toLowerCase())).map(a => (
                                        <tr key={a.code} className="hover:bg-blue-50 h-8 transition-colors">
                                            <td className="px-3 border-b border-gray-100 font-bold text-[#0078d4]">{a.code}</td>
                                            <td className="px-3 border-b border-gray-100">{a.name}</td>
                                            <td className="px-3 border-b border-gray-100 text-center">
                                                <button onClick={() => selectArea(a)} className="bg-[#0078d4] text-white text-[9px] px-2 py-1 rounded-sm font-bold">SELECT</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* Route Search Modal */}
            {showRouteSearch && (
                <div className="fixed inset-0 z-[400] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowRouteSearch(false)} />
                    <div className="relative w-full max-w-md bg-[#f0f0f0] shadow-2xl rounded-sm border border-gray-400 overflow-hidden flex flex-col max-h-[70vh]">
                        <div className="p-3 border-b border-gray-300 flex justify-between items-center bg-white">
                            <h3 className="font-bold text-gray-700 text-sm">Select Route</h3>
                            <button onClick={() => setShowRouteSearch(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
                        </div>
                        <div className="p-3 bg-white">
                            <input 
                                type="text" 
                                placeholder="Search route..." 
                                className="w-full h-8 border border-gray-300 px-3 text-sm rounded-sm outline-none" 
                                value={routeSearchQuery} 
                                onChange={(e) => setRouteSearchQuery(e.target.value)} 
                            />
                        </div>
                        <div className="overflow-y-auto p-1 bg-white m-1 border border-gray-300">
                            <table className="w-full text-[12.5px] text-left">
                                <thead className="bg-[#f0f0f0] h-8 font-bold text-gray-600 text-[10px] uppercase">
                                    <tr>
                                        <th className="px-3 border-b">Code</th>
                                        <th className="px-3 border-b">Route Name</th>
                                        <th className="px-3 border-b text-center w-20">Select</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {routes.filter(r => (r.name || '').toLowerCase().includes(routeSearchQuery.toLowerCase()) || (r.code || '').toLowerCase().includes(routeSearchQuery.toLowerCase())).map(r => (
                                        <tr key={r.code} className="hover:bg-blue-50 h-8 transition-colors">
                                            <td className="px-3 border-b border-gray-100 font-bold text-[#0078d4]">{r.code}</td>
                                            <td className="px-3 border-b border-gray-100">{r.name}</td>
                                            <td className="px-3 border-b border-gray-100 text-center">
                                                <button onClick={() => selectRoute(r)} className="bg-[#0078d4] text-white text-[9px] px-2 py-1 rounded-sm font-bold">SELECT</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* Bank Search Modal */}
            {showBankSearch && (
                <div className="fixed inset-0 z-[400] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowBankSearch(false)} />
                    <div className="relative w-full max-w-md bg-[#f0f0f0] shadow-2xl rounded-sm border border-gray-400 overflow-hidden flex flex-col max-h-[70vh]">
                        <div className="p-3 border-b border-gray-300 flex justify-between items-center bg-white font-['Plus_Jakarta_Sans']">
                            <h3 className="font-bold text-gray-700 text-sm">Select Bank</h3>
                            <button onClick={() => setShowBankSearch(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
                        </div>
                        <div className="p-3 bg-white">
                            <input 
                                type="text" 
                                placeholder="Search bank..." 
                                className="w-full h-8 border border-gray-300 px-3 text-sm rounded-sm focus:border-[#0078d4] outline-none" 
                                value={bankSearchQuery} 
                                onChange={(e) => setBankSearchQuery(e.target.value)} 
                            />
                        </div>
                        <div className="overflow-y-auto p-1 bg-white m-1 border border-gray-300">
                            <table className="w-full text-[12.5px] text-left">
                                <thead className="bg-[#f0f0f0] sticky top-0 text-gray-700 font-bold uppercase text-[10px] h-8">
                                    <tr>
                                        <th className="px-3 border-b border-gray-300">Bank Name</th>
                                        <th className="px-3 border-b border-gray-300 text-center w-24">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {banks.filter(b => (b.name || '').toLowerCase().includes(bankSearchQuery.toLowerCase())).map(b => (
                                        <tr key={b.code} className="hover:bg-blue-50 transition-colors h-8">
                                            <td className="px-3 border-b border-gray-100 font-medium text-gray-700">{b.name}</td>
                                            <td className="px-3 border-b border-gray-100 text-center">
                                                <button 
                                                    onClick={() => selectBank(b)} 
                                                    className="bg-[#0078d4] text-white text-[9px] px-3 py-1 rounded-sm font-bold hover:bg-[#005a9e]"
                                                >
                                                    SELECT
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* Customer Search Modal */}
            {showSearchModal && (
                <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowSearchModal(false)} />
                    <div className="relative w-full max-w-4xl bg-[#f0f0f0] shadow-2xl rounded-sm border border-gray-400 overflow-hidden flex flex-col max-h-[85vh]">
                        <div className="p-3 border-b border-gray-300 flex justify-between items-center bg-white font-['Plus_Jakarta_Sans']">
                            <h3 className="font-bold text-gray-700 text-sm">Search Customers - {customersList.length} Found</h3>
                            <div className="flex gap-4">
                                <input type="text" placeholder="Search by name, code..." className="h-8 border border-gray-300 px-3 text-sm rounded-md w-64 focus:border-[#0078d4] outline-none" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                                <button onClick={() => setShowSearchModal(false)} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
                            </div>
                        </div>
                        <div className="overflow-y-auto p-2 font-['Plus_Jakarta_Sans'] bg-white m-1 border border-gray-300">
                            <table className="w-full text-[13px] text-left">
                                <thead className="bg-[#f0f0f0] sticky top-0 text-gray-700 font-bold uppercase text-[11px] tracking-wider h-9">
                                    <tr>
                                        <th className="px-3 border-b border-gray-300 text-center w-24">Code</th>
                                        <th className="px-3 border-b border-gray-300">Customer Name</th>
                                        <th className="px-3 border-b border-gray-300">Phone</th>
                                        <th className="px-3 border-b border-gray-300 text-center w-32">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {customersList.filter(c => (c.cust_Name || '').toLowerCase().includes(searchQuery.toLowerCase()) || (c.code || '').toLowerCase().includes(searchQuery.toLowerCase())).map(c => (
                                        <tr key={c.code} className="hover:bg-blue-50 transition-colors h-9">
                                            <td className="px-3 border-b border-gray-200 text-center font-bold text-[#0078d4]">{c.code || c.Code}</td>
                                            <td className="px-3 border-b border-gray-200 font-medium uppercase text-gray-700">{c.cust_Name || c.Cust_Name}</td>
                                            <td className="px-3 border-b border-gray-200 text-gray-500 font-medium">{c.phone || c.Phone}</td>
                                            <td className="px-3 border-b border-gray-200 text-center">
                                                <button onClick={() => selectCustomer(c.code || c.Code)} className="bg-[#0078d4] text-white text-[10px] px-4 py-1.5 rounded-sm font-bold hover:bg-[#005a9e]">SELECT</button>
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

export default CustomerMasterBoard;
