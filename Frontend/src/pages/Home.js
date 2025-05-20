import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="home-container">
      <header className="home-header">
        <h1>Bienvenido a TaxiDay</h1>
        <div className="user-info">
          <p>Conductor: {user?.licencia}</p>
          <button onClick={handleLogout}>Cerrar sesión</button>
        </div>
      </header>
      
      <main className="home-content">
        <section className="dashboard">
          <h2>Panel de Control</h2>
          <div className="dashboard-grid">
            <div className="dashboard-card">
              <h3>Estado Actual</h3>
              <p>Disponible</p>
            </div>
            <div className="dashboard-card">
              <h3>Viajes del Día</h3>
              <p>0</p>
            </div>
            <div className="dashboard-card">
              <h3>Ganancias</h3>
              <p>€0.00</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}