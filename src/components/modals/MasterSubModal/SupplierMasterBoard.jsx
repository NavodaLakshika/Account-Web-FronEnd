import React, { useState, useEffect } from 'react';
import SimpleModal from '../../../components/SimpleModal';
import { Search, Save, RotateCcw, Trash2, CheckCircle } from 'lucide-react';
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

    const handleDelete = async () => { 
        if (!isEditMode || !formData.Code) return; 
        if (!window.confirm(`Are you sure you want to delete supplier "${formData.Supplier_Name}"?`)) return;
        setLoading(true);
        try { 
            await supplierService.delete(formData.Code); 
            showSuccessToast('Supplier deleted successfully'); 
            handleClear(); 
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

    const inputClass = "flex-1 min-w-0 h-8 border border-slate-200 rounded px-3 text-[12px] font-bold text-gray-700 bg-slate-50 outline-none transition-all focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20";
    const labelClass = "text-[11px] font-bold text-gray-500 uppercase w-32 shrink-0";

    return (
        <>
            <SimpleModal
                isOpen={isOpen}
                onClose={onClose}
                title="Supplier Master Directory"
                maxWidth="max-w-[1050px]"
                footer={
                    <div className="bg-slate-50 px-6 py-4 w-full flex justify-between items-center border-t border-slate-200 rounded-b-xl">
                        <div className="flex gap-3">
                            <button
                                onClick={handleDelete}
                                disabled={!isEditMode || loading}
                                className={`px-6 py-3 font-mono font-bold text-sm uppercase tracking-widest rounded-[5px] transition-all flex items-center justify-center gap-2 border-none ${(!isEditMode || loading) ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-[#ff3b30] hover:bg-[#e03127] text-white shadow-md shadow-red-100 active:scale-95'}`}
                            >
                                <Trash2 size={14} /> DELETE DOC
                            </button>
                            <button
                                onClick={handleClear}
                                className="px-6 py-3 bg-[#00adff] hover:bg-[#0099e6] text-white font-mono font-bold text-sm uppercase tracking-widest rounded-[5px] transition-all active:scale-95 flex items-center justify-center gap-2 border-none"
                            >
                                <RotateCcw size={14} /> CLEAR FORM
                            </button>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={handleSave}
                                disabled={loading}
                                className="px-6 py-3 bg-[#2bb744] hover:bg-[#259b3a] text-white font-mono font-bold text-sm uppercase tracking-widest rounded-[5px] shadow-md shadow-green-100 transition-all active:scale-95 flex items-center justify-center gap-2 border-none"
                            >
                                <CheckCircle size={14} /> {isEditMode ? 'UPDATE & SAVE' : 'SAVE & APPLY'}
                            </button>
                        </div>
                    </div>
                }
            >
                <div className="space-y-4 overflow-y-auto no-scrollbar font-['Tahoma']">
                    <div className="bg-white p-4 border border-slate-200 rounded-[5px] space-y-4">
                        <div className="grid grid-cols-12 gap-x-6 gap-y-4">
                            
                            {/* Row 1 */}
                            <div className="col-span-6 flex items-center gap-2">
                                <label className={labelClass}>Supplier Code</label>
                                <div className="flex-1 flex gap-1 h-8 min-w-0">
                                    <input 
                                        type="text" 
                                        name="Code" 
                                        value={formData.Code} 
                                        onChange={handleInput} 
                                        className="flex-1 min-w-0 h-8 border border-slate-200 px-3 text-[12px] font-bold text-blue-600 bg-slate-50 rounded outline-none transition-all focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20" 
                                        placeholder="Auto Gen"
                                        readOnly
                                    />
                                    <button onClick={openSearch} className="w-10 h-8 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[5px] transition-all shadow-md active:scale-95 shrink-0">
                                        <Search size={16} />
                                    </button>
                                </div>
                            </div>
                            
                            <div className="col-span-6 flex items-center gap-2">
                                <label className={labelClass}>Supplier Name</label>
                                <input type="text" name="Supplier_Name" value={formData.Supplier_Name} onChange={handleInput} className={inputClass} />
                            </div>

                            {/* Row 2 */}
                            <div className="col-span-6 flex items-center gap-2">
                                <label className={labelClass}>Distrb. Company</label>
                                <input type="text" name="Destibution_Name" value={formData.Destibution_Name} onChange={handleInput} className={inputClass} />
                            </div>

                            <div className="col-span-6 flex items-center gap-2">
                                <label className={labelClass}>Vendor Type</label>
                                <div className="flex-1 flex gap-1 h-8 min-w-0">
                                    <input
                                        type="text"
                                        readOnly
                                        value={formData.Vend_Typ}
                                        placeholder="Select Type..."
                                        className="flex-1 min-w-0 h-8 border border-slate-200 px-3 text-[12px] font-bold text-red-600 bg-slate-50 rounded outline-none cursor-pointer transition-all focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20"
                                        onClick={() => setShowVTModal(true)}
                                    />
                                    <button onClick={() => setShowVTModal(true)} className="w-10 h-8 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[5px] transition-all shadow-md active:scale-95 shrink-0">
                                        <Search size={16} />
                                    </button>
                                </div>
                            </div>

                            {/* Row 3 */}
                            <div className="col-span-6 flex items-center gap-2">
                                <label className={labelClass}>Contact Person</label>
                                <input type="text" name="Contact_Person" value={formData.Contact_Person} onChange={handleInput} className={inputClass} />
                            </div>
                            <div className="col-span-6 flex items-center gap-2">
                                <label className={labelClass}>Phone Number</label>
                                <input type="text" name="Phone" value={formData.Phone} onChange={handleInput} className={inputClass} />
                            </div>

                            {/* Row 4 */}
                            <div className="col-span-6 flex items-center gap-2">
                                <label className={labelClass}>Address Line 1</label>
                                <input type="text" name="Address1" value={formData.Address1} onChange={handleInput} className={inputClass} />
                            </div>
                            <div className="col-span-6 flex items-center gap-2">
                                <label className={labelClass}>Fax</label>
                                <input type="text" name="Fax" value={formData.Fax} onChange={handleInput} className={inputClass} />
                            </div>

                            {/* Row 5 */}
                            <div className="col-span-6 flex items-center gap-2">
                                <label className={labelClass}>Address Line 2</label>
                                <input type="text" name="Address2" value={formData.Address2} onChange={handleInput} className={inputClass} />
                            </div>
                            <div className="col-span-6 flex items-center gap-2">
                                <label className={labelClass}>Email Address</label>
                                <input type="email" name="Email" value={formData.Email} onChange={handleInput} className={inputClass} />
                            </div>

                            {/* Row 6 */}
                            <div className="col-span-6 flex items-center gap-2">
                                <label className={labelClass}>Website URL</label>
                                <input type="text" name="Web" value={formData.Web} onChange={handleInput} className={inputClass} />
                            </div>
                            <div className="col-span-6 flex items-center gap-2">
                                <label className={labelClass}>VAT Reg No</label>
                                <input type="text" name="VAT_Number" value={formData.VAT_Number} onChange={handleInput} className={inputClass} />
                            </div>

                            {/* Row 7 */}
                            <div className="col-span-6 flex items-center gap-2">
                                <label className={labelClass}>Bank Name</label>
                                <div className="flex-1 flex gap-1 h-8 min-w-0">
                                    <input
                                        type="text"
                                        readOnly
                                        value={formData.Bank_Name}
                                        placeholder="Select Bank..."
                                        className="flex-1 min-w-0 h-8 border border-slate-200 px-3 text-[12px] font-bold text-red-600 bg-slate-50 rounded outline-none cursor-pointer transition-all focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20"
                                        onClick={() => setShowBankModal(true)}
                                    />
                                    <button onClick={() => setShowBankModal(true)} className="w-10 h-8 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[5px] transition-all shadow-md active:scale-95 shrink-0">
                                        <Search size={16} />
                                    </button>
                                </div>
                            </div>
                            <div className="col-span-6 flex items-center gap-2">
                                <label className={labelClass}>Branch Name</label>
                                <input type="text" name="Brunch" value={formData.Brunch} onChange={handleInput} className={inputClass} />
                            </div>

                            {/* Row 8 */}
                            <div className="col-span-6 flex items-center gap-2">
                                <label className={labelClass}>A/C Number</label>
                                <input type="text" name="AC_Number" value={formData.AC_Number} onChange={handleInput} className={inputClass} />
                            </div>
                            <div className="col-span-6 flex items-center gap-2">
                                <label className={labelClass}>Credit Period</label>
                                <input type="number" name="Credit_Period" value={formData.Credit_Period} onChange={handleInput} className={`${inputClass} font-mono`} />
                            </div>

                            {/* Row 9 */}
                            <div className="col-span-6 flex items-center gap-2">
                                <div className="w-32 shrink-0"></div>
                                <label className="flex items-center gap-3 cursor-pointer p-1.5 border border-slate-200 rounded-[5px] bg-slate-50 px-3 hover:bg-slate-100 transition-colors">
                                    <input type="checkbox" name="Locked" checked={formData.Locked} onChange={handleInput} className="w-4 h-4 text-[#0285fd] border-slate-300 rounded focus:ring-[#00D1FF]" />
                                    <span className="text-[11px] font-bold text-gray-600 select-none uppercase tracking-widest">Supplier Account Locked</span>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
            </SimpleModal>

            {/* Lookups */}
            <SimpleModal
                isOpen={showSearchModal}
                onClose={() => setShowSearchModal(false)}
                title="Supplier Directory Lookup"
                maxWidth="max-w-[600px]"
            >
                <div className="space-y-4 font-['Tahoma']">
                    <div className="flex items-center gap-4 p-3 rounded-[5px] border border-slate-200 bg-white mb-2">
                        <span className="text-[12px] font-bold text-gray-500 uppercase tracking-widest">Search Facility</span>
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                            <input
                                type="text"
                                placeholder="Find supplier..."
                                className="w-full h-9 pl-10 pr-4 border border-slate-200 rounded outline-none text-sm bg-slate-50 transition-all focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20"
                                value={supSearch}
                                onChange={(e) => setSupSearch(e.target.value)}
                                autoFocus
                            />
                        </div>
                    </div>
                    <div className="border border-slate-200 rounded-[5px] overflow-hidden shadow-sm">
                        <div className="max-h-[400px] overflow-y-auto no-scrollbar">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50/80 sticky top-0 text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest border-b border-slate-200">
                                    <tr>
                                        <th className="px-5 py-3">Code</th>
                                        <th className="px-5 py-3">Supplier Name</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 bg-white">
                                    {suppliersList
                                        .filter(c => ((c.supplier_Name || c.Supplier_Name || c.name || c.Name) || '').toLowerCase().includes(supSearch.toLowerCase()) || ((c.code || c.Code) || '').toLowerCase().includes(supSearch.toLowerCase()))
                                        .map((c, i) => (
                                        <tr key={i} className="group hover:bg-blue-50/50 cursor-pointer transition-colors" onClick={() => selectSupplier(c.code || c.Code)}>
                                            <td className="px-5 py-3 font-mono text-[12px] text-gray-700">{c.code || c.Code}</td>
                                            <td className="px-5 py-3 text-[12px] font-bold text-gray-700 group-hover:text-blue-600">{c.supplier_Name || c.Supplier_Name || c.name || c.Name}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </SimpleModal>

            <SimpleModal
                isOpen={showVTModal}
                onClose={() => setShowVTModal(false)}
                title="Vendor Type Directory"
                maxWidth="max-w-[500px]"
            >
                <div className="space-y-4 font-['Tahoma']">
                    <div className="flex items-center gap-4 p-3 rounded-[5px] border border-slate-200 bg-white mb-2">
                        <span className="text-[12px] font-bold text-gray-500 uppercase tracking-widest">Search Facility</span>
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                            <input
                                type="text"
                                placeholder="Find vendor type..."
                                className="w-full h-9 pl-10 pr-4 border border-slate-200 rounded outline-none text-sm bg-slate-50 transition-all focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20"
                                value={vtSearch}
                                onChange={(e) => setVtSearch(e.target.value)}
                                autoFocus
                            />
                        </div>
                    </div>
                    <div className="border border-slate-200 rounded-[5px] overflow-hidden shadow-sm">
                        <div className="max-h-[300px] overflow-y-auto no-scrollbar">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50/80 sticky top-0 text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest border-b border-slate-200">
                                    <tr>
                                        <th className="px-5 py-3">Vendor Type</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 bg-white">
                                    {vendorTypes
                                        .filter(c => ((c.vendorTypes || c.VendorTypes || c.vend_Typ || c.Vend_Typ) || '').toLowerCase().includes(vtSearch.toLowerCase()))
                                        .map((v, i) => (
                                        <tr key={i} className="group hover:bg-blue-50/50 cursor-pointer transition-colors" onClick={() => { setFormData(prev => ({ ...prev, Vend_Typ: v.vendorTypes || v.VendorTypes || v.vend_Typ || v.Vend_Typ })); setShowVTModal(false); }}>
                                            <td className="px-5 py-3 text-[12px] font-bold text-gray-700 group-hover:text-blue-600">{v.vendorTypes || v.VendorTypes || v.vend_Typ || v.Vend_Typ}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </SimpleModal>

            <SimpleModal
                isOpen={showBankModal}
                onClose={() => setShowBankModal(false)}
                title="Bank Directory Lookup"
                maxWidth="max-w-[500px]"
            >
                <div className="space-y-4 font-['Tahoma']">
                    <div className="flex items-center gap-4 p-3 rounded-[5px] border border-slate-200 bg-white mb-2">
                        <span className="text-[12px] font-bold text-gray-500 uppercase tracking-widest">Search Facility</span>
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                            <input
                                type="text"
                                placeholder="Find bank..."
                                className="w-full h-9 pl-10 pr-4 border border-slate-200 rounded outline-none text-sm bg-slate-50 transition-all focus:border-[#00D1FF] focus:ring-2 focus:ring-[#00D1FF]/20"
                                value={bankSearch}
                                onChange={(e) => setBankSearch(e.target.value)}
                                autoFocus
                            />
                        </div>
                    </div>
                    <div className="border border-slate-200 rounded-[5px] overflow-hidden shadow-sm">
                        <div className="max-h-[300px] overflow-y-auto no-scrollbar">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50/80 sticky top-0 text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest border-b border-slate-200">
                                    <tr>
                                        <th className="px-5 py-3">Code</th>
                                        <th className="px-5 py-3">Bank Name</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 bg-white">
                                    {banks
                                        .filter(c => ((c.name || c.Name) || '').toLowerCase().includes(bankSearch.toLowerCase()) || ((c.code || c.Code) || '').toLowerCase().includes(bankSearch.toLowerCase()))
                                        .map((b, i) => (
                                        <tr key={i} className="group hover:bg-blue-50/50 cursor-pointer transition-colors" onClick={() => { setFormData(prev => ({ ...prev, Bank_Code: b.code || b.Code, Bank_Name: b.name || b.Name })); setShowBankModal(false); }}>
                                            <td className="px-5 py-3 font-mono text-[12px] text-gray-700">{b.code || b.Code}</td>
                                            <td className="px-5 py-3 text-[12px] font-bold text-gray-700 group-hover:text-blue-600">{b.name || b.Name}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </SimpleModal>
        </>
    );
};

export default SupplierMasterBoard;
