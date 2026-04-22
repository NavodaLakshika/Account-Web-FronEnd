import React, { useState, useEffect } from 'react';
import SimpleModal from '../../SimpleModal';
import { Search, RotateCcw, Plus, Edit, Trash2, X, Building2, Loader2, AlertTriangle, Globe, Briefcase, Calendar } from 'lucide-react';
import CalendarModal from '../../CalendarModal';
import { authService } from '../../../services/auth.service';
import toast from 'react-hot-toast';

const CompanyBoard = ({ isOpen, onClose }) => {
    const user = authService.getCurrentUser();
    
    // Form State
    const [formData, setFormData] = useState({
        Comp_Name: '',
        Legal_Name: '',
        Address1: '',
        Address2: '',
        Country: '',
        Phone: '',
        Email: '',
        Web: '',
        Industry: '',
        Organiz: '',
        Start_Date: new Date().toISOString().split('T')[0],
        Acc_Year: '',
        To_Year: '',
        Tax_ID: '',
        Reg_Number: '',
        User_Name: user?.empName || user?.EmpName || user?.username || 'Admin'
    });

    const [loading, setLoading] = useState(false);
    const [countries, setCountries] = useState([]);
    const [industries, setIndustries] = useState([]);
    
    // Lookup State
    const [showLookup, setShowLookup] = useState(false);
    const [lookupResults, setLookupResults] = useState([]);
    const [searching, setSearching] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    // Country Lookup State
    const [showCountryLookup, setShowCountryLookup] = useState(false);
    const [countryResults, setCountryResults] = useState([]);
    const [searchingCountry, setSearchingCountry] = useState(false);

    // Industry Lookup State
    const [showIndustryLookup, setShowIndustryLookup] = useState(false);
    const [industryResults, setIndustryResults] = useState([]);
    const [searchingIndustry, setSearchingIndustry] = useState(false);

    // Organizational Type Lookup State
    const [showOrgLookup, setShowOrgLookup] = useState(false);
    const orgTypes = [
        { code: 'CORP', name: 'Corporation' },
        { code: 'PART', name: 'Partnership' },
        { code: 'SOLE', name: 'Sole Proprietorship' }
    ];

    // Calendar State
    const [showCalendar, setShowCalendar] = useState(false);

    // Fetch master data on component mount
    useEffect(() => {
        if (isOpen) {
            const fetchMasterData = async () => {
                try {
                    const [countryData, industryData] = await Promise.all([
                        authService.getAllCountries(),
                        authService.getAllIndustries()
                    ]);
                    setCountries(countryData);
                    setIndustries(industryData);
                } catch (error) {
                    console.error('Error loading master data:', error);
                }
            };
            fetchMasterData();
        }
    }, [isOpen]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleClear = () => {
        setFormData({
            Comp_Name: '',
            Legal_Name: '',
            Address1: '',
            Address2: '',
            Country: '',
            Phone: '',
            Email: '',
            Web: '',
            Industry: '',
            Organiz: '',
            Start_Date: new Date().toISOString().split('T')[0],
            Acc_Year: '',
            To_Year: '',
            Tax_ID: '',
            Reg_Number: '',
            User_Name: user?.empName || user?.EmpName || user?.username || 'Admin'
        });
    };

    const handleSearch = async () => {
        setSearching(true);
        setShowLookup(true);
        try {
            const userName = user?.empName || user?.EmpName || user?.username;
            let data;
            if (userName && userName !== 'Admin') {
                data = await authService.getCompaniesByEmployee(userName);
            } else {
                data = await authService.getAllCompanies();
            }
            
            // Normalize data to ensure companyCode works (backend might return CompanyCode vs companyCode)
            const normalizedData = data.map(c => ({
                ...c,
                companyCode: c.companyCode || c.CompanyCode,
                companyName: c.companyName || c.CompanyName
            }));
            
            setLookupResults(normalizedData);
        } catch (error) {
            console.error('Error fetching companies:', error);
            toast.error('Failed to load companies for search.');
        } finally {
            setSearching(false);
        }
    };

    const handleCountrySearch = async () => {
        setSearchingCountry(true);
        setShowCountryLookup(true);
        try {
            const data = await authService.getAllCountries();
            setCountryResults(data);
        } catch (error) {
            console.error('Error fetching countries:', error);
            toast.error('Failed to load countries.');
        } finally {
            setSearchingCountry(false);
        }
    };

    const handleIndustrySearch = async () => {
        setSearchingIndustry(true);
        setShowIndustryLookup(true);
        try {
            const data = await authService.getAllIndustries();
            setIndustryResults(data);
        } catch (error) {
            console.error('Error fetching industries:', error);
            toast.error('Failed to load industries.');
        } finally {
            setSearchingIndustry(false);
        }
    };

    const handleSelectCompany = async (company) => {
        setLoading(true);
        try {
            const details = await authService.getCompanyDetails(company.companyCode);
            setFormData({
                Code: details.companyCode,
                Comp_Name: details.companyName,
                Legal_Name: details.legalName || '',
                Address1: details.address1 || '',
                Address2: details.address2 || '',
                Country: details.country || '',
                Phone: details.phone || '',
                Email: details.email || '',
                Web: details.web || '',
                Industry: details.industry || '',
                Organiz: details.organiz || '',
                Start_Date: details.startDate ? details.startDate.split('T')[0] : '',
                Acc_Year: details.accYear || '',
                To_Year: details.toYear || '',
                Tax_ID: details.taxID || '',
                Reg_Number: details.regNumber || '',
                User_Name: user?.empName || user?.EmpName || user?.username || 'Admin'
            });
            setShowLookup(false);
            toast.success('Company loaded successfully!');
        } catch (error) {
            console.error('Error loading company details:', error);
            toast.error('Failed to load company details.');
        } finally {
            setLoading(false);
        }
    };

    const handleSelectCountry = (country) => {
        setFormData(prev => ({ ...prev, Country: country.countryName }));
        setShowCountryLookup(false);
    };

    const handleSelectIndustry = (industry) => {
        setFormData(prev => ({ ...prev, Industry: industry.indName }));
        setShowIndustryLookup(false);
    };

    const handleSelectOrg = (org) => {
        setFormData(prev => ({ ...prev, Organiz: org.name }));
        setShowOrgLookup(false);
    };

    const handleDateSelect = (date) => {
        setFormData(prev => ({ ...prev, Start_Date: date }));
    };

    const handleAddNew = async () => {
        if (!formData.Comp_Name) {
            toast.error('Company Name is required.');
            return;
        }

        setLoading(true);

        try {
            await authService.createCompany(formData);
            toast.success('Company created successfully!');
            handleClear(); // Reset after successful creation
        } catch (error) {
            console.error('Error creating company:', error);
            toast.error(typeof error === 'string' ? error : error.message || 'Failed to create company.');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = async () => {
        if (!formData.Code) return;
        
        setLoading(true);

        try {
            await authService.editCompany(formData);
            toast.success('Company updated successfully!');
        } catch (error) {
            console.error('Error editing company:', error);
            toast.error(typeof error === 'string' ? error : error.message || 'Failed to update company.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = () => {
        if (!formData.Code) return;
        setShowDeleteConfirm(true);
    };

    const confirmDelete = async () => {
        setLoading(true);
        try {
            await authService.deleteCompany(formData.Code);
            toast.success('Company deleted successfully!');
            handleClear(); // Reset form after deletion
            setShowDeleteConfirm(false);
        } catch (error) {
            console.error('Error deleting company:', error);
            toast.error(typeof error === 'string' ? error : error.message || 'Failed to delete company.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <SimpleModal
                isOpen={isOpen}
                onClose={onClose}
                title="Company Profile"
                maxWidth="max-w-4xl"
                footer={
                    <>
                        <button 
                            onClick={handleAddNew}
                            disabled={loading || !!formData.Code}
                            className={`px-6 h-10 bg-[#50af60] text-white text-[13px] font-bold rounded-[5px] shadow-md shadow-green-200 hover:bg-[#24db4e] transition-all active:scale-95 flex items-center justify-center gap-2 ${(loading || !!formData.Code) ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            <Plus size={14} /> Add New
                        </button>
                        <button 
                            onClick={handleEdit}
                            disabled={loading || !formData.Code}
                            className={`px-6 h-10 bg-[#00adff] text-white text-[13px] font-bold rounded-[5px] hover:bg-[#0099e6] shadow-md shadow-blue-200 transition-all active:scale-95 flex items-center justify-center gap-2 ${(loading || !formData.Code) ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            <Edit size={14} /> {loading ? 'Saving...' : 'Edit'}
                        </button>
                        <button 
                            onClick={handleDelete}
                            disabled={loading || !formData.Code}
                            className={`px-6 h-10 bg-[#d13438] text-white text-[13px] font-bold rounded-[5px] shadow-md shadow-red-200 hover:bg-[#a4262c] transition-all active:scale-95 flex items-center justify-center gap-2 ${(loading || !formData.Code) ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            <Trash2 size={14} /> Delete
                        </button>
                        <button onClick={handleClear} className="px-6 h-10 bg-[#00adff] text-white text-[13px] font-bold rounded-[5px] hover:bg-[#0099e6] shadow-md shadow-blue-200 transition-all active:scale-95 flex items-center justify-center gap-2 border-none">
                            <RotateCcw size={14} /> Clear
                        </button>
                       
                    </>
                }
            >
                <div className="py-2 select-none font-['Tahoma'] space-y-4 text-[12.5px] mt-4 min-h-[500px]">
                    <div className="border-b border-gray-200 pb-4 mb-4 flex items-center justify-center">
                        <h2 className="text-[17px] font-bold text-black uppercase tracking-tight">Enter New Company Details & Update</h2>
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center gap-6">
                            <label className="w-32 font-bold text-gray-700">Company ID</label>
                            <div className="flex-1 flex gap-3">
                                <input 
                                    type="text" 
                                    value={formData.Code || 'AUTO-GEN'} 
                                    readOnly 
                                    className="w-32 h-8 border border-gray-300 px-2 bg-white rounded-[5px] outline-none font-bold text-blue-600 shadow-sm text-center" 
                                />
                                <button 
                                    onClick={handleSearch}
                                    className="w-10 h-8 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[5px] transition-all shadow-md active:scale-95"
                                >
                                    <Search size={18} />
                                </button>
                            </div>
                        </div>

                        <FormRow label="Company Name">
                            <input 
                                type="text" 
                                name="Comp_Name"
                                value={formData.Comp_Name}
                                onChange={handleInputChange}
                                maxLength={50}
                                className="flex-1 h-8 font-mono border border-gray-300 px-3 bg-white rounded-[5px] outline-none focus:border-blue-400 shadow-sm transition-all focus:shadow-md" 
                            />
                        </FormRow>

                        <FormRow label="Legal Company Name">
                            <input 
                                type="text" 
                                name="Legal_Name"
                                value={formData.Legal_Name}
                                onChange={handleInputChange}
                                className="flex-1 h-8 font-mono border border-gray-300 px-3 bg-white rounded-[5px] outline-none focus:border-blue-400 shadow-sm transition-all focus:shadow-md" 
                            />
                        </FormRow>

                        <FormRow label="Address 1">
                            <input 
                                type="text" 
                                name="Address1"
                                value={formData.Address1}
                                onChange={handleInputChange}
                                className="flex-1 h-8 font-mono border border-gray-300 px-3 bg-white rounded-[5px] outline-none focus:border-blue-400 shadow-sm transition-all focus:shadow-md" 
                            />
                        </FormRow>

                        <FormRow label="Address 2">
                            <input 
                                type="text" 
                                name="Address2"
                                value={formData.Address2}
                                onChange={handleInputChange}
                                className="flex-1 h-8 font-mono border border-gray-300 px-3 bg-white rounded-[5px] outline-none focus:border-blue-400 shadow-sm transition-all focus:shadow-md" 
                            />
                        </FormRow>

                        <FormRow label="Country">
                            <div className="flex-1 flex gap-3">
                                <input 
                                    type="text"
                                    name="Country"
                                    value={formData.Country}
                                    readOnly
                                    className="flex-1 h-8 font-mono border border-gray-300 px-3 bg-gray-50 rounded-[5px] outline-none shadow-sm cursor-default"
                                />
                                <button 
                                    onClick={handleCountrySearch}
                                    className="w-10 h-8 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[5px] transition-all shadow-md active:scale-95"
                                >
                                    <Globe size={18} />
                                </button>
                            </div>
                        </FormRow>

                        <FormRow label="Phone No">
                            <input 
                                type="text" 
                                name="Phone"
                                value={formData.Phone}
                                onChange={handleInputChange}
                                className="flex-1 h-8 font-mono border border-gray-300 px-3 bg-white rounded-[5px] outline-none focus:border-blue-400 shadow-sm transition-all focus:shadow-md" 
                            />
                        </FormRow>

                        <FormRow label="E-Mail Address">
                            <input 
                                type="email" 
                                name="Email"
                                value={formData.Email}
                                onChange={handleInputChange}
                                className="flex-1 h-8 font-mono border border-gray-300 px-3 bg-white rounded-[5px] outline-none focus:border-blue-400 shadow-sm transition-all focus:shadow-md" 
                            />
                        </FormRow>

                        <FormRow label="Web Site">
                            <input 
                                type="text" 
                                name="Web"
                                value={formData.Web}
                                onChange={handleInputChange}
                                className="flex-1 h-8 font-mono border border-gray-300 px-3 bg-white rounded-[5px] outline-none focus:border-blue-400 shadow-sm transition-all focus:shadow-md" 
                            />
                        </FormRow>

                        <FormRow label="Industry">
                            <div className="flex-1 flex gap-3">
                                <input 
                                    type="text"
                                    name="Industry"
                                    value={formData.Industry}
                                    readOnly
                                    className="flex-1 h-8 font-mono border border-gray-300 px-3 bg-gray-50 rounded-[5px] outline-none shadow-sm cursor-default"
                                />
                                <button 
                                    onClick={handleIndustrySearch}
                                    className="w-10 h-8 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[5px] transition-all shadow-md active:scale-95"
                                >
                                    <Briefcase size={18} />
                                </button>
                            </div>
                        </FormRow>

                        <FormRow label="Company Organized">
                            <div className="flex-1 flex gap-3">
                                <input 
                                    type="text"
                                    name="Organiz"
                                    value={formData.Organiz}
                                    readOnly
                                    className="flex-1 h-8 font-mono border border-gray-300 px-3 bg-gray-50 rounded-[5px] outline-none shadow-sm cursor-default"
                                />
                                <button 
                                    onClick={() => setShowOrgLookup(true)}
                                    className="w-10 h-8 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[5px] transition-all shadow-md active:scale-95"
                                >
                                    <Search size={18} />
                                </button>
                            </div>
                        </FormRow>

                        <div className="flex items-center gap-6">
                            <label className="w-32 font-bold text-gray-700">Business Start Date</label>
                            <div className="flex gap-3">
                                <input 
                                    type="text" 
                                    name="Start_Date"
                                    value={formData.Start_Date}
                                    readOnly
                                    className="w-[127px] h-8 font-mono border border-gray-300 px-3 bg-gray-50 rounded-[5px] outline-none shadow-sm cursor-default" 
                                />
                                <button 
                                    onClick={() => setShowCalendar(true)}
                                    className="w-10 h-8 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded-[5px] transition-all shadow-md active:scale-95"
                                >
                                    <Calendar size={18} />
                                </button>
                            </div>
                        </div>

                        <FormRow label="Fin. Year From">
                            <input 
                                type="text" 
                                name="Acc_Year"
                                value={formData.Acc_Year}
                                onChange={handleInputChange}
                                className="w-[180px] h-8 font-mono border border-gray-300 px-3 bg-white rounded-[5px] outline-none focus:border-blue-400 shadow-sm transition-all focus:shadow-md" 
                            />
                        </FormRow>

                        <FormRow label="Fin. Year To">
                            <input 
                                type="text" 
                                name="To_Year"
                                value={formData.To_Year}
                                onChange={handleInputChange}
                                className="w-[180px] h-8 font-mono border border-gray-300 px-3 bg-white rounded-[5px] outline-none focus:border-blue-400 shadow-sm transition-all focus:shadow-md" 
                            />
                        </FormRow>

                        <FormRow label="Company Reg. No">
                            <input 
                                type="text" 
                                name="Reg_Number"
                                value={formData.Reg_Number}
                                onChange={handleInputChange}
                                className="flex-1 h-8 font-mono border border-gray-300 px-3 bg-white rounded-[5px] outline-none focus:border-blue-400 shadow-sm transition-all focus:shadow-md" 
                            />
                        </FormRow>

                        <FormRow label="Tax ID">
                            <input 
                                type="text" 
                                name="Tax_ID"
                                value={formData.Tax_ID}
                                onChange={handleInputChange}
                                className="flex-1 h-8 font-mono border border-gray-300 px-3 bg-white rounded-[5px] outline-none focus:border-blue-400 shadow-sm transition-all focus:shadow-md" 
                            />
                        </FormRow>
                    </div>
                </div>
            </SimpleModal>

            {/* Company Lookup Modal */}
            {showLookup && (
                <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setShowLookup(false)} />
                    <div className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden animate-in zoom-in-95 duration-200">
                        {/* Header */}
                        <div className="bg-[#0078d4] px-4 py-2 flex items-center justify-between text-white">
                            <div className="flex items-center gap-2">
                                <Building2 size={16} />
                                <span className="text-sm font-bold">Search Company Lookup</span>
                            </div>
                            <button
                                onClick={() => setShowLookup(false)}
                                className="w-9 h-8 flex items-center justify-center bg-[#ff3b30] hover:bg-[#e03127] text-white rounded-[8px] shadow-[0_4px_12px_rgba(255,59,48,0.3)] hover:shadow-[0_6px_20px_rgba(255,59,48,0.4)] transition-all active:scale-90 outline-none border-none group"
                                title="Close"
                            >
                                <X size={18} strokeWidth={4} className="group-hover:scale-110 transition-transform" />
                            </button>
                        </div>

                        {/* Search List */}
                        <div className="p-2">
                            <div className="bg-gray-100 px-3 py-1.5 flex text-[10px] font-bold text-gray-600 border-b border-gray-200">
                                <span className="w-[120px]">CODE</span>
                                <span className="flex-1">COMPANY NAME</span>
                            </div>
                            <div className="max-h-[300px] overflow-y-auto overflow-x-hidden custom-scrollbar">
                                {searching ? (
                                    <div className="p-8 text-center text-sm text-gray-500">Searching for companies...</div>
                                ) : lookupResults.length > 0 ? (
                                    lookupResults.map((company, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => handleSelectCompany(company)}
                                            className="w-full flex items-center justify-between px-3 py-2 text-xs border-b border-gray-100 hover:bg-blue-50 transition-all text-left"
                                        >
                                            <div className="flex items-center gap-2 flex-1">
                                                <span className="w-[120px] font-mono text-[11px] font-bold text-[#0078d4]">
                                                    {company.companyCode}
                                                </span>
                                                <span className="flex-1 font-mono font-medium text-gray-700 uppercase">
                                                    {company.companyName}
                                                </span>
                                            </div>
                                            <div className="bg-[#e49e1b] text-white text-[10px] px-5 py-1.5 rounded-md font-bold hover:bg-[#cb9b34] shadow-sm transition-all active:scale-95 uppercase">Select</div>
                                        </button>
                                    ))
                                ) : (
                                    <div className="p-8 text-center text-sm text-gray-500">No companies found.</div>
                                )}
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="bg-gray-50 px-4 py-2 border-t border-gray-200 flex justify-between items-center text-[10px] text-gray-400">
                            <span>{lookupResults.length} Result(s)</span>
                            <span className="italic font-bold text-[#0078d4]">ACCOUNT CLOUD LOOKUP</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Custom Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => !loading && setShowDeleteConfirm(false)} />
                    <div className="relative w-full max-w-md bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-8 text-center">
                            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-white shadow-lg">
                                <AlertTriangle size={40} className="text-[#d13438]" />
                            </div>
                            <h3 className="text-xl font-black text-slate-800 mb-2">Confirm Deletion</h3>
                            <p className="text-slate-500 text-sm leading-relaxed mb-8">
                                Are you sure you want to delete <span className="font-bold text-slate-800 uppercase">"{formData.Comp_Name}"</span>? 
                                <br />This action is permanent and cannot be undone.
                            </p>
                            
                            <div className="flex gap-3">
                                <button 
                                    onClick={() => setShowDeleteConfirm(false)}
                                    disabled={loading}
                                    className="flex-1 h-12 bg-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-200 transition-all active:scale-95 disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={confirmDelete}
                                    disabled={loading}
                                    className="flex-1 h-12 bg-[#d13438] text-white font-bold rounded-2xl hover:bg-[#a4262c] shadow-lg shadow-red-200 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {loading ? <Loader2 size={18} className="animate-spin" /> : "Delete Now"}
                                </button>
                            </div>
                        </div>
                        
                        <div className="bg-slate-50 py-3 border-t border-slate-100">
                            <span className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] block text-center">Security Verification Required</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Country Lookup Modal */}
            {showCountryLookup && (
                <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setShowCountryLookup(false)} />
                    <div className="relative w-full max-w-md bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden animate-in zoom-in-95 duration-200">
                        {/* Header */}
                        <div className="bg-[#0078d4] px-4 py-2 flex items-center justify-between text-white">
                            <div className="flex items-center gap-2">
                                <Globe size={16} />
                                <span className="text-sm font-bold">Search Country Lookup</span>
                            </div>
                            <button
                                onClick={() => setShowCountryLookup(false)}
                                className="w-9 h-8 flex items-center justify-center bg-[#ff3b30] hover:bg-[#e03127] text-white rounded-[8px] shadow-[0_4px_12px_rgba(255,59,48,0.3)] hover:shadow-[0_6px_20px_rgba(255,59,48,0.4)] transition-all active:scale-90 outline-none border-none group"
                                title="Close"
                            >
                                <X size={18} strokeWidth={4} className="group-hover:scale-110 transition-transform" />
                            </button>
                        </div>

                        {/* Search List */}
                        <div className="p-2">
                            <div className="bg-gray-100 px-3 py-1.5 flex text-[10px] font-bold text-gray-600 border-b border-gray-200">
                                <span className="w-[100px]">CODE</span>
                                <span className="flex-1">COUNTRY NAME</span>
                            </div>
                            <div className="max-h-[300px] overflow-y-auto overflow-x-hidden custom-scrollbar">
                                {searchingCountry ? (
                                    <div className="p-8 text-center text-sm text-gray-500">Loading countries...</div>
                                ) : countryResults.length > 0 ? (
                                    countryResults.map((country, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => handleSelectCountry(country)}
                                            className="w-full flex items-center justify-between px-3 py-2 text-xs border-b border-gray-100 hover:bg-blue-50 transition-all text-left"
                                        >
                                            <div className="flex items-center gap-2 flex-1">
                                                <span className="w-[100px] font-mono text-[11px] font-bold text-[#0078d4]">
                                                    {country.countryCode}
                                                </span>
                                                <span className="flex-1 font-mono font-medium text-gray-700 uppercase">
                                                    {country.countryName}
                                                </span>
                                            </div>
                                            <div className="bg-[#e49e1b] text-white text-[10px] px-5 py-1.5 rounded-md font-bold hover:bg-[#cb9b34] shadow-sm transition-all active:scale-95 uppercase">Select</div>
                                        </button>
                                    ))
                                ) : (
                                    <div className="p-8 text-center text-sm text-gray-500">No countries found.</div>
                                )}
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="bg-gray-50 px-4 py-2 border-t border-gray-200 flex justify-between items-center text-[10px] text-gray-400">
                            <span>{countryResults.length} Result(s)</span>
                            <span className="italic font-bold text-[#0078d4]">ACCOUNT CLOUD DATA</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Industry Lookup Modal */}
            {showIndustryLookup && (
                <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setShowIndustryLookup(false)} />
                    <div className="relative w-full max-w-md bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden animate-in zoom-in-95 duration-200">
                        {/* Header */}
                        <div className="bg-[#0078d4] px-4 py-2 flex items-center justify-between text-white">
                            <div className="flex items-center gap-2">
                                <Briefcase size={16} />
                                <span className="text-sm font-bold">Search Industry Lookup</span>
                            </div>
                            <button
                                onClick={() => setShowIndustryLookup(false)}
                                className="w-9 h-8 flex items-center justify-center bg-[#ff3b30] hover:bg-[#e03127] text-white rounded-[8px] shadow-[0_4px_12px_rgba(255,59,48,0.3)] hover:shadow-[0_6px_20px_rgba(255,59,48,0.4)] transition-all active:scale-90 outline-none border-none group"
                                title="Close"
                            >
                                <X size={18} strokeWidth={4} className="group-hover:scale-110 transition-transform" />
                            </button>
                        </div>

                        {/* Search List */}
                        <div className="p-2">
                            <div className="bg-gray-100 px-3 py-1.5 flex text-[10px] font-bold text-gray-600 border-b border-gray-200">
                                <span className="w-[100px]">CODE</span>
                                <span className="flex-1">INDUSTRY NAME</span>
                            </div>
                            <div className="max-h-[300px] overflow-y-auto overflow-x-hidden custom-scrollbar">
                                {searchingIndustry ? (
                                    <div className="p-8 text-center text-sm text-gray-500">Loading industries...</div>
                                ) : industryResults.length > 0 ? (
                                    industryResults.map((industry, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => handleSelectIndustry(industry)}
                                            className="w-full flex items-center justify-between px-3 py-2 text-xs border-b border-gray-100 hover:bg-blue-50 transition-all text-left"
                                        >
                                            <div className="flex items-center gap-2 flex-1">
                                                <span className="w-[100px] font-mono text-[11px] font-bold text-[#0078d4]">
                                                    {industry.indCode}
                                                </span>
                                                <span className="flex-1 font-mono font-medium text-gray-700 uppercase">
                                                    {industry.indName}
                                                </span>
                                            </div>
                                            <div className="bg-[#e49e1b] text-white text-[10px] px-5 py-1.5 rounded-md font-bold hover:bg-[#cb9b34] shadow-sm transition-all active:scale-95 uppercase">Select</div>
                                        </button>
                                    ))
                                ) : (
                                    <div className="p-8 text-center text-sm text-gray-500">No industries found.</div>
                                )}
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="bg-gray-50 px-4 py-2 border-t border-gray-200 flex justify-between items-center text-[10px] text-gray-400">
                            <span>{industryResults.length} Result(s)</span>
                            <span className="italic font-bold text-[#0078d4]">ACCOUNT CLOUD DATA</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Organizational Type Lookup Modal */}
            {showOrgLookup && (
                <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setShowOrgLookup(false)} />
                    <div className="relative w-full max-w-md bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden animate-in zoom-in-95 duration-200">
                        {/* Header */}
                        <div className="bg-[#0078d4] px-4 py-2 flex items-center justify-between text-white">
                            <div className="flex items-center gap-2">
                                <Search size={16} />
                                <span className="text-sm font-bold">Organization Type Lookup</span>
                            </div>
                            <button
                                onClick={() => setShowOrgLookup(false)}
                                className="w-9 h-8 flex items-center justify-center bg-[#ff3b30] hover:bg-[#e03127] text-white rounded-[8px] shadow-[0_4px_12px_rgba(255,59,48,0.3)] hover:shadow-[0_6px_20_rgba(255,59,48,0.4)] transition-all active:scale-90 outline-none border-none group"
                                title="Close"
                            >
                                <X size={18} strokeWidth={4} className="group-hover:scale-110 transition-transform" />
                            </button>
                        </div>

                        {/* Search List */}
                        <div className="p-2">
                            <div className="bg-gray-100 px-3 py-1.5 flex text-[10px] font-bold text-gray-600 border-b border-gray-200">
                                <span className="w-[100px]">CODE</span>
                                <span className="flex-1">TYPE NAME</span>
                            </div>
                            <div className="max-h-[300px] overflow-y-auto overflow-x-hidden custom-scrollbar">
                                {orgTypes.map((org, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => handleSelectOrg(org)}
                                        className="w-full flex items-center justify-between px-3 py-2 text-xs border-b border-gray-100 hover:bg-blue-50 transition-all text-left"
                                    >
                                        <div className="flex items-center gap-2 flex-1">
                                            <span className="w-[100px] font-mono text-[11px] font-bold text-[#0078d4]">
                                                {org.code}
                                            </span>
                                            <span className="flex-1 font-mono font-medium text-gray-700 uppercase">
                                                {org.name}
                                            </span>
                                        </div>
                                        <div className="bg-[#e49e1b] text-white text-[10px] px-5 py-1.5 rounded-md font-bold hover:bg-[#cb9b34] shadow-sm transition-all active:scale-95 uppercase">Select</div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="bg-gray-50 px-4 py-2 border-t border-gray-200 flex justify-between items-center text-[10px] text-gray-400">
                            <span>{orgTypes.length} Result(s)</span>
                            <span className="italic font-bold text-[#0078d4]">ACCOUNT CLOUD DATA</span>
                        </div>
                    </div>
                </div>
            )}

            <CalendarModal 
                isOpen={showCalendar}
                onClose={() => setShowCalendar(false)}
                onDateSelect={handleDateSelect}
                initialDate={formData.Start_Date}
            />
        </>
    );
};

const FormRow = ({ label, children }) => (
    <div className="flex items-center gap-6">
        <label className="w-32 font-bold text-gray-700">{label}</label>
        {children}
    </div>
);

export default CompanyBoard;
