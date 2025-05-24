import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ErrorMessage from '../components/ErrorMessage';

export default function HomePage() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [activeJornada, setActiveJornada] = useState(null);
  const [turnoActivo, setTurnoActivo] = useState(null);
  const [loadingJornadas, setLoadingJornadas] = useState(true);
  const [loadingTurno, setLoadingTurno] = useState(false);
  const [error, setError] = useState(null);
  const [errorType, setErrorType] = useState('error_general');
  const [showCrearTurnoForm, setShowCrearTurnoForm] = useState(false);
  const [turnoFormData, setTurnoFormData] = useState({ kmInicial: '' });
  const [stats, setStats] = useState({ totalJornadas: 0, totalCarreras: 0, totalRecaudado: 0 });
  const [successMessage, setSuccessMessage] = useState('');

  const fetchTurnoActivo = useCallback(async (jornadaId) => {
    if (!isAuthenticated || !user?.accessToken || !jornadaId) return;
    setLoadingTurno(true);
    try {
      setTurnoActivo(null);
      setShowCrearTurnoForm(!!jornadaId);
      setError(null);
    } catch (err) {
      setError(err.message);
      setTurnoActivo(null);
    } finally {
      setLoadingTurno(false);
    }
  }, [user, isAuthenticated]);

  const fetchJornadasActivas = useCallback(async () => {
    if (!isAuthenticated || !user?.accessToken) {
      setLoadingJornadas(false);
      setActiveJornada(null);
      setTurnoActivo(null);
      return;
    }
    setLoadingJornadas(true);
    setError(null);
    try {
      const resp = await fetch('/api/jornadas?estado=activa', {
        headers: { 'Authorization': `Bearer ${user.accessToken}` },
      });
      if (!resp.ok) {
        if (resp.status === 401) {
          logout();
          navigate('/');
          return;
        }
        const errorData = await resp.json().catch(() => ({ message: `Error del servidor: ${resp.status} ${resp.statusText}` }));
        throw new Error(errorData.message || `Error al cargar jornadas activas`);
      }
      const data = await resp.json();
      if (data && data.length > 0) {
        setActiveJornada(data[0]);
        await fetchTurnoActivo(data[0].idJornada);
      } else {
        setActiveJornada(null);
        setTurnoActivo(null);
        setShowCrearTurnoForm(false);
      }
    } catch (err) {
      setError(err.message);
      setActiveJornada(null);
      setTurnoActivo(null);
    } finally {
      setLoadingJornadas(false);
    }
  }, [user, isAuthenticated, logout, navigate, fetchTurnoActivo]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchJornadasActivas();
    } else {
      setLoadingJornadas(false);
      setActiveJornada(null);
      setTurnoActivo(null);
    }
  }, [isAuthenticated, fetchJornadasActivas]);

  const handleNuevaJornada = async () => {
    if (!isAuthenticated || !user?.accessToken || !user?.idTaxista) {
      setError('Usuario no autenticado o datos incompletos para crear jornada.');
      return;
    }
    setError(null);
    setLoadingJornadas(true);
    if (activeJornada && activeJornada.idJornada) {
      try {
        const cerrarResp = await fetch(`/api/jornadas/${activeJornada.idJornada}/cerrar`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user.accessToken}`,
          },
          body: JSON.stringify({}),
        });
        if (cerrarResp.ok) {
          setActiveJornada(null);
          setTurnoActivo(null);
        }
      } catch (err) {
        // No detener el flujo si falla el cierre
      }
    }
    try {
      const resp = await fetch('/api/jornadas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.accessToken}`,
        },
        body: JSON.stringify({ taxista: { idTaxista: user.idTaxista } }),
      });
      if (!resp.ok) {
        const errorData = await resp.json().catch(() => ({ message: `Error del servidor: ${resp.status} ${resp.statusText}` }));
        throw new Error(errorData.message || 'Error al crear nueva jornada.');
      }
      const newJornada = await resp.json();
      setActiveJornada(newJornada);
      setTurnoActivo(null);
      setShowCrearTurnoForm(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingJornadas(false);
    }
  };

  const handleCrearTurno = async (e) => {
    e.preventDefault();
    if (!isAuthenticated || !user?.accessToken || !activeJornada?.idJornada) {
      setError('No hay jornada activa o usuario no autenticado para crear turno.');
      return;
    }
    setError(null);
    setLoadingTurno(true);
    try {
      const resp = await fetch(`/api/turnos/jornada/${activeJornada.idJornada}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.accessToken}`,
        },
        body: JSON.stringify({ kmInicial: parseFloat(turnoFormData.kmInicial), estado: 'ABIERTO' }),
      });
      if (!resp.ok) {
        const errorData = await resp.json().catch(() => ({ message: `Error del servidor: ${resp.status} ${resp.statusText}` }));
        throw new Error(errorData.message || 'Error al crear turno.');
      }
      const nuevoTurno = await resp.json();
      setTurnoActivo(nuevoTurno);
      setShowCrearTurnoForm(false);
      navigate(`/jornada/${activeJornada.idJornada}/turno/${nuevoTurno.idTurno}/carrera`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingTurno(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (loadingJornadas && !activeJornada) {
    return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-amber-400 text-xl">Cargando datos de jornada...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-900 text-slate-100">
      <main className="flex-1 flex items-center justify-center w-full">
        <div className="w-full max-w-5xl mx-auto px-2 md:px-8 py-8">
        <header className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-amber-400">TaxiDay</h1>
              <p className="text-slate-400 text-sm">Bienvenido, <span className="text-amber-300 font-semibold">{user?.nombre || user?.licencia}</span>!</p>
              </div>
              <button
              onClick={handleLogout}
              className="bg-red-600/80 text-white px-5 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm font-semibold shadow-md"
              >
                Cerrar Sesión
              </button>
        </div>
      </header>

        {error && (
            <div className="mb-6 bg-red-800/40 border border-red-700/50 text-red-200 px-6 py-4 rounded-lg text-sm animate-fade-in">
              <ErrorMessage 
                message={error}
                type={errorType}
                onClose={() => {
                  setError(null);
                  setErrorType('error_general');
                }}
              />
          </div>
        )}

          {successMessage && (
            <ErrorMessage 
              message={successMessage}
              type="success"
              onClose={() => setSuccessMessage('')}
            />
          )}

          <div className="grid grid-cols-1 md:grid-cols-[320px_1fr] gap-8 items-start">
            <div className="bg-slate-900/80 p-6 rounded-xl border border-slate-700/60 shadow-lg flex flex-col w-full md:w-[320px] max-w-full">
            {!activeJornada ? (
              <>
                <h3 className="text-xl font-semibold text-amber-300 mb-3">Nueva Jornada</h3>
                <p className="text-sm text-slate-400 mb-4">No tienes una jornada de trabajo activa.</p>
                <button
                  onClick={handleNuevaJornada}
                  disabled={loadingJornadas || loadingTurno}
                  className="w-full bg-amber-500 hover:bg-amber-600 text-gray-900 py-2.5 px-4 rounded-lg transition-colors font-semibold disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
                >
                  {loadingJornadas ? 'Procesando...' : 'Iniciar Nueva Jornada'}
                </button>
              </>
            ) : (
              <>
                <h3 className="text-xl font-semibold text-green-400 mb-3">Jornada Activa</h3>
                <p className="text-sm text-slate-400">ID Jornada: <span className="font-medium text-slate-100">{activeJornada.idJornada}</span></p>
                <p className="text-sm text-slate-400 mb-4">Iniciada: <span className="font-medium text-slate-100">{new Date(activeJornada.fechaInicio).toLocaleString()}</span></p>
                {!turnoActivo && !showCrearTurnoForm && (
                  <button
                    onClick={() => setShowCrearTurnoForm(true)}
                    disabled={loadingTurno}
                    className="w-full mt-3 bg-sky-500 hover:bg-sky-600 text-white py-2.5 px-4 rounded-lg transition-colors font-semibold disabled:opacity-60 shadow-sm"
                  >
                    Iniciar Nuevo Turno
                  </button>
                )}
                {showCrearTurnoForm && (
                  <form onSubmit={handleCrearTurno} className="space-y-4 mt-4 p-4 bg-slate-800/80 rounded-lg border border-slate-700/50">
                    <div>
                      <label htmlFor="kmInicial" className="block text-xs font-medium text-slate-200 mb-1.5">KM Inicial del Turno</label>
                      <input
                        type="number"
                        id="kmInicial"
                        value={turnoFormData.kmInicial}
                        onChange={(e) => setTurnoFormData({ ...turnoFormData, kmInicial: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg focus:ring-2 focus:ring-sky-500 text-slate-100 placeholder-slate-500 text-sm shadow-sm"
                        placeholder="Ej: 123450"
                        required
                      />
          </div>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => setShowCrearTurnoForm(false)}
                        className="flex-1 bg-slate-700 hover:bg-slate-600 text-slate-200 py-2 px-3 rounded-lg transition-colors text-sm font-medium shadow-sm"
                      >
                        Cancelar
                      </button>
          <button
                        type="submit"
                        disabled={loadingTurno}
                        className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 px-3 rounded-lg transition-colors font-semibold disabled:opacity-60 shadow-sm"
          >
                        {loadingTurno ? 'Guardando...' : 'Guardar Turno'}
          </button>
        </div>
                  </form>
                )}
                {turnoActivo && (
                  <div className="mt-4 pt-4 border-t border-slate-700/50">
                    <h4 className="text-lg font-semibold text-sky-400 mb-2">Turno Activo</h4>
                    <p className="text-sm text-slate-400">ID Turno: <span className="font-medium text-slate-100">{turnoActivo.idTurno}</span></p>
                    <p className="text-sm text-slate-400">KM Inicial: <span className="font-medium text-slate-100">{turnoActivo.kmInicial}</span></p>
                    <p className="text-sm text-slate-400 mb-3">Iniciado: <span className="font-medium text-slate-100">{new Date(turnoActivo.fechaInicio).toLocaleString()}</span></p>
                    <button
                      onClick={() => navigate(`/jornada/${activeJornada.idJornada}/turno/${turnoActivo.idTurno}/carrera`)}
                      className="w-full bg-purple-500 hover:bg-purple-600 text-white py-2.5 px-4 rounded-lg transition-colors font-semibold shadow-sm"
                    >
                      Gestionar Carreras
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
            <div className="flex flex-col gap-6 w-full max-w-2xl mx-auto">
              <div className="bg-slate-900/80 p-6 rounded-xl border border-slate-700/60 shadow-lg flex flex-col">
            <h3 className="text-xl font-semibold text-amber-300 mb-3">Estadísticas</h3>
            <div className="space-y-2 text-sm">
              <p className="text-slate-400">Jornadas Totales: <span className="font-semibold text-amber-200">{stats.totalJornadas}</span></p>
              <p className="text-slate-400">Carreras Totales: <span className="font-semibold text-amber-200">{stats.totalCarreras}</span></p>
              <p className="text-slate-400">Recaudado Total: <span className="font-semibold text-amber-200">{stats.totalRecaudado.toFixed(2)} €</span></p>
            </div>
            <p className="text-xs text-slate-500 mt-4 italic">Funcionalidad de estadísticas en desarrollo.</p>
          </div>
        </div>
      </div>
        </div>
      </main>
      <footer className="w-full text-center text-xs text-slate-500 py-4 border-t border-slate-800 mt-auto">
        TaxiDay © 2025 — Hecho con <span className="text-red-500">♥</span> para taxistas
      </footer>
    </div>
  );
} 