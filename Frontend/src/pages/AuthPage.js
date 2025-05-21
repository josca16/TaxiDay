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
    <div className="min-h-screen bg-background text-text flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-surface rounded-2xl shadow-lg border border-border p-8">
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
  );
};

export default AuthPage; 