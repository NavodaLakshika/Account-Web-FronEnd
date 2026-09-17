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

    if (companyData) {
        try {
            const parsed = JSON.parse(companyData);
            if (typeof parsed === 'string') {
                companyCode = parsed;
            } else {
                companyCode = parsed.company_Code || parsed.companyCode || parsed.CompanyCode || parsed.Company_Code || parsed.Code || parsed.code || companyData;
                companyName = parsed.company_Name || parsed.companyName || parsed.CompanyName || parsed.Comp_Name || parsed.comp_Name || parsed.name || companyName;
            }
        } catch (e) { companyCode = companyData; }
    }

    const companyMap = {};
    if (companyCode && companyMap[companyCode]) {
        companyCode = companyMap[companyCode];
    }

    let parsedCompany = null;
    if (companyData) {
        try { parsedCompany = JSON.parse(companyData); } catch(e) {}
    }

    if (userData) {
        try {
            const parsed = JSON.parse(userData);
            userName = parsed.emp_Name || parsed.empName || parsed.EmpName || userName;
        } catch (e) { }
    }

    return { companyCode, companyName, userName, companyDetails: parsedCompany };
};

export const getCompanyCode = () => getSessionData().companyCode;
export const getCompanyName = () => getSessionData().companyName;
export const getUserName = () => getSessionData().userName;
export const getCompanyDetails = () => getSessionData().companyDetails;
