import React, { useState, useEffect } from 'react';
import SimpleModal from '../components/SimpleModal';
import { Search, RotateCcw, Save, Trash2, Loader2, X } from 'lucide-react';
import { supplierService } from '../services/supplier.service';

import { getSessionData } from '../utils/session';
import { showSuccessToast, showErrorToast } from '../utils/toastUtils';


const VendorBoard = ({ isOpen, onClose }) => {
    const getInitialFormData = () => ({
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
        CurrentUser: ''
    });

    const [formData, setFormData] = useState(getInitialFormData());
    const [banks, setBanks] = useState([]);
    const [vendorTypes, setVendorTypes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [showSearchModal, setShowSearchModal] = useState(false);
    const [suppliersList, setSuppliersList] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        if (isOpen) {
            setFormData(getInitialFormData());
            const { companyCode, userName } = getSessionData();
            setFormData(prev => ({ 
                ...prev, 
                CurrentUser: userName,
                Company: companyCode
            }));
            fetchLookups();
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
            ...getInitialFormData(),
            CurrentUser: formData.CurrentUser,
            Company: formData.Company
        });
        setIsEditMode(false);
        showSuccessToast('Form cleared');
    };

    const handleSave = async () => {
        if (!formData.Supplier_Name) {
            showErrorToast('Supplier Name is required');
            return;
        }
        if (!formData.Vend_Typ) {
            showErrorToast('Vendor Type is required');
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

    const handleDelete = async () => {
        if (!isEditMode || !formData.Code) return;
        if (!window.confirm('Are you sure you want to delete this supplier?')) return;

        setLoading(true);
        try {
            await supplierService.delete(formData.Code);
            showSuccessToast('Supplier deleted');
            handleClear();
        } catch (error) {
            showErrorToast(error);
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
            showErrorToast('Failed to load suppliers');
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
            showSuccessToast('Supplier loaded');
        } catch (error) {
            showErrorToast(error);
        } finally {
            setLoading(false);
        }
    };

    const footer = (
        <div className="bg-slate-50/80 px-6 py-3 w-full flex justify-end gap-3 border-t border-slate-200 rounded-b-[5px]">
            <button 
                onClick={handleSave}
                disabled={loading}
                className={`px-6 py-3 bg-[#2bb744] hover:bg-[#259b3a] text-white font-mono font-bold text-sm uppercase tracking-widest rounded-[5px] shadow-md shadow-green-100 transition-all active:scale-95 flex items-center justify-center gap-2 border-none ${loading ? 'opacity-50' : ''}`}
            >
                {loading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} {isEditMode ? 'UPDATE' : 'SAVE'}
            </button>
            <button 
                onClick={handleDelete}
                disabled={!isEditMode || loading}
                className={`px-6 py-3 bg-[#ff3b30] hover:bg-[#e03127] text-white font-mono font-bold text-sm uppercase tracking-widest rounded-[5px] shadow-md shadow-red-100 transition-all active:scale-95 flex items-center justify-center gap-2 border-none ${(!isEditMode || loading) ? 'opacity-50' : ''}`}
            >
                <Trash2 size={14} /> DELETE
            </button>
            <button 
                onClick={handleClear}
                className="px-6 py-3 bg-[#00adff] hover:bg-[#0099e6] text-white font-mono font-bold text-sm uppercase tracking-widest rounded-[5px] transition-all active:scale-95 flex items-center justify-center gap-2 border-none"
            >
                <RotateCcw size={14} /> CLEAR
            </button>
            <button 
                onClick={onClose} 
                className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-500 font-mono font-bold text-sm uppercase tracking-widest rounded-[5px] transition-all active:scale-95 flex items-center justify-center gap-2 border-none"
            >
                <X size={14} /> EXIT
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
                <div className="space-y-4">
                    {/* ID and Name */}
                    <div className="bg-white p-4 border border-slate-200 rounded-[5px] space-y-3">
                        <div className="grid grid-cols-12 gap-3 items-center">
                            <label className="col-span-3 text-[11px] font-bold text-gray-500 uppercase">Supplier ID / Name</label>
                            <div className="col-span-3">
                                <input 
                                    type="text" 
                                    name="Code"
                                    value={formData.Code}
                                    onChange={handleInputChange}
                                    placeholder="AUTO"
                                    readOnly={isEditMode}
                                    className="w-full h-8 border border-slate-200 px-2 text-sm font-mono font-bold focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20 outline-none rounded bg-slate-50 transition-all"
                                />
                            </div>
                            <div className="col-span-12 md:col-span-5 relative">
                                <input 
                                    type="text" 
                                    name="Supplier_Name"
                                    value={formData.Supplier_Name}
                                    onChange={handleInputChange}
                                    placeholder="Enter Supplier Name"
                                    className="w-full h-8 border border-slate-200 px-2 text-sm outline-none rounded bg-slate-50 transition-all focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20"
                                />
                            </div>
                            <button 
                                onClick={openSearch}
                                className="col-span-1 w-8 h-8 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[5px] transition-all shadow-md active:scale-95 border-none"
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
                                className="flex-1 h-8 border border-slate-200 px-2 text-sm outline-none rounded bg-slate-50 transition-all focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20" 
                            />
                        </FormRow>

                        <FormRow label="Address 1">
                            <input type="text" name="Address1" value={formData.Address1} onChange={handleInputChange} className="flex-1 h-8 border border-slate-200 px-2 text-sm rounded bg-slate-50 transition-all focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20" />
                        </FormRow>
                        <FormRow label="Address 2">
                            <input type="text" name="Address2" value={formData.Address2} onChange={handleInputChange} className="flex-1 h-8 border border-slate-200 px-2 text-sm rounded bg-slate-50 transition-all focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20" />
                        </FormRow>

                        <div className="grid grid-cols-2 gap-4">
                            <FormRow label="Phone Number">
                                <input type="text" name="Phone" value={formData.Phone} onChange={handleInputChange} className="flex-1 h-8 border border-slate-200 px-2 text-sm rounded bg-slate-50 transition-all focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20" />
                            </FormRow>
                            <div className="flex items-center gap-2">
                                <label className="text-[11px] font-bold text-gray-500 uppercase w-20 text-center">Fax</label>
                                <input type="text" name="Fax" value={formData.Fax} onChange={handleInputChange} className="flex-1 h-8 border border-slate-200 px-2 text-sm rounded bg-slate-50 transition-all focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20" />
                            </div>
                        </div>

                        <FormRow label="E-Mail Address">
                            <input type="email" name="Email" value={formData.Email} onChange={handleInputChange} className="flex-1 h-8 border border-slate-200 px-2 text-sm rounded bg-slate-50 transition-all focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20" />
                        </FormRow>

                        <FormRow label="Web Site">
                            <input type="text" name="Web" value={formData.Web} onChange={handleInputChange} className="flex-1 h-8 border border-slate-200 px-2 text-sm rounded bg-slate-50 transition-all focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20" />
                        </FormRow>

                        <div className="grid grid-cols-2 gap-4">
                            <FormRow label="Contact Person">
                                <input type="text" name="Contact_Person" value={formData.Contact_Person} onChange={handleInputChange} className="flex-1 h-8 border border-slate-200 px-2 text-sm rounded bg-slate-50 transition-all focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20" />
                            </FormRow>
                            <div className="flex items-center gap-2">
                                <label className="text-[11px] font-bold text-gray-500 uppercase w-32 text-center">Credit Period</label>
                                <input type="number" name="Credit_Period" value={formData.Credit_Period} onChange={handleInputChange} className="w-20 h-8 border border-slate-200 px-2 text-sm rounded bg-slate-50 transition-all focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20" />
                                <span className="text-sm font-mono font-bold text-slate-600">Days</span>
                            </div>
                        </div>

                        <FormRow label="Vender Type">
                            <select 
                                name="Vend_Typ" 
                                value={formData.Vend_Typ} 
                                onChange={handleInputChange}
                                className="flex-1 h-8 border border-slate-200 px-2 text-sm bg-slate-50 rounded outline-none transition-all focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20"
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
                                className="flex-1 h-8 border border-slate-200 px-2 text-sm bg-slate-50 rounded outline-none transition-all focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20"
                            >
                                <option value="">Select Bank</option>
                                {banks.map(b => <option key={b.id} value={b.bank_Name}>{b.bank_Name}</option>)}
                            </select>
                        </FormRow>

                        <div className="grid grid-cols-2 gap-4">
                            <FormRow label="Branch">
                                <input type="text" name="Brunch" value={formData.Brunch} onChange={handleInputChange} className="flex-1 h-8 border border-slate-200 px-2 text-sm rounded bg-slate-50 transition-all focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20" />
                            </FormRow>
                            <div className="flex items-center gap-2">
                                <label className="text-[11px] font-bold text-gray-500 uppercase w-24 text-center">A/C No</label>
                                <input type="text" name="AC_Number" value={formData.AC_Number} onChange={handleInputChange} className="flex-1 h-8 border border-slate-200 px-2 text-sm rounded bg-slate-50 transition-all focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <FormRow label="VAT Reg. No">
                                <input type="text" name="VAT_Number" value={formData.VAT_Number} onChange={handleInputChange} className="flex-1 h-8 border border-slate-200 px-2 text-sm rounded bg-slate-50 transition-all focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20" />
                            </FormRow>
                            <div className="flex items-center gap-2 justify-center">
                                <input 
                                    type="checkbox" 
                                    id="locked-v" 
                                    name="Locked" 
                                    checked={formData.Locked} 
                                    onChange={handleInputChange} 
                                    className="w-4 h-4 border-slate-300 rounded text-blue-600 focus:ring-[#00D1FF]"
                                />
                                <label htmlFor="locked-v" className="text-[11px] font-bold text-gray-500 uppercase">Supplier is Inactive</label>
                            </div>
                        </div>
                    </div>
                </div>
            </SimpleModal>

            {/* Search Modal */}
            {showSearchModal && (
                <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setShowSearchModal(false)} />
                    <div className="relative w-full max-w-2xl bg-white shadow-2xl rounded-[5px] border border-slate-200 overflow-hidden flex flex-col max-h-[80vh]">
                        <div className="px-6 py-3.5 border-b border-slate-200 flex justify-between items-center bg-white">
                            <h3 className="text-[15px] font-mono font-bold text-slate-800 uppercase tracking-widest">Search Suppliers</h3>
                            <div className="flex gap-2 items-center">
                                <input 
                                    type="text" 
                                    placeholder="Name or ID..."
                                    className="h-8 border border-slate-200 px-3 text-sm bg-slate-50 rounded outline-none focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20 transition-all w-64"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                                <button 
                                    onClick={() => setShowSearchModal(false)} 
                                    className="w-8 h-8 bg-white/10 hover:bg-slate-100 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 transition-all border-none"
                                    title="Close"
                                >
                                    <X size={15} strokeWidth={2} />
                                </button>
                            </div>
                        </div>
                        <div className="overflow-y-auto no-scrollbar">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50/80 sticky top-0 text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest border-b border-slate-200">
                                    <tr>
                                        <th className="p-3 border-b border-slate-200">Code</th>
                                        <th className="p-3 border-b border-slate-200">Supplier Name</th>
                                        <th className="p-3 border-b border-slate-200 w-24 text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {suppliersList
                                        .filter(s => (s.supplier_Name || s.Supplier_Name)?.toLowerCase().includes(searchQuery.toLowerCase()) || (s.code || s.Code)?.toLowerCase().includes(searchQuery.toLowerCase()))
                                        .map(s => (
                                        <tr key={s.code || s.Code} className="hover:bg-slate-50 transition-colors group">
                                            <td className="p-3 border-b border-slate-100 font-mono text-[12px] text-slate-600">{s.code || s.Code}</td>
                                            <td className="p-3 border-b border-slate-100 text-[12px] text-slate-700">{s.supplier_Name || s.Supplier_Name}</td>
                                            <td className="p-3 border-b border-slate-100 text-center">
                                                <button 
                                                    onClick={() => selectSupplier(s.code || s.Code)}
                                                    className="bg-[#e49e1b] text-white text-[9px] px-4 py-1.5 rounded-[5px] font-mono font-bold uppercase tracking-widest hover:bg-[#cb9b34] transition-all active:scale-95"
                                                >
                                                    Select
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {suppliersList.length === 0 && (
                                        <tr>
                                            <td colSpan="3" className="p-8 text-center text-slate-300 font-mono text-[11px] uppercase tracking-widest">No suppliers found.</td>
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
        <label className="text-[11px] font-bold text-gray-500 uppercase w-32 shrink-0">{label}</label>
        {children}
    </div>
);

export default VendorBoard;
