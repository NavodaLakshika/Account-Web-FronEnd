import React, { useState, useEffect } from 'react';
import { Building2, Globe, Briefcase, Calendar } from 'lucide-react';
import CalendarModal from '../../CalendarModal';
import { authService } from '../../../services/auth.service';
import { showSuccessToast, showErrorToast } from '../../../utils/toastUtils';
import { MasterFormWrapper, MasterFieldRow, MasterInput, MasterLookupInput, MasterLookupModal } from '../../MasterFormComponents';

const orgTypes = [
    { code: 'CORP', name: 'Corporation' }, { code: 'PART', name: 'Partnership' }, { code: 'SOLE', name: 'Sole Proprietorship' }
];

const CompanyBoard = ({ isOpen, onClose }) => {
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
                try { const [countryData, industryData] = await Promise.all([authService.getAllCountries(), authService.getAllIndustries()]); setCountries(countryData); setIndustries(industryData); } catch (error) { console.error('Error loading master data:', error); }
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
            let data = (userName && userName !== 'Admin') ? await authService.getCompaniesByEmployee(userName) : await authService.getAllCompanies();
            setLookupResults(data.map(c => ({ ...c, companyCode: c.companyCode || c.CompanyCode, companyName: c.companyName || c.CompanyName })));
        } catch (error) { console.error('Error fetching companies:', error); showErrorToast('Failed to load companies for search.'); } finally { setLoading(false); }
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

    if (!isOpen) return null;

    return (
        <>
            <MasterFormWrapper
                isOpen={isOpen}
                onClose={onClose}
                title="Company Profile"
                subtitle="Manage company registration & details"
                icon={Building2}
                isEditMode={isEditMode}
                loading={loading}
                onClear={handleClear}
                onSave={handleSave}
                onDelete={handleDelete}
            >
                <MasterFieldRow label="Company ID" colSpan="col-span-6">
                    <MasterLookupInput value={formData.Code} onSearchClick={handleSearch} isIdField />
                </MasterFieldRow>
                <MasterFieldRow label="Company Name" colSpan="col-span-6">
                    <MasterInput name="Comp_Name" value={formData.Comp_Name} onChange={handleInputChange} maxLength={50} placeholder="" />
                </MasterFieldRow>

                <MasterFieldRow label="Legal Name" colSpan="col-span-6">
                    <MasterInput name="Legal_Name" value={formData.Legal_Name} onChange={handleInputChange} placeholder="" />
                </MasterFieldRow>
                <MasterFieldRow label="Organization" colSpan="col-span-6">
                    <MasterLookupInput value={formData.Organiz} onSearchClick={() => setShowOrgLookup(true)} placeholder="" />
                </MasterFieldRow>

                <div className="col-span-12 h-px bg-slate-100 my-2" />

                <MasterFieldRow label="Address 1" colSpan="col-span-6">
                    <MasterInput name="Address1" value={formData.Address1} onChange={handleInputChange} placeholder="" />
                </MasterFieldRow>
                <MasterFieldRow label="Address 2" colSpan="col-span-6">
                    <MasterInput name="Address2" value={formData.Address2} onChange={handleInputChange} placeholder="" />
                </MasterFieldRow>

                <MasterFieldRow label="Country" colSpan="col-span-6">
                    <MasterLookupInput value={formData.Country} onSearchClick={handleCountrySearch} placeholder="" />
                </MasterFieldRow>
                <MasterFieldRow label="Phone No" colSpan="col-span-6">
                    <MasterInput name="Phone" value={formData.Phone} onChange={handleInputChange} placeholder="" />
                </MasterFieldRow>

                <MasterFieldRow label="E-Mail" colSpan="col-span-6">
                    <MasterInput type="email" name="Email" value={formData.Email} onChange={handleInputChange} placeholder="" />
                </MasterFieldRow>
                <MasterFieldRow label="Website" colSpan="col-span-6">
                    <MasterInput name="Web" value={formData.Web} onChange={handleInputChange} placeholder="" />
                </MasterFieldRow>

                <div className="col-span-12 h-px bg-slate-100 my-2" />

                <MasterFieldRow label="Industry" colSpan="col-span-6">
                    <MasterLookupInput value={formData.Industry} onSearchClick={handleIndustrySearch} placeholder="" />
                </MasterFieldRow>
                <MasterFieldRow label="Start Date" colSpan="col-span-6">
                    <div className="flex gap-1 items-center flex-1">
                        <MasterInput name="Start_Date" value={formData.Start_Date} readOnly />
                        <button type="button" onClick={() => setShowCalendar(true)} className="w-9 h-8 bg-[#0285fd] text-white flex items-center justify-center hover:bg-[#0073ff] rounded transition-all shadow-sm active:scale-95 shrink-0 border-none"><Calendar size={14} /></button>
                    </div>
                </MasterFieldRow>

                <MasterFieldRow label="Fin. Year From" colSpan="col-span-6">
                    <MasterInput name="Acc_Year" value={formData.Acc_Year} onChange={handleInputChange} placeholder="YYYY" />
                </MasterFieldRow>
                <MasterFieldRow label="Fin. Year To" colSpan="col-span-6">
                    <MasterInput name="To_Year" value={formData.To_Year} onChange={handleInputChange} placeholder="YYYY" />
                </MasterFieldRow>

                <MasterFieldRow label="Registration No" colSpan="col-span-6">
                    <MasterInput name="Reg_Number" value={formData.Reg_Number} onChange={handleInputChange} placeholder="" />
                </MasterFieldRow>
                <MasterFieldRow label="Tax ID" colSpan="col-span-6">
                    <MasterInput name="Tax_ID" value={formData.Tax_ID} onChange={handleInputChange} placeholder="" />
                </MasterFieldRow>
            </MasterFormWrapper>

            <MasterLookupModal 
                isOpen={showLookup} 
                onClose={() => setShowLookup(false)} 
                title="Company Search" 
                columns={[
                    { label: 'CODE', key: 'companyCode', isId: true, width: 'w-[100px]' },
                    { label: 'COMPANY NAME', key: 'companyName' }
                ]}
                items={lookupResults.filter(c => (c.companyName || '').toLowerCase().includes(compSearch.toLowerCase()) || (c.companyCode || '').toLowerCase().includes(compSearch.toLowerCase()))}
                loading={loading} 
                onSelect={handleSelectCompany}
                searchQuery={compSearch}
                setSearchQuery={setCompSearch}
            />

            <MasterLookupModal 
                isOpen={showCountryLookup} 
                onClose={() => setShowCountryLookup(false)} 
                title="Country Lookup" 
                columns={[
                    { label: 'CODE', key: 'countryCode', isId: true, width: 'w-[80px]' },
                    { label: 'COUNTRY NAME', key: 'countryName' }
                ]}
                items={countryResults.filter(c => (c.countryName || '').toLowerCase().includes(countrySearch.toLowerCase()))}
                loading={loading} 
                onSelect={(c) => { setFormData(prev => ({ ...prev, Country: c.countryName })); setShowCountryLookup(false); }}
                searchQuery={countrySearch}
                setSearchQuery={setCountrySearch}
            />

            <MasterLookupModal 
                isOpen={showIndustryLookup} 
                onClose={() => setShowIndustryLookup(false)} 
                title="Industry Lookup" 
                columns={[
                    { label: 'CODE', key: 'indCode', isId: true, width: 'w-[80px]' },
                    { label: 'INDUSTRY NAME', key: 'indName' }
                ]}
                items={industryResults.filter(c => (c.indName || '').toLowerCase().includes(industrySearch.toLowerCase()))}
                loading={loading} 
                onSelect={(c) => { setFormData(prev => ({ ...prev, Industry: c.indName })); setShowIndustryLookup(false); }}
                searchQuery={industrySearch}
                setSearchQuery={setIndustrySearch}
            />

            <MasterLookupModal 
                isOpen={showOrgLookup} 
                onClose={() => setShowOrgLookup(false)} 
                title="Organization Type" 
                columns={[
                    { label: 'CODE', key: 'code', isId: true, width: 'w-[80px]' },
                    { label: 'TYPE NAME', key: 'name' }
                ]}
                items={orgTypes.filter(c => (c.name || '').toLowerCase().includes(orgSearch.toLowerCase()))}
                onSelect={(o) => { setFormData(prev => ({ ...prev, Organiz: o.name })); setShowOrgLookup(false); }}
                searchQuery={orgSearch}
                setSearchQuery={setOrgSearch}
            />

            <CalendarModal isOpen={showCalendar} onClose={() => setShowCalendar(false)} onDateSelect={(date) => setFormData(prev => ({ ...prev, Start_Date: date }))} initialDate={formData.Start_Date} />
        </>
    );
};

export default CompanyBoard;
