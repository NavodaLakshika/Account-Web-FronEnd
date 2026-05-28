import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: Attach Token and Company Code
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    const companyStr = localStorage.getItem('selectedCompany');
    if (companyStr) {
      let companyCode = '';
      try {
        const companyObj = JSON.parse(companyStr);
        companyCode = companyObj.companyCode || companyObj.CompanyCode || companyObj.code || companyObj.Code || companyStr;
      } catch (e) {
        companyCode = companyStr;
      }
      if (companyCode) {
        config.headers['x-company-code'] = companyCode;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: Handle 401 Unauthorized
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Skip redirect if this was the login request itself
      const isLoginRequest = error.config?.url?.includes('/Auth/login');
      if (!isLoginRequest) {
        console.warn('Session expired. Redirecting to login...');
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        localStorage.removeItem('selectedCompany');
        window.location.href = '/'; // Force redirect to login
      }
    }
    return Promise.reject(error);
  }
);

export default api;
