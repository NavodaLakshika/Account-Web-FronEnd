import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'react-hot-toast';
import { authService } from './services/auth.service';

import AuthPage from './pages/AuthPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/Dashboard';
import ItemsServicesReportPage from './pages/ItemsServicesReportPage';
import ProductsReportPage from './pages/ProductsReportPage';
import SystemAnalyticsReportPage from './pages/SystemAnalyticsReportPage';
import ReportBillPayments from './pages/ReportBillPayments';
import ReportSalesOrders from './pages/ReportSalesOrders';
import ChequeRegisterReport from './pages/ChequeRegisterReport';
import GeneralLedgerReport from './pages/GeneralLedgerReport';
import ReportViewerPage from './pages/ReportViewerPage';

import SuperAdminDashboard from './pages/SuperAdminDashboard';

import BIDashboardPage from './pages/BIDashboardPage';
import GlobalLoader from './components/GlobalLoader';

const ProtectedRoute = ({ children }) => {
  const user = authService.getCurrentUser();
  const location = useLocation();
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
};

function App() {
  return (
    <HelmetProvider>
      <Router>
        <GlobalLoader />
        <div className="App selection:bg-blue-100 selection:text-blue-600">
          <Toaster 
              position="top-right"
              toastOptions={{
                  duration: 4000
              }}
          />
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<AuthPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Protected Routes */}
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/bi-dashboard" element={<ProtectedRoute><BIDashboardPage /></ProtectedRoute>} />
            <Route path="/super-admin" element={<ProtectedRoute><SuperAdminDashboard /></ProtectedRoute>} />
            <Route path="/report-viewer" element={<ProtectedRoute><ReportViewerPage /></ProtectedRoute>} />

            <Route path="/report/items-services" element={<ProtectedRoute><ItemsServicesReportPage /></ProtectedRoute>} />
            <Route path="/report/products" element={<ProtectedRoute><ProductsReportPage /></ProtectedRoute>} />
            <Route path="/report/system-analytics" element={<ProtectedRoute><SystemAnalyticsReportPage /></ProtectedRoute>} />
            <Route path="/report/bill-payments" element={<ProtectedRoute><ReportBillPayments /></ProtectedRoute>} />
            <Route path="/report/sales-orders" element={<ProtectedRoute><ReportSalesOrders /></ProtectedRoute>} />
            <Route path="/report/cheque-register" element={<ProtectedRoute><ChequeRegisterReport /></ProtectedRoute>} />
            <Route path="/report/general-ledger" element={<ProtectedRoute><GeneralLedgerReport /></ProtectedRoute>} />

            {/* Default Route */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            
            {/* Fallback */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </div>
      </Router>
    </HelmetProvider>
  );
}

export default App;
