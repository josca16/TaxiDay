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
    <div>
      <h2>Registro de Taxista</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="nombre"
          placeholder="Nombre"
          value={form.nombre}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="apellidos"
          placeholder="Apellidos"
          value={form.apellidos}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="licencia"
          placeholder="Licencia"
          value={form.licencia}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="contrasena"
          placeholder="Contraseña"
          value={form.contrasena}
          onChange={handleChange}
          required
        />
        <button type="submit">Registrar</button>
      </form>
      {error && <p style={{color:'red'}}>{error}</p>}
    </div>
  );
}