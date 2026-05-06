import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { DashboardLayout } from './layouts/DashboardLayout';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { StudentDashboard } from './pages/StudentDashboard';
import { TeacherDashboard } from './pages/TeacherDashboard';
import { DocumentHub } from './pages/DocumentHub';
import { CertificateUpload } from './pages/CertificateUpload';
import { VerifyCertificate } from './pages/VerifyCertificate';

const DashboardRouter: React.FC = () => {
  const { user } = useAuth();
  if (user?.role === 'teacher') return <TeacherDashboard />;
  return <StudentDashboard />;
};

export default function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected routes inside DashboardLayout */}
      <Route path="/" element={
        <ProtectedRoute>
          <DashboardLayout />
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardRouter />} />
        <Route path="documents" element={<DocumentHub />} />
        <Route path="upload" element={<CertificateUpload />} />
        <Route path="verify" element={<VerifyCertificate />} />
        <Route path="review" element={<TeacherDashboard />} />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
