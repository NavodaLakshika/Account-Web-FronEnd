import axios from 'axios';

// Using relative path so Vite proxy handles the connection
const api = axios.create({
  baseURL: '/api', 
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
      const isLoginRequest = error.config?.url?.includes('/Auth/login');
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
        localStorage.setItem('user', JSON.stringify(response.data));
        localStorage.setItem('token', token);
      }
      return response.data;
    } catch (error) {
      console.error('Login Error:', error);
      throw error.response?.data || 'Login failed. Please check your credentials.';
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

  // SEND OTP VIA AIRTEL SMS GATEWAY (frontend direct call via Vite proxy)
  async sendSmsOtp(phoneNumber) {
    // Generate a secure 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Normalize phone: remove spaces, dashes, leading +94 or 0, keep digits only
    let dst = phoneNumber.replace(/[\s\-\(\)]/g, '');
    if (dst.startsWith('+')) dst = dst.slice(1); // remove leading +
    // Sri Lanka: if starts with 94, keep; if starts with 0, replace with 94
    if (dst.startsWith('0')) dst = '94' + dst.slice(1);

    const message = encodeURIComponent(`Your ONIMTA verification code is: ${otp}. Valid for 5 minutes. Do not share this code.`);
    const url = `/sms/send_sms.php?username=onimta&password=gUY2eBbvpr&src=ONIMTA&dst=${dst}&msg=${message}&dr=1`;

    try {
      const res = await fetch(url);
      const text = await res.text();
      console.log('SMS Gateway response:', text);
      // Most SMS gateways return a success code/message; we trust the send succeeded
      return otp; // Return the OTP so caller can verify locally
    } catch (error) {
      console.error('SMS Gateway Error:', error);
      throw 'Failed to send OTP. Please check your phone number and try again.';
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

  // LOGOUT
  logout() {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
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
  }
};
