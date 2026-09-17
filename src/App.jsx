import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'react-hot-toast';
import { authService } from './services/auth.service';
import { desktopNotificationService } from './services/desktopNotification.service';
import { enterBillService } from './services/enterBill.service';
import { getSessionData } from './utils/session';

import AuthPage from './pages/AuthPage';
import RegisterPage from './pages/RegisterPage';
import LegalTermsPage from './pages/LegalTermsPage';
import PrivacyPage from './pages/PrivacyPage';
import SecurityPage from './pages/SecurityPage';
import SLAPage from './pages/SLAPage';
import SupportPage from './pages/SupportPage';
import Dashboard from './pages/Dashboard';
import ItemsServicesReportPage from './pages/ItemsServicesReportPage';
import ProductsReportPage from './pages/ProductsReportPage';
import SystemAnalyticsReportPage from './pages/SystemAnalyticsReportPage';
import ReportBillPayments from './pages/ReportBillPayments';
import ReportSalesOrders from './pages/ReportSalesOrders';
import ChequeRegisterReport from './pages/ChequeRegisterReport';
import GeneralLedgerReport from './pages/GeneralLedgerReport';
import ReportViewerPage from './pages/ReportViewerPage';
import BoardViewerPage from './pages/BoardViewerPage';

import SuperAdminDashboard from './pages/SuperAdminDashboard';

import BIDashboardPage from './pages/BIDashboardPage';
import GlobalLoader from './components/GlobalLoader';

const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  if (false) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
};

function App() {
  useEffect(() => {
    // Request permission & listen for network connection to trigger desktop alerts for unpaid bills
    desktopNotificationService.initNetworkDesktopNotifier(async () => {
      const { companyCode } = getSessionData();
      if (!companyCode) return [];
      try {
        const bills = await enterBillService.searchBills('', companyCode);
        return bills || [];
      } catch (err) {
        return [];
      }
    });
  }, []);

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
            <Route path="/legal" element={<LegalTermsPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/security" element={<SecurityPage />} />
            <Route path="/sla" element={<SLAPage />} />
            <Route path="/support" element={<SupportPage />} />

            {/* Protected Routes */}
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/bi-dashboard" element={<ProtectedRoute><BIDashboardPage /></ProtectedRoute>} />
            <Route path="/super-admin" element={<ProtectedRoute><SuperAdminDashboard /></ProtectedRoute>} />
            <Route path="/report-viewer" element={<ProtectedRoute><ReportViewerPage /></ProtectedRoute>} />
            <Route path="/board" element={<ProtectedRoute><BoardViewerPage /></ProtectedRoute>} />

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
