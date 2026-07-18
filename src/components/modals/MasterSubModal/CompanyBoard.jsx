import React, { useState, useEffect } from 'react';
import { Building2, Globe, Briefcase, Calendar } from 'lucide-react';
import CalendarModal from '../../CalendarModal';
import { authService } from '../../../services/auth.service';
import { showSuccessToast, showErrorToast } from '../../../utils/toastUtils';
import { MasterFormWrapper, MasterFieldRow, MasterInput, MasterSelect } from '../../MasterFormComponents';

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
    const [companies, setCompanies] = useState([]);
    const [showCalendar, setShowCalendar] = useState(false);

    useEffect(() => {
        if (isOpen) {
            handleClear();
            const fetchMasterData = async () => {
                try { 
                    const [countryData, industryData] = await Promise.all([authService.getAllCountries(), authService.getAllIndustries()]); 
                    setCountries(countryData); 
                    setIndustries(industryData);
                    
                    const userName = user?.empName || user?.EmpName || user?.username;
                    const empCode = user?.EmpCode || user?.empCode;
                    let data = (userName && userName !== 'Admin' && empCode) ? await authService.getCompaniesByEmployee(empCode) : userName === 'Admin' ? await authService.getAllCompanies() : [];
                    setCompanies(data.map(c => ({ ...c, companyCode: c.companyCode || c.CompanyCode, companyName: c.companyName || c.CompanyName })));
                } catch (error) { console.error('Error loading master data:', error); }
            };
            fetchMasterData();
        }
    }, [isOpen]);

    const handleInputChange = (e) => { const { name, value } = e.target; setFormData(prev => ({ ...prev, [name]: value })); };
    const handleClear = () => { setFormData(initialState); setIsEditMode(false); };

    const handleCompanyChange = async (e) => {
        const code = e.target.value;
        const company = companies.find(c => c.companyCode === code);
        if (company) {
            setLoading(true);
            try {
                const details = await authService.getCompanyDetails(company.companyCode);
                setFormData({ Code: details.companyCode, Comp_Name: details.companyName, Legal_Name: details.legalName || '', Address1: details.address1 || '', Address2: details.address2 || '', Country: details.country || '', Phone: details.phone || '', Email: details.email || '', Web: details.web || '', Industry: details.industry || '', Organiz: details.organiz || '', Start_Date: details.startDate ? details.startDate.split('T')[0] : '', Acc_Year: details.accYear || '', To_Year: details.toYear || '', Tax_ID: details.taxID || '', Reg_Number: details.regNumber || '', User_Name: user?.empName || user?.EmpName || user?.username || 'Admin' });
                setIsEditMode(true);
                showSuccessToast('Company loaded successfully!');
            } catch (error) { showErrorToast('Failed to load company details.'); } finally { setLoading(false); }
        } else {
            handleClear();
        }
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
                    <MasterSelect 
                        name="Code"
                        value={formData.Code || ''}
                        onChange={handleCompanyChange}
                        options={companies.map(c => ({ value: c.companyCode, label: `${c.companyCode} - ${c.companyName}` }))}
                        placeholder="Select company to edit..."
                        isIdField
                    />
                </MasterFieldRow>
                <MasterFieldRow label="Company Name" colSpan="col-span-6">
                    <MasterInput name="Comp_Name" value={formData.Comp_Name} onChange={handleInputChange} maxLength={50} placeholder="" />
                </MasterFieldRow>

                <MasterFieldRow label="Legal Name" colSpan="col-span-6">
                    <MasterInput name="Legal_Name" value={formData.Legal_Name} onChange={handleInputChange} placeholder="" />
                </MasterFieldRow>
                <MasterFieldRow label="Organization" colSpan="col-span-6">
                    <MasterSelect 
                        name="Organiz"
                        value={formData.Organiz || ''}
                        onChange={handleInputChange}
                        options={orgTypes.map(o => ({ value: o.name, label: o.name }))}
                        placeholder="Select Organization..."
                    />
                </MasterFieldRow>

                <div className="col-span-12 h-px bg-slate-100 my-2" />

                <MasterFieldRow label="Address 1" colSpan="col-span-6">
                    <MasterInput name="Address1" value={formData.Address1} onChange={handleInputChange} placeholder="" />
                </MasterFieldRow>
                <MasterFieldRow label="Address 2" colSpan="col-span-6">
                    <MasterInput name="Address2" value={formData.Address2} onChange={handleInputChange} placeholder="" />
                </MasterFieldRow>

                <MasterFieldRow label="Country" colSpan="col-span-6">
                    <MasterSelect 
                        name="Country"
                        value={formData.Country || ''}
                        onChange={handleInputChange}
                        options={countries.map(c => ({ value: c.countryName, label: c.countryName }))}
                        placeholder="Select Country..."
                    />
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
                    <MasterSelect 
                        name="Industry"
                        value={formData.Industry || ''}
                        onChange={handleInputChange}
                        options={industries.map(i => ({ value: i.indName, label: i.indName }))}
                        placeholder="Select Industry..."
                    />
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



            <CalendarModal isOpen={showCalendar} onClose={() => setShowCalendar(false)} onDateSelect={(date) => setFormData(prev => ({ ...prev, Start_Date: date }))} initialDate={formData.Start_Date} />
        </>
    );
};

export default CompanyBoard;
