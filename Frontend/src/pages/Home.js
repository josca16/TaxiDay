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

  // Añadir estado para mes actual
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [monthlyStats, setMonthlyStats] = useState({
    totalJornadas: 0,
    totalCarreras: 0,
    totalRecaudado: 0
  });

  // Añadir un estado para controlar la animación de destaque
  const [highlightTurnoForm, setHighlightTurnoForm] = useState(false);

  // Add state for modal
  const [detallesModalOpen, setDetallesModalOpen] = useState(false);
  const [selectedTurnoId, setSelectedTurnoId] = useState(null);
  const [selectedJornadaId, setSelectedJornadaId] = useState(null);

  // Iconos para estadísticas
  const icons = [
    <svg key="jornadas" className="w-8 h-8 text-primary mb-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>,
    <svg key="carreras" className="w-8 h-8 text-primary mb-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
    </svg>,
    <svg key="recaudado" className="w-8 h-8 text-primary mb-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
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
        console.log("Obteniendo jornadas para el taxista:", user.idTaxista);
        // Realiza la petición GET al backend para obtener TODAS las jornadas (temporal)
        // IDEALMENTE: Se debería usar un endpoint específico como '/api/taxistas/' + user.idTaxista + '/jornadas'
        const resp = await fetch('/api/jornadas');
        
        if (!resp.ok) {
          throw new Error(`Error al cargar jornadas: ${resp.statusText}`);
        }
        
        const data = await resp.json();
        console.log("Datos recibidos del servidor:", data);
        
        // Filtrar las jornadas para mostrar solo las del taxista actual
        const userJornadas = data.filter(jornada => jornada.taxista?.idTaxista === user.idTaxista);
        
        // Ordenar las jornadas por fecha (más recientes primero)
        userJornadas.sort((a, b) => new Date(b.fechaInicio) - new Date(a.fechaInicio));
        
        console.log('Jornadas del usuario:', userJornadas);
        setJornadas(userJornadas); // Almacena las jornadas filtradas en el estado

        // Calcular estadísticas
        const totalCarreras = userJornadas.reduce((sum, j) => {
          const turnosCarreras = j.turnos?.reduce((tSum, t) => {
            const carrerasCount = Array.isArray(t.carreras) ? t.carreras.length : 0;
            console.log(`Turno ${t.idTurno} tiene ${carrerasCount} carreras`);
            return tSum + carrerasCount;
          }, 0) || 0;
          return sum + turnosCarreras;
        }, 0);
        
        const totalRecaudado = userJornadas.reduce((sum, j) => {
          const turnosRecaudado = j.turnos?.reduce((tSum, t) => {
            const carrerasRecaudo = t.carreras?.reduce((cSum, c) => {
              const importe = parseFloat(c.importeTotal) || 0;
              return cSum + importe;
            }, 0) || 0;
            return tSum + carrerasRecaudo;
          }, 0) || 0;
          return sum + turnosRecaudado;
        }, 0);

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
          console.log('Jornada activa encontrada:', openJornada);
          setActiveJornadaId(openJornada.idJornada);
          fetchTurnoActivo(openJornada.idJornada);
        } else {
          console.log('No se encontró ninguna jornada activa');
          // Limpiar cualquier jornada activa guardada previamente
          setActiveJornadaId(null);
          setTurno(null);
        }

      } catch (err) {
        setError(err.message); // Captura y almacena cualquier error
        console.error('Error al cargar jornadas:', err); // Log de error
      } finally {
        setLoading(false); // Indica que la carga ha terminado (éxito o error)
      }
    };

    fetchJornadas(); // Ejecuta la función de carga
  }, [user]); // El efecto se re-ejecuta si el objeto 'user' cambia

  const fetchTurnoActivo = async (jornadaId) => {
    try {
      console.log(`Buscando turno activo para la jornada ${jornadaId}`);
      const resp = await fetch(`/api/jornadas/${jornadaId}/turno-activo`);
      
      if (!resp.ok) {
        const errorData = await resp.text();
        console.error("Error en respuesta del servidor:", errorData);
        // No vamos a lanzar error aquí, simplemente asumir que no hay turno activo
        console.log("Asumiendo que no hay turno activo para esta jornada");
        setTurno(null);
        return;
      }
      
      const data = await resp.json();
      console.log("Turno activo recibido:", data);
      
      // Verificar si es un turno válido
      if (!data || !data.idTurno) {
        console.log("No se encontró un turno activo válido");
        setTurno(null);
        return;
      }
      
      // Verificar explícitamente si existen carreras y garantizar que sea un array
      if (!data.carreras) {
        data.carreras = [];
      } else if (!Array.isArray(data.carreras)) {
        data.carreras = [data.carreras];
      }
      
      setTurno(data);
    } catch (err) {
      console.error("Error al obtener turno activo:", err);
      setError("Error al cargar turno activo. Puede continuar trabajando.");
      setTurno(null);
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
      
      // Abrir automáticamente el formulario de crear turno con animación
      setShowCrearTurnoForm(true);
      setHighlightTurnoForm(true);
      
      // Scroll hacia el formulario
      setTimeout(() => {
        const turnoFormElement = document.getElementById('nuevo-turno-form');
        if (turnoFormElement) {
          turnoFormElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        
        // Desactivar la animación después de unos segundos
        setTimeout(() => {
          setHighlightTurnoForm(false);
        }, 3000);
      }, 100);
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

    if (!formData.kmFinal) {
      setError('Debe ingresar los kilómetros finales para cerrar el turno.');
      return;
    }

    try {
      const resp = await fetch(`/api/turnos/${turno.idTurno}/cerrar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kmFinal: parseFloat(formData.kmFinal)
        })
      });

      if (!resp.ok) {
        const errorData = await resp.json();
        throw new Error(errorData.message || 'Error al cerrar turno');
      }

      // Actualizar las jornadas para reflejar el cambio
      const updatedJornadas = jornadas.map(j => {
        if (j.idJornada === activeJornadaId) {
          if (j.turnos) {
            j.turnos = j.turnos.map(t => {
              if (t.idTurno === turno.idTurno) {
                return { ...t, estado: 'cerrado', kmFinal: parseFloat(formData.kmFinal), fechaFinal: new Date().toISOString() };
              }
              return t;
            });
          }
        }
        return j;
      });
      
      setJornadas(updatedJornadas);
      setTurno(null);
      setFormData({
        kmInicial: '',
        kmFinal: '',
        importeTotal: '',
        tipoPago: 'efectivo'
      });
      
      // Mostrar mensaje de éxito
      setSuccessMessage('Turno cerrado correctamente');
      setTimeout(() => setSuccessMessage(''), 3000);
      
      // Mostrar formulario para crear nuevo turno
      setShowCrearTurnoForm(true);
      setTimeout(() => {
        const turnoFormElement = document.getElementById('nuevo-turno-form');
        if (turnoFormElement) {
          turnoFormElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    } catch (err) {
      setError(err.message);
    }
  };

  // Maneja la acción de crear carrera
  const handleCrearCarrera = async () => {
    if (!turno || !turno.idTurno) {
      setError('No hay un turno activo para registrar una carrera.');
      return;
    }

    if (!formData.importeTotal) {
      setError('Debe ingresar el importe total de la carrera.');
      return;
    }

    try {
      console.log("Creando carrera para el turno:", turno.idTurno);
      console.log("Datos de la carrera:", formData);
      
      const resp = await fetch(`/api/carreras/turno/${turno.idTurno}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          importeTotal: parseFloat(formData.importeTotal),
          tipoPago: formData.tipoPago,
          fechaInicio: new Date().toISOString()
        })
      });

      if (!resp.ok) {
        const errorData = await resp.json().catch(() => ({}));
        throw new Error(`Error al crear carrera: ${errorData.message || resp.statusText}`);
      }
      
      const newCarrera = await resp.json();
      console.log("Nueva carrera creada:", newCarrera);
      
      // Añadir la carrera al turno actual
      if (!turno.carreras) {
        turno.carreras = [];
      }
      
      turno.carreras.push(newCarrera);
      setTurno({...turno}); // Forzar actualización
      
      // Actualizar también las jornadas para que se refleje la nueva carrera
      const updatedJornadas = jornadas.map(j => {
        if (j.idJornada === activeJornadaId) {
          // Buscar y actualizar el turno en la jornada
          if (j.turnos) {
            j.turnos = j.turnos.map(t => {
              if (t.idTurno === turno.idTurno) {
                // Si el turno ya tiene carreras, añadir la nueva
                if (!t.carreras) {
                  t.carreras = [];
                }
                t.carreras.push(newCarrera);
              }
              return t;
            });
          }
        }
        return j;
      });
      
      setJornadas(updatedJornadas);

      // Limpiar formulario
      setFormData({
        importeTotal: '',
        tipoPago: 'efectivo'
      });
      
      setShowCarreraForm(false);
      setError(null);
      
      // Mostrar mensaje de éxito
      setSuccessMessage('Carrera registrada correctamente');
      setTimeout(() => setSuccessMessage(''), 3000);
      
    } catch (err) {
      console.error("Error al crear carrera:", err);
      setError(err.message);
    }
  };

  // Maneja la acción de cerrar sesión
  const handleLogout = () => {
    logout(); // Llama a la función logout del contexto
    navigate('/'); // Redirige a la página de login
  };

  // Maneja la acción de continuar jornada actual
  const handleContinueJornadaClick = (jornadaId) => {
    const targetJornadaId = jornadaId || activeJornadaId;
    
    if (!targetJornadaId) {
      setError('No hay jornada activa para continuar.');
      return;
    }
    
    setActiveJornadaId(targetJornadaId);
    
    // Si ya hay un turno activo, ir directamente a la página de carreras
    if (turno && turno.idTurno) {
      navigate(`/jornada/${targetJornadaId}/turno/${turno.idTurno}/carrera`);
      return;
    }
    
    // Si no hay turno activo, mostrar formulario de creación de turno con animación destacada
    setShowCrearTurnoForm(true);
    setHighlightTurnoForm(true);
    
    // Scroll hacia el formulario
    setTimeout(() => {
      const turnoFormElement = document.getElementById('nuevo-turno-form');
      if (turnoFormElement) {
        turnoFormElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      
      // Desactivar la animación después de unos segundos
      setTimeout(() => {
        setHighlightTurnoForm(false);
      }, 3000);
    }, 100);
    
    console.log("Continuando jornada: " + targetJornadaId);
  };

  // Modificamos el useEffect para que no redirija automáticamente, sino que sea controlado por el usuario
  useEffect(() => {
    // Solo vamos a verificar que la información sea consistente
    if (activeJornadaId && turno && turno.idTurno) {
      console.log(`Jornada activa: ${activeJornadaId}, Turno activo: ${turno.idTurno}`);
    }
  }, [activeJornadaId, turno]);

  // Función para obtener solo la fecha (sin hora)
  function toDateString(date) {
    // Asegurar que la fecha se maneja correctamente sin importar el formato de entrada
    const d = new Date(date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  // Días con jornadas - Mejorado para evitar problemas con formatos de fecha
  const jornadasPorFecha = {};
  jornadas.forEach(j => {
    // Verificar que j.fechaInicio existe y es válido
    if (j && j.fechaInicio) {
    const fecha = toDateString(j.fechaInicio);
      console.log(`Procesando jornada ${j.idJornada} con fecha ${fecha}`);
    if (!jornadasPorFecha[fecha]) jornadasPorFecha[fecha] = [];
    jornadasPorFecha[fecha].push(j);
    }
  });
  const fechasConJornada = Object.keys(jornadasPorFecha);
  console.log("Fechas con jornadas:", fechasConJornada);

  // Renderizar jornadas y carreras del día seleccionado
  function renderJornadasDelDia() {
    if (!selectedDate) return null;
    
    const fecha = toDateString(selectedDate);
    console.log(`Buscando jornadas para fecha: ${fecha}`);
    
    // Buscar todas las jornadas que coincidan con la fecha seleccionada
    const jornadasDelDia = jornadas.filter(jornada => {
      if (!jornada || !jornada.fechaInicio) return false;
      const jornadaFecha = toDateString(jornada.fechaInicio);
      const coincide = jornadaFecha === fecha;
      console.log(`Jornada ${jornada.idJornada}: ${jornadaFecha} vs ${fecha} = ${coincide}`);
      return coincide;
    });
    
    console.log(`Jornadas encontradas para ${fecha}:`, jornadasDelDia);
    
    if (jornadasDelDia.length === 0) {
      return (
        <div className="bg-background/30 rounded-lg p-6 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-3 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-text-muted">No hay jornadas en este día.</p>
          <button 
            onClick={handleNewJornada}
            className="mt-4 text-primary hover:text-primary-light transition-colors text-sm underline"
          >
            Crear nueva jornada
          </button>
        </div>
      );
    }
    
    return (
      <div className="flex flex-col gap-6 mt-4 max-h-[calc(100vh-400px)] overflow-y-auto pr-2">
        {jornadasDelDia.map(j => (
          <div key={j.idJornada} className="bg-surface rounded-2xl p-6 border border-border shadow flex flex-col gap-2">
            <div className="font-bold text-primary text-lg mb-1">Jornada #{j.idJornada} ({j.estado})</div>
            <div className="text-sm text-text-muted mb-1">Inicio: {new Date(j.fechaInicio).toLocaleString()}</div>
            <div className="text-sm text-text-muted mb-1">Final: {j.fechaFinal ? new Date(j.fechaFinal).toLocaleString() : '—'}</div>
            <div className="font-semibold text-primary mt-2 mb-1">Turnos:</div>
            {j.turnos && j.turnos.length > 0 ? (
              <ul className="flex flex-col gap-2">
                {j.turnos.map(t => (
                  <li key={t.idTurno} className="bg-background rounded-xl p-4 border border-border shadow flex flex-col gap-1">
                    <div className="font-semibold text-text">Turno #{t.idTurno}</div>
                    <div className="text-xs text-text-muted">KM Inicial: {t.kmInicial} | KM Final: {t.kmFinal ?? '—'}</div>
                    <div className="text-xs text-text-muted">Inicio: {new Date(t.fechaInicio).toLocaleString()}</div>
                    <div className="text-xs text-text-muted">Final: {t.fechaFinal ? new Date(t.fechaFinal).toLocaleString() : '—'}</div>
                    <div className="font-semibold text-primary mt-2 mb-1">Carreras:</div>
                    {t.carreras && t.carreras.length > 0 ? (
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
      <div className="bg-surface/80 rounded-lg p-4 mb-4 border border-border shadow-sm">
        <div className="flex justify-between items-center mb-2">
          <div>
            <span className="text-lg font-semibold text-text">Jornada {jornada.idJornada}</span>
            {jornada.estado && (
              <span className={`ml-2 inline-block px-2 py-0.5 rounded-full text-xs ${
                jornada.estado.toLowerCase() === 'cerrada' ? 'bg-gray-700/30 text-gray-400 border border-gray-700/40' : 'bg-green-900/30 text-green-400 border border-green-800/40'
              }`}>
                {jornada.estado}
              </span>
            )}
        </div>
          <div className="text-text-muted text-sm">
            {jornada.fechaInicio && new Date(jornada.fechaInicio).toLocaleDateString()}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 text-sm mb-4">
        <div>
            <p className="text-text-muted">Inicio</p>
            <p className="font-medium">{jornada.fechaInicio ? new Date(jornada.fechaInicio).toLocaleTimeString() : 'N/A'}</p>
          </div>
          <div>
            <p className="text-text-muted">Fin</p>
            <p className="font-medium">{jornada.fechaFinal ? new Date(jornada.fechaFinal).toLocaleTimeString() : 'En curso'}</p>
          </div>
          <div>
            <p className="text-text-muted">Turnos</p>
            <p className="font-medium">{jornada.turnos ? jornada.turnos.length : 0}</p>
          </div>
        </div>

        <div className="flex space-x-2">
          {jornada.estado?.toLowerCase() === 'activa' && (
            <button
              onClick={() => handleContinueJornadaClick(jornada.idJornada)}
              className="flex-1 bg-primary hover:bg-primary-dark text-gray-900 font-medium px-4 py-2 rounded-lg transition-colors shadow-sm"
            >
              Continuar Jornada
            </button>
          )}
          <button
            onClick={() => handleVerDetalles(jornada.turnos?.[0]?.idTurno, jornada.idJornada)}
            className={`${jornada.estado?.toLowerCase() === 'activa' ? '' : 'flex-1'} bg-gray-700 hover:bg-gray-600 text-white font-medium px-4 py-2 rounded-lg transition-colors shadow-sm text-sm`}
          >
            Ver Detalles
          </button>
        </div>
      </div>
    );
  }

  // Modificar la función que maneja el cambio de fecha en el calendario
  const handleCalendarChange = (date) => {
    setSelectedDate(date);
    // Actualizar mes y año actual cuando cambie la fecha
    if (date.getMonth() !== currentMonth || date.getFullYear() !== currentYear) {
      setCurrentMonth(date.getMonth());
      setCurrentYear(date.getFullYear());
    }
  };

  // Efecto para calcular estadísticas mensuales cuando cambie el mes o las jornadas
  useEffect(() => {
    // Filtrar jornadas por mes actual
    const jornadasDelMes = jornadas.filter(jornada => {
      if (!jornada || !jornada.fechaInicio) return false;
      const fecha = new Date(jornada.fechaInicio);
      return fecha.getMonth() === currentMonth && fecha.getFullYear() === currentYear;
    });

    // Calcular estadísticas para el mes
    const totalCarreras = jornadasDelMes.reduce((sum, j) => 
      sum + (j.turnos?.reduce((tSum, t) => 
        tSum + (t.carreras?.length || 0), 0) || 0), 0);
    
    const totalRecaudado = jornadasDelMes.reduce((sum, j) => 
      sum + (j.turnos?.reduce((tSum, t) => 
        tSum + (t.carreras?.reduce((cSum, c) => 
          cSum + (parseFloat(c.importeTotal) || 0), 0) || 0), 0) || 0), 0);

    setMonthlyStats({
      totalJornadas: jornadasDelMes.length,
      totalCarreras,
      totalRecaudado
    });
  }, [jornadas, currentMonth, currentYear]);

  // Efecto para mostrar información detallada sobre las jornadas y fechas
  useEffect(() => {
    // Crear un registro de jornadas por fecha para depuración
    const fechasRegistro = {};
    jornadas.forEach(j => {
      if (j && j.fechaInicio) {
        const fechaOriginal = j.fechaInicio;
        const fechaObj = new Date(fechaOriginal);
        const fechaFormateada = toDateString(fechaOriginal);
        
        if (!fechasRegistro[fechaFormateada]) {
          fechasRegistro[fechaFormateada] = [];
        }
        
        fechasRegistro[fechaFormateada].push({
          id: j.idJornada,
          fechaOriginal,
          fechaObjToString: fechaObj.toString(),
          toISOString: fechaObj.toISOString(),
          turnos: j.turnos?.length || 0,
          totalCarreras: j.turnos?.reduce((total, t) => total + (t.carreras?.length || 0), 0) || 0
        });
      }
    });
    
    console.log("Registro detallado de fechas y jornadas:", fechasRegistro);
    
    // Actualizar las jornadas del día cuando cambia el día seleccionado o las jornadas
    if (selectedDate) {
      const fecha = toDateString(selectedDate);
      console.log("Fecha seleccionada formateada:", fecha);
      console.log("Todas las jornadas disponibles por fecha:", jornadasPorFecha);
      console.log("Jornadas para la fecha seleccionada:", jornadasPorFecha[fecha] || "Ninguna");
    }
  }, [selectedDate, jornadas]);

  // Add a function to handle 'Ver Detalles' button click
  const handleVerDetalles = (turnoId, jornadaId) => {
    setSelectedTurnoId(turnoId);
    setSelectedJornadaId(jornadaId);
    setDetallesModalOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-xl text-gray-300">Cargando...</div>
      </div>
    );
  }

  // Nuevo renderizado con el estilo moderno
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/10 flex flex-col">
      {/* Header con navegación y datos del usuario */}
      <header className="w-full bg-surface/60 backdrop-blur-sm border-b border-border shadow-md">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="bg-primary p-2 rounded-lg shadow">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
          </div>
            <h1 className="text-2xl font-bold text-primary">TaxiDay</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            {user && (
              <div className="text-right">
                <p className="text-text font-medium">{user.nombre} {user.apellidos}</p>
                <p className="text-text-muted text-sm">Licencia: {user.licencia}</p>
              </div>
            )}
            <button 
              onClick={handleLogout}
              className="bg-primary/10 hover:bg-primary/20 text-primary px-4 py-2 rounded-lg transition-colors"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </header>

      {/* Contenido principal */}
      <div className="flex-1 container mx-auto px-6 py-8">
        {/* Mensajes de error y éxito */}
        {error && (
          <div className="mb-6 bg-red-800/40 border border-red-700/50 text-red-200 px-6 py-4 rounded-lg text-sm animate-fade-in">
            {error}
          </div>
        )}

      {successMessage && (
          <div className="mb-6 bg-green-800/40 border border-green-700/50 text-green-200 px-6 py-4 rounded-lg text-sm animate-fade-in">
          {successMessage}
          </div>
      )}

        {/* Panel de estadísticas (más compacto) */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-surface/70 backdrop-blur-sm p-4 rounded-xl border border-border shadow-lg flex items-center space-x-3">
            <div className="bg-primary/20 p-2 rounded-lg">
              {icons[0]}
          </div>
            <div>
              <p className="text-2xl font-bold text-primary">{stats.totalJornadas}</p>
              <p className="text-text-muted text-xs">Jornadas</p>
            </div>
          </div>
          
          <div className="bg-surface/70 backdrop-blur-sm p-4 rounded-xl border border-border shadow-lg flex items-center space-x-3">
            <div className="bg-primary/20 p-2 rounded-lg">
              {icons[1]}
              </div>
            <div>
              <p className="text-2xl font-bold text-primary">{stats.totalCarreras}</p>
              <p className="text-text-muted text-xs">Carreras</p>
            </div>
          </div>

          <div className="bg-surface/70 backdrop-blur-sm p-4 rounded-xl border border-border shadow-lg flex items-center space-x-3">
            <div className="bg-primary/20 p-2 rounded-lg">
              {icons[2]}
            </div>
            <div>
              <p className="text-2xl font-bold text-primary">{stats.totalRecaudado.toFixed(2)}€</p>
              <p className="text-text-muted text-xs">Recaudación</p>
            </div>
          </div>
        </div>
        
        {/* Opciones principales simplificadas: Nueva Jornada y Continuar Jornada */}
        <div className="mb-8">
          <div className="bg-surface/70 backdrop-blur-sm rounded-xl border border-border shadow-lg overflow-hidden">
            <div className="px-6 py-5 border-b border-border">
              <h2 className="text-xl font-bold text-primary">Tu Jornada</h2>
            </div>
            
            <div className="p-6">
              {activeJornadaId ? (
                // Si hay una jornada activa
                <div className="flex flex-col items-center">
                  <div className="bg-green-500/20 rounded-full p-4 mb-4">
                    <svg className="w-16 h-16 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  
                  <h3 className="text-lg font-bold text-primary mb-2">Jornada Activa #{activeJornadaId}</h3>
                  <p className="text-center text-text-muted mb-6">
                    {turno 
                      ? `Tienes un turno activo (#${turno.idTurno}). Continúa registrando tus carreras.`
                      : "Tu jornada está activa. Crea un nuevo turno para comenzar a registrar carreras."}
                  </p>
                  
                  {turno ? (
                    <div className="w-full max-w-md">
                      <div className="bg-surface/80 rounded-lg p-5 border border-border mb-4">
                        <div className="flex flex-col gap-3">
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="font-semibold text-primary">Turno #{turno.idTurno}</h4>
                            <span className="text-sm text-text-muted">Inicio: {new Date(turno.fechaInicio).toLocaleTimeString()}</span>
                          </div>
                          <div className="flex items-center gap-4 mb-4">
                            <div className="flex-1">
                              <label htmlFor="kmFinal" className="block text-sm font-medium text-text-muted mb-1">
                                Kilómetros finales:
                              </label>
                              <input
                                id="kmFinal"
                                type="text"
                                inputMode="decimal"
                                name="kmFinal"
                                value={formData.kmFinal}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  if (value === '' || /^[0-9]*\.?[0-9]*$/.test(value)) {
                                    setFormData(prev => ({ ...prev, kmFinal: value }));
                                  }
                                }}
                                placeholder="Ingrese km finales"
                                className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary text-text"
                              />
          </div>
                            <div className="text-sm text-text-muted">
                              <p>KM iniciales: <span className="font-medium">{turno.kmInicial}</span></p>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <button
                              onClick={() => navigate(`/jornada/${activeJornadaId}/turno/${turno.idTurno}/carrera`)}
                              className="flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-gray-900 font-medium px-4 py-3 rounded-lg transition-colors shadow-md"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                              </svg>
                              Registrar Carrera
                            </button>
                            <button
                              onClick={handleCerrarTurno}
                              className="flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-700 text-white font-medium px-4 py-3 rounded-lg transition-colors shadow-md"
                              disabled={!formData.kmFinal}
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              Cerrar Turno
                            </button>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={async () => {
                          if (window.confirm('¿Estás seguro de que deseas cerrar esta jornada? Esta acción no se puede deshacer.')) {
                            try {
                              const closeResp = await fetch(`/api/jornadas/${activeJornadaId}/cerrar`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ fechaFinal: new Date().toISOString() })
                              });
                              
                              if (!closeResp.ok) {
                                const errorData = await closeResp.json();
                                throw new Error(`Error al cerrar jornada: ${errorData.message || closeResp.statusText}`);
                              }
                              
                              setSuccessMessage('Jornada cerrada correctamente');
                              setActiveJornadaId(null);
                              setTurno(null);
                              
                              // Actualizar las jornadas para reflejar el cambio
                              const updatedJornadas = jornadas.map(j => {
                                if (j.idJornada === activeJornadaId) {
                                  return { ...j, estado: 'cerrada', fechaFinal: new Date().toISOString() };
                                }
                                return j;
                              });
                              
                              setJornadas(updatedJornadas);
                            } catch (err) {
                              setError(err.message);
                            }
                          }
                        }}
                        className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-medium px-4 py-2 rounded-lg transition-colors shadow-md mt-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Cerrar Jornada
                      </button>
              </div>
                  ) : (
                    <div className="w-full max-w-md">
                      <div className="bg-surface/80 rounded-lg p-5 border border-border mb-4">
                        <form onSubmit={handleCrearTurno}>
                          <div className="mb-4">
                            <label className="block text-sm font-medium text-text mb-1">
                              KM Iniciales
                            </label>
                            <input
                              type="text"
                              inputMode="decimal"
                              name="kmInicial"
                              value={formData.kmInicial}
                              onChange={(e) => {
                                const value = e.target.value;
                                if (value === '' || /^[0-9]*\.?[0-9]*$/.test(value)) {
                                  setFormData(prev => ({ ...prev, kmInicial: value }));
                                }
                              }}
                              className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary text-text"
                              required
                            />
          </div>

                          <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary hover:bg-primary-dark text-gray-900 font-medium px-4 py-2 rounded-lg transition-colors shadow-sm"
                          >
                            {loading ? (
                              <span className="flex items-center justify-center">
                                <span className="animate-spin h-4 w-4 mr-2 border-t-2 border-gray-900 border-r-2 rounded-full"></span>
                                Creando...
                              </span>
                            ) : 'Crear Turno'}
                          </button>
                        </form>
                      </div>
                      
                      <button
                        onClick={async () => {
                          if (window.confirm('¿Estás seguro de que deseas cerrar esta jornada? Esta acción no se puede deshacer.')) {
                            try {
                              const closeResp = await fetch(`/api/jornadas/${activeJornadaId}/cerrar`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ fechaFinal: new Date().toISOString() })
                              });
                              
                              if (!closeResp.ok) {
                                const errorData = await closeResp.json();
                                throw new Error(`Error al cerrar jornada: ${errorData.message || closeResp.statusText}`);
                              }
                              
                              setSuccessMessage('Jornada cerrada correctamente');
                              setActiveJornadaId(null);
                              setTurno(null);
                              
                              // Actualizar las jornadas para reflejar el cambio
                              const updatedJornadas = jornadas.map(j => {
                                if (j.idJornada === activeJornadaId) {
                                  return { ...j, estado: 'cerrada', fechaFinal: new Date().toISOString() };
                                }
                                return j;
                              });
                              
                              setJornadas(updatedJornadas);
                            } catch (err) {
                              setError(err.message);
                            }
                          }
                        }}
                        className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-medium px-4 py-2 rounded-lg transition-colors shadow-md"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Cerrar Jornada
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                // Si no hay jornada activa
                <div className="flex flex-col items-center">
                  <div className="bg-primary/20 rounded-full p-4 mb-4">
                    <svg className="w-16 h-16 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  
                  <h3 className="text-lg font-bold text-primary mb-2">No hay jornada activa</h3>
                  <p className="text-center text-text-muted mb-6 max-w-md">
                    Para comenzar a registrar tus carreras, crea una nueva jornada. Esto te permitirá 
                    llevar un registro organizado de tus actividades diarias.
                  </p>
                  
                  <button
                    onClick={handleNewJornada}
                    disabled={loading}
                    className="flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-gray-900 font-medium px-6 py-3 rounded-lg transition-colors shadow-md w-full max-w-xs"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center">
                        <span className="animate-spin h-4 w-4 mr-2 border-t-2 border-gray-900 border-r-2 rounded-full"></span>
                        Creando...
                      </span>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Nueva Jornada
              </>
            )}
                  </button>
                </div>
            )}
            </div>
          </div>
        </div>

        {/* Sección combinada: Calendario y Jornadas */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Panel izquierdo: Calendario */}
          <div className="lg:col-span-1">
            <div className="bg-surface/70 backdrop-blur-sm rounded-xl border border-border shadow-lg overflow-hidden mb-8">
              <div className="px-6 py-5 border-b border-border">
                <h2 className="text-xl font-bold text-primary">Calendario</h2>
              </div>
              
              <div className="p-4">
                <div className="mb-4 react-calendar-container">
                  <Calendar
                    onChange={handleCalendarChange}
                    value={selectedDate || new Date()}
                    onActiveStartDateChange={({ activeStartDate }) => {
                      if (activeStartDate) {
                        setCurrentMonth(activeStartDate.getMonth());
                        setCurrentYear(activeStartDate.getFullYear());
                      }
                    }}
                    tileClassName={({ date, view }) => {
                      if (view === 'month') {
                        const dateString = toDateString(date);
                        // Comprobar si hay jornadas para este día
                        const hasJornada = fechasConJornada.includes(dateString);
                        return hasJornada ? 'has-jornada' : null;
                      }
                    }}
                  />
                    </div>
                
                <p className="text-sm text-text-muted text-center">
                  Los días con jornadas están marcados. Haz clic para ver detalles.
                </p>
                </div>
            </div>
            
            {/* Estadísticas mensuales */}
            <div className="bg-surface/70 backdrop-blur-sm rounded-xl border border-border shadow-lg overflow-hidden">
              <div className="px-6 py-5 border-b border-border">
                <h2 className="text-xl font-bold text-primary">Estadísticas Mensuales</h2>
              </div>
              
              <div className="p-6">
                <h3 className="text-lg font-medium mb-4">
                  {new Date(currentYear, currentMonth).toLocaleString('es', { month: 'long', year: 'numeric' })}
                </h3>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-text-muted">Jornadas:</span>
                    <span className="font-semibold">{monthlyStats.totalJornadas}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-text-muted">Carreras:</span>
                    <span className="font-semibold">{monthlyStats.totalCarreras}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-text-muted">Recaudación:</span>
                    <span className="font-semibold text-primary">{monthlyStats.totalRecaudado.toFixed(2)}€</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Panel derecho: Jornadas (del día seleccionado o recientes) */}
          <div className="lg:col-span-2">
            <div className="bg-surface/70 backdrop-blur-sm rounded-xl border border-border shadow-lg overflow-hidden">
              <div className="px-6 py-5 border-b border-border flex justify-between items-center">
                <h2 className="text-xl font-bold text-primary">
                  {selectedDate 
                    ? `Jornadas del ${selectedDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}` 
                    : 'Jornadas Recientes'}
                </h2>
                
                {selectedDate ? (
                  <button 
                    onClick={() => setSelectedDate(null)} 
                    className="text-text-muted hover:text-text text-sm"
                  >
                    Ver recientes
                  </button>
                ) : (
                  <button 
                    onClick={() => setSelectedDate(new Date())} 
                    className="text-text-muted hover:text-text text-sm"
                  >
                    Ver hoy
                  </button>
                )}
              </div>
              
              <div className="p-6">
                {selectedDate ? (
                  // Jornadas del día seleccionado
                  <div className="space-y-4">
                    {(() => {
                      const fecha = toDateString(selectedDate);
                      const jornadasDelDia = jornadas.filter(jornada => {
                        if (!jornada || !jornada.fechaInicio) return false;
                        return toDateString(jornada.fechaInicio) === fecha;
                      });
                      
                      if (jornadasDelDia.length === 0) {
                        return (
                          <div className="bg-background/30 rounded-lg p-6 text-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-3 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <p className="text-text-muted">No hay jornadas en este día.</p>
                            <button 
                              onClick={handleNewJornada}
                              className="mt-4 text-primary hover:text-primary-light transition-colors text-sm underline"
                            >
                              Crear nueva jornada
                            </button>
                          </div>
                        );
                      }
                      
                      // Ordenar jornadas por hora de inicio (más recientes primero)
                      jornadasDelDia.sort((a, b) => new Date(b.fechaInicio) - new Date(a.fechaInicio));
                      
                      return (
                        <ul className="space-y-3">
                          {jornadasDelDia.map(jornada => (
                            <li key={jornada.idJornada} className="bg-surface/80 rounded-lg border border-border shadow-sm overflow-hidden">
                              <div className="p-4">
                                <div className="flex justify-between items-center mb-2">
                                  <div className="flex items-center">
                                    <span className="text-lg font-semibold text-text">Jornada #{jornada.idJornada}</span>
                                    {jornada.estado && (
                                      <span className={`ml-2 inline-block px-2 py-0.5 rounded-full text-xs ${
                                        jornada.estado.toLowerCase() === 'cerrada' 
                                          ? 'bg-gray-700/30 text-gray-400 border border-gray-700/40' 
                                          : 'bg-green-900/30 text-green-400 border border-green-800/40'
                                      }`}>
                                        {jornada.estado}
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-text-muted text-sm">
                                    {jornada.fechaInicio && new Date(jornada.fechaInicio).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                  </div>
                                </div>
                                
                                {/* Resumen de la jornada */}
                                <div className="grid grid-cols-3 gap-2 text-sm mb-3">
                                  <div>
                                    <span className="text-text-muted">Turnos:</span>
                                    <span className="font-medium ml-1">{jornada.turnos?.length || 0}</span>
                                  </div>
                                  <div>
                                    <span className="text-text-muted">Carreras:</span>
                                    <span className="font-medium ml-1">
                                      {jornada.turnos?.reduce((total, t) => total + (t.carreras?.length || 0), 0) || 0}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-text-muted">Total:</span>
                                    <span className="font-medium ml-1 text-primary">
                                      {jornada.turnos?.reduce((sum, t) => 
                                        sum + (t.carreras?.reduce((cSum, c) => 
                                          cSum + (parseFloat(c.importeTotal) || 0), 0) || 0), 0).toFixed(2)}€
                                    </span>
                                  </div>
                                </div>
                                
                                {/* Botones de acción */}
                                <div className="flex space-x-2">
                                  {jornada.estado?.toLowerCase() === 'activa' && (
                                    <button
                                      onClick={() => handleContinueJornadaClick(jornada.idJornada)}
                                      className="flex-1 bg-primary hover:bg-primary-dark text-gray-900 font-medium px-4 py-2 rounded-lg transition-colors shadow-sm text-sm"
                                    >
                                      Continuar Jornada
                                    </button>
                                  )}
                                  <button
                                    onClick={() => handleVerDetalles(jornada.turnos?.[0]?.idTurno, jornada.idJornada)}
                                    className={`${jornada.estado?.toLowerCase() === 'activa' ? 'flex-1' : 'w-full'} 
                                      bg-gray-700 hover:bg-gray-600 text-white font-medium px-4 py-2 rounded-lg transition-colors shadow-sm text-sm`}
                                  >
                                    Ver Detalles
                                  </button>
                                </div>
                              </div>
                            </li>
                          ))}
                        </ul>
                      );
                    })()}
            </div>
                ) : (
                  // Jornadas recientes
                  <div className="space-y-3">
                    {jornadas.slice(0, 5).map(jornada => (
                      <div key={jornada.idJornada} className="bg-surface/80 rounded-lg border border-border shadow-sm overflow-hidden">
                        <div className="p-4">
                          <div className="flex justify-between items-center mb-2">
                            <div className="flex items-center">
                              <span className="text-lg font-semibold text-text">Jornada #{jornada.idJornada}</span>
                              {jornada.estado && (
                                <span className={`ml-2 inline-block px-2 py-0.5 rounded-full text-xs ${
                                  jornada.estado.toLowerCase() === 'cerrada' 
                                    ? 'bg-gray-700/30 text-gray-400 border border-gray-700/40' 
                                    : 'bg-green-900/30 text-green-400 border border-green-800/40'
                                }`}>
                                  {jornada.estado}
                                </span>
                              )}
                            </div>
                            <div className="text-text-muted text-sm">
                              {jornada.fechaInicio && new Date(jornada.fechaInicio).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                            </div>
                          </div>
                          
                          {/* Resumen de la jornada */}
                          <div className="grid grid-cols-3 gap-2 text-sm mb-3">
                            <div>
                              <span className="text-text-muted">Turnos:</span>
                              <span className="font-medium ml-1">{jornada.turnos?.length || 0}</span>
        </div>
                            <div>
                              <span className="text-text-muted">Carreras:</span>
                              <span className="font-medium ml-1">
                                {jornada.turnos?.reduce((total, t) => total + (t.carreras?.length || 0), 0) || 0}
                              </span>
                            </div>
                            <div>
                              <span className="text-text-muted">Total:</span>
                              <span className="font-medium ml-1 text-primary">
                                {jornada.turnos?.reduce((sum, t) => 
                                  sum + (t.carreras?.reduce((cSum, c) => 
                                    cSum + (parseFloat(c.importeTotal) || 0), 0) || 0), 0).toFixed(2)}€
                              </span>
                            </div>
                          </div>
                          
                          {/* Botones de acción */}
                          <button
                            onClick={() => jornada.estado?.toLowerCase() === 'activa' 
                              ? handleContinueJornadaClick(jornada.idJornada) 
                              : handleVerDetalles(jornada.turnos?.[0]?.idTurno, jornada.idJornada)}
                            className={`w-full font-medium px-4 py-2 rounded-lg transition-colors shadow-sm text-sm ${
                              jornada.estado?.toLowerCase() === 'activa' 
                                ? 'bg-primary hover:bg-primary-dark text-gray-900' 
                                : 'bg-gray-700 hover:bg-gray-600 text-white'
                            }`}
                          >
                            {jornada.estado?.toLowerCase() === 'activa' ? 'Continuar Jornada' : 'Ver Detalles'}
                          </button>
                        </div>
                      </div>
                    ))}
                    
                    {jornadas.length > 5 && (
                      <button 
                        onClick={() => {
                          const fechaHoy = new Date();
                          setSelectedDate(fechaHoy);
                          setCurrentMonth(fechaHoy.getMonth());
                          setCurrentYear(fechaHoy.getFullYear());
                        }}
                        className="w-full py-2 text-primary hover:bg-primary/5 transition-colors rounded-lg text-center text-sm mt-2"
                      >
                        Ver más jornadas
                      </button>
                    )}
                    
                    {jornadas.length === 0 && (
                      <div className="bg-background/30 rounded-lg p-6 text-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-3 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="text-text-muted">No hay jornadas registradas todavía.</p>
                        <button 
                          onClick={handleNewJornada}
                          className="mt-4 text-primary hover:text-primary-light transition-colors text-sm underline"
                        >
                          Crear nueva jornada
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full py-4 bg-surface/60 backdrop-blur-sm border-t border-border">
        <div className="container mx-auto px-6 text-center">
          <p className="text-text-muted text-sm">© {new Date().getFullYear()} TaxiDay | Todos los derechos reservados</p>
        </div>
      </footer>
      
      {/* Modal para detalles */}
      <ModalDetalles 
        isOpen={detallesModalOpen} 
        onClose={() => setDetallesModalOpen(false)} 
        turnoId={selectedTurnoId}
        jornadaId={selectedJornadaId}
      />
    </div>
  );
}