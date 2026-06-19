/**
 * Session Utility
 * Handles retrieval of company and user information from localStorage
 * to avoid hardcoding values like 'C001' or 'SYSTEM'.
 */

export const getSessionData = () => {
    const companyData = localStorage.getItem('selectedCompany');
    const userData = localStorage.getItem('user');
    
    let companyCode = null;
    let companyName = null;
    let userName = null;

    if (companyData) {
        try {
            const parsed = JSON.parse(companyData);
            if (typeof parsed === 'string') {
                companyCode = parsed;
            } else {
                companyCode = parsed.company_Code || parsed.companyCode || parsed.CompanyCode || companyData;
                companyName = parsed.company_Name || parsed.companyName || parsed.CompanyName || companyName;
            }
        } catch (e) { companyCode = companyData; }
    }

    const companyMap = {
        'C001': 'COM001',
        'C002': 'COM002'
    };
    if (companyCode && companyMap[companyCode]) {
        companyCode = companyMap[companyCode];
    }

    if (userData) {
        try {
            const parsed = JSON.parse(userData);
            userName = parsed.emp_Name || parsed.empName || parsed.EmpName || userName;
        } catch (e) { }
    }

    return { companyCode, companyName, userName };
};

export const getCompanyCode = () => getSessionData().companyCode;
export const getCompanyName = () => getSessionData().companyName;
export const getUserName = () => getSessionData().userName;
