import React, { useState, useEffect } from 'react';
import SimpleModal from '../components/SimpleModal';
import { Building2, Globe, Briefcase, Calendar, Search, Trash2, RotateCcw, Save } from 'lucide-react';
import ConfirmModal from '../components/modals/ConfirmModal';
import CalendarModal from '../components/CalendarModal';
import { authService } from '../services/auth.service';
import { showSuccessToast, showErrorToast } from '../utils/toastUtils';
import TransactionFormWrapper from '../components/TransactionFormWrapper';
import SearchableSelect from '../components/SearchableSelect';

const orgTypes = [
    { code: 'CORP', name: 'Corporation' }, { code: 'PART', name: 'Partnership' }, { code: 'SOLE', name: 'Sole Proprietorship' }
];

const CompanyProfileBoard = ({ isOpen, onClose }) => {
    const user = authService.getCurrentUser();
    const initialState = {
        Code: '', Comp_Name: '', Legal_Name: '', Address1: '', Address2: '', Country: '', Phone: '', Email: '', Web: '',
        Industry: '', Organiz: '', Start_Date: new Date().toISOString().split('T')[0], Acc_Year: '', To_Year: '',
        Tax_ID: '', Reg_Number: '', User_Name: user?.empName || user?.EmpName || user?.username || 'Admin'
    };
    
    const [formData, setFormData] = useState(initialState);
    const [loading, setLoading] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [countries, setCountries] = useState([]);
    const [industries, setIndustries] = useState([]);
    
    const [allCompanies, setAllCompanies] = useState([]);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showCalendar, setShowCalendar] = useState(false);

    useEffect(() => {
        if (isOpen) {
            handleClear();
            const fetchMasterData = async () => {
                try {
                    const userName = user?.empName || user?.EmpName || user?.username;
                    const empCode = user?.EmpCode || user?.empCode;

                    const [countryData, industryData, companyData] = await Promise.all([
                        authService.getAllCountries(), 
                        authService.getAllIndustries(),
                        (userName && userName !== 'Admin' && empCode) ? authService.getCompaniesByEmployee(empCode) : authService.getAllCompanies()
                    ]);
                    setCountries(countryData);
                    setIndustries(industryData);
                    setAllCompanies(companyData.map(c => ({ ...c, companyCode: c.companyCode || c.CompanyCode, companyName: c.companyName || c.CompanyName })));
                } catch (error) {
                    console.error('Error loading master data:', error);
                }
            };
            fetchMasterData();
        }
    }, [isOpen]);

    const handleInputChange = (e) => { const { name, value } = e.target; setFormData(prev => ({ ...prev, [name]: value })); };
    const handleClear = () => { setFormData(initialState); setIsEditMode(false); };



    const handleSelectCompany = async (company) => {
        setLoading(true);
        try {
            const details = await authService.getCompanyDetails(company.companyCode);
            setFormData({ Code: details.companyCode, Comp_Name: details.companyName, Legal_Name: details.legalName || '', Address1: details.address1 || '', Address2: details.address2 || '', Country: details.country || '', Phone: details.phone || '', Email: details.email || '', Web: details.web || '', Industry: details.industry || '', Organiz: details.organiz || '', Start_Date: details.startDate ? details.startDate.split('T')[0] : '', Acc_Year: details.accYear || '', To_Year: details.toYear || '', Tax_ID: details.taxID || '', Reg_Number: details.regNumber || '', User_Name: user?.empName || user?.EmpName || user?.username || 'Admin' });
            setIsEditMode(true);
            showSuccessToast('Company loaded successfully!');
        } catch (error) { showErrorToast('Failed to load company details.'); } finally { setLoading(false); }
    };

    const handleSave = async () => {
        if (!formData.Comp_Name) { showErrorToast('Company Name is required.'); return; }
        setLoading(true);
        try { 
            if (isEditMode) {
                await authService.editCompany(formData); 
                showSuccessToast('Company updated successfully!');
            } else {
                await authService.createCompany(formData); 
                showSuccessToast('Company created successfully!'); 
                setIsEditMode(true);
            }
        } catch (error) { showErrorToast(typeof error === 'string' ? error : error.message || 'Failed to save company.'); } finally { setLoading(false); }
    };

    const handleDelete = () => {
        if (!isEditMode || !formData.Code) return;
        setShowDeleteConfirm(true);
    };

    const confirmDelete = async () => {
        setIsDeleting(true);
        try {
            await authService.deleteCompany(formData.Code); 
            showSuccessToast('Company deleted successfully!'); 
            handleClear(); 
            setShowDeleteConfirm(false);
        } catch (error) { 
            showErrorToast(typeof error === 'string' ? error : error.message || 'Failed to delete company.'); 
        } finally { 
            setIsDeleting(false); 
        }
    };

    return (
        <>
            <TransactionFormWrapper subtitle="Manage company registration & details" icon={Building2}
                isOpen={isOpen}
                onClose={onClose}
                title="Company Profile"
                footer={
                    <div className="bg-[#fcfcfc] px-6 py-5 w-full flex justify-between items-center border-t border-gray-200 rounded-b-[10px] shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]">
                        <div className="flex gap-3">
                            {isEditMode && (
                                <button type="button" onClick={handleDelete} disabled={!isEditMode || loading} className={`px-6 h-10 bg-red-50 text-red-600 text-sm font-bold rounded-[3px] hover:bg-red-100 transition-all active:scale-95 flex items-center gap-2 border border-red-100 ${(!isEditMode || loading) ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                    <Trash2 size={14} /> Delete
                                </button>
                            )}
                            <button type="button" onClick={handleClear} className="px-6 h-10 border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 font-semibold rounded-[3px] shadow-sm text-[13px] transition-all flex items-center justify-center gap-2">
                                <RotateCcw size={14} /> CLEAR
                            </button>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={handleSave} disabled={loading} className="px-6 h-10 bg-[#0285fd] hover:bg-[#0073ff] text-white font-semibold rounded-[3px] shadow-sm text-[13px] transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                                <Save size={14} /> SAVE
                            </button>
                        </div>
                    </div>
                }
            >
                <div className="space-y-3 overflow-y-auto no-scrollbar font-['Tahoma']">
                    <div className="bg-white p-4 border border-slate-200 rounded-[3px] space-y-4">
                        <div className="grid grid-cols-12 gap-x-6 gap-y-3.5">
                            <div className="col-span-6">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Company ID</label>
                                <div className="relative flex-1">
                                    <select
                                        value={formData.Code || ""}
                                        onChange={(e) => {
                                            const code = e.target.value;
                                            if (!code) {
                                                handleClear();
                                                return;
                                            }
                                            const comp = allCompanies.find(c => c.companyCode === code);
                                            if (comp) handleSelectCompany(comp);
                                        }}
                                        className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700 appearance-none font-mono" style={{ backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.5rem center', backgroundSize: '1em' }}
                                    >
                                        <option value="">Select Company</option>
                                        {allCompanies.map((c, idx) => (
                                            <option key={idx} value={c.companyCode}>
                                                {c.companyCode} - {c.companyName}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="col-span-6">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Company Name</label>
                                <input type="text" name="Comp_Name" value={formData.Comp_Name} onChange={handleInputChange} maxLength={50} className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700" />
                            </div>
                            <div className="col-span-6">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Legal Name</label>
                                <input type="text" name="Legal_Name" value={formData.Legal_Name} onChange={handleInputChange} className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700" />
                            </div>
                            <div className="col-span-6">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Organization</label>
                                <div className="relative">
                                    <select
                                        value={formData.Organiz}
                                        onChange={(ev) => {
                                            const val = ev.target.value;
                                            const o = (orgTypes || []).find(i => (i.code && i.code.toString() === val) || (i.name && i.name.toString() === val) || (i.itemId && i.itemId.toString() === val) || (i.id && i.id.toString() === val) || i === val);
                                            if (o) {
                                                setFormData(prev => ({ ...prev, Organiz: o.name }));
                                            }
                                        }}
                                        className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700 cursor-pointer appearance-none"
                                        style={{ backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.5rem center', backgroundSize: '1em' }}
                                    >
                                        <option value="">Select...</option>
                                        {(orgTypes || []).map((o, idx) => (
                                            <option key={idx} value={o.name || o.code || o}>
                                                {o.code ? `${o.code} - ${o.name}` : (o.name || o)}
                                            </option>
                                        ))}
                                        {(orgTypes || []).map((o, idx) => (
                                            <option key={idx} value={o.code || o.itemId || o.id || o.name || o}>
                                                {o.code ? `${o.code} - ${o.name}` : (o.itemId ? `${o.itemId} - ${o.itemName || o.name}` : (o.name || o))}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="col-span-12 h-px bg-slate-100 my-1" />
                            <div className="col-span-6">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Address 1</label>
                                <input type="text" name="Address1" value={formData.Address1} onChange={handleInputChange} className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700" />
                            </div>
                            <div className="col-span-6">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Address 2</label>
                                <input type="text" name="Address2" value={formData.Address2} onChange={handleInputChange} className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700" />
                            </div>
                            <div className="col-span-6">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Country</label>
                                <div className="relative flex-1">
                                    <select
                                        name="Country"
                                        value={formData.Country}
                                        onChange={handleInputChange}
                                        className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700 appearance-none" style={{ backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.5rem center', backgroundSize: '1em' }}
                                    >
                                        <option value="">Select Country</option>
                                        {countries.map((c, idx) => (
                                            <option key={idx} value={c.countryName}>
                                                {c.countryName}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="col-span-6">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Phone No</label>
                                <input type="text" name="Phone" value={formData.Phone} onChange={handleInputChange} className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700" />
                            </div>
                            <div className="col-span-6">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">E-Mail</label>
                                <input type="email" name="Email" value={formData.Email} onChange={handleInputChange} className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700" />
                            </div>
                            <div className="col-span-6">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Website</label>
                                <input type="text" name="Web" value={formData.Web} onChange={handleInputChange} className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700" />
                            </div>
                            <div className="col-span-12 h-px bg-slate-100 my-1" />
                            <div className="col-span-6">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Industry</label>
                                <div className="relative flex-1">
                                    <select
                                        name="Industry"
                                        value={formData.Industry}
                                        onChange={handleInputChange}
                                        className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700 appearance-none" style={{ backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.5rem center', backgroundSize: '1em' }}
                                    >
                                        <option value="">Select Industry</option>
                                        {industries.map((c, idx) => (
                                            <option key={idx} value={c.indName}>
                                                {c.indName}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="col-span-6">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Start Date</label>
                                <div className="relative">
                                    <input type="text" readOnly value={formData.Start_Date} onClick={() => setShowCalendar(true)} className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] cursor-pointer pr-10 text-gray-700" />
                                    <button onClick={() => setShowCalendar(true)} className="absolute right-1 top-1 bottom-1 w-8 flex items-center justify-center text-gray-500 hover:text-gray-800 bg-transparent border-none cursor-pointer">
                                        <Calendar size={16} />
                                    </button>
                                </div>
                            </div>
                            <div className="col-span-6">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Fin. Year From</label>
                                <input type="text" name="Acc_Year" value={formData.Acc_Year} onChange={handleInputChange} placeholder="YYYY" className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700" />
                            </div>
                            <div className="col-span-6">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Fin. Year To</label>
                                <input type="text" name="To_Year" value={formData.To_Year} onChange={handleInputChange} placeholder="YYYY" className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700" />
                            </div>
                            <div className="col-span-6">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Registration No</label>
                                <input type="text" name="Reg_Number" value={formData.Reg_Number} onChange={handleInputChange} className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700" />
                            </div>
                            <div className="col-span-6">
                                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Tax ID</label>
                                <input type="text" name="Tax_ID" value={formData.Tax_ID} onChange={handleInputChange} className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700" />
                            </div>
                        </div>
                    </div>
                </div>
            </TransactionFormWrapper>

            <ConfirmModal
                isOpen={showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(false)}
                onConfirm={confirmDelete}
                title="Delete Company"
                message={`Are you sure you want to delete this company (${formData.Comp_Name})? This action cannot be undone.`}
                loading={isDeleting}
                confirmText="Delete"
                variant="danger"
            />

            <CalendarModal isOpen={showCalendar} onClose={() => setShowCalendar(false)} currentDate={formData.Start_Date} onDateChange={(d) => setFormData(prev => ({ ...prev, Start_Date: d }))} title="Select Start Date" />
        </>
    );
};

export default CompanyProfileBoard;
