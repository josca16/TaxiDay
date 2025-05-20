import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function RegisterPage() {
  const [form, setForm] = useState({
    nombre: '',
    apellidos: '',
    licencia: '',
    contrasena: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    try {
      await axios.post('/api/taxistas', form);
      alert('Usuario creado correctamente. Ahora puedes iniciar sesión.');
      navigate('/');
    } catch (err) {
      setError('Error al crear usuario. ¿Licencia ya existente?');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h2>Registro de Taxista</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="text"
          name="nombre"
          placeholder="Nombre"
          value={form.nombre}
          onChange={handleChange}
          required
          className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:border-blue-500"
        />
        <input
          type="text"
          name="apellidos"
          placeholder="Apellidos"
          value={form.apellidos}
          onChange={handleChange}
          required
          className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:border-blue-500"
        />
        <input
          type="text"
          name="licencia"
          placeholder="Licencia"
          value={form.licencia}
          onChange={handleChange}
          required
          className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:border-blue-500"
        />
        <input
          type="password"
          name="contrasena"
          placeholder="Contraseña"
          value={form.contrasena}
          onChange={handleChange}
          required
          className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:border-blue-500"
        />
        <button type="submit" className="bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring focus:border-blue-300">
          Registrar
        </button>
        {error && <p className="text-red-500 text-center mt-2">{error}</p>}
      </form>
    </div>
  );
}