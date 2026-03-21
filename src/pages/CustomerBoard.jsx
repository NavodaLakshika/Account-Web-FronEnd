import React, { useState, useEffect } from 'react';
import SimpleModal from '../components/SimpleModal';
import { Search, RotateCcw, Save, Trash2, Loader2 , X} from 'lucide-react';
import { customerService } from '../services/customer.service';
import { toast } from 'react-hot-toast';

const CustomerBoard = ({ isOpen, onClose }) => {
    const initialState = {
        Code: '',
        Cust_Name: '',
        Address1: '',
        Address2: '',
        Phone: '',
        Fax: '',
        Email: '',
        Web: '',
        Cont_Person: '',
        NIC: '',
        Credit_Period: '0',
        Credit_Limit: 0,
        Bank: '',
        Brunch: '',
        AC_Number: '',
        VAT_Number: '',
        Type: 'Regular',
        Area_Code: '',
        Route_Code: '',
        Locked: false,
        CurrentUser: 'SYSTEM'
    };

    const [formData, setFormData] = useState(initialState);
    const [areas, setAreas] = useState([]);
    const [routes, setRoutes] = useState([]);
    const [banks, setBanks] = useState([]);
    const [types, setTypes] = useState(['Platinum', 'Regular']);
    const [loading, setLoading] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [showSearchModal, setShowSearchModal] = useState(false);
    const [customersList, setCustomersList] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        if (isOpen) {
            fetchLookups();
            const user = JSON.parse(localStorage.getItem('user'));
            if (user) {
                setFormData(prev => ({ ...prev, CurrentUser: user.emp_Name || 'SYSTEM' }));
            }
        }
    }, [isOpen]);

    const fetchLookups = async () => {
        try {
            const [areasData, routesData, banksData, typesData] = await Promise.all([
                customerService.getAreas(),
                customerService.getRoutes(),
                customerService.getBanks(),
                customerService.getTypes()
            ]);
            setAreas(areasData || []);
            setRoutes(routesData || []);
            setBanks(banksData || []);
            if (typesData && typesData.length > 0) setTypes(typesData);
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
            CurrentUser: formData.CurrentUser
        });
        setIsEditMode(false);
        toast.success('Form cleared');
    };

    const handleSave = async () => {
        if (!formData.Cust_Name) {
            toast.error('Customer Name is required');
            return;
        }
        if (!formData.Type) {
            toast.error('Customer Type is required');
            return;
        }

        setLoading(true);
        try {
            const payload = {
                ...formData,
                Credit_Period: String(formData.Credit_Period || '0'),
                Credit_Limit: Number(formData.Credit_Limit || 0)
            };

            if (isEditMode) {
                await customerService.update(formData.Code, payload);
                toast.success('Customer updated successfully');
            } else {
                const response = await customerService.create(payload);
                setFormData(prev => ({ ...prev, Code: response.code }));
                toast.success(`Customer created: ${response.code}`);
                if (response.nameExists) {
                    toast.error('Warning: A customer with this name already exists.');
                }
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
        } catch (error) {
            toast.error('Failed to load customers');
        } finally {
            setLoading(false);
        }
    };

    const selectCustomer = async (code) => {
        setLoading(true);
        try {
            const data = await customerService.getByCode(code);
            // Map backend potentially PascalCase/camelCase response to our PascalCase state
            setFormData({
                Code: data.code || data.Code,
                Cust_Name: data.cust_Name || data.Cust_Name,
                Address1: data.address1 || data.Address1,
                Address2: data.address2 || data.Address2,
                Phone: data.phone || data.Phone,
                Fax: data.fax || data.Fax,
                Email: data.email || data.Email,
                Web: data.web || data.Web,
                Cont_Person: data.cont_Person || data.Cont_Person,
                NIC: data.nic || data.NIC,
                Credit_Period: String(data.credit_Period || data.Credit_Period || '0'),
                Credit_Limit: Number(data.credit_Limit || data.Credit_Limit || 0),
                Bank: data.bank || data.Bank,
                Brunch: data.brunch || data.Brunch,
                AC_Number: data.ac_Number || data.AC_Number,
                VAT_Number: data.vat_Number || data.VAT_Number,
                Type: data.type || data.Type,
                Area_Code: data.area_Code || data.Area_Code,
                Route_Code: data.route_Code || data.Route_Code,
                Locked: (data.locked || data.Locked) === 1,
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
        <>
            <button 
                onClick={handleClear}
                className="px-6 h-10 bg-slate-100 text-slate-600 text-sm font-bold rounded-md hover:bg-slate-200 transition-all active:scale-95 flex items-center gap-2"
            >
                <RotateCcw size={14} /> Clear
            </button>
            <button 
                onClick={handleDelete}
                disabled={!isEditMode || loading}
                className={`px-6 h-10 bg-[#d13438] text-white text-sm font-bold rounded-md shadow-md shadow-red-200 hover:bg-[#a4262c] transition-all active:scale-95 flex items-center gap-2 ${(!isEditMode || loading) ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
                <Trash2 size={14} /> Delete
            </button>
            <button 
                onClick={handleSave}
                disabled={loading}
                className={`px-6 h-10 bg-[#0078d4] text-white text-sm font-bold rounded-md shadow-md shadow-blue-200 hover:bg-[#005a9e] transition-all active:scale-95 flex items-center gap-2 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
                {loading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} 
                {isEditMode ? 'Update' : 'Save'}
            </button>
            <button onClick={onClose} className="px-6 h-10 bg-slate-100 text-slate-600 text-sm font-bold rounded-md hover:bg-slate-200 transition-all active:scale-95">
                <X size={14} /> Exit
            </button>
        </>
    );

    return (
        <>
            <SimpleModal
                isOpen={isOpen}
                onClose={onClose}
                title="Customer Information"
                maxWidth="max-w-5xl"
                footer={footer}
            >
                <div className="space-y-4">
                    {/* ID and Name */}
                    <div className="grid grid-cols-12 gap-4 border-b border-gray-200 pb-4">
                        <div className="col-span-3">
                            <label className="block text-xs font-bold text-gray-700 mb-1">Customer ID</label>
                            <div className="flex gap-1">
                                <input 
                                    type="text" 
                                    name="Code"
                                    value={formData.Code}
                                    onChange={handleInputChange}
                                    className="w-full h-8 border border-gray-300 px-2 text-sm bg-gray-50 font-bold" 
                                    placeholder="AUTO"
                                    readOnly={isEditMode}
                                />
                                <button 
                                    onClick={openSearch}
                                    className="w-8 h-8 bg-gray-100 border border-gray-300 flex items-center justify-center hover:bg-gray-200"
                                >
                                    <Search size={14} />
                                </button>
                            </div>
                        </div>
                        <div className="col-span-9">
                            <label className="block text-xs font-bold text-gray-700 mb-1">Customer Name</label>
                            <input 
                                type="text" 
                                name="Cust_Name"
                                value={formData.Cust_Name}
                                onChange={handleInputChange}
                                className="w-full h-8 border border-gray-300 px-2 text-sm focus:border-blue-500 outline-none" 
                                placeholder="Enter customer name..." 
                            />
                        </div>
                    </div>

                    {/* Main Info */}
                    <div className="grid grid-cols-2 gap-8">
                        {/* Left Side: Contact */}
                        <div className="space-y-3">
                            <h3 className="text-xs font-bold text-blue-800 uppercase border-b border-blue-100 pb-1">Contact Details</h3>
                            <div className="grid grid-cols-1 gap-2">
                                <FormRow label="Address 1">
                                    <input type="text" name="Address1" value={formData.Address1} onChange={handleInputChange} className="flex-1 h-7 border border-gray-300 px-2 text-sm" />
                                </FormRow>
                                <FormRow label="Address 2">
                                    <input type="text" name="Address2" value={formData.Address2} onChange={handleInputChange} className="flex-1 h-7 border border-gray-300 px-2 text-sm" />
                                </FormRow>
                                <FormRow label="Phone">
                                    <input type="text" name="Phone" value={formData.Phone} onChange={handleInputChange} className="flex-1 h-7 border border-gray-300 px-2 text-sm" />
                                </FormRow>
                                <FormRow label="Fax">
                                    <input type="text" name="Fax" value={formData.Fax} onChange={handleInputChange} className="flex-1 h-7 border border-gray-300 px-2 text-sm" />
                                </FormRow>
                                <FormRow label="Contact Person">
                                    <input type="text" name="Cont_Person" value={formData.Cont_Person} onChange={handleInputChange} className="flex-1 h-7 border border-gray-300 px-2 text-sm" />
                                </FormRow>
                                <FormRow label="Email">
                                    <input type="email" name="Email" value={formData.Email} onChange={handleInputChange} className="flex-1 h-7 border border-gray-300 px-2 text-sm" />
                                </FormRow>
                                <FormRow label="Website">
                                    <input type="text" name="Web" value={formData.Web} onChange={handleInputChange} className="flex-1 h-7 border border-gray-300 px-2 text-sm" />
                                </FormRow>
                                <FormRow label="NIC">
                                    <input type="text" name="NIC" value={formData.NIC} onChange={handleInputChange} className="flex-1 h-7 border border-gray-300 px-2 text-sm" />
                                </FormRow>
                            </div>
                        </div>

                        {/* Right Side: Financial & Settings */}
                        <div className="space-y-6">
                            <div className="space-y-3">
                                <h3 className="text-xs font-bold text-blue-800 uppercase border-b border-blue-100 pb-1">Credit & Financial</h3>
                                <div className="grid grid-cols-1 gap-2">
                                    <FormRow label="Credit Limit">
                                        <input type="number" name="Credit_Limit" value={formData.Credit_Limit} onChange={handleInputChange} className="flex-1 h-7 border border-gray-300 px-2 text-sm text-right" />
                                    </FormRow>
                                    <FormRow label="Credit Period">
                                        <div className="flex items-center gap-2 flex-1">
                                            <input type="number" name="Credit_Period" value={formData.Credit_Period} onChange={handleInputChange} className="w-20 h-7 border border-gray-300 px-2 text-sm" />
                                            <span className="text-xs text-gray-500">Days</span>
                                        </div>
                                    </FormRow>
                                    <FormRow label="VAT/Tax ID">
                                        <input type="text" name="VAT_Number" value={formData.VAT_Number} onChange={handleInputChange} className="flex-1 h-7 border border-gray-300 px-2 text-sm" />
                                    </FormRow>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <h3 className="text-xs font-bold text-blue-800 uppercase border-b border-blue-100 pb-1">Banking</h3>
                                <div className="grid grid-cols-1 gap-2">
                                    <FormRow label="Bank Name">
                                        <select 
                                            name="Bank" 
                                            value={formData.Bank} 
                                            onChange={handleInputChange} 
                                            className="flex-1 h-7 border border-gray-300 px-1 text-sm bg-white"
                                        >
                                            <option value="">Select Bank...</option>
                                            {banks.map(b => <option key={b.id} value={b.bank_Name}>{b.bank_Name}</option>)}
                                        </select>
                                    </FormRow>
                                    <FormRow label="Branch">
                                        <input type="text" name="Brunch" value={formData.Brunch} onChange={handleInputChange} className="flex-1 h-7 border border-gray-300 px-2 text-sm" />
                                    </FormRow>
                                    <FormRow label="Account No">
                                        <input type="text" name="AC_Number" value={formData.AC_Number} onChange={handleInputChange} className="flex-1 h-7 border border-gray-300 px-2 text-sm" />
                                    </FormRow>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Geography & Categorization */}
                    <div className="bg-gray-50 p-4 border border-gray-200 space-y-3">
                        <h3 className="text-xs font-bold text-gray-700 uppercase">Categorization & Geography</h3>
                        <div className="grid grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <FormRow label="Type">
                                    <select 
                                        name="Type" 
                                        value={formData.Type} 
                                        onChange={handleInputChange} 
                                        className="flex-1 h-7 border border-gray-300 px-1 text-sm bg-white"
                                    >
                                        <option value="">Select Type...</option>
                                        {types.map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                </FormRow>
                                <div className="flex items-center gap-2 ml-[120px]">
                                    <input 
                                        type="checkbox" 
                                        id="locked" 
                                        name="Locked" 
                                        checked={formData.Locked} 
                                        onChange={handleInputChange} 
                                        className="w-4 h-4" 
                                    />
                                    <label htmlFor="locked" className="text-xs text-gray-700 font-bold">Mark as Locked (Inactive)</label>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <FormRow label="Area">
                                    <div className="flex gap-1 flex-1">
                                        <input 
                                            type="text" 
                                            name="Area_Code" 
                                            value={formData.Area_Code} 
                                            onChange={handleInputChange} 
                                            className="w-16 h-7 border border-gray-300 px-2 text-sm" 
                                        />
                                        <select 
                                            value={formData.Area_Code} 
                                            onChange={(e) => setFormData(p => ({ ...p, Area_Code: e.target.value }))}
                                            className="flex-1 h-7 border border-gray-300 px-1 text-sm bg-white"
                                        >
                                            <option value="">Select Area...</option>
                                            {areas.map(a => <option key={a.code} value={a.code}>{a.area_Name}</option>)}
                                        </select>
                                    </div>
                                </FormRow>
                                <FormRow label="Route">
                                    <div className="flex gap-1 flex-1">
                                        <input 
                                            type="text" 
                                            name="Route_Code" 
                                            value={formData.Route_Code} 
                                            onChange={handleInputChange} 
                                            className="w-16 h-7 border border-gray-300 px-2 text-sm" 
                                        />
                                        <select 
                                            value={formData.Route_Code} 
                                            onChange={(e) => setFormData(p => ({ ...p, Route_Code: e.target.value }))}
                                            className="flex-1 h-7 border border-gray-300 px-1 text-sm bg-white"
                                        >
                                            <option value="">Select Route...</option>
                                            {routes.map(r => <option key={r.code} value={r.code}>{r.route_Name}</option>)}
                                        </select>
                                    </div>
                                </FormRow>
                            </div>
                        </div>
                    </div>
                </div>
            </SimpleModal>

            {/* Simple Search Modal */}
            {showSearchModal && (
                <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setShowSearchModal(false)} />
                    <div className="relative w-full max-w-2xl bg-white shadow-2xl rounded-xl border border-gray-100 overflow-hidden flex flex-col max-h-[80vh]">
                        <div className="px-6 py-4 flex items-center justify-between border-b border-gray-100 bg-white select-none">
                            <h3 className="text-lg font-bold text-slate-800 tracking-tight">Search Customers</h3>
                            <input 
                                type="text" 
                                placeholder="Search by name or code..."
                                className="h-9 border border-gray-300 px-3 text-sm rounded-md w-64"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="overflow-y-auto p-2">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-100 sticky top-0">
                                    <tr>
                                        <th className="p-2 border">Code</th>
                                        <th className="p-2 border">Name</th>
                                        <th className="p-2 border w-20">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {customersList
                                        .filter(c => (c.cust_Name || c.Cust_Name)?.toLowerCase().includes(searchQuery.toLowerCase()) || (c.code || c.Code)?.toLowerCase().includes(searchQuery.toLowerCase()))
                                        .map(c => (
                                        <tr key={c.code || c.Code} className="hover:bg-blue-50">
                                            <td className="p-2 border font-mono">{c.code || c.Code}</td>
                                            <td className="p-2 border">{c.cust_Name || c.Cust_Name}</td>
                                            <td className="p-2 border">
                                                <button 
                                                    onClick={() => selectCustomer(c.code || c.Code)}
                                                    className="w-full bg-blue-600 text-white text-xs py-1 rounded hover:bg-blue-700"
                                                >
                                                    Select
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {customersList.length === 0 && (
                                        <tr>
                                            <td colSpan="3" className="p-4 text-center text-gray-500">No customers found.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <div className="bg-slate-50 px-6 py-4 flex justify-end gap-3 border-t border-gray-100">
                            <button onClick={() => setShowSearchModal(false)} className="px-6 h-10 flex items-center justify-center bg-slate-100 text-slate-600 text-sm font-bold rounded-md hover:bg-slate-200 transition-all active:scale-95">Close</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

const FormRow = ({ label, children }) => (
    <div className="flex items-center">
        <label className="text-xs font-semibold text-gray-600 w-[120px] shrink-0">{label}</label>
        {children}
    </div>
);

export default CustomerBoard;
;
