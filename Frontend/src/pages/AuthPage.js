import React, { useState } from 'react';
import LoginPage from './LoginPage';
import RegisterPage from './RegisterPage';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

const AuthPage = () => {
  const { isAuthenticated } = useAuth();
  const [showRegister, setShowRegister] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/home" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/10 flex flex-col">
      {/* Header con navegación */}
      <header className="w-full bg-surface/60 backdrop-blur-sm border-b border-border shadow-md">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="bg-primary p-2 rounded-lg shadow">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-primary">TaxiDay</h1>
          </div>
          <div>
            <button 
              onClick={() => setShowRegister(!showRegister)} 
              className="text-primary hover:text-primary-light transition-colors"
            >
              {showRegister ? 'Iniciar sesión' : 'Crear cuenta'}
            </button>
          </div>
        </div>
      </header>

      {/* Contenido principal */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="container mx-auto flex flex-col lg:flex-row items-center justify-between gap-10 max-w-6xl">
          {/* Lado izquierdo - Información del producto */}
          <div className="lg:w-1/2 text-center lg:text-left">
            <h2 className="text-4xl font-bold text-primary mb-4">Bienvenido a TaxiDay</h2>
            <p className="text-xl text-text-muted mb-6">La plataforma que simplifica la gestión diaria de tu trabajo como taxista</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-surface/60 backdrop-blur-sm p-4 rounded-lg border border-border shadow-md">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-lg font-semibold mb-1">Control Total</h3>
                <p className="text-text-muted text-sm">Administra tus jornadas y carreras fácilmente</p>
              </div>
              
              <div className="bg-surface/60 backdrop-blur-sm p-4 rounded-lg border border-border shadow-md">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <h3 className="text-lg font-semibold mb-1">Estadísticas Detalladas</h3>
                <p className="text-text-muted text-sm">Visualiza tu rendimiento diario y mensual</p>
              </div>
            </div>
          </div>
          
          {/* Lado derecho - Formulario de autenticación */}
          <div className="lg:w-1/2 w-full max-w-md">
            <div className="bg-surface/70 backdrop-blur-sm rounded-xl shadow-xl border border-border p-8">
        {showRegister ? (
          <RegisterPage 
            onSuccessfulRegister={() => setShowRegister(false)}
            onCancel={() => setShowRegister(false)}
          />
        ) : (
          <LoginPage 
            onSuccessfulLogin={() => {}}
            onRegisterClick={() => setShowRegister(true)}
          />
        )}
      </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full py-4 bg-surface/60 backdrop-blur-sm border-t border-border">
        <div className="container mx-auto px-6 text-center">
          <p className="text-text-muted text-sm">© {new Date().getFullYear()} TaxiDay | Todos los derechos reservados</p>
        </div>
      </footer>
    </div>
  );
};

export default AuthPage; 