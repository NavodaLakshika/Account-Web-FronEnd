import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'react-hot-toast';
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


import SuperAdminDashboard from './pages/SuperAdminDashboard';

import BIDashboardPage from './pages/BIDashboardPage';
import GlobalLoader from './components/GlobalLoader';

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
            {/* AuthPage handles login only */}
            <Route path="/login" element={<AuthPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/bi-dashboard" element={<BIDashboardPage />} />
            <Route path="/super-admin" element={<SuperAdminDashboard />} />

            <Route path="/report/items-services" element={<ItemsServicesReportPage />} />
            <Route path="/report/products" element={<ProductsReportPage />} />
            <Route path="/report/system-analytics" element={<SystemAnalyticsReportPage />} />
            <Route path="/report/bill-payments" element={<ReportBillPayments />} />
            <Route path="/report/sales-orders" element={<ReportSalesOrders />} />
            <Route path="/report/cheque-register" element={<ChequeRegisterReport />} />
            <Route path="/report/general-ledger" element={<GeneralLedgerReport />} />

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
