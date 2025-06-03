import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import ModalDetalles from '../components/ModalDetalles';
import CalendarComponent from '../components/CalendarComponent';
import StatsPanel from '../components/StatsPanel';
import MonthlyStats from '../components/MonthlyStats';
import Header from '../components/Header';
import Footer from '../components/Footer';
import JornadasRecientes from '../components/JornadasRecientes';
import ActiveJornada from '../components/ActiveJornada';
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
        if (resp.status === 404) {
          console.log("No hay turno activo para esta jornada");
          setTurno(null);
          setShowCrearTurnoForm(true);
          return;
        }

        // Intentar obtener el mensaje de error del servidor
        try {
          const errorData = await resp.json();
          throw new Error(errorData.message || `Error al obtener turno activo: ${resp.statusText}`);
        } catch (jsonError) {
          // Si no podemos parsear el JSON, simplemente ignoramos el error
          console.log("No se pudo obtener turno activo, continuando...");
          setTurno(null);
          setShowCrearTurnoForm(true);
          return;
        }
      }
      
      let data;
      try {
        data = await resp.json();
      } catch (jsonError) {
        console.log("Error al parsear respuesta del turno activo, continuando...");
        setTurno(null);
        setShowCrearTurnoForm(true);
        return;
      }

      console.log("Respuesta del turno activo:", data);
      
      if (!data || !data.idTurno) {
        console.log("No se encontró un turno activo válido");
        setTurno(null);
        setShowCrearTurnoForm(true);
        return;
      }
      
      if (!data.carreras) {
        data.carreras = [];
      } else if (!Array.isArray(data.carreras)) {
        data.carreras = [data.carreras];
      }
      
      setTurno(data);
      setShowCrearTurnoForm(false);
    } catch (err) {
      console.error("Error al obtener turno activo:", err);
      // No mostrar el error al usuario
      setTurno(null);
      setShowCrearTurnoForm(true);
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
          body: JSON.stringify({ 
            fechaFinal: new Date().toISOString(),
            zonaHoraria: Intl.DateTimeFormat().resolvedOptions().timeZone
          })
        });

        if (!closeResp.ok) {
          const errorData = await closeResp.json();
          throw new Error(`Error al cerrar jornada anterior: ${errorData.message || closeResp.statusText}`);
        }
        setActiveJornadaId(null);
        setTurno(null);
      } catch (err) {
        setError(err.message);
        setTimeout(() => setError(''), 2000);
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
      setTimeout(() => setError(''), 2000);
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
      setTimeout(() => setError(''), 2000);
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
      setTimeout(() => setSuccessMessage(''), 2000);
      
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
      setTimeout(() => setError(''), 2000);
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
      setTimeout(() => setSuccessMessage(''), 2000);
      
    } catch (err) {
      console.error("Error al crear carrera:", err);
      setError(err.message);
      setTimeout(() => setError(''), 2000);
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

  // Mantener el efecto de información detallada
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
    
    if (selectedDate) {
      const fecha = toDateString(selectedDate);
      console.log("Fecha seleccionada formateada:", fecha);
      console.log("Todas las jornadas disponibles por fecha:", jornadasPorFecha);
      console.log("Jornadas para la fecha seleccionada:", jornadasPorFecha[fecha] || "Ninguna");
    }
  }, [selectedDate, jornadas]);

  // Add a function to handle 'Ver Detalles' button click
  const handleVerDetalles = (jornadaId) => {
    setSelectedJornadaId(jornadaId);
    setDetallesModalOpen(true);
  };

  const handleCerrarJornada = async () => {
                          if (window.confirm('¿Estás seguro de que deseas cerrar esta jornada? Esta acción no se puede deshacer.')) {
                            try {
                              const turnoActivo = jornadas.find(j => j.idJornada === activeJornadaId)?.turnos?.find(t => t.estado?.toLowerCase() === 'abierto');
                              
                              if (turnoActivo) {
                                setError('No puedes cerrar la jornada mientras tengas un turno activo. Por favor, cierra el turno primero.');
                                return;
                              }

                              const closeResp = await fetch(`/api/jornadas/${activeJornadaId}/cerrar`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ 
                                  fechaFinal: new Date().toISOString(),
                                  zonaHoraria: Intl.DateTimeFormat().resolvedOptions().timeZone
                                })
                              });
                              
                              if (!closeResp.ok) {
                                const errorData = await closeResp.json();
                                throw new Error(`Error al cerrar jornada: ${errorData.message || closeResp.statusText}`);
                              }
                              
                              setSuccessMessage('Jornada cerrada correctamente');
                              setActiveJornadaId(null);
                              setTurno(null);
                              
                              const updatedJornadas = jornadas.map(j => {
                                if (j.idJornada === activeJornadaId) {
                                  return { ...j, estado: 'cerrada', fechaFinal: new Date().toISOString() };
                                }
                                return j;
                              });
                              
                              setJornadas(updatedJornadas);
                            } catch (err) {
                              setError(err.message);
                              setTimeout(() => setError(''), 2000);
                            }
                          }
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
      <Header user={user} onLogout={handleLogout} />

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

        {/* Panel de estadísticas */}
        <StatsPanel stats={stats} icons={icons} />
        
        {/* Opciones principales simplificadas: Nueva Jornada y Continuar Jornada */}
        <div className="mb-8">
          <div className="bg-surface/70 backdrop-blur-sm rounded-xl border border-border shadow-lg overflow-hidden">
            <div className="px-6 py-5 border-b border-border">
              <h2 className="text-xl font-bold text-primary">Tu Jornada</h2>
                </div>
            
            <div className="p-6">
              <ActiveJornada
                activeJornadaId={activeJornadaId}
                turno={turno}
                formData={formData}
                setFormData={setFormData}
                onNewJornada={handleNewJornada}
                onCerrarTurno={handleCerrarTurno}
                onCerrarJornada={handleCerrarJornada}
                onCrearTurno={handleCrearTurno}
                loading={loading}
              />
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
                  <CalendarComponent
                    selectedDate={selectedDate}
                    onDateChange={setSelectedDate}
                    jornadas={jornadas}
                    currentMonth={currentMonth}
                    currentYear={currentYear}
                    setCurrentMonth={setCurrentMonth}
                    setCurrentYear={setCurrentYear}
                    setMonthlyStats={setMonthlyStats}
                  />
                    </div>
                
                <p className="text-sm text-text-muted text-center">
                  Los días con jornadas están marcados. Haz clic para ver detalles.
                </p>
                </div>
            </div>
            
            {/* Estadísticas mensuales */}
            <MonthlyStats
              currentMonth={currentMonth}
              currentYear={currentYear}
              monthlyStats={monthlyStats}
            />
          </div>
          
          {/* Panel derecho: Jornadas (del día seleccionado o recientes) */}
          <div className="lg:col-span-2">
            <JornadasRecientes
              selectedDate={selectedDate}
              jornadas={jornadas}
              onNewJornada={handleNewJornada}
              onContinueJornada={handleContinueJornadaClick}
              onVerDetalles={handleVerDetalles}
              setSelectedDate={setSelectedDate}
              setCurrentMonth={setCurrentMonth}
              setCurrentYear={setCurrentYear}
            />
              </div>
                                  </div>
                                </div>
                                
      <Footer />
      
      {/* Modal para detalles */}
      <ModalDetalles 
        isOpen={detallesModalOpen} 
        onClose={() => setDetallesModalOpen(false)} 
        jornadaId={selectedJornadaId}
      />
    </div>
  );
}