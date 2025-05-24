import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Home from './pages/Home';
import CarreraPage from './pages/CarreraPage';
import { useAuth } from './context/AuthContext';
import AuthPage from './pages/AuthPage';
import './App.css';

// Componente para rutas protegidas
function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/" />;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen w-full bg-background text-text font-sans selection:bg-primary/30 selection:text-white">
          <div className="fixed inset-0 bg-grid-pattern opacity-[0.02] pointer-events-none"></div>
      <Routes>
            <Route path="/" element={<AuthPage />} />
          <Route 
            path="/home" 
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            } 
          />
          <Route 
              path="/jornada/:jornadaId/turno/:turnoId/carrera" 
            element={
              <ProtectedRoute>
                  <CarreraPage />
              </ProtectedRoute>
            }
          />
      </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
