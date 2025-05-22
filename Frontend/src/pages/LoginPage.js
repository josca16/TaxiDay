import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Página de inicio de sesión
export default function LoginPage({ onSuccessfulLogin, onRegisterClick }) {
  const [formData, setFormData] = useState({
    licencia: '',
    contrasena: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
    const resp = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
    });
      if (!resp.ok) {
        const errorData = await resp.json().catch(() => ({}));
        throw new Error(errorData.message || 'Error al iniciar sesión');
      }
      const data = await resp.json();
      login(data);
      if (onSuccessfulLogin) onSuccessfulLogin();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-primary mb-6 text-center">Iniciar sesión</h2>
      
      {error && (
        <div className="bg-red-800/40 border border-red-700/50 text-red-200 px-4 py-3 rounded-lg text-sm mb-6 animate-fade-in">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-text text-sm font-medium mb-2">Licencia</label>
          <input
            type="text"
            name="licencia"
            value={formData.licencia}
            onChange={handleInputChange}
            className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary text-text placeholder-text-muted"
            placeholder="Introduce tu licencia"
            required
          />
        </div>
        <div>
          <label className="block text-text text-sm font-medium mb-2">Contraseña</label>
          <input
            type="password"
            name="contrasena"
            value={formData.contrasena}
            onChange={handleInputChange}
            className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary text-text placeholder-text-muted"
            placeholder="Introduce tu contraseña"
            required
          />
          <div className="flex justify-end mt-1">
            <a href="#" className="text-sm text-primary hover:text-primary-light">¿Olvidaste la contraseña?</a>
          </div>
        </div>
        
        <div className="pt-2">
          <button 
            type="submit" 
            className="w-full bg-primary hover:bg-primary-dark text-gray-900 font-semibold py-2.5 rounded-lg transition-colors shadow-md"
          >
            Iniciar sesión
          </button>
        </div>
        
        <div className="relative py-3">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border"></div>
          </div>
          <div className="relative flex justify-center">
            <span className="bg-surface px-4 text-xs text-text-muted">o continuar con</span>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            className="flex items-center justify-center bg-background hover:bg-gray-700 text-text py-2 px-4 rounded-lg border border-border"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Google
          </button>
          <button
            type="button"
            className="flex items-center justify-center bg-background hover:bg-gray-700 text-text py-2 px-4 rounded-lg border border-border"
          >
            <svg className="w-5 h-5 mr-2 text-primary" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 0C4.477 0 0 4.477 0 10c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V19c0 .27.16.59.67.5C17.14 18.16 20 14.42 20 10A10 10 0 0010 0z"/>
            </svg>
            GitHub
          </button>
        </div>
        
        <div className="text-center text-text-muted text-sm">
          <p>¿No tienes cuenta? <button onClick={onRegisterClick} className="text-primary hover:text-primary-light font-medium">Registrarse</button></p>
        </div>
      </form>
    </div>
  );
}