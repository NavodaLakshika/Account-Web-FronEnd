/**
 * Session Utility
 * Handles retrieval of company and user information from localStorage
 * to avoid hardcoding values.
 */

export const getSessionData = () => {
    const companyData = localStorage.getItem('selectedCompany') || sessionStorage.getItem('selectedCompany');
    const userData = localStorage.getItem('user') || sessionStorage.getItem('user');
    
    let companyCode = null;
    let companyName = null;
    let userName = null;
    let parsedCompany = null;

    const extractCodeAndName = (obj) => {
        if (!obj) return { code: null, name: null };
        if (typeof obj === 'string') {
            const trimmed = obj.trim();
            if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
                try {
                    return extractCodeAndName(JSON.parse(trimmed));
                } catch (e) {
                    return { code: null, name: null };
                }
            }
            return { code: trimmed, name: trimmed };
        }
        const code = obj.company_Code || 
                     obj.companyCode || 
                     obj.CompanyCode || 
                     obj.Company_Code || 
                     obj.Company_Id || 
                     obj.companyId || 
                     obj.CompanyId || 
                     obj.Comp_Code || 
                     obj.comp_Code || 
                     obj.CompCode || 
                     obj.compCode || 
                     obj.Code || 
                     obj.code || 
                     obj.id || 
                     obj.Id || 
                     null;

        const name = obj.company_Name || 
                     obj.companyName || 
                     obj.CompanyName || 
                     obj.Comp_Name || 
                     obj.comp_Name || 
                     obj.name || 
                     obj.Name || 
                     null;

        return { code: (typeof code === 'string' && code.startsWith('{')) ? null : code, name };
    };

    if (companyData) {
        const res = extractCodeAndName(companyData);
        companyCode = res.code;
        companyName = res.name;
        try { parsedCompany = typeof companyData === 'string' ? JSON.parse(companyData) : companyData; } catch(e) {}
    }

    // Secondary fallback: check other potential storage keys
    if (!companyCode) {
        const fallbacks = ['company', 'companyCode', 'currentCompany', 'activeCompany'];
        for (const k of fallbacks) {
            const raw = localStorage.getItem(k) || sessionStorage.getItem(k);
            if (raw) {
                const res = extractCodeAndName(raw);
                if (res.code) {
                    companyCode = res.code;
                    if (!companyName) companyName = res.name;
                    break;
                }
            }
        }
    }

    if (userData) {
        try {
            const parsed = JSON.parse(userData);
            userName = parsed.emp_Name || parsed.empName || parsed.EmpName || parsed.Emp_Name || userName;
            if (!companyCode) {
                const res = extractCodeAndName(parsed);
                if (res.code) companyCode = res.code;
            }
        } catch (e) { }
    }

    // Default fallback if still null or a JSON string
    if (!companyCode || (typeof companyCode === 'string' && companyCode.startsWith('{'))) {
        companyCode = 'COM001';
    }

    return { companyCode, companyName: companyName || companyCode, userName, companyDetails: parsedCompany };
};

export const getCompanyCode = () => getSessionData().companyCode;
export const getCompanyName = () => getSessionData().companyName;
export const getUserName = () => getSessionData().userName;
export const getCompanyDetails = () => getSessionData().companyDetails;

export const getCompanyModule = (identifier) => {
    try {
        const { companyCode, companyName, companyDetails } = getSessionData();
        const id = identifier || companyCode || companyName;
        if (id) {
            const stored = localStorage.getItem(`company_module_${id}`) || sessionStorage.getItem(`company_module_${id}`);
            if (stored) return stored;
        }
        if (companyName && !identifier) {
            const storedByName = localStorage.getItem(`company_module_${companyName}`);
            if (storedByName) return storedByName;
        }
        if (companyDetails?.model) return companyDetails.model;
        if (companyDetails?.Model) return companyDetails.Model;
        if (companyDetails?.companyModule) return companyDetails.companyModule;
        const globalModule = localStorage.getItem('selectedCompanyModule') || sessionStorage.getItem('selectedCompanyModule');
        if (globalModule) return globalModule;
    } catch (e) {
        console.error('Error getting company module', e);
    }
    return 'Sales';
};

export const setCompanyModule = (identifier, module) => {
    try {
        const mod = module === 'Service' ? 'Service' : 'Sales';
        if (identifier) {
            localStorage.setItem(`company_module_${identifier}`, mod);
            sessionStorage.setItem(`company_module_${identifier}`, mod);
        }
        localStorage.setItem('selectedCompanyModule', mod);
        sessionStorage.setItem('selectedCompanyModule', mod);
        window.dispatchEvent(new CustomEvent('company_module_changed', { detail: { module: mod, identifier } }));
    } catch (e) {
        console.error('Error setting company module', e);
    }
};
