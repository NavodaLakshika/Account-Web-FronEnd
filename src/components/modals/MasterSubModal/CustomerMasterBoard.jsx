import React, { useState, useEffect } from 'react';
import SimpleModal from '../../SimpleModal';
import { Search, RotateCcw, Save, Trash2, RefreshCcw, UserCircle, Loader2, X, Briefcase, MapPin, Navigation, Building2, UserPlus } from 'lucide-react';
import { customerService } from '../../../services/customer.service';
import ConfirmModal from '../../modals/ConfirmModal';
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
    const [showTypeSearch, setShowTypeSearch] = useState(false);
    const [customersList, setCustomersList] = useState([]);
    const [bankSearchQuery, setBankSearchQuery] = useState('');
    const [areaSearchQuery, setAreaSearchQuery] = useState('');
    const [routeSearchQuery, setRouteSearchQuery] = useState('');
    const [typeSearchQuery, setTypeSearchQuery] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);

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
                Cont_Person: formData.Contact_Person,
                NIC: formData.NIC_No,
                Bank: formData.Bank_Name,
                Type: formData.Cust_Typ,
                Credit_Limit: parseFloat(formData.Credit_Limit) || 0,
                Credit_Period: (formData.Credit_Period || "0").toString()
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
        setShowConfirmModal(true);
    };

    const confirmDelete = async () => {
        setLoading(true);
        try {
            await customerService.delete(formData.Code);
            toast.success('Customer deleted');
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
                Code: data.code || data.Code || '',
                Cust_Name: data.cust_Name || data.Cust_Name || '',
                Address1: data.address1 || data.Address1 || '',
                Address2: data.address2 || data.Address2 || '',
                Phone: data.phone || data.Phone || '',
                Fax: data.fax || data.Fax || '',
                Email: data.email || data.Email || '',
                Web: data.web || data.Web || '',
                Contact_Person: data.cont_Person || data.cont_Person || data.contact_Person || data.Contact_Person || '',
                NIC_No: data.nic || data.NIC || data.niC_No || data.NIC_No || '',
                Credit_Limit: (data.credit_Limit || data.Credit_Limit || '0.00').toString(),
                Credit_Period: (data.credit_Period || data.Credit_Period || '0').toString(),
                Bank_Name: data.bank || data.Bank || data.bank_Name || data.Bank_Name || '',
                Bank_Code: String(data.bank_Code || data.Bank_Code || ''),
                Brunch: data.brunch || data.Brunch || '',
                AC_Number: data.ac_Number || data.AC_Number || '',
                VAT_Number: data.vat_Number || data.VAT_Number || '',
                Cust_Typ: data.type || data.Type || data.cust_Typ || data.Cust_Typ || '',
                Area_Code: data.area_Code || data.Area_Code || '',
                Area_Name: data.area_Name || data.Area_Name || '',
                Route_Code: data.route_Code || data.Route_Code || '',
                Route_Name: data.route_Name || data.Route_Name || '',
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

    const selectType = (type) => {
        setFormData(prev => ({
            ...prev,
            Cust_Typ: type
        }));
        setShowTypeSearch(false);
        setTypeSearchQuery('');
    };

    const footer = (
        <div className="bg-slate-50 px-6 py-4 w-full flex justify-end gap-3 border-t border-gray-100 mt-4 rounded-b-xl">
            <button onClick={handleSave} disabled={loading} className={`px-6 h-10 bg-[#50af60] text-white text-sm font-bold rounded-md shadow-md shadow-blue-200 hover:bg-[#24db4e] transition-all active:scale-95 flex items-center justify-center gap-2 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                {loading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} 
                {isEditMode ? 'Update' : 'Save'}
            </button>
            <button onClick={handleDelete} disabled={!isEditMode || loading} className={`px-6 h-10 bg-[#d13438] text-white text-sm font-bold rounded-md shadow-md shadow-red-200 hover:bg-[#a4262c] transition-all active:scale-95 flex items-center justify-center gap-2 ${(!isEditMode || loading) ? 'opacity-50 cursor-not-allowed' : ''}`}>
                <Trash2 size={14} /> Delete
            </button>
            <button onClick={handleClear} className="px-6 h-10 bg-[#00adff] text-white text-sm font-bold rounded-md hover:bg-[#0099e6] transition-all active:scale-95 flex items-center justify-center gap-2 border-none">
                <RotateCcw size={14} /> Clear
            </button>
        </div>
    );

    return (
        <>
            <SimpleModal isOpen={isOpen} onClose={onClose} title="Customer Master File" maxWidth="max-w-[850px]" footer={footer}>
                <div className="py-2 select-none font-['Tahoma']">
                    <div className="border-b border-gray-200 pb-4 flex items-center justify-center">
                        <h2 className="text-[17px] font-bold text-black uppercase tracking-tight">Enter New Customer Details & Update</h2>
                    </div>

                        <div className="space-y-4 text-[12.5px] mt-4">
                            {/* Row 1: ID and Name */}
                            <div className="flex items-center gap-6">
                                <label className="w-32 font-bold text-gray-700">Customer ID / Name</label>
                                <div className="flex-1 flex gap-3">
                                    <input type="text" name="Code" value={formData.Code} readOnly className="w-32 h-8 border border-gray-300 px-2 bg-white rounded-[5px] outline-none focus:border-blue-400 font-bold text-blue-600 shadow-sm" />
                                    <input type="text" name="Cust_Name" value={formData.Cust_Name} onChange={handleInputChange} placeholder="Enter Customer Name" className="flex-1 h-8 font-mono border border-gray-300 px-3 bg-white rounded-[5px] outline-none focus:border-blue-400 shadow-sm transition-all focus:shadow-md" />
                                    <button onClick={openSearch} className="w-10 h-8 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[5px] transition-all shadow-md active:scale-95">
                                        <Search size={18} />
                                    </button>
                                </div>
                            </div>

                            {/* Address Lines */}
                            <div className="flex items-center gap-6">
                                <label className="w-32 font-bold text-gray-700">Address 1</label>
                                <input type="text" name="Address1" value={formData.Address1} onChange={handleInputChange} className="flex-1 h-8 font-mono border border-gray-300 px-3 bg-white rounded-[5px] outline-none focus:border-blue-400 shadow-sm" />
                            </div>
                            <div className="flex items-center gap-6">
                                <label className="w-32 font-bold text-gray-700">Address 2</label>
                                <input type="text" name="Address2" value={formData.Address2} onChange={handleInputChange} className="flex-1 h-8 font-mono border border-gray-300 px-3 bg-white rounded-[5px] outline-none focus:border-blue-400 shadow-sm" />
                            </div>

                            {/* Phone and Fax */}
                            <div className="flex items-center gap-6">
                                <label className="w-32 font-bold text-gray-700">Phone Number</label>
                                <div className="flex-1 flex items-center gap-10">
                                    <input type="text" name="Phone" value={formData.Phone} onChange={handleInputChange} className="flex-1 h-8 font-mono border border-gray-300 px-3 bg-white rounded-[5px] outline-none focus:border-blue-400 shadow-sm" />
                                    <label className="w-20 font-bold text-gray-700 text-center">Fax</label>
                                    <input type="text" name="Fax" value={formData.Fax} onChange={handleInputChange} className="flex-1 h-8 font-mono border border-gray-300 px-3 bg-white rounded-[5px] outline-none focus:border-blue-400 shadow-sm" />
                                </div>
                            </div>

                            {/* Email and Web */}
                            <div className="flex items-center gap-6">
                                <label className="w-32 font-bold text-gray-700">E-Mail Address</label>
                                <input type="text" name="Email" value={formData.Email} onChange={handleInputChange} className="flex-1 h-8 font-mono border border-gray-300 px-3 bg-white rounded-[5px] outline-none focus:border-blue-400 shadow-sm" />
                            </div>

                            <div className="flex items-center gap-6">
                                <label className="w-32 font-bold text-gray-700">Web Site</label>
                                <input type="text" name="Web" value={formData.Web} onChange={handleInputChange} className="flex-1 h-8 font-mono border border-gray-300 px-3 bg-white rounded-[5px] outline-none focus:border-blue-400 shadow-sm" />
                            </div>

                            {/* Contact Person and NIC */}
                            <div className="flex items-center gap-6">
                                <label className="w-32 font-bold text-gray-700">Contact Person</label>
                                <div className="flex-1 flex items-center gap-10">
                                    <input type="text" name="Contact_Person" value={formData.Contact_Person} onChange={handleInputChange} className="flex-1 h-8 font-mono border border-gray-300 px-3 bg-white rounded-[5px] outline-none focus:border-blue-400 shadow-sm" />
                                    <label className="w-20 font-bold text-gray-700 text-center">NIC No</label>
                                    <input type="text" name="NIC_No" value={formData.NIC_No} onChange={handleInputChange} className="flex-1 h-8 font-mono border border-gray-300 px-3 bg-white rounded-[5px] outline-none focus:border-blue-400 shadow-sm" />
                                </div>
                            </div>

                            {/* Credit Limit and Period */}
                            <div className="flex items-center gap-6">
                                <label className="w-32 font-bold text-gray-700">Credit Limit</label>
                                <div className="flex-1 flex items-center gap-10">
                                    <input type="text" name="Credit_Limit" value={formData.Credit_Limit} onChange={handleInputChange} className="w-[245px] h-8 border border-gray-300 px-3 bg-white rounded-[5px] outline-none focus:border-blue-400 text-right font-bold shadow-sm" />
                                    <div className="flex-1 flex items-center gap-6">
                                        <label className="w-24 font-bold text-gray-700 text-center">Credit Period</label>
                                        <input type="text" name="Credit_Period" value={formData.Credit_Period} onChange={handleInputChange} className="w-[245px]  h-8 border border-gray-300 px-3 bg-white rounded-[5px] outline-none focus:border-blue-400 text-center shadow-sm" />
                                    </div>
                                </div>
                            </div>

                            {/* Bank Detail */}
                            <div className="flex items-center gap-6">
                                <label className="w-32 font-bold text-gray-700">Bank Detail</label>
                                <div className="flex-1 flex gap-3">
                                    <input
                                        type="text"
                                        value={formData.Bank_Name}
                                        readOnly
                                        placeholder="Select Bank..."
                                        className="flex-1 h-8 border border-gray-300 px-3 bg-gray-50 rounded-[5px] outline-none shadow-sm"
                                    />
                                    <button
                                        onClick={() => setShowBankSearch(true)}
                                        className="w-10 h-8 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[5px] transition-all shadow-md active:scale-95"
                                    >
                                        <Search size={18} />
                                    </button>
                                </div>
                            </div>

                            {/* Branch and A/C No */}
                            <div className="flex items-center gap-6">
                                <label className="w-32 font-bold text-gray-700">Branch Detail</label>
                                <div className="flex-1 flex items-center gap-10">
                                    <input type="text" name="Brunch" value={formData.Brunch} onChange={handleInputChange} placeholder="Branch Name" className="flex-1 h-8 font-mono border border-gray-300 px-3 bg-white rounded-[5px] outline-none focus:border-blue-400 shadow-sm" />
                                    <label className="w-20 font-bold text-gray-700 text-center">A/C No</label>
                                    <input type="text" name="AC_Number" value={formData.AC_Number} onChange={handleInputChange} placeholder="A/C Number" className="flex-1 h-8 font-mono border border-gray-300 px-3 bg-white rounded-[5px] outline-none focus:border-blue-400 shadow-sm" />
                                </div>
                            </div>

                            {/* VAT and Customer Type */}
                            <div className="flex items-center gap-6">
                                <label className="w-32 font-bold text-gray-700">VAT Reg. No</label>
                                <div className="flex-1 flex items-center gap-10">
                                    <input type="text" name="VAT_Number" value={formData.VAT_Number} onChange={handleInputChange} className="w-[245px] h-8 font-mono border border-gray-300 px-3 bg-white rounded-[5px] outline-none focus:border-blue-400 shadow-sm" />
                                    <div className="flex-1 flex items-center gap-6">
                                        <label className="w-24 font-bold text-gray-700 text-center">Cust. Type</label>
                                        <div className="flex-1 flex gap-2">
                                            <input 
                                                type="text" 
                                                value={formData.Cust_Typ} 
                                                readOnly 
                                                placeholder="Select Type..." 
                                                className="flex-1 h-8 border border-gray-300 px-3 bg-gray-50 rounded-[5px] outline-none shadow-sm" 
                                            />
                                            <button 
                                                onClick={() => setShowTypeSearch(true)} 
                                                className="w-10 h-8 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[5px] transition-all shadow-md active:scale-95"
                                            >
                                                <Search size={18} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-end pr-2">
                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <input type="checkbox" name="Locked" checked={formData.Locked} onChange={handleInputChange} className="w-5 h-5 rounded-[5px] border-gray-300 text-[#0078d4] focus:ring-[#0078d4] shadow-sm transition-all" /> 
                                    <span className={`font-bold transition-colors ${formData.Locked ? 'text-red-500' : 'text-gray-700'}`}>Customer is Inactive</span>
                                </label>
                            </div>

                            {/* Area Selection */}
                            <div className="flex items-center gap-6 pt-1">
                                <label className="w-32 font-bold text-gray-700">Area Selection</label>
                                <div className="flex-1 flex gap-2 items-center">
                                    <button onClick={fetchLookups} className="w-10 h-8 bg-white border border-gray-300 flex items-center justify-center hover:bg-gray-50 rounded-[5px] text-[#0078d4] shadow-sm transition-all active:scale-95"><RefreshCcw size={16} /></button>
                                    <input type="text" value={formData.Area_Code} readOnly className="w-24 h-8 border border-gray-300 px-3 bg-gray-50 rounded-[5px] outline-none shadow-sm font-mono text-center" />
                                    <input type="text" value={formData.Area_Name} readOnly placeholder="Select Area..." className="flex-1 h-8 border border-gray-300 px-3 bg-gray-50 rounded-[5px] outline-none shadow-sm" />
                                    <button onClick={() => setShowAreaSearch(true)} className="w-10 h-8 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[5px] shadow-md transition-all active:scale-95"><Search size={18} /></button>
                                </div>
                            </div>

                            {/* Route Selection */}
                            <div className="flex items-center gap-6 pt-1">
                                <label className="w-32 font-bold text-gray-700">Route Selection</label>
                                <div className="flex-1 flex gap-2 items-center">
                                    <button onClick={fetchLookups} className="w-10 h-8 bg-white border border-gray-300 flex items-center justify-center hover:bg-gray-50 rounded-sm text-[#0078d4] shadow-sm transition-all active:scale-95"><RefreshCcw size={16} /></button>
                                    <input type="text" value={formData.Route_Code} readOnly className="w-24 h-8 border border-gray-300 px-3 bg-gray-50 rounded-sm outline-none shadow-sm font-mono text-center" />
                                    <input type="text" value={formData.Route_Name} readOnly placeholder="Select Route..." className="flex-1 h-8 border border-gray-300 px-3 bg-gray-50 rounded-sm outline-none shadow-sm" />
                                    <button onClick={() => setShowRouteSearch(true)} className="w-10 h-8 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[5px] shadow-md transition-all active:scale-95"><Search size={18} /></button>
                                </div>
                            </div>
                        </div>
                    </div>
            </SimpleModal>

            {/* Customer Search Modal */}
            {showSearchModal && (
                <SimpleModal isOpen={showSearchModal} onClose={() => setShowSearchModal(false)} title={`Search Customers - ${customersList.length} Found`} maxWidth="max-w-2xl">
                    <div className="flex flex-col h-full font-['Tahoma']">
                        <div className="p-4 bg-slate-50 border-b border-gray-100 flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <Search size={16} className="text-gray-400" />
                                <span className="text-[12px] font-bold text-gray-500 uppercase tracking-widest">Search Facility</span>
                            </div>
                            <input 
                                type="text" 
                                placeholder="Find by Name, Code or Phone..." 
                                className="h-10 border border-gray-300 px-4 text-sm rounded-md w-80 focus:border-[#0285fd] outline-none shadow-sm transition-all" 
                                value={searchQuery} 
                                onChange={(e) => setSearchQuery(e.target.value)} 
                            />
                        </div>
                        <div className="overflow-y-auto max-h-[60vh] custom-scrollbar">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-[#f8fafc] sticky top-0 text-gray-600 font-bold uppercase text-[11px] tracking-wider z-10 shadow-sm leading-8">
                                    <tr>
                                        <th className="px-3 border-b text-center">Code</th>
                                        <th className="px-3 border-b">Customer Name</th>
                                        <th className="px-3 border-b">Phone</th>
                                        <th className="px-3 border-b text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {customersList.filter(c => (c.cust_Name || '').toLowerCase().includes(searchQuery.toLowerCase()) || (c.code || '').toLowerCase().includes(searchQuery.toLowerCase())).map(c => (
                                        <tr key={c.code} className="hover:bg-blue-50/50 transition-colors border-b border-gray-50">
                                            <td className="p-3 text-center font-mono font-bold text-gray-700">{c.code || c.Code}</td>
                                            <td className="p-3 font-medium font-mono uppercase text-gray-700">{c.cust_Name || c.Cust_Name}</td>
                                            <td className="p-3 font-mono text-gray-700">{c.phone || c.Phone}</td>
                                            <td className="p-3 text-center">
                                                <button onClick={() => selectCustomer(c.code || c.Code)} className="bg-[#e49e1b] text-white text-[10px] px-5 py-1.5 rounded-md font-bold hover:bg-[#cb9b34] shadow-sm transition-all active:scale-95 uppercase">SELECT</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </SimpleModal>
            )}

            {/* Area Search Modal */}
            <SimpleModal isOpen={showAreaSearch} onClose={() => setShowAreaSearch(false)} title={`Area Directory - ${areas.length} Found`} maxWidth="max-w-xl">
                <div className="flex flex-col h-full font-['Tahoma']">
                    <div className="p-4 bg-slate-50 border-b border-gray-100 flex items-center justify-between mb-2">
                        <span className="text-[12px] font-bold text-gray-500 uppercase tracking-wider">Search Facility</span>
                        <input 
                            type="text" 
                            placeholder="Search by code or name..." 
                            className="h-9 border border-gray-300 px-3 text-sm rounded-[5px] w-72 focus:border-[#0285fd] outline-none shadow-sm" 
                            value={areaSearchQuery} 
                            onChange={(e) => setAreaSearchQuery(e.target.value)} 
                        />
                    </div>
                    <div className="overflow-y-auto max-h-[50vh] custom-scrollbar">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-[#f8fafc] sticky top-0 text-gray-600 font-bold uppercase text-[11px] tracking-wider z-10 shadow-sm leading-8">
                                <tr>
                                    <th className="px-3 border-b">Code</th>
                                    <th className="px-3 border-b">Area Name</th>
                                    <th className="px-3 border-b text-center w-24">Select</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {areas.filter(a => (a.name || '').toLowerCase().includes(areaSearchQuery.toLowerCase()) || (a.code || '').toLowerCase().includes(areaSearchQuery.toLowerCase())).map(a => (
                                    <tr key={a.code} className="hover:bg-blue-50/50 transition-colors border-b border-gray-50">
                                        <td className="p-3 font-bold text-gray-700">{a.code}</td>
                                        <td className="p-3 font-mono uppercase text-gray-700">{a.name}</td>
                                        <td className="p-3 text-center">
                                            <button onClick={() => selectArea(a)} className="bg-[#e49e1b] text-white text-[10px] px-4 py-1.5 rounded-md font-bold hover:bg-[#cb9b34] shadow-sm transition-all active:scale-95">SELECT</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </SimpleModal>

            {/* Route Search Modal */}
            <SimpleModal isOpen={showRouteSearch} onClose={() => setShowRouteSearch(false)} title={`Route Directory - ${routes.length} Found`} maxWidth="max-w-xl">
                <div className="flex flex-col h-full font-['Tahoma']">
                    <div className="p-4 bg-slate-50 border-b border-gray-100 flex items-center justify-between mb-2">
                        <span className="text-[12px] font-bold text-gray-500 uppercase tracking-wider">Search Facility</span>
                        <input 
                            type="text" 
                            placeholder="Search by code or name..." 
                            className="h-9 border border-gray-300 px-3 text-sm rounded-[5px] w-72 focus:border-[#0285fd] outline-none shadow-sm" 
                            value={routeSearchQuery} 
                            onChange={(e) => setRouteSearchQuery(e.target.value)} 
                        />
                    </div>
                    <div className="overflow-y-auto max-h-[50vh] custom-scrollbar">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-[#f8fafc] sticky top-0 text-gray-600 font-bold uppercase text-[11px] tracking-wider z-10 shadow-sm leading-8">
                                <tr>
                                    <th className="px-3 border-b">Code</th>
                                    <th className="px-3 border-b">Route Name</th>
                                    <th className="px-3 border-b text-center w-24">Select</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {routes.filter(r => (r.name || '').toLowerCase().includes(routeSearchQuery.toLowerCase()) || (r.code || '').toLowerCase().includes(routeSearchQuery.toLowerCase())).map(r => (
                                    <tr key={r.code} className="hover:bg-blue-50/50 transition-colors border-b border-gray-50">
                                        <td className="p-3 font-bold text-gray-700">{r.code}</td>
                                        <td className="p-3 font-mono uppercase text-gray-700">{r.name}</td>
                                        <td className="p-3 text-center">
                                            <button onClick={() => selectRoute(r)} className="bg-[#e49e1b] text-white text-[10px] px-4 py-1.5 rounded-md font-bold hover:bg-[#cb9b34] shadow-sm transition-all active:scale-95">SELECT</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </SimpleModal>

            {/* Bank Search Modal */}
            <SimpleModal isOpen={showBankSearch} onClose={() => setShowBankSearch(false)} title={`Bank Directory - ${banks.length} Found`} maxWidth="max-w-xl">
                <div className="flex flex-col h-full font-['Tahoma']">
                    <div className="p-4 bg-slate-50 border-b border-gray-100 flex items-center justify-between mb-2">
                        <span className="text-[12px] font-bold text-gray-500 uppercase tracking-wider">Search Facility</span>
                        <input 
                            type="text" 
                            placeholder="Select and search bank repository..." 
                            className="h-9 border border-gray-300 px-3 text-sm rounded-[5px] w-72 focus:border-[#0285fd] outline-none shadow-sm" 
                            value={bankSearchQuery} 
                            onChange={(e) => setBankSearchQuery(e.target.value)} 
                        />
                    </div>
                    <div className="overflow-y-auto max-h-[50vh] custom-scrollbar">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-[#f8fafc] sticky top-0 text-gray-600 font-bold uppercase text-[11px] tracking-wider z-10 shadow-sm leading-8">
                                <tr>
                                    <th className="px-3 border-b">Code</th>
                                    <th className="px-3 border-b">Bank Name</th>
                                    <th className="px-3 border-b text-center w-32">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {banks.filter(b => (b.name || '').toLowerCase().includes(bankSearchQuery.toLowerCase()) || (b.code || '').toLowerCase().includes(bankSearchQuery.toLowerCase())).map((b, idx) => (
                                    <tr key={idx} className="hover:bg-blue-50/50 transition-colors border-b border-gray-50">
                                        <td className="p-3 font-bold text-gray-700 text-[11px]">{b.code}</td>
                                        <td className="p-3 font-mono uppercase text-gray-700 text-[11px]">{b.name}</td>
                                        <td className="p-3 text-center">
                                            <button onClick={() => selectBank(b)} className="bg-[#e49e1b] text-white text-[10px] px-5 py-1.5 rounded-md font-bold hover:bg-[#cb9b34] shadow-sm transition-all active:scale-95">SELECT</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </SimpleModal>

            {/* Customer Type Search Modal */}
            <SimpleModal isOpen={showTypeSearch} onClose={() => setShowTypeSearch(false)} title="Customer Type Directory" maxWidth="max-w-xl">
                <div className="flex flex-col h-full font-['Tahoma']">
                    <div className="p-4 bg-slate-50 border-b border-gray-100 flex items-center justify-between mb-2">
                        <span className="text-[12px] font-bold text-gray-500 uppercase tracking-wider">Search Facility</span>
                        <input 
                            type="text" 
                            placeholder="Search types..." 
                            className="h-9 border border-gray-300 px-3 text-sm rounded-[5px] w-72 focus:border-[#0285fd] outline-none shadow-sm" 
                            value={typeSearchQuery} 
                            onChange={(e) => setTypeSearchQuery(e.target.value)} 
                        />
                    </div>
                    <div className="overflow-y-auto max-h-[50vh] custom-scrollbar">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-[#f8fafc] sticky top-0 text-gray-600 font-bold uppercase text-[11px] tracking-wider z-10 shadow-sm leading-8">
                                <tr>
                                    <th className="px-3 border-b">Type Name</th>
                                    <th className="px-3 border-b text-center w-32">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {customerTypes.filter(t => (t || '').toLowerCase().includes(typeSearchQuery.toLowerCase())).map((t, idx) => (
                                    <tr key={idx} className="hover:bg-blue-50/50 transition-colors border-b border-gray-50">
                                        <td className="p-3 font-mono uppercase text-gray-700 text-[11px]">{t}</td>
                                        <td className="p-3 text-center">
                                            <button onClick={() => selectType(t)} className="bg-[#e49e1b] text-white text-[10px] px-5 py-1.5 rounded-md font-bold hover:bg-[#cb9b34] shadow-sm transition-all active:scale-95 uppercase">SELECT</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </SimpleModal>


            <ConfirmModal 
                isOpen={showConfirmModal} 
                onClose={() => setShowConfirmModal(false)} 
                onConfirm={confirmDelete} 
                title="Delete Customer" 
                message={`Are you sure you want to delete customer ${formData.Cust_Name}? All records for this customer will be permanently removed.`} 
                variant="danger" 
                loading={loading} 
                confirmText="Delete Now"
            />
        </>
    );
};

export default CustomerMasterBoard;
