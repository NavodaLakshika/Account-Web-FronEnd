/**
 * Session Utility
 * Handles retrieval of company and user information from localStorage
 * to avoid hardcoding values like 'C001' or 'SYSTEM'.
 */

export const getSessionData = () => {
    const companyData = localStorage.getItem('selectedCompany');
    const userData = localStorage.getItem('user');
    
    let companyCode = 'COM001'; // Safe default for your specific environment
    let userName = 'SYSTEM';

    if (companyData) {
        try {
            const parsed = JSON.parse(companyData);
            companyCode = parsed.company_Code || parsed.companyCode || parsed.CompanyCode || companyData;
        } catch (e) { companyCode = companyData; }
    }

    if (userData) {
        try {
            const parsed = JSON.parse(userData);
            userName = parsed.emp_Name || parsed.empName || parsed.EmpName || userName;
        } catch (e) { }
    }

    return { companyCode, userName };
};

export const getCompanyCode = () => getSessionData().companyCode;
export const getUserName = () => getSessionData().userName;
