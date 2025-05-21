import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ModalDetalles from '../components/ModalDetalles';

export default function CarreraPage() {
  const { jornadaId, turnoId } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  const [carreraData, setCarreraData] = useState({
    precio: '',
    tipoPago: '',
    notas: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [turnoCerrado, setTurnoCerrado] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
        setError("Usuario no autenticado. Por favor, inicie sesión.");
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    const fetchTurno = async () => {
      if (!isAuthenticated || !user) return;
      try {
        const resp = await fetch(`/api/turnos/${turnoId}`);
        if (!resp.ok) return;
        const data = await resp.json();
        if (data.estado && data.estado.toLowerCase() === 'cerrado') {
          setTurnoCerrado(true);
        } else {
          setTurnoCerrado(false);
        }
      } catch (err) {
        setTurnoCerrado(true);
      }
    };
    fetchTurno();
  }, [isAuthenticated, user, turnoId]);

  // Validación de turnoId después de los hooks
  const turnoIdValido = turnoId && turnoId !== 'undefined' && !isNaN(Number(turnoId)) && Number(turnoId) > 0;
  if (!turnoIdValido) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-900 text-red-100 p-8 rounded-xl shadow-lg text-center">
          <h2 className="text-2xl font-bold mb-4">Error</h2>
          <p>No hay turno activo o el ID de turno es inválido.</p>
          <button
            onClick={() => navigate('/home')}
            className="mt-6 bg-primary hover:bg-primary-dark text-gray-900 font-semibold py-2 px-6 rounded-lg transition-colors shadow-md"
          >
            Volver a Home
          </button>
        </div>
      </div>
    );
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCarreraData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleGuardarCarrera = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setLoading(true);

    if (!isAuthenticated || !user) {
      setError('Usuario no autenticado.');
      setLoading(false);
      return;
    }

    if (turnoCerrado) {
      setError('No puedes agregar carreras a un turno cerrado.');
      setLoading(false);
      return;
    }

    try {
      const tipoPagoFinal = carreraData.tipoPago || 'efectivo';
      const resp = await fetch(`/api/turnos/${turnoId}/carreras`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          importeTotal: parseFloat(carreraData.precio),
          tipoPago: tipoPagoFinal,
          notas: carreraData.notas
        })
      });

      if (!resp.ok) {
        if (resp.status === 401) {
            logout();
            navigate('/');
            throw new Error('Sesión expirada o inválida. Por favor, inicie sesión de nuevo.');
        }
        const data = await resp.json().catch(() => ({ message: resp.statusText }));
        throw new Error(data.message || `Error al registrar carrera. Estado: ${resp.status}`);
      }

      setSuccessMessage('Carrera registrada exitosamente. Puedes registrar otra o cerrar el turno.');
      setCarreraData({ precio: '', tipoPago: '', notas: '' });
    } catch (err) {
      console.error('Error registrando carrera:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCerrarTurno = async () => {
    setError('');
    setSuccessMessage('');
    setLoading(true);

    if (!isAuthenticated || !user) {
      setError('Usuario no autenticado.');
      setLoading(false);
      return;
    }

    try {
      const kmFinalInput = prompt("Ingrese los KM finales del turno:");
      if (kmFinalInput === null || isNaN(parseFloat(kmFinalInput))) {
        setError("Debe ingresar un valor numérico para los KM finales.");
        setLoading(false);
        return;
      }
      const kmFinal = parseFloat(kmFinalInput);

      const resp = await fetch(`/api/turnos/${turnoId}/cerrar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          kmFinal: kmFinal 
        })
      });

      if (!resp.ok) {
        if (resp.status === 401) {
            logout();
            navigate('/');
            throw new Error('Sesión expirada o inválida. Por favor, inicie sesión de nuevo.');
        }
         const data = await resp.json().catch(() => ({ message: resp.statusText }));
         setError(data.message || `Error al cerrar turno. Estado: ${resp.status}`);
         setLoading(false);
         return;
      }
      setSuccessMessage('Turno cerrado exitosamente. Redirigiendo a Home...');
      setTurnoCerrado(true);
      setTimeout(() => {
        sessionStorage.setItem('successMessage', 'Turno cerrado correctamente. Puedes iniciar un nuevo turno o jornada.');
        window.location.href = '/home';
      }, 2000);
    } catch (err) {
      console.error('Error cerrando turno:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  const handleNuevaCarrera = () => {
    setCarreraData({ precio: '', tipoPago: '', notas: '' });
    setError('');
    setSuccessMessage('');
  };

  if (!isAuthenticated || !user) {
    return <p className="text-center text-red-500 p-10">Usuario no autenticado. Por favor, inicie sesión.</p>;
  }

  if (turnoCerrado) {
    return (
      <div className="min-h-screen bg-background text-text flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md bg-surface/90 rounded-xl shadow-xl p-8 border border-border text-center">
          <h2 className="text-2xl font-bold text-primary mb-4">Turno Cerrado</h2>
          <p className="mb-6 text-text-muted">Este turno ya está cerrado. No puedes agregar más carreras.</p>
          <button
            onClick={() => navigate('/home')}
            className="bg-primary hover:bg-primary-dark text-gray-900 font-semibold py-2 px-6 rounded-lg transition-colors shadow-md"
          >
            Volver a Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-text flex flex-col items-center p-0">
      {/* Header visual */}
      <header className="w-full bg-gradient-to-br from-primary/30 to-background/80 py-10 px-4 flex flex-col items-center shadow-lg mb-10 border-b border-border">
        <div className="max-w-2xl w-full flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col gap-2">
            <span className="text-3xl md:text-4xl font-extrabold text-primary drop-shadow-lg">Registrar Carrera</span>
            <span className="text-text-muted text-lg md:text-xl">Jornada #{jornadaId} &mdash; Turno #{turnoId}</span>
          </div>
        </div>
      </header>

      {/* Formulario en tarjeta */}
      <div className="w-full max-w-lg bg-surface/90 backdrop-blur-sm rounded-2xl shadow-2xl p-10 border border-border mt-8 mb-16">
        <form onSubmit={handleGuardarCarrera} className="space-y-6">
          <div>
            <label className="block text-text text-sm font-medium mb-2">Precio (€)</label>
            <input
              type="number"
              name="precio"
              value={carreraData.precio}
              onChange={handleInputChange}
              className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary text-text placeholder-text-muted text-base"
              placeholder="Precio"
              required
            />
          </div>
          <div>
            <label className="block text-text text-sm font-medium mb-2">Tipo de pago</label>
            <select
              name="tipoPago"
              value={carreraData.tipoPago}
              onChange={handleInputChange}
              className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary text-text placeholder-text-muted text-base"
              required
            >
              <option value="" disabled>Selecciona tipo de pago</option>
              <option value="efectivo">Efectivo</option>
              <option value="tarjeta">Tarjeta</option>
              <option value="bizum">Bizum</option>
            </select>
          </div>
          <div>
            <label className="block text-text text-sm font-medium mb-2">Notas</label>
            <textarea
              name="notas"
              value={carreraData.notas}
              onChange={handleInputChange}
              className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary text-text placeholder-text-muted text-base"
              placeholder="Notas (opcional)"
              rows={2}
            />
          </div>
          {error && (
            <div className="bg-red-800/40 border border-red-700/50 text-red-200 px-4 py-2 rounded-lg text-base text-center">
              {error}
            </div>
          )}
          {successMessage && (
            <div className="bg-green-800/40 border border-green-700/50 text-green-200 px-4 py-2 rounded-lg text-base text-center">
              {successMessage}
            </div>
          )}
          <div className="flex gap-6 mt-8">
            <button type="submit" disabled={!turnoIdValido || loading} className="flex-1 bg-primary hover:bg-primary-dark text-gray-900 font-semibold py-3 rounded-lg transition-colors shadow-md text-lg disabled:opacity-60 disabled:cursor-not-allowed">
              Guardar Carrera
            </button>
            <button type="button" onClick={handleCerrarTurno} disabled={!turnoIdValido || loading} className="flex-1 bg-surface hover:bg-background text-primary font-semibold py-3 rounded-lg border border-primary transition-colors shadow-md text-lg">
              Cerrar Turno
            </button>
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