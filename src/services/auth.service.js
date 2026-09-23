import axios from 'axios';

// Using relative path so Vite proxy handles the connection
const api = axios.create({
  baseURL: import.meta.env.PROD ? (import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : 'http://194.233.76.58:8282/api') : '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a response interceptor to handle token expiration (401) and Trigger Global Refreshes
api.interceptors.response.use(
  (response) => {
    // Intercept mutations to auto-refresh reports globally
    const method = response.config?.method?.toLowerCase();
    if (['post', 'put', 'delete', 'patch'].includes(method)) {
      window.dispatchEvent(new Event('reportDataChanged'));
    }
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Only redirect to login if this was NOT the login request itself
      const isLoginRequest = error.config?.url?.includes('/Auth/login') || error.config?.url?.includes('/Auth/verify-2fa-login');
      if (!isLoginRequest) {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        localStorage.removeItem('selectedCompany');
        window.location.href = '/'; // Force redirect to login
      }
    }
    return Promise.reject(error);
  }
);

export const authService = {
  // LOGIN
  async login(empName, password) {
    try {
      // Clear any stale session data before logging in
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      localStorage.removeItem('selectedCompany');

      const response = await api.post(`/Auth/login`, {
        Emp_Name: empName,
        Pass_Word: password
      });

      if (response.data && (response.data.token || response.data.Token)) {
        const token = response.data.token || response.data.Token;
        response.data._typedUsername = empName;
        localStorage.setItem('user', JSON.stringify(response.data));
        localStorage.setItem('token', token);
      }
      return response.data;
    } catch (error) {
      console.error('Login Error:', error);
      throw error.response?.data || 'Login failed. Please check your credentials.';
    }
  },

  // VERIFY 2FA LOGIN
  async verify2FALogin(empCode, tempToken, code) {
    try {
      const response = await api.post('/Auth/verify-2fa-login', {
        EmpCode: empCode,
        TempToken: tempToken,
        Code: code
      });
      if (response.data && (response.data.token || response.data.Token)) {
        const token = response.data.token || response.data.Token;
        response.data._typedUsername = empName;
        localStorage.setItem('user', JSON.stringify(response.data));
        localStorage.setItem('token', token);
      }
      return response.data;
    } catch (error) {
      console.error('Verify 2FA Login Error:', error);
      throw error.response?.data || 'Invalid 2FA code.';
    }
  },

  // REGISTER
  async register(registerData) {
    try {
      // Matches RegisterRequest DTO: { Emp_Name, Email, Pass_Word, Conpass_Word, Phone_Number }
      const response = await api.post('/Auth/register', registerData);
      return response.data;
    } catch (error) {
      console.error('Registration Error:', error);
      throw error.response?.data || 'Registration failed. Please try again.';
    }
  },

  // CHECK EMAIL EXISTS
  async checkEmailExists(email) {
    const response = await api.get(`/Auth/check-email`, {
      params: { email }
    });
    return response.data;
  },

  // SEND OTP FOR REGISTRATION
  async sendOtpForRegistration(phoneNumber) {
    try {
      const response = await api.post('/Auth/send-otp', { PhoneNumber: phoneNumber });
      return response.data;
    } catch (error) {
      console.error('Send OTP Error:', error);
      throw error.response?.data || 'Failed to send OTP. Please try again.';
    }
  },

  // VERIFY OTP FOR REGISTRATION
  async verifyOtpForRegistration(phoneNumber, otpCode) {
    try {
      const response = await api.post('/Auth/verify-otp', { PhoneNumber: phoneNumber, OtpCode: otpCode });
      return response.data;
    } catch (error) {
      console.error('Verify OTP Error:', error);
      throw error.response?.data || 'Invalid OTP. Please try again.';
    }
  },

  // SEND OTP VIA BACKEND SMS GATEWAY SERVICE
  async sendSmsOtp(phoneNumber, type = 'register') {
    try {
      const response = await api.post('/Auth/send-sms-otp', {
        PhoneNumber: phoneNumber,
        Type: type
      });
      if (response.data && response.data.otp) {
        return response.data.otp;
      }
      throw new Error(response.data?.message || 'Failed to send OTP.');
    } catch (error) {
      console.error('Send SMS OTP Error:', error);
      throw error.response?.data?.message || error.message || 'Failed to send OTP. Please check your phone number and try again.';
    }
  },

  // FORGOT PASSWORD
  async forgotPassword(usernameOrEmail) {
    try {
      const response = await api.post('/Auth/forgot-password', {
        UsernameOrEmail: usernameOrEmail
      });
      return response.data;
    } catch (error) {
      console.error('Forgot Password Error:', error);
      throw error.response?.data || 'Failed to process request.';
    }
  },

  // RESET PASSWORD
  async resetPassword(token, newPassword) {
    try {
      const response = await api.post('/Auth/reset-password', {
        Token: token,
        NewPassword: newPassword
      });
      return response.data;
    } catch (error) {
      console.error('Reset Password Error:', error);
      throw error.response?.data || 'Failed to reset password.';
    }
  },

  // RESET PASSWORD DIRECT (SMS)
  async resetPasswordDirect(empCode, newPassword) {
    try {
      const response = await api.post('/Auth/reset-password-direct', {
        EmpCode: empCode,
        NewPassword: newPassword
      });
      return response.data;
    } catch (error) {
      console.error('Reset Password Direct Error:', error);
      throw error.response?.data || 'Failed to reset password.';
    }
  },

  // LOGOUT
  logout() {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('selectedCompany');
    localStorage.removeItem('company');
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('selectedCompany');
    sessionStorage.clear();
  },

  // GET ALL COMPANIES
  async getAllCompanies() {
    try {
      const token = this.getToken();
      const response = await api.get(`/Company/all`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error('Get All Companies Error:', error);
      throw error.response?.data || 'Failed to fetch companies.';
    }
  },

  // GET COMPANIES BY EMPLOYEE CODE
  async getCompaniesByEmployee(empCode) {
    try {
      const token = this.getToken();
      const response = await api.get(`/Company/search/byEmployee`, {
        params: { empCode },
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error('Search Companies Error:', error);
      throw error.response?.data || 'Failed to search companies.';
    }
  },

  // OPEN COMPANY
  async openCompany(empCode, companyCode) {
    try {
      const token = this.getToken();
      const response = await api.post(`/Company/open`, {
        EmpCode: empCode,
        CompanyCode: companyCode
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data) {
        localStorage.setItem('selectedCompany', JSON.stringify(response.data));
      }
      return response.data;
    } catch (error) {
      console.error('Open Company Error:', error);
      throw error.response?.data || 'Failed to open company.';
    }
  },

  // CREATE COMPANY
  async createCompany(companyData) {
    try {
      const token = this.getToken();
      const response = await api.post(`/Company/create`, companyData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error('Create Company Error:', error);
      throw error.response?.data || 'Failed to create company.';
    }
  },

  // EDIT COMPANY
  async editCompany(companyData) {
    try {
      const token = this.getToken();
      const response = await api.put(`/Company/edit`, companyData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error('Edit Company Error:', error);
      throw error.response?.data || 'Failed to update company.';
    }
  },

  // DELETE COMPANY
  async deleteCompany(code) {
    try {
      const token = this.getToken();
      const response = await api.delete(`/Company/delete/${code}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error('Delete Company Error:', error);
      throw error.response?.data || 'Failed to delete company.';
    }
  },

  // GET COMPANY DETAILS
  async getCompanyDetails(code) {
    try {
      const token = this.getToken();
      const response = await api.get(`/Company/details/${code}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error('Get Company Details Error:', error);
      throw error.response?.data || 'Failed to fetch company details.';
    }
  },

  // GET ALL COUNTRIES
  async getAllCountries() {
    try {
      const token = this.getToken();
      const response = await api.get(`/Country/all`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error('Get Countries Error:', error);
      throw error.response?.data || 'Failed to fetch countries.';
    }
  },

  // GET ALL INDUSTRIES
  async getAllIndustries() {
    try {
      const token = this.getToken();
      const response = await api.get(`/Industry/all`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error('Get Industries Error:', error);
      throw error.response?.data || 'Failed to fetch industries.';
    }
  },

  // GET TOKEN
  getToken() {
    return localStorage.getItem('token');
  },

  // GET CURRENT USER
  getCurrentUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  // CHECK IF JWT TOKEN IS EXPIRED
  isTokenExpired(token = this.getToken()) {
    if (!token) return true;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload && payload.exp) {
        return payload.exp * 1000 < Date.now();
      }
    } catch {
      // Not a valid JWT payload - treat as not expired so it can be validated by the server
    }
    return false;
  },

  // CHECK IF USER HAS A VALID SESSION (user saved AND a valid non-expired token)
  isSuperAdmin(user) {
    if (!user) return false;

    // Create a lowercase keyed object to avoid any casing issues from the backend
    const lowerKeys = {};
    for (const key in user) {
      lowerKeys[key.toLowerCase()] = user[key];
    }

    // 1. Exact Name/Email Check (Based on your DB: 'onimtait@gmail.com' or 'ONIMTA')
    const typedIdentifier = String(user._typedUsername || lowerKeys.email || lowerKeys.emp_name || '').trim().toLowerCase();
    const exactAdminIdentifiers = ['onimtait@gmail.com', 'onimta', 'admin@onimta.com', 'superadmin@onimta.com', 'admin'];
    if (exactAdminIdentifiers.includes(typedIdentifier)) return true;

    // 2. Role explicit
    const roleStr = String(lowerKeys.role || lowerKeys.usertype || lowerKeys.userrole || lowerKeys.accounttype || lowerKeys.roal || lowerKeys.emp_role || '').trim().toLowerCase();
    const adminRoles = ['systemadmin', 'superadmin', 'admin', 'super_admin', 'system_admin', 'super admin', 'system admin'];
    if (adminRoles.includes(roleStr)) return true;

    // 3. UserRole_Id explicit
    const userRoleId = String(lowerKeys.userrole_id || lowerKeys.userroleid || lowerKeys.role_id || '').trim();
    if (userRoleId === '99') return true;

    // 4. Emp Code / ID explicit
    const empCodeStr = String(lowerKeys.emp_code || lowerKeys.empcode || '').trim().toUpperCase();
    if (empCodeStr === '0' || empCodeStr === 'ADMIN_0' || empCodeStr === 'SUPER_ADMIN') return true;

    // 5. Account/Admin Flags
    if (lowerKeys.isadmin === true || lowerKeys.issuperadmin === true) return true;

    return false;
  },
  isAuthenticated() {
    if (!localStorage.getItem('user')) return false;
    if (this.isTokenExpired()) return false;
    return true;
  }
};



