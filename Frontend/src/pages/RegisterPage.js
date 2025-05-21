import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage({ onSuccessfulRegister, onCancel }) {
  const [formData, setFormData] = useState({
    licencia: '',
    nombre: '',
    apellidos: '',
    email: '',
    telefono: '',
    contrasena: '',
    confirmarContrasena: ''
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
    if (formData.contrasena !== formData.confirmarContrasena) {
      setError('Las contraseñas no coinciden');
      return;
    }
    try {
      const resp = await fetch('/api/taxistas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          licencia: formData.licencia,
          nombre: formData.nombre,
          apellidos: formData.apellidos,
          email: formData.email,
          telefono: formData.telefono,
          contrasena: formData.contrasena
        })
      });
      if (!resp.ok) {
        const errorData = await resp.json().catch(() => ({}));
        throw new Error(errorData.message || 'Error al registrar');
      }
      let data = null;
      try {
        data = await resp.json();
      } catch (jsonError) {
        throw new Error('Registro exitoso, pero la respuesta del servidor no es válida.');
      }
      if (data) {
        if (onSuccessfulRegister) onSuccessfulRegister();
      } else {
        throw new Error('Registro exitoso, pero no se recibieron datos de usuario.');
      }
    } catch (err) {
      setError(err.message || 'Ocurrió un error durante el registro.');
    }
  };

  return (
    <div className="min-h-screen bg-background text-text flex flex-col items-center p-0">
      {/* Header visual */}
      <header className="w-full bg-gradient-to-br from-primary/30 to-background/80 py-10 px-4 flex flex-col items-center shadow-lg mb-10 border-b border-border">
        <div className="max-w-2xl w-full flex flex-col items-center gap-2">
          <span className="text-3xl md:text-4xl font-extrabold text-primary drop-shadow-lg">Registro</span>
          <span className="text-text-muted text-lg md:text-xl">Crea tu cuenta de TaxiDay</span>
        </div>
      </header>

      {/* Formulario en tarjeta */}
      <div className="w-full max-w-lg bg-surface/90 backdrop-blur-sm rounded-2xl shadow-2xl p-10 border border-border mt-8 mb-16">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-text text-sm font-medium mb-2">Licencia</label>
              <input type="text" name="licencia" value={formData.licencia} onChange={handleInputChange} className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary text-text placeholder-text-muted text-base" placeholder="Licencia" required />
            </div>
            <div>
              <label className="block text-text text-sm font-medium mb-2">Nombre</label>
              <input type="text" name="nombre" value={formData.nombre} onChange={handleInputChange} className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary text-text placeholder-text-muted text-base" placeholder="Nombre" required />
            </div>
            <div>
              <label className="block text-text text-sm font-medium mb-2">Apellidos</label>
              <input type="text" name="apellidos" value={formData.apellidos} onChange={handleInputChange} className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary text-text placeholder-text-muted text-base" placeholder="Apellidos" required />
            </div>
            <div>
              <label className="block text-text text-sm font-medium mb-2">Email</label>
              <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary text-text placeholder-text-muted text-base" placeholder="Email" required />
            </div>
            <div>
              <label className="block text-text text-sm font-medium mb-2">Teléfono</label>
              <input type="tel" name="telefono" value={formData.telefono} onChange={handleInputChange} className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary text-text placeholder-text-muted text-base" placeholder="Teléfono" required />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-text text-sm font-medium mb-2">Contraseña</label>
              <input type="password" name="contrasena" value={formData.contrasena} onChange={handleInputChange} className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary text-text placeholder-text-muted text-base" placeholder="Contraseña" required />
            </div>
            <div>
              <label className="block text-text text-sm font-medium mb-2">Confirmar contraseña</label>
              <input type="password" name="confirmarContrasena" value={formData.confirmarContrasena} onChange={handleInputChange} className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary text-text placeholder-text-muted text-base" placeholder="Confirmar contraseña" required />
            </div>
          </div>
          {error && (
            <div className="bg-red-800/40 border border-red-700/50 text-red-200 px-4 py-2 rounded-lg text-base text-center">
              {error}
            </div>
          )}
          <div className="flex gap-6 mt-8">
            <button type="submit" className="flex-1 bg-primary hover:bg-primary-dark text-gray-900 font-semibold py-3 rounded-lg transition-colors shadow-md text-lg">
              Registrarse
            </button>
            {onCancel && (
              <button type="button" onClick={onCancel} className="flex-1 bg-surface hover:bg-background text-primary font-semibold py-3 rounded-lg border border-primary transition-colors shadow-md text-lg">
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Footer */}
      <footer className="w-full py-8 mt-auto bg-background border-t border-border text-center text-text-muted text-sm">
        TaxiDay &copy; {new Date().getFullYear()} &mdash; Hecho con ❤️ para taxistas
      </footer>
    </div>
  );
}