import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Home from './pages/Home';
import CarreraPage from './pages/CarreraPage';
import { useAuth } from './context/AuthContext';

// Componente para rutas protegidas
function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/" />;
}

// Componente principal de autenticación
function AuthPage() {
  const [showRegister, setShowRegister] = useState(false);
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/home" />;
  }

  return showRegister ? (
    <RegisterPage 
      onSuccessfulRegister={() => setShowRegister(false)}
      onCancel={() => setShowRegister(false)}
    />
  ) : (
    <LoginPage 
      onSuccessfulLogin={() => {}}
      onRegisterClick={() => setShowRegister(true)}
    />
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen w-full bg-gray-950 text-gray-300">
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
