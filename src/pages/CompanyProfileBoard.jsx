import React, { useState, useEffect } from 'react';
import SimpleModal from '../components/SimpleModal';
import { Building2, Globe, Briefcase, Calendar, Search, Trash2, RotateCcw, Save } from 'lucide-react';
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
    
    const [showLookup, setShowLookup] = useState(false);
    const [lookupResults, setLookupResults] = useState([]);
    
    const [showCountryLookup, setShowCountryLookup] = useState(false);
    const [countryResults, setCountryResults] = useState([]);
    
    const [showIndustryLookup, setShowIndustryLookup] = useState(false);
    const [industryResults, setIndustryResults] = useState([]);
    
    const [showOrgLookup, setShowOrgLookup] = useState(false);
    const [showCalendar, setShowCalendar] = useState(false);

    const [compSearch, setCompSearch] = useState('');
    const [countrySearch, setCountrySearch] = useState('');
    const [industrySearch, setIndustrySearch] = useState('');
    const [orgSearch, setOrgSearch] = useState('');

    useEffect(() => {
        if (isOpen) {
            handleClear();
            const fetchMasterData = async () => {
                try {
                    const [countryData, industryData] = await Promise.all([authService.getAllCountries(), authService.getAllIndustries()]);
                    setCountries(countryData);
                    setIndustries(industryData);
                } catch (error) {
                    console.error('Error loading master data:', error);
                }
            };
            fetchMasterData();
        }
    }, [isOpen]);

    const handleInputChange = (e) => { const { name, value } = e.target; setFormData(prev => ({ ...prev, [name]: value })); };
    const handleClear = () => { setFormData(initialState); setIsEditMode(false); };

    const handleSearch = async () => {
        setLoading(true); setShowLookup(true);
        try {
            const userName = user?.empName || user?.EmpName || user?.username;
            const empCode = user?.EmpCode || user?.empCode;
            let data = (userName && userName !== 'Admin' && empCode) ? await authService.getCompaniesByEmployee(empCode) : userName === 'Admin' ? await authService.getAllCompanies() : [];
            setLookupResults(data.map(c => ({ ...c, companyCode: c.companyCode || c.CompanyCode, companyName: c.companyName || c.CompanyName })));
        } catch (error) {
            console.error('Error fetching companies:', error);
            showErrorToast('Failed to load companies for search.');
        } finally { setLoading(false); }
    };

    const handleCountrySearch = async () => { setLoading(true); setShowCountryLookup(true); try { setCountryResults(await authService.getAllCountries()); } catch (error) { showErrorToast('Failed to load countries.'); } finally { setLoading(false); } };
    const handleIndustrySearch = async () => { setLoading(true); setShowIndustryLookup(true); try { setIndustryResults(await authService.getAllIndustries()); } catch (error) { showErrorToast('Failed to load industries.'); } finally { setLoading(false); } };

    const handleSelectCompany = async (company) => {
        setLoading(true);
        try {
            const details = await authService.getCompanyDetails(company.companyCode);
            setFormData({ Code: details.companyCode, Comp_Name: details.companyName, Legal_Name: details.legalName || '', Address1: details.address1 || '', Address2: details.address2 || '', Country: details.country || '', Phone: details.phone || '', Email: details.email || '', Web: details.web || '', Industry: details.industry || '', Organiz: details.organiz || '', Start_Date: details.startDate ? details.startDate.split('T')[0] : '', Acc_Year: details.accYear || '', To_Year: details.toYear || '', Tax_ID: details.taxID || '', Reg_Number: details.regNumber || '', User_Name: user?.empName || user?.EmpName || user?.username || 'Admin' });
            setIsEditMode(true);
            setShowLookup(false);
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

    const handleDelete = async () => {
        if (!isEditMode || !formData.Code) return;
        if (!window.confirm(`Are you sure you want to delete company "${formData.Comp_Name}"?`)) return;
        setLoading(true);
        try { await authService.deleteCompany(formData.Code); showSuccessToast('Company deleted successfully!'); handleClear(); } catch (error) { showErrorToast(typeof error === 'string' ? error : error.message || 'Failed to delete company.'); } finally { setLoading(false); }
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
                                <button onClick={handleDelete} className="px-6 h-10 border-2 border-red-500 text-red-600 bg-white hover:bg-red-50 font-semibold rounded-[3px] shadow-sm text-[13px] transition-all flex items-center justify-center gap-2">
                                    <Trash2 size={14} /> DELETE
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
                                <div className="relative">
                                    <input type="text" readOnly value={formData.Code} onClick={handleSearch} className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700 font-mono cursor-pointer appearance-none"  style={{ backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.5rem center', backgroundSize: '1em' }} />
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
                                <div className="relative">
                                    <input type="text" readOnly value={formData.Country} onClick={handleCountrySearch} className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700 cursor-pointer appearance-none"  style={{ backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.5rem center', backgroundSize: '1em' }} />
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
                                <div className="relative">
                                    <input type="text" readOnly value={formData.Industry} onClick={handleIndustrySearch} className="w-full h-10 border border-gray-300 rounded-[3px] px-3 text-[14px] bg-white outline-none focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] text-gray-700 cursor-pointer appearance-none"  style={{ backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.5rem center', backgroundSize: '1em' }} />
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

            <SimpleModal isOpen={showLookup} onClose={() => setShowLookup(false)} title="Company Search" maxWidth="max-w-[700px]">
                <div className="space-y-4 font-['Tahoma']">
                    <div className="flex items-center gap-4 bg-slate-50 p-4 border-b border-gray-100 mb-2">
                        <span className="text-[12px] font-bold text-gray-500 uppercase tracking-wider">Search</span>
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                            <input type="text" placeholder="Find company..." className="w-full h-10 pl-10 pr-4 border border-gray-300 rounded-[3px] outline-none text-[13px] focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] shadow-sm bg-white" value={compSearch} onChange={(e) => setCompSearch(e.target.value)} autoFocus />
                        </div>
                    </div>
                    <div className="border border-gray-200 rounded-[3px] overflow-hidden shadow-sm max-h-[400px] overflow-y-auto no-scrollbar">
                        <table className="w-full text-left">
                            <thead className="bg-[#f8fafc] sticky top-0 text-[11px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 shadow-sm z-10">
                                <tr><th className=" px-5 py-3">Code</th><th className=" px-5 py-3">Company Name</th><th className="text-right px-5 py-3">Action</th></tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {lookupResults.filter(c => (c.companyName || '').toLowerCase().includes(compSearch.toLowerCase()) || (c.companyCode || '').toLowerCase().includes(compSearch.toLowerCase())).map((c, i) => (
                                    <tr key={i} className="group hover:bg-blue-50/50  transition-all cursor-pointer group border-b border-gray-50" onClick={() => handleSelectCompany(c)}>
                                        <td className="font-mono text-[12px] font-bold text-blue-600 px-5 py-3">{c.companyCode}</td>
                                        <td className="text-[12px] font-bold text-slate-700 uppercase group-hover:text-blue-600 transition-colors px-5 py-3">{c.companyName}</td>
                                        <td className="text-right px-5 py-3">
                                            <button className="bg-white text-[#0285fd] border border-[#0285fd] hover:bg-blue-50 text-[10px] px-5 py-2 rounded-[3px] font-black shadow-sm transition-all active:scale-95 uppercase">SELECT</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </SimpleModal>

            <SimpleModal isOpen={showCountryLookup} onClose={() => setShowCountryLookup(false)} title="Country Lookup" maxWidth="max-w-[700px]">
                <div className="space-y-4 font-['Tahoma']">
                    <div className="flex items-center gap-4 bg-slate-50 p-4 border-b border-gray-100 mb-2">
                        <span className="text-[12px] font-bold text-gray-500 uppercase tracking-wider">Search</span>
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                            <input type="text" placeholder="Find country..." className="w-full h-10 pl-10 pr-4 border border-gray-300 rounded-[3px] outline-none text-[13px] focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] shadow-sm bg-white" value={countrySearch} onChange={(e) => setCountrySearch(e.target.value)} autoFocus />
                        </div>
                    </div>
                    <div className="border border-gray-200 rounded-[3px] overflow-hidden shadow-sm max-h-[400px] overflow-y-auto no-scrollbar">
                        <table className="w-full text-left">
                            <thead className="bg-[#f8fafc] sticky top-0 text-[11px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 shadow-sm z-10">
                                <tr><th className=" px-5 py-3">Code</th><th className=" px-5 py-3">Country Name</th><th className="text-right px-5 py-3">Action</th></tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {countryResults.filter(c => (c.countryName || '').toLowerCase().includes(countrySearch.toLowerCase())).map((c, i) => (
                                    <tr key={i} className="group hover:bg-blue-50/50  transition-all cursor-pointer group border-b border-gray-50" onClick={() => { setFormData(prev => ({ ...prev, Country: c.countryName })); setShowCountryLookup(false); }}>
                                        <td className="font-mono text-[12px] font-bold text-blue-600 px-5 py-3">{c.countryCode}</td>
                                        <td className="text-[12px] font-bold text-slate-700 uppercase group-hover:text-blue-600 transition-colors px-5 py-3">{c.countryName}</td>
                                        <td className="text-right px-5 py-3">
                                            <button className="bg-white text-[#0285fd] border border-[#0285fd] hover:bg-blue-50 text-[10px] px-5 py-2 rounded-[3px] font-black shadow-sm transition-all active:scale-95 uppercase">SELECT</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </SimpleModal>

            <SimpleModal isOpen={showIndustryLookup} onClose={() => setShowIndustryLookup(false)} title="Industry Lookup" maxWidth="max-w-[700px]">
                <div className="space-y-4 font-['Tahoma']">
                    <div className="flex items-center gap-4 bg-slate-50 p-4 border-b border-gray-100 mb-2">
                        <span className="text-[12px] font-bold text-gray-500 uppercase tracking-wider">Search</span>
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                            <input type="text" placeholder="Find industry..." className="w-full h-10 pl-10 pr-4 border border-gray-300 rounded-[3px] outline-none text-[13px] focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] shadow-sm bg-white" value={industrySearch} onChange={(e) => setIndustrySearch(e.target.value)} autoFocus />
                        </div>
                    </div>
                    <div className="border border-gray-200 rounded-[3px] overflow-hidden shadow-sm max-h-[400px] overflow-y-auto no-scrollbar">
                        <table className="w-full text-left">
                            <thead className="bg-[#f8fafc] sticky top-0 text-[11px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 shadow-sm z-10">
                                <tr><th className=" px-5 py-3">Code</th><th className=" px-5 py-3">Industry Name</th><th className="text-right px-5 py-3">Action</th></tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {industryResults.filter(c => (c.indName || '').toLowerCase().includes(industrySearch.toLowerCase())).map((c, i) => (
                                    <tr key={i} className="group hover:bg-blue-50/50  transition-all cursor-pointer group border-b border-gray-50" onClick={() => { setFormData(prev => ({ ...prev, Industry: c.indName })); setShowIndustryLookup(false); }}>
                                        <td className="font-mono text-[12px] font-bold text-blue-600 px-5 py-3">{c.indCode}</td>
                                        <td className="text-[12px] font-bold text-slate-700 uppercase group-hover:text-blue-600 transition-colors px-5 py-3">{c.indName}</td>
                                        <td className="text-right px-5 py-3">
                                            <button className="bg-white text-[#0285fd] border border-[#0285fd] hover:bg-blue-50 text-[10px] px-5 py-2 rounded-[3px] font-black shadow-sm transition-all active:scale-95 uppercase">SELECT</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </SimpleModal>

            <SimpleModal isOpen={showOrgLookup} onClose={() => setShowOrgLookup(false)} title="Organization Type" maxWidth="max-w-[700px]">
                <div className="space-y-4 font-['Tahoma']">
                    <div className="flex items-center gap-4 bg-slate-50 p-4 border-b border-gray-100 mb-2">
                        <span className="text-[12px] font-bold text-gray-500 uppercase tracking-wider">Search</span>
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                            <input type="text" placeholder="Find type..." className="w-full h-10 pl-10 pr-4 border border-gray-300 rounded-[3px] outline-none text-[13px] focus:border-[#0285fd] focus:ring-1 focus:ring-[#0285fd] shadow-sm bg-white" value={orgSearch} onChange={(e) => setOrgSearch(e.target.value)} autoFocus />
                        </div>
                    </div>
                    <div className="border border-gray-200 rounded-[3px] overflow-hidden shadow-sm max-h-[300px] overflow-y-auto no-scrollbar">
                        <table className="w-full text-left">
                            <thead className="bg-[#f8fafc] sticky top-0 text-[11px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 shadow-sm z-10">
                                <tr><th className=" px-5 py-3">Code</th><th className=" px-5 py-3">Type Name</th><th className="text-right px-5 py-3">Action</th></tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {orgTypes.filter(c => (c.name || '').toLowerCase().includes(orgSearch.toLowerCase())).map((o, i) => (
                                    <tr key={i} className="group hover:bg-blue-50/50  transition-all cursor-pointer group border-b border-gray-50" onClick={() => { setFormData(prev => ({ ...prev, Organiz: o.name })); setShowOrgLookup(false); }}>
                                        <td className="font-mono text-[12px] font-bold text-blue-600 px-5 py-3">{o.code}</td>
                                        <td className="text-[12px] font-bold text-slate-700 uppercase group-hover:text-blue-600 transition-colors px-5 py-3">{o.name}</td>
                                        <td className="text-right px-5 py-3">
                                            <button className="bg-white text-[#0285fd] border border-[#0285fd] hover:bg-blue-50 text-[10px] px-5 py-2 rounded-[3px] font-black shadow-sm transition-all active:scale-95 uppercase">SELECT</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </SimpleModal>

            <CalendarModal isOpen={showCalendar} onClose={() => setShowCalendar(false)} currentDate={formData.Start_Date} onDateChange={(d) => setFormData(prev => ({ ...prev, Start_Date: d }))} title="Select Start Date" />
        </>
    );
};

export default CompanyProfileBoard;
