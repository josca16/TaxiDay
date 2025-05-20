import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Página de inicio de sesión
export default function LoginPage() {
  // Estado para los campos del formulario y mensajes de error
  const [licencia, setLicencia] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [error, setError] = useState('');

  // Hook para la navegación programática
  const navigate = useNavigate();
  // Hook para acceder a las funciones y estado del contexto de autenticación
  const { login } = useAuth();

  // Maneja el envío del formulario de login
  const handleSubmit = async (e) => {
    e.preventDefault(); // Previene la recarga de la página al enviar el formulario
    setError(''); // Limpia errores previos

    console.log('Intentando iniciar sesión con licencia:', licencia); // Log de depuración

    try {
      // Realiza la petición POST al backend para el login
      const resp = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // Envía las credenciales en el cuerpo de la petición como JSON
        body: JSON.stringify({ licencia, contrasena })
      });
      
      // Verifica la respuesta del servidor
      if (resp.status === 200) {
        // Si el login es exitoso (código 200)
        const userData = await resp.json(); // Parsea la respuesta JSON (TaxistaDto)
        login(userData); // Llama a la función login del contexto para guardar el usuario
        console.log('Login exitoso', userData); // Log de depuración
        navigate('/home'); // Redirige a la página de inicio
      } else {
        // Si el login falla (otro código de estado)
        const errorData = await resp.json(); // Intenta parsear el mensaje de error del backend
        setError(errorData.message || 'Credenciales inválidas'); // Muestra el error recibido o un mensaje genérico
        console.error('Login fallido', resp.status, errorData); // Log de error
      }
    } catch (err) {
      // Captura errores de red u otros errores durante la petición
      setError('Error al conectar con el servidor');
      console.error('Error en la petición de login:', err); // Log del error
    }
  };

  return (
    // Estructura Jsx de la página de login
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-center mb-4">Iniciar sesión en TaxiDay</h2>
      {/* Formulario de login */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col">
          <input
            type="text"
            placeholder="Licencia"
            value={licencia}
            onChange={e => setLicencia(e.target.value)}
            required
            className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:border-blue-500"
          />
        </div>
        <div className="flex flex-col">
          <input
            type="password"
            placeholder="Contraseña"
            value={contrasena}
            onChange={e => setContrasena(e.target.value)}
            required
            className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:border-blue-500"
          />
        </div>
        {/* Botón de envío del formulario */}
        <button type="submit" className="bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring focus:border-blue-300">
          Entrar
        </button>
        {/* Muestra el mensaje de error si existe */}
        {error && <p className="text-red-500 text-center mt-2">{error}</p>}
      </form>
      {/* Enlace a la página de registro */}
      <p className="text-center mt-4">
        ¿No tienes cuenta? <Link to="/register">Regístrate aquí</Link>
      </p>
    </div>
  );
}