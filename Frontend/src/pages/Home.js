import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import ModalDetalles from '../components/ModalDetalles';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

// Página de inicio (requiere autenticación)
export default function Home() {
  // Usa el hook useAuth para obtener el usuario autenticado y la función de logout
  const { user, logout } = useAuth();
  // Hook para la navegación programática
  const navigate = useNavigate();

  // Estados para jornadas
  const [jornadas, setJornadas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeJornadaId, setActiveJornadaId] = useState(null);

  // Estados para turno
  const [turno, setTurno] = useState(null);
  const [showCarreraForm, setShowCarreraForm] = useState(false);
  const [formData, setFormData] = useState({
    kmInicial: '',
    kmFinal: '',
    importeTotal: '',
    tipoPago: 'efectivo'
  });

  // Estado para las estadísticas
  const [stats, setStats] = useState({
    totalJornadas: 0,
    totalCarreras: 0,
    totalRecaudado: 0
  });

  // Mostrar formulario para crear turno
  const [showCrearTurnoForm, setShowCrearTurnoForm] = useState(false);

  // Estado para mensaje de éxito tras cerrar turno
  const [successMessage, setSuccessMessage] = useState(() => {
    // Si venimos de cerrar turno, mostrar mensaje
    const msg = sessionStorage.getItem('successMessage');
    if (msg) {
      sessionStorage.removeItem('successMessage');
      return msg;
    }
    return '';
  });

  // Estado para el modal de detalles
  const [modalDetalles, setModalDetalles] = useState({ open: false, jornada: null });

  // Estado para el día seleccionado en el calendario
  const [selectedDate, setSelectedDate] = useState(null);

  // Iconos para estadísticas
  const icons = [
    <svg key="jornadas" className="w-8 h-8 text-primary mb-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /></svg>,
    <svg key="carreras" className="w-8 h-8 text-primary mb-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="4" /></svg>,
    <svg key="recaudado" className="w-8 h-8 text-primary mb-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 8v8m0 0a4 4 0 100-8 4 4 0 000 8z" /></svg>
  ];

  // Efecto para cargar las jornadas al montar el componente
  useEffect(() => {
    // Función asíncrona para obtener las jornadas
    const fetchJornadas = async () => {
      // Verificar si hay un usuario autenticado y si tiene un ID de taxista
      if (!user || !user.idTaxista) {
        setLoading(false);
        return;
      }

      try {
        // Realiza la petición GET al backend para obtener TODAS las jornadas (temporal)
        // IDEALMENTE: Se debería usar un endpoint específico como '/api/taxistas/' + user.idTaxista + '/jornadas'
        const resp = await fetch('/api/jornadas');
        
        if (!resp.ok) {
          throw new Error(`Error al cargar jornadas: ${resp.statusText}`);
        }
        
        const data = await resp.json();
        
        // Filtrar las jornadas para mostrar solo las del taxista actual
        const userJornadas = data.filter(jornada => jornada.taxista?.idTaxista === user.idTaxista);
        
        setJornadas(userJornadas); // Almacena las jornadas filtradas en el estado
        console.log('Jornadas cargadas y filtradas:', userJornadas); // Log de depuración

        // Calcular estadísticas
        const totalCarreras = userJornadas.reduce((sum, j) => 
          sum + (j.turnos?.reduce((tSum, t) => 
            tSum + (t.carreras?.length || 0), 0) || 0), 0);
        
        const totalRecaudado = userJornadas.reduce((sum, j) => 
          sum + (j.turnos?.reduce((tSum, t) => 
            tSum + (t.carreras?.reduce((cSum, c) => 
              cSum + (c.importeTotal || 0), 0) || 0), 0) || 0), 0);

        setStats({
          totalJornadas: userJornadas.length,
          totalCarreras,
          totalRecaudado
        });

        // Intentar encontrar una jornada activa (estado CREADA/ABIERTA/activa)
        const openJornada = userJornadas.find(jornada => {
          const estado = jornada.estado?.toLowerCase();
          return estado === 'activa' || estado === 'creada' || estado === 'abierta';
        });
        if (openJornada) {
          setActiveJornadaId(openJornada.idJornada);
          console.log('Jornada activa encontrada:', openJornada.idJornada);
          fetchTurnoActivo(openJornada.idJornada);
        }

      } catch (err) {
        setError(err.message); // Captura y almacena cualquier error
        console.error('Error fetching jornadas:', err); // Log de error
      } finally {
        setLoading(false); // Indica que la carga ha terminado (éxito o error)
      }
    };

    fetchJornadas(); // Ejecuta la función de carga
  }, [user]); // El efecto se re-ejecuta si el objeto 'user' cambia

  const fetchTurnoActivo = async (jornadaId) => {
    try {
      const resp = await fetch(`/api/jornadas/${jornadaId}/turno-activo`);
      if (!resp.ok) throw new Error('Error al cargar turno activo');
      const data = await resp.json();
      setTurno(data);
    } catch (err) {
      setError(err.message);
    }
  };

  // Maneja la acción de crear una nueva jornada
  const handleNewJornada = async () => {
    if (!user || !user.idTaxista) {
      setError('Usuario no autenticado para crear jornada.');
      return;
    }

    // Si hay una jornada activa, intentar cerrarla primero
    if (activeJornadaId) {
      try {
        const closeResp = await fetch(`/api/jornadas/${activeJornadaId}/cerrar`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fechaFinal: new Date().toISOString() })
        });

        if (!closeResp.ok) {
          const errorData = await closeResp.json();
          throw new Error(`Error al cerrar jornada anterior: ${errorData.message || closeResp.statusText}`);
        }
        setActiveJornadaId(null);
        setTurno(null);
      } catch (err) {
        setError(err.message);
        return;
      }
    }

    // Ahora crear la nueva jornada
    try {
      const resp = await fetch('/api/jornadas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taxista: { idTaxista: user.idTaxista }
        })
      });

      if (!resp.ok) {
        const errorData = await resp.json();
        throw new Error(`Error al crear jornada: ${errorData.message || resp.statusText}`);
      }

      const newJornada = await resp.json();
      setJornadas([...jornadas, newJornada]);
      setActiveJornadaId(newJornada.idJornada);
      setError(null);
      // Abrir automáticamente el formulario de crear turno
      setShowCrearTurnoForm(true);
    } catch (err) {
      setError(err.message);
    }
  };

  // Maneja la acción de crear turno (ahora desde formulario)
  const handleCrearTurno = async (e) => {
    if (e) e.preventDefault();
    if (!activeJornadaId) {
      setError('No hay jornada activa para crear un turno.');
      return;
    }
    if (!formData.kmInicial) {
      setError('Debe ingresar los kilómetros iniciales.');
      return;
    }
    try {
      const resp = await fetch(`/api/turnos/jornada/${activeJornadaId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          kmInicial: parseFloat(formData.kmInicial),
          estado: 'abierto'
        })
      });
      if (!resp.ok) {
        const errorData = await resp.json();
        throw new Error(errorData.message || 'Error al crear turno');
      }
      const newTurno = await resp.json();
      setFormData(prev => ({ ...prev, kmInicial: '' }));
      setError(null);
      setShowCrearTurnoForm(false);
      navigate(`/jornada/${activeJornadaId}/turno/${newTurno.idTurno}/carrera`);
    } catch (err) {
      setError(err.message || 'Ocurrió un error al crear el turno.');
    }
  };

  const handleCerrarTurno = async () => {
    if (!turno) return;

    try {
      const resp = await fetch(`/api/turnos/${turno.idTurno}/cerrar`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kmFinal: formData.kmFinal
        })
      });

      if (!resp.ok) {
        const errorData = await resp.json();
        throw new Error(errorData.message || 'Error al cerrar turno');
      }

      setTurno(null);
      setFormData({
        kmInicial: '',
        kmFinal: '',
        importeTotal: '',
        tipoPago: 'efectivo'
      });
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCrearCarrera = async () => {
    if (!turno) return;

    try {
      const resp = await fetch(`/api/turnos/${turno.idTurno}/carreras`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          importeTotal: formData.importeTotal,
          tipoPago: formData.tipoPago
        })
      });

      if (!resp.ok) {
        const errorData = await resp.json();
        throw new Error(errorData.message || 'Error al crear carrera');
      }

      setShowCarreraForm(false);
      setFormData({
        ...formData,
        importeTotal: '',
        tipoPago: 'efectivo'
      });
    } catch (err) {
      setError(err.message);
    }
  };

  // Maneja la acción de cerrar sesión
  const handleLogout = () => {
    logout(); // Llama a la función logout del contexto
    navigate('/'); // Redirige a la página de login
  };

  // Maneja la acción de continuar jornada actual
  const handleContinueJornadaClick = () => {
    // Simplemente permite crear un nuevo turno en la jornada activa
    setError(null);
    setShowCrearTurnoForm(true);
  };

  useEffect(() => {
    // Redirigir automáticamente a la pantalla de carreras si hay turno abierto
    if (activeJornadaId && turno && turno.idTurno) {
      navigate(`/jornada/${activeJornadaId}/turno/${turno.idTurno}/carrera`);
    }
  }, [activeJornadaId, turno, navigate]);

  // Función para obtener solo la fecha (sin hora)
  function toDateString(date) {
    return new Date(date).toISOString().split('T')[0];
  }

  // Días con jornadas
  const jornadasPorFecha = {};
  jornadas.forEach(j => {
    const fecha = toDateString(j.fechaInicio);
    if (!jornadasPorFecha[fecha]) jornadasPorFecha[fecha] = [];
    jornadasPorFecha[fecha].push(j);
  });
  const fechasConJornada = Object.keys(jornadasPorFecha);

  // Renderizar jornadas y carreras del día seleccionado
  function renderJornadasDelDia() {
    if (!selectedDate) return null;
    const fecha = toDateString(selectedDate);
    const jornadasDia = jornadasPorFecha[fecha] || [];
    if (!jornadasDia.length) {
      return <div className="text-text-muted text-center mt-4">No hay jornadas en este día.</div>;
    }
    return (
      <div className="flex flex-col gap-6 mt-4">
        {jornadasDia.map(j => (
          <div key={j.idJornada} className="bg-surface rounded-2xl p-6 border border-border shadow flex flex-col gap-2">
            <div className="font-bold text-primary text-lg mb-1">Jornada #{j.idJornada} ({j.estado})</div>
            <div className="text-sm text-text-muted mb-1">Inicio: {new Date(j.fechaInicio).toLocaleString()}</div>
            <div className="text-sm text-text-muted mb-1">Final: {j.fechaFinal ? new Date(j.fechaFinal).toLocaleString() : '—'}</div>
            <div className="font-semibold text-primary mt-2 mb-1">Turnos:</div>
            {j.turnos?.length ? (
              <ul className="flex flex-col gap-2">
                {j.turnos.map(t => (
                  <li key={t.idTurno} className="bg-background rounded-xl p-4 border border-border shadow flex flex-col gap-1">
                    <div className="font-semibold text-text">Turno #{t.idTurno}</div>
                    <div className="text-xs text-text-muted">KM Inicial: {t.kmInicial} | KM Final: {t.kmFinal ?? '—'}</div>
                    <div className="text-xs text-text-muted">Inicio: {new Date(t.fechaInicio).toLocaleString()}</div>
                    <div className="text-xs text-text-muted">Final: {t.fechaFinal ? new Date(t.fechaFinal).toLocaleString() : '—'}</div>
                    <div className="font-semibold text-primary mt-2 mb-1">Carreras:</div>
                    {t.carreras?.length ? (
                      <ul className="flex flex-col gap-1">
                        {t.carreras.map(c => (
                          <li key={c.idCarrera} className="bg-surface rounded p-2 border border-border">
                            <div className="text-xs text-text">Carrera #{c.idCarrera} | {c.importeTotal} € | {c.tipoPago}</div>
                            {c.notas && <div className="text-xs text-text-muted">Notas: {c.notas}</div>}
                          </li>
                        ))}
                      </ul>
                    ) : <div className="text-xs text-text-muted">Sin carreras</div>}
                  </li>
                ))}
              </ul>
            ) : <div className="text-xs text-text-muted">Sin turnos</div>}
          </div>
        ))}
      </div>
    );
  }

  // Función para renderizar detalles de una jornada
  function renderDetallesJornada(jornada) {
    return (
      <div className="flex flex-col gap-8">
        <div className="mb-2">
          <div className="font-extrabold text-xl text-primary mb-1">Jornada #{jornada.idJornada}</div>
          <div className="text-text-muted text-base mb-1">Fecha inicio: <span className="font-semibold text-text">{new Date(jornada.fechaInicio).toLocaleString()}</span></div>
          <div className="text-text-muted text-base mb-1">Fecha final: <span className="font-semibold text-text">{jornada.fechaFinal ? new Date(jornada.fechaFinal).toLocaleString() : '—'}</span></div>
          <div className="text-text-muted text-base mb-1">Estado: <span className="font-semibold text-text">{jornada.estado}</span></div>
          <div className="text-text-muted text-base mb-1">Taxista: <span className="font-semibold text-text">{jornada.taxista?.nombre} {jornada.taxista?.apellidos} ({jornada.taxista?.licencia})</span></div>
        </div>
        <div>
          <div className="font-bold text-lg text-primary/80 mb-3">Turnos:</div>
          {jornada.turnos?.length ? (
            <ul className="flex flex-col gap-6">
              {jornada.turnos.map(turno => (
                <li key={turno.idTurno} className="bg-background/80 rounded-xl p-5 border border-border shadow flex flex-col gap-2">
                  <div className="font-bold text-base text-primary mb-1">Turno #{turno.idTurno}</div>
                  <div className="text-base text-text-muted">KM Inicial: <span className="text-text font-semibold">{turno.kmInicial}</span> | KM Final: <span className="text-text font-semibold">{turno.kmFinal ?? '—'}</span></div>
                  <div className="text-base text-text-muted">Inicio: <span className="text-text font-semibold">{new Date(turno.fechaInicio).toLocaleString()}</span></div>
                  <div className="text-base text-text-muted">Final: <span className="text-text font-semibold">{turno.fechaFinal ? new Date(turno.fechaFinal).toLocaleString() : '—'}</span></div>
                  <div className="text-base text-text-muted mb-2">Estado: <span className="text-text font-semibold">{turno.estado}</span></div>
                  <div className="font-semibold text-primary/70 mt-2 mb-1">Carreras:</div>
                  {turno.carreras?.length ? (
                    <ul className="flex flex-col gap-3">
                      {turno.carreras.map(carrera => (
                        <li key={carrera.idCarrera} className="bg-surface rounded-lg p-4 border border-border shadow flex flex-col gap-1">
                          <div className="font-semibold text-text">Carrera #{carrera.idCarrera}</div>
                          <div className="text-sm text-text-muted">Fecha: <span className="text-text font-medium">{new Date(carrera.fechaInicio).toLocaleString()}</span></div>
                          <div className="text-sm text-text-muted">Importe: <span className="text-text font-medium">{carrera.importeTotal} €</span> | Taxímetro: <span className="text-text font-medium">{carrera.importeTaximetro ?? '—'} €</span></div>
                          <div className="text-sm text-text-muted">Pago: <span className="text-text font-medium">{carrera.tipoPago}</span></div>
                          {carrera.notas && <div className="text-sm text-text-muted">Notas: <span className="text-text font-medium">{carrera.notas}</span></div>}
                        </li>
                      ))}
                    </ul>
                  ) : <div className="text-sm text-text-muted">Sin carreras</div>}
                </li>
              ))}
            </ul>
          ) : <div className="text-base text-text-muted">Sin turnos</div>}
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-xl text-gray-300">Cargando...</div>
      </div>
    );
  }

  // Sustituir todo el contenido del return por un layout más web, con más relleno visual
  return (
    <div className="min-h-screen bg-background text-text flex flex-col items-center p-0">
      {/* Hero/Header grande */}
      <header className="w-full bg-gradient-to-br from-primary/30 to-background/80 py-12 px-4 flex flex-col items-center shadow-lg mb-10 border-b border-border">
        <div className="max-w-6xl w-full flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col gap-2">
            <span className="text-4xl md:text-5xl font-extrabold text-primary drop-shadow-lg">TaxiDay</span>
            <span className="text-text-muted text-lg md:text-xl">Bienvenido, {user?.nombre || user?.licencia}</span>
          </div>
          <button onClick={logout} className="bg-primary hover:bg-primary-dark text-gray-900 font-semibold py-3 px-8 rounded-xl transition-colors shadow-md text-lg">Cerrar sesión</button>
        </div>
      </header>

      {/* Mensaje de éxito tras cerrar turno */}
      {successMessage && (
        <div className="mb-6 bg-green-800/90 text-green-100 px-6 py-3 rounded-xl shadow-lg border border-green-700/60 max-w-2xl w-full text-center">
          {successMessage}
        </div>
      )}

      {/* Estadísticas y acciones principales en grid */}
      <section className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-4 gap-12 mb-16 px-4 items-start">
        {/* Calendario */}
        <div className="col-span-1 flex flex-col items-center bg-surface rounded-2xl shadow-lg border border-border p-4 min-w-[260px] max-w-[320px] mx-auto">
          <div className="font-bold text-primary text-base mb-2">Calendario de Jornadas</div>
          <Calendar
            onChange={setSelectedDate}
            value={selectedDate}
            tileClassName={({ date, view }) => {
              if (view === 'month' && fechasConJornada.includes(toDateString(date))) {
                return 'bg-primary/30 text-primary font-bold rounded-full';
              }
              return '';
            }}
            locale="es-ES"
            calendarType="iso8601"
            className="!bg-background !text-text !border-none !shadow-none !rounded-xl !p-2"
          />
          {renderJornadasDelDia()}
        </div>
        {/* Estadísticas y acciones */}
        <div className="col-span-1 lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Estadísticas */}
          {[
            { label: 'Jornadas', value: stats.totalJornadas, icon: icons[0] },
            { label: 'Carreras', value: stats.totalCarreras, icon: icons[1] },
            { label: 'Recaudado', value: stats.totalRecaudado.toFixed(2) + ' €', icon: icons[2] }
          ].map((stat, i) => (
            <div key={stat.label} className="bg-surface rounded-2xl p-6 shadow-lg border border-border flex flex-col items-center min-h-[120px] justify-center transition-all">
              {stat.icon}
              <span className="text-5xl font-extrabold text-primary leading-tight mb-1">{stat.value}</span>
              <span className="text-text-muted text-base">{stat.label}</span>
            </div>
          ))}
          {/* Acciones principales */}
          <div className="col-span-full flex flex-col gap-4 justify-center mt-8">
            {!activeJornadaId && (
              <button onClick={handleNewJornada} className="w-full bg-primary hover:bg-primary-dark text-gray-900 font-semibold py-3 rounded-2xl shadow-lg transition-colors text-lg">Nueva Jornada</button>
            )}
            {activeJornadaId && !turno && (
              <>
                <button onClick={handleNewJornada} className="w-full bg-primary hover:bg-primary-dark text-gray-900 font-semibold py-3 rounded-2xl shadow-lg transition-colors text-lg">Nueva Jornada</button>
                <button onClick={() => setShowCrearTurnoForm(true)} className="w-full bg-primary hover:bg-primary-dark text-gray-900 font-semibold py-3 rounded-2xl shadow-lg transition-colors text-lg">Continuar Jornada</button>
              </>
            )}
            {!activeJornadaId && (
              <button disabled className="w-full bg-surface text-text-muted font-semibold py-3 rounded-2xl shadow-lg border border-border transition-colors text-lg cursor-not-allowed">Continuar Jornada</button>
            )}
          </div>
        </div>
      </section>

      {/* Formulario para crear turno */}
      {showCrearTurnoForm && (
        <section className="w-full max-w-lg mx-auto bg-surface rounded-2xl shadow-2xl p-10 mb-12 border border-border">
          <h2 className="text-2xl font-bold text-primary mb-6 text-center">Nuevo Turno</h2>
          <form onSubmit={handleCrearTurno} className="space-y-6">
            <div>
              <label className="block text-text text-sm font-medium mb-2">KM Inicial</label>
              <input
                type="number"
                name="kmInicial"
                value={formData.kmInicial}
                onChange={e => setFormData({ ...formData, kmInicial: e.target.value })}
                className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary text-text placeholder-text-muted text-base"
                placeholder="Introduce los KM iniciales"
                required
              />
            </div>
            <div className="flex gap-6 mt-8">
              <button type="submit" className="flex-1 bg-primary hover:bg-primary-dark text-gray-900 font-semibold py-3 rounded-lg transition-colors shadow-md text-lg">Guardar Turno</button>
              <button type="button" onClick={() => setShowCrearTurnoForm(false)} className="flex-1 bg-surface hover:bg-background text-primary font-semibold py-3 rounded-lg border border-primary transition-colors shadow-md text-lg">Cancelar</button>
            </div>
          </form>
        </section>
      )}

      {/* Lista de jornadas */}
      <section className="w-full max-w-6xl bg-surface rounded-2xl shadow-2xl border border-border p-8 mb-16 mt-8">
        <h2 className="text-xl font-bold text-primary mb-4">Historial de Jornadas</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-base">
            <thead>
              <tr className="text-text-muted border-b border-border">
                <th className="py-2 px-4 text-left">ID</th>
                <th className="py-2 px-4 text-left">Fecha</th>
                <th className="py-2 px-4 text-left">Estado</th>
                <th className="py-2 px-4 text-left">Turnos</th>
                <th className="py-2 px-4 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {jornadas.map(j => (
                <tr key={j.idJornada} className="border-b border-border hover:bg-background/40 transition-colors rounded-xl">
                  <td className="py-2 px-4">{j.idJornada}</td>
                  <td className="py-2 px-4">{new Date(j.fechaInicio).toLocaleString()}</td>
                  <td className="py-2 px-4">{j.estado}</td>
                  <td className="py-2 px-4">{j.turnos?.length || 0}</td>
                  <td className="py-2 px-4">
                    <button onClick={() => setModalDetalles({ open: true, jornada: j })} className="text-primary hover:underline text-base">Ver detalles</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Errores */}
      {error && error !== 'Error al cargar turno activo' && (
        <div className="fixed bottom-6 right-6 bg-red-800/90 text-red-100 px-6 py-3 rounded-xl shadow-lg border border-red-700/60">
          {error}
        </div>
      )}

      {/* Modal de detalles */}
      <ModalDetalles
        open={modalDetalles.open}
        onClose={() => setModalDetalles({ open: false, jornada: null })}
        titulo={modalDetalles.jornada ? `Detalles de la Jornada #${modalDetalles.jornada.idJornada}` : ''}
      >
        {modalDetalles.jornada && renderDetallesJornada(modalDetalles.jornada)}
      </ModalDetalles>

      {/* Footer */}
      <footer className="w-full py-8 mt-auto bg-background border-t border-border text-center text-text-muted text-sm">
        TaxiDay &copy; {new Date().getFullYear()} &mdash; Hecho con ❤️ para taxistas
      </footer>
    </div>
  );
}