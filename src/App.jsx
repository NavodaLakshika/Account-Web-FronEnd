import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import AuthPage from './pages/AuthPage';
import SelectCompanyPage from './pages/SelectCompanyPage';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <Router>
      <div className="App selection:bg-blue-100 selection:text-blue-600">
        <Toaster 
            position="top-right"
            toastOptions={{
                className: 'font-["Outfit"] shadow-xl border-none p-4 rounded-2xl',
                duration: 4000,
                style: {
                    background: '#ffffff',
                    color: '#1e293b',
                }
            }}
        />
        <Routes>
          {/* AuthPage handles login only */}
          <Route path="/login" element={<AuthPage />} />
          <Route path="/select-company" element={<SelectCompanyPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          
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
