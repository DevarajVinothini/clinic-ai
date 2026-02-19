import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './components/Toast';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Register from './pages/Register';
import PatientDashboard from './pages/PatientDashboard';
import StaffDashboard from './pages/StaffDashboard';
import Appointments from './pages/Appointments';
import Chat from './pages/Chat';
import Medications from './pages/Medications';
import Reminders from './pages/Reminders';
import Patients from './pages/Patients';
import RiskAnalytics from './pages/RiskAnalytics';
import './index.css';

function ProtectedLayout({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-screen"><div className="spinner" style={{ width: 36, height: 36 }}></div><span>Loading...</span></div>;
  if (!user) return <Navigate to="/login" />;
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">{children}</div>
    </div>
  );
}

function StaffRoute({ children }) {
  const { user } = useAuth();
  if (user?.role === 'patient') return <Navigate to="/dashboard" />;
  return children;
}

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Patient routes */}
            <Route path="/dashboard" element={<ProtectedLayout><PatientDashboard /></ProtectedLayout>} />
            <Route path="/appointments" element={<ProtectedLayout><Appointments /></ProtectedLayout>} />
            <Route path="/medications" element={<ProtectedLayout><Medications /></ProtectedLayout>} />
            <Route path="/reminders" element={<ProtectedLayout><Reminders /></ProtectedLayout>} />
            <Route path="/chat" element={<ProtectedLayout><Chat /></ProtectedLayout>} />

            {/* Staff routes */}
            <Route path="/staff" element={<ProtectedLayout><StaffRoute><StaffDashboard /></StaffRoute></ProtectedLayout>} />
            <Route path="/staff/appointments" element={<ProtectedLayout><StaffRoute><Appointments /></StaffRoute></ProtectedLayout>} />
            <Route path="/staff/patients" element={<ProtectedLayout><StaffRoute><Patients /></StaffRoute></ProtectedLayout>} />
            <Route path="/staff/risk" element={<ProtectedLayout><StaffRoute><RiskAnalytics /></StaffRoute></ProtectedLayout>} />

            <Route path="/" element={<Navigate to="/login" />} />
            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
