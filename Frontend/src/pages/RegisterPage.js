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
            <div>
          <h2 className="text-2xl font-bold text-primary mb-6 text-center">            Crear una cuenta          </h2>

      {error && (
        <div className="bg-red-800/40 border border-red-700/50 text-red-200 px-4 py-3 rounded-lg text-sm mb-6 animate-fade-in">
          {error}
        </div>
)}

        <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
<div>
              <label className="block text-text text-sm font-medium mb-2">Licencia</label>
              <input
                                type="text"
                name="licencia" 
                value={formData.licencia}
                onChange={handleInputChange}
className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary text-text placeholder-text-muted" 
              placeholder="Licencia"
              required 
              />
            </div>
            <div>
              <label className="block text-text text-sm font-medium mb-2">Nombre</label>
              <input
                                type="text"
                name="nombre" 
                value={formData.nombre}
                onChange={handleInputChange}
className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary text-text placeholder-text-muted" 
              placeholder="Nombre"
              required 
              />
</div>
              </div>

            <div>
              <label className="block text-text text-sm font-medium mb-2">Apellidos</label>
              <input
                                type="text"
                name="apellidos" 
                value={formData.apellidos}
                onChange={handleInputChange}
className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary text-text placeholder-text-muted" 
            placeholder="Apellidos"
            required 
              />
              </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
<div>
              <label className="block text-text text-sm font-medium mb-2">Email</label>
              <input
                                type="email"
                name="email" 
                value={formData.email}
                onChange={handleInputChange}
className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary text-text placeholder-text-muted" 
              placeholder="email@ejemplo.com"
              required 
              />
              </div>
            <div>
              <label className="block text-text text-sm font-medium mb-2">Teléfono</label>
              <input
                                type="tel"
                name="telefono" 
                value={formData.telefono}
                onChange={handleInputChange}
className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary text-text placeholder-text-muted" 
              placeholder="Teléfono"
              required 
              />
</div>
              </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
<div>
              <label className="block text-text text-sm font-medium mb-2">Contraseña</label>
              <input
                                type="password"
                name="contrasena"
                value={formData.contrasena}
                onChange={handleInputChange}
className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary text-text placeholder-text-muted" 
              placeholder="Contraseña"
              required 
              />
              </div>
            <div>
              <label className="block text-text text-sm font-medium mb-2">Confirmar contraseña</label>
              <input
                                type="password"
                name="confirmarContrasena"
                value={formData.confirmarContrasena}
                onChange={handleInputChange}
className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary text-text placeholder-text-muted" 
              placeholder="Confirmar contraseña"
              required 
              />
            </div>
          </div>

            <div className="pt-2">
            <button
              type="submit"
              className="w-full bg-primary hover:bg-primary-dark text-gray-900 font-semibold py-2.5 rounded-lg transition-colors shadow-md"
            >
              Crear cuenta
            </button>
          </div>
        
        <div className="text-center text-text-muted text-sm pt-3">
<p>            ¿Ya tienes una cuenta? <button onClick={onCancel} className="text-primary hover:text-primary-light font-medium">Iniciar sesión</button></p>
        </div>
        
        <div className="text-xs text-text-muted pt-3 text-center">
          <p>
            Al registrarte, aceptas nuestros <a href="#" className="text-primary hover:text-primary-light underline">Términos de servicio</a> y 
            <a href="#" className="text-primary hover:text-primary-light underline"> Política de privacidad</a>
          </p>
        </div>
      </form>
    </div>
  );
}