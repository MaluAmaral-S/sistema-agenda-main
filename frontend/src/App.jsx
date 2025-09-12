import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import LoadingSpinner from './components/common/LoadingSpinner';

// Páginas
import Home from './pages/Home';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Services from './pages/Services';
import BusinessHours from './pages/BusinessHours';
import Plans from './pages/Plans';
import Booking from './pages/Booking';
import AppointmentsDemo from './pages/AppointmentsDemo';
import ForgotPassword from './pages/ForgotPassword';
import AccountManagement from './pages/AccountManagement';



import './App.css';

function App() {
  console.log("App.jsx carregado!");
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            {/* Rotas públicas */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/recuperar-senha" element={<ForgotPassword />} />
            <Route path="/planos" element={<Plans />} />
            <Route path="/demo" element={<AppointmentsDemo />} />
            {/* A rota mais específica (:businessSlug) deve vir antes da genérica. */}
            <Route path="/agendamento/:businessSlug" element={<Booking />} />
            <Route path="/agendamento" element={<Booking />} />
            
            {/* Rotas protegidas */}
            <Route path="/painel" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            
            <Route path="/servicos" element={
              <ProtectedRoute>
                <Services />
              </ProtectedRoute>
            } />
            
            <Route path="/horarios" element={
              <ProtectedRoute>
                <BusinessHours />
              </ProtectedRoute>
            } />

            <Route path="/conta" element={
              <ProtectedRoute>
                <AccountManagement />
              </ProtectedRoute>
            } />
            
            {/* Redirecionamento para compatibilidade */}
            <Route path="/painel.html" element={<Navigate to="/painel" replace />} />
            <Route path="/login.html" element={<Navigate to="/login" replace />} />
            <Route path="/planos.html" element={<Navigate to="/planos" replace />} />
            
            {/* Rota 404 */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
