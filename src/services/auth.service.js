import axios from 'axios';

// Using relative path so Vite proxy handles the connection
const api = axios.create({
  baseURL: '/api', 
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a response interceptor to handle token expiration (401)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      localStorage.removeItem('selectedCompany');
      window.location.href = '/'; // Force redirect to login
    }
    return Promise.reject(error);
  }
);

export const authService = {
  // LOGIN
  async login(empName, password) {
    try {
      // Updated to match DTO LoginRequest: { Emp_Name, Pass_Word }
      // Sending as BODY [FromBody]
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

  // GET COMPANIES BY EMPLOYEE
  async getCompaniesByEmployee(empName) {
    try {
      const token = this.getToken();
      const response = await api.get(`/Company/search/byEmployee`, {
        params: { empName },
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error('Search Companies Error:', error);
      throw error.response?.data || 'Failed to search companies.';
    }
  },

  // OPEN COMPANY
  async openCompany(empName, companyCode) {
    try {
      const token = this.getToken();
      const response = await api.post(`/Company/open`, {
        EmpName: empName,
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
