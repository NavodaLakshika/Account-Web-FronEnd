import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import ItemsServicesReportPage from './pages/ItemsServicesReportPage';

function App() {
  return (
    <Router>
      <div className="App selection:bg-blue-100 selection:text-blue-600">
        <Toaster 
            position="top-right"
            toastOptions={{
                className: 'font-["Plus_Jakarta_Sans"] shadow-2xl border border-gray-100 rounded-xl text-sm font-bold',
                duration: 4000,
                style: {
                    background: '#ffffff',
                    color: '#1e293b',
                    borderRadius: '12px',
                    padding: '16px 24px',
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                },
                success: {
                    iconTheme: {
                        primary: '#10b981',
                        secondary: '#ffffff',
                    },
                },
                error: {
                    iconTheme: {
                        primary: '#d13438',
                        secondary: '#ffffff',
                    },
                }
            }}
        />
        <Routes>
          {/* AuthPage handles login only */}
          <Route path="/login" element={<AuthPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/report/items-services" element={<ItemsServicesReportPage />} />
          
          {/* Default Route */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
