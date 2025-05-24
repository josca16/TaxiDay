import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ModalDetalles from '../components/ModalDetalles';
import ErrorMessage from '../components/ErrorMessage';

export default function CarreraPage() {
  const { jornadaId, turnoId } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  const [carreraData, setCarreraData] = useState({
    precio: '',
    precioTaximetro: '',
    tipoPago: 'efectivo',
    esAeropuerto: false,
    esEmisora: false,
    notas: ''
  });
  const [error, setError] = useState('');
  const [errorType, setErrorType] = useState('error_general');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [turnoCerrado, setTurnoCerrado] = useState(false);
  const [carreras, setCarreras] = useState([]);
  const [turnoInfo, setTurnoInfo] = useState(null);
  const [loadingCarreras, setLoadingCarreras] = useState(true);
  const [kmModalOpen, setKmModalOpen] = useState(false);
  const [kmFinal, setKmFinal] = useState('');
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [cerrarJornada, setCerrarJornada] = useState(false);
  
  // Estado para notas del turno
  const [turnoNotas, setTurnoNotas] = useState('');
  const [editandoNotas, setEditandoNotas] = useState(false);
  const [guardandoNotas, setGuardandoNotas] = useState(false);
  
  // Estados para gestionar las pausas
  const [estadoPausa, setEstadoPausa] = useState('activo');
  const [tiempoPausado, setTiempoPausado] = useState('00:00:00');
  const [tiempoTrabajado, setTiempoTrabajado] = useState('00:00:00');
  const [tiempoTotal, setTiempoTotal] = useState('00:00:00');
  const [loadingPausa, setLoadingPausa] = useState(false);
  const [intervaloEstadisticas, setIntervaloEstadisticas] = useState(null);

  // Mover la función fetchTurnoYCarreras fuera del useEffect para que esté disponible en todo el componente
  const fetchTurnoYCarreras = async () => {
    if (!isAuthenticated || !user || !turnoId) return;
    setLoadingCarreras(true);
    try {
      // Obtener info del turno
      const respTurno = await fetch(`/api/turnos/${turnoId}`);
      if (!respTurno.ok) throw new Error('Error al cargar datos del turno');
      const dataTurno = await respTurno.json();
      console.log('Datos del turno recibidos:', dataTurno);
      
      // Corregir el formato de fecha si viene en otro formato
      if (dataTurno.fechaInicio && !dataTurno.horaInicio) {
        dataTurno.horaInicio = dataTurno.fechaInicio;
      }
      
      setTurnoInfo(dataTurno);
      
      // Inicializar las notas del turno y asegurarse de que se muestren correctamente
      if (dataTurno.notas !== undefined) {
        console.log('Notas recibidas del servidor:', dataTurno.notas);
        setTurnoNotas(dataTurno.notas || '');
      }
      
      if (dataTurno.estado && dataTurno.estado.toLowerCase() === 'cerrado') {
        setTurnoCerrado(true);
      } else {
        setTurnoCerrado(false);
      }
      
      // Obtener carreras del turno - Manejar mejor el caso donde no hay carreras
      try {
        const respCarreras = await fetch(`/api/turnos/${turnoId}/carreras`);
        if (respCarreras.ok) {
          const dataCarreras = await respCarreras.json();
          console.log('Carreras recibidas:', dataCarreras); // Log para debugging
          
          if (Array.isArray(dataCarreras)) {
            setCarreras(dataCarreras);
          } else if (dataCarreras && typeof dataCarreras === 'object') {
            // Si recibimos un objeto en lugar de un array, intentamos adaptarlo
            setCarreras([dataCarreras]);
          } else {
            setCarreras([]);
          }
        } else {
          // Si el endpoint devuelve error, asumimos que no hay carreras en vez de mostrar un error
          console.log('No se encontraron carreras para este turno (código de error)');
          setCarreras([]);
        }
      } catch (err) {
        console.log('No se encontraron carreras para este turno, es normal para turnos nuevos');
        setCarreras([]);
      }
    } catch (err) {
      console.error('Error cargando datos del turno:', err);
      setError("Error al cargar datos del turno. Inténtalo de nuevo más tarde.");
    } finally {
      setLoadingCarreras(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
        setError("Usuario no autenticado. Por favor, inicie sesión.");
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    fetchTurnoYCarreras();
  }, [isAuthenticated, user, turnoId, successMessage]);

  // Después del useEffect que carga el turno y carreras, añadir otro para obtener estadísticas periódicamente
  useEffect(() => {
    // Si hay un turno activo y no está cerrado, obtener estadísticas iniciales y establecer intervalo
    if (turnoId && !turnoCerrado) {
      // Cargar estadísticas iniciales
      obtenerEstadisticasTurno();
      
      // Configurar actualización periódica cada 10 segundos
      const intervalo = setInterval(() => {
        obtenerEstadisticasTurno();
      }, 10000);
      
      setIntervaloEstadisticas(intervalo);
      
      // Limpiar intervalo al desmontar
      return () => {
        if (intervalo) {
          clearInterval(intervalo);
        }
      };
    }
  }, [turnoId, turnoCerrado]);
  
  // Función para obtener estadísticas actualizadas del turno
  const obtenerEstadisticasTurno = async () => {
    if (!turnoId) return;
    
      try {
      const resp = await fetch(`/api/turnos/${turnoId}/estadisticas`);
      if (!resp.ok) throw new Error('Error al obtener estadísticas');
      
        const data = await resp.json();
      console.log('Estadísticas recibidas:', data);
      
      // Actualizar estados con la información recibida
      setEstadoPausa(data.estadoPausa);
      setTiempoPausado(data.tiempoPausado);
      setTiempoTrabajado(data.tiempoTrabajado);
      setTiempoTotal(data.tiempoTotal);
      
    } catch (err) {
      console.error('Error obteniendo estadísticas:', err);
    }
  };
  
  // Función para pausar el turno
  const handlePausarTurno = async () => {
    if (turnoCerrado) return;
    
    setLoadingPausa(true);
    try {
      const resp = await fetch(`/api/turnos/${turnoId}/pausar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!resp.ok) {
        const data = await resp.json().catch(() => ({ message: resp.statusText }));
        throw new Error(data.message || 'Error al pausar turno');
      }
      
      const data = await resp.json();
      console.log('Turno pausado:', data);
      
      setEstadoPausa('pausado');
      setSuccessMessage('Turno pausado. Timer detenido.');
      
      // Actualizar estadísticas inmediatamente
      obtenerEstadisticasTurno();
      
      // Limpiar mensaje después de 3 segundos
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
      
      } catch (err) {
      console.error('Error pausando turno:', err);
      setError(err.message || 'Error al pausar turno');
    } finally {
      setLoadingPausa(false);
    }
  };
  
  // Función para reanudar el turno
  const handleReanudarTurno = async () => {
    if (turnoCerrado) return;
    
    setLoadingPausa(true);
    try {
      const resp = await fetch(`/api/turnos/${turnoId}/reanudar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!resp.ok) {
        const data = await resp.json().catch(() => ({ message: resp.statusText }));
        throw new Error(data.message || 'Error al reanudar turno');
      }
      
      const data = await resp.json();
      console.log('Turno reanudado:', data);
      
      setEstadoPausa('activo');
      setSuccessMessage('Turno reanudado. Timer en marcha.');
      
      // Actualizar estadísticas inmediatamente
      obtenerEstadisticasTurno();
      
      // Limpiar mensaje después de 3 segundos
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
      
    } catch (err) {
      console.error('Error reanudando turno:', err);
      setError(err.message || 'Error al reanudar turno');
    } finally {
      setLoadingPausa(false);
    }
  };

  // Validación de turnoId después de los hooks
  const turnoIdValido = turnoId && turnoId !== 'undefined' && !isNaN(Number(turnoId)) && Number(turnoId) > 0;
  if (!turnoIdValido) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="bg-red-900/80 text-red-100 p-8 rounded-xl shadow-xl text-center max-w-md border border-red-800">
          <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="text-2xl font-bold mb-4">Error de Turno</h2>
          <ErrorMessage
            message="No hay turno activo o el ID de turno es inválido."
            type="error_general"
          />
          <button
            onClick={() => navigate('/home')}
            className="w-full bg-primary hover:bg-primary-dark text-gray-900 font-semibold py-3 px-6 rounded-lg transition-colors shadow-md"
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

    if (!carreraData.precio || parseFloat(carreraData.precio) <= 0) {
      setError('Por favor, introduce un precio válido mayor que 0.');
      setLoading(false);
      return;
    }

    const precioTaximetro = carreraData.precioTaximetro ? parseFloat(carreraData.precioTaximetro) : 0;
    const precioTotal = parseFloat(carreraData.precio);
    
    if (precioTaximetro > precioTotal) {
      setError('El importe del taxímetro no puede ser mayor que el importe total.');
      setLoading(false);
      return;
    }

    try {
      const tipoPagoFinal = carreraData.tipoPago || 'efectivo';
      
      // Datos a enviar al servidor
      const datosCarrera = {
        importeTotal: precioTotal,
        importeTaximetro: precioTaximetro,
        tipoPago: tipoPagoFinal,
        esAeropuerto: carreraData.esAeropuerto || false,
        esEmisora: carreraData.esEmisora || false,
        notas: carreraData.notas || '',
        fechaInicio: new Date().toISOString()
      };
      
      console.log('Enviando datos de carrera:', datosCarrera);
      
      const resp = await fetch(`/api/turnos/${turnoId}/carreras`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(datosCarrera)
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

      const carreraNueva = await resp.json();
      console.log('Carrera guardada exitosamente:', carreraNueva);
      
      // Asegurar que tenga un formato consistente con las propiedades que usamos
      const carreraFormateada = {
        idCarrera: carreraNueva.idCarrera || carreraNueva.id,
        importeTotal: parseFloat(carreraNueva.importeTotal || carreraData.precio),
        importeTaximetro: parseFloat(carreraNueva.importeTaximetro || carreraData.precioTaximetro || 0),
        propina: carreraNueva.propina || (precioTotal - precioTaximetro),
        tipoPago: carreraNueva.tipoPago || tipoPagoFinal,
        esAeropuerto: carreraNueva.esAeropuerto || carreraData.esAeropuerto || false,
        esEmisora: carreraNueva.esEmisora || carreraData.esEmisora || false,
        fecha: carreraNueva.fecha || carreraNueva.fechaInicio || new Date().toISOString(),
        notas: carreraNueva.notas || carreraData.notas || ''
      };
      
      console.log('Carrera formateada para mostrar:', carreraFormateada);
      
      // Actualizar la lista de carreras
      setCarreras(prev => [...prev, carreraFormateada]);
      
      // Reiniciar el formulario
      setCarreraData({ 
        precio: '', 
        precioTaximetro: '',
        tipoPago: 'efectivo', 
        esAeropuerto: false,
        esEmisora: false,
        notas: '' 
      });
      setSuccessMessage('Carrera registrada exitosamente');
    } catch (err) {
      console.error('Error registrando carrera:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmCerrarTurno = async () => {
    if (!kmFinal || isNaN(parseFloat(kmFinal)) || parseFloat(kmFinal) <= 0) {
      setError("Debe ingresar un valor numérico válido para los KM finales.");
      return;
    }

    setConfirmModalOpen(true);
  };

  const ejecutarCierreTurno = async () => {
    setError('');
    setSuccessMessage('');
    setLoading(true);
    setKmModalOpen(false);
    setConfirmModalOpen(false);

    try {
      const resp = await fetch(`/api/turnos/${turnoId}/cerrar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          kmFinal: parseFloat(kmFinal) 
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
      
      // Si se seleccionó cerrar la jornada también
      if (cerrarJornada && jornadaId) {
        try {
          const respJornada = await fetch(`/api/jornadas/${jornadaId}/cerrar`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              fechaFinal: new Date().toISOString()
            })
          });
          
          if (!respJornada.ok) {
            const dataError = await respJornada.json().catch(() => ({ message: respJornada.statusText }));
            console.error('Error al cerrar jornada:', dataError);
            // Continuamos aunque haya error en la jornada, ya que el turno se cerró correctamente
          }
          
          setSuccessMessage('Turno y jornada cerrados exitosamente. Redirigiendo a Home...');
        } catch (jornadaErr) {
          console.error('Error cerrando jornada:', jornadaErr);
          // No lanzamos excepción, continuamos ya que el turno se cerró bien
        }
      } else {
      setSuccessMessage('Turno cerrado exitosamente. Redirigiendo a Home...');
      }
      
      setTurnoCerrado(true);
      setTimeout(() => {
        sessionStorage.setItem('successMessage', 'Turno cerrado correctamente. Puedes iniciar un nuevo turno o jornada.');
        navigate('/home');
      }, 2000);
    } catch (err) {
      console.error('Error cerrando turno:', err);
      setError(err.message || 'Error al cerrar el turno. Inténtalo de nuevo más tarde.');
    } finally {
      setLoading(false);
    }
  };

  const handleCerrarTurno = () => {
    setKmFinal('');
    setKmModalOpen(true);
  };

  const handleNuevaCarrera = () => {
    setCarreraData({ 
      precio: '', 
      precioTaximetro: '',
      tipoPago: 'efectivo', 
      esAeropuerto: false,
      esEmisora: false,
      notas: '' 
    });
    setError('');
    setSuccessMessage('');
  };

  const handleVolverHome = () => {
    navigate('/home');
  };

  // Función para guardar las notas del turno
  const handleGuardarNotas = async () => {
    if (!turnoId) return;
    
    setGuardandoNotas(true);
    setError('');
    try {
      console.log('Enviando notas:', turnoNotas);
      
      // Usamos el endpoint específico para notas
      const resp = await fetch(`/api/turnos/${turnoId}/notas`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          notas: turnoNotas
        })
      });
      
      if (!resp.ok) {
        const data = await resp.json().catch(() => ({ message: resp.statusText }));
        throw new Error(data.message || 'Error al guardar las notas');
      }
      
      const respData = await resp.json();
      console.log('Respuesta al guardar notas:', respData);
      
      // Actualizamos la información del turno con las notas nuevas
      setTurnoInfo(prev => ({...prev, notas: turnoNotas}));
      
      // Volver a cargar el turno para asegurarnos de que tenemos los datos actualizados
      await fetchTurnoYCarreras();
      
      setSuccessMessage('Notas guardadas correctamente');
      setEditandoNotas(false);
      
      // Limpiar mensaje después de 3 segundos
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (err) {
      console.error('Error guardando notas:', err);
      setError(err.message || 'Error al guardar las notas. Inténtalo de nuevo más tarde.');
    } finally {
      setGuardandoNotas(false);
    }
  };

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="bg-surface/90 text-red-500 p-8 rounded-xl shadow-xl text-center max-w-md">
          <h2 className="text-2xl font-bold mb-4">Error de autenticación</h2>
          <ErrorMessage
            message="Usuario no autenticado. Por favor, inicie sesión."
            type="error_general"
          />
          <button
            onClick={() => navigate('/')}
            className="w-full bg-primary hover:bg-primary-dark text-gray-900 font-semibold py-3 px-6 rounded-lg transition-colors shadow-md"
          >
            Iniciar Sesión
          </button>
        </div>
      </div>
    );
  }

  if (turnoCerrado) {
    return (
      <div className="min-h-screen bg-background text-text flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md bg-surface/90 rounded-xl shadow-xl p-8 border border-border text-center">
          <svg className="w-16 h-16 text-primary mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="text-2xl font-bold text-primary mb-4">Turno Cerrado</h2>
          <ErrorMessage
            message="Este turno ya está cerrado. No puedes agregar más carreras."
            type="info"
          />
          <button
            onClick={() => navigate('/home')}
            className="w-full bg-primary hover:bg-primary-dark text-gray-900 font-semibold py-3 px-6 rounded-lg transition-colors shadow-md"
          >
            Volver a Home
          </button>
        </div>
      </div>
    );
  }

  // Calcular estadísticas
  const totalImporte = carreras.reduce((sum, c) => sum + (parseFloat(c.importeTotal) || 0), 0);
  const numCarreras = carreras.length;
  const promedioImporte = numCarreras > 0 ? totalImporte / numCarreras : 0;
  
  // Modal para KM finales
  const KmModal = () => (
    <div className={`fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center ${kmModalOpen ? '' : 'hidden'}`}>
      <div className="bg-surface rounded-xl p-6 w-full max-w-md animate-fade-in">
        <h3 className="text-xl font-bold text-primary mb-4">Cerrar Turno</h3>
        <p className="text-text-muted mb-4">Introduce los kilómetros finales del vehículo para cerrar este turno.</p>
        
        <div className="mb-4">
          <label htmlFor="kmFinal" className="block text-sm font-medium text-text mb-1">
            KM Finales
          </label>
          <input
            type="text"
            inputMode="decimal"
            id="kmFinal"
            value={kmFinal}
            onChange={(e) => {
              // Validar que solo se ingresen números y punto decimal
              const value = e.target.value;
              if (value === '' || /^[0-9]*\.?[0-9]*$/.test(value)) {
                setKmFinal(value);
              }
            }}
            className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary text-text"
            placeholder="Introduce los KM finales"
            autoFocus
          />
        </div>
        
        <div className="mb-4">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={cerrarJornada}
              onChange={(e) => setCerrarJornada(e.target.checked)}
              className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-primary"
            />
            <span className="text-text">Cerrar también la jornada actual</span>
          </label>
          <p className="text-text-muted text-sm mt-1 ml-6">
            Al seleccionar esta opción, la jornada quedará cerrada y no podrás añadir más turnos.
          </p>
        </div>
        
        <div className="flex space-x-3">
          <button
            onClick={handleConfirmCerrarTurno}
            className="flex-1 bg-primary hover:bg-primary-dark text-gray-900 font-medium px-4 py-2 rounded-lg transition-colors shadow-sm"
          >
            Continuar
          </button>
          <button
            onClick={() => {
              setKmModalOpen(false);
              setKmFinal('');
              setCerrarJornada(false);
              setError('');
            }}
            className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-medium px-4 py-2 rounded-lg transition-colors shadow-sm"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );

  // Modal de confirmación para cerrar turno
  const ConfirmModal = () => (
    <div className={`fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center ${confirmModalOpen ? '' : 'hidden'}`}>
      <div className="bg-surface rounded-xl p-6 w-full max-w-md animate-fade-in">
        <div className="flex items-center justify-center mb-4 text-yellow-500">
          <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        
        <h3 className="text-xl font-bold text-primary mb-2 text-center">Confirmar Cierre</h3>
        <p className="text-text-muted mb-4 text-center">
          ¿Estás seguro de que deseas cerrar este turno?<br />
          KM finales: <strong>{kmFinal}</strong><br />
          {cerrarJornada && <span className="text-yellow-400">También se cerrará la jornada actual.</span>}<br />
          Esta acción no se puede deshacer.
        </p>
        
        <div className="flex space-x-3">
          <button
            onClick={ejecutarCierreTurno}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium px-4 py-2 rounded-lg transition-colors shadow-sm"
          >
            {cerrarJornada ? 'Cerrar Turno y Jornada' : 'Cerrar Turno'}
          </button>
          <button
            onClick={() => setConfirmModalOpen(false)}
            className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-medium px-4 py-2 rounded-lg transition-colors shadow-sm"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/10 flex flex-col">
      {/* Header con navegación y datos del usuario */}
      <header className="w-full bg-surface/60 backdrop-blur-sm border-b border-border shadow-md">
        <div className="container mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center space-x-3">
              <div className="bg-primary p-2 rounded-lg shadow">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-primary">TaxiDay</h1>
            </div>
            
            <div className="flex flex-wrap items-center justify-center gap-2">
              <button 
                onClick={handleVolverHome}
                className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors w-full sm:w-auto"
              >
                Volver a Home
              </button>
              
              {!turnoCerrado && (
                <>
                  {estadoPausa === 'activo' ? (
                    <button 
                      onClick={handlePausarTurno}
                      disabled={loadingPausa}
                      className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center w-full sm:w-auto"
                    >
                      {loadingPausa ? (
                        <span className="flex items-center">
                          <span className="animate-spin rounded-full h-4 w-4 mr-2 border-b-2 border-white"></span>
                          Pausar
                        </span>
                      ) : (
                        <>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m-9-6h14" />
                          </svg>
                          <span className="hidden sm:inline">Pausar Turno</span>
                          <span className="sm:hidden">Pausar</span>
                        </>
                      )}
                    </button>
                  ) : (
                    <button 
                      onClick={handleReanudarTurno}
                      disabled={loadingPausa}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center w-full sm:w-auto"
                    >
                      {loadingPausa ? (
                        <span className="flex items-center">
                          <span className="animate-spin rounded-full h-4 w-4 mr-2 border-b-2 border-white"></span>
                          Reanudar
                        </span>
                      ) : (
                        <>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="hidden sm:inline">Reanudar Turno</span>
                          <span className="sm:hidden">Reanudar</span>
                        </>
                      )}
                    </button>
                  )}
                  
                  <button 
                    onClick={handleCerrarTurno}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors w-full sm:w-auto"
                  >
                    Cerrar Turno
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Contenido principal */}
      <div className="flex-1 container mx-auto px-4 sm:px-6 py-4 sm:py-8">
        {error && (
          <div className="mb-4 sm:mb-6 bg-red-800/40 border border-red-700/50 text-red-200 px-4 sm:px-6 py-4 rounded-lg text-sm animate-fade-in">
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
          <div className="mb-4 sm:mb-6 bg-green-800/40 border border-green-700/50 text-green-200 px-4 sm:px-6 py-4 rounded-lg text-sm animate-fade-in">
            <ErrorMessage
              message={successMessage}
              type="success"
              onClose={() => setSuccessMessage('')}
            />
          </div>
        )}
        
        {turnoInfo && (
          <div className="mb-4 sm:mb-6 bg-surface/70 backdrop-blur-sm p-4 sm:p-6 rounded-xl border border-border shadow-lg">
            <h2 className="text-xl font-bold text-primary mb-4">Información del Turno</h2>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
              <div>
                <p className="text-text-muted text-sm">Estado</p>
                <p className="font-medium">
                  <span className={`inline-block px-2 py-0.5 rounded-full text-sm ${
                    turnoCerrado ? 'bg-gray-700/30 text-gray-400 border border-gray-700/40' : 'bg-green-900/30 text-green-400 border border-green-800/40'
                  }`}>
                    {turnoInfo.estado || (turnoCerrado ? 'Cerrado' : 'Activo')}
                  </span>
                </p>
              </div>
              
              <div>
                <p className="text-text-muted text-sm">Hora Inicio</p>
                <p className="font-medium">
                  {turnoInfo.horaInicio ? new Date(turnoInfo.horaInicio).toLocaleTimeString() : 'N/A'}
                </p>
              </div>
              
              <div>
                <p className="text-text-muted text-sm">KM Iniciales</p>
                <p className="font-medium">{turnoInfo.kmInicial || 'N/A'}</p>
              </div>
              
              <div>
                <p className="text-text-muted text-sm">KM Finales</p>
                <p className="font-medium">{turnoInfo.kmFinal || 'No registrado'}</p>
              </div>
            </div>
            
            {/* Panel de Estadísticas de Tiempo */}
            <div className="mt-5 pt-5 border-t border-border">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Estadísticas de Tiempo</h3>
                
                {!turnoCerrado && (
                  <span className={`px-2 py-1 rounded text-sm ${
                    estadoPausa === 'pausado' 
                      ? 'bg-yellow-900/30 text-yellow-400 border border-yellow-800/40' 
                      : 'bg-green-900/30 text-green-400 border border-green-800/40'
                  }`}>
                    {estadoPausa === 'pausado' ? '⏸️ Pausado' : '▶️ En marcha'}
                  </span>
                )}
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-background/30 p-4 rounded-lg border border-border/50 text-center">
                  <p className="text-text-muted text-sm mb-1">Tiempo Total</p>
                  <p className="text-xl font-mono">{tiempoTotal}</p>
                </div>
                
                <div className="bg-background/30 p-4 rounded-lg border border-border/50 text-center">
                  <p className="text-text-muted text-sm mb-1">Tiempo Trabajado</p>
                  <p className="text-xl font-mono text-green-400">{tiempoTrabajado}</p>
                </div>
                
                <div className="bg-background/30 p-4 rounded-lg border border-border/50 text-center">
                  <p className="text-text-muted text-sm mb-1">Tiempo Pausado</p>
                  <p className="text-xl font-mono text-yellow-400">{tiempoPausado}</p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-7 gap-4 sm:gap-8">
          {/* Panel izquierdo: Crear carreras */}
          <div className="lg:col-span-3 order-2 lg:order-1">
            <div className="bg-surface/70 backdrop-blur-sm rounded-xl border border-border shadow-lg overflow-hidden">
              <div className="px-4 sm:px-6 py-5 border-b border-border">
                <h2 className="text-xl font-bold text-primary">Nueva Carrera</h2>
              </div>
              
              <div className="p-4 sm:p-6">
                {turnoCerrado ? (
                  <div className="bg-red-900/20 border border-red-800/30 rounded-lg p-4 text-center">
                    <p className="text-red-300">El turno ya está cerrado. No se pueden añadir nuevas carreras.</p>
                  </div>
                ) : (
                  <form onSubmit={handleGuardarCarrera} className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="precio" className="block text-sm font-medium text-text mb-1">
                          Precio (€)
                        </label>
                        <input
                          type="text"
                          inputMode="decimal"
                          id="precio"
                          name="precio"
                          value={carreraData.precio}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (value === '' || /^[0-9]*\.?[0-9]*$/.test(value)) {
                              setCarreraData(prev => ({ ...prev, precio: value }));
                            }
                          }}
                          className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary text-text text-lg"
                          placeholder="0.00"
                          required
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="precioTaximetro" className="block text-sm font-medium text-text mb-1">
                          Precio Taxímetro (€)
                        </label>
                        <input
                          type="text"
                          inputMode="decimal"
                          id="precioTaximetro"
                          name="precioTaximetro"
                          value={carreraData.precioTaximetro}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (value === '' || /^[0-9]*\.?[0-9]*$/.test(value)) {
                              setCarreraData(prev => ({ ...prev, precioTaximetro: value }));
                            }
                          }}
                          className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary text-text text-lg"
                          placeholder="0.00"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="tipoPago" className="block text-sm font-medium text-text mb-1">
                        Tipo de Pago
                      </label>
                      <select
                        id="tipoPago"
                        name="tipoPago"
                        value={carreraData.tipoPago}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary text-text text-lg"
                      >
                        <option value="efectivo">Efectivo</option>
                        <option value="tarjeta">Tarjeta</option>
                        <option value="otro">Otro</option>
                      </select>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                      <div className="flex-1">
                        <label className="flex items-center p-3 bg-background/50 rounded-lg border border-border cursor-pointer hover:bg-background transition-colors">
                          <input
                            type="checkbox"
                            id="esAeropuerto"
                            name="esAeropuerto"
                            checked={carreraData.esAeropuerto}
                            onChange={(e) => setCarreraData(prev => ({ ...prev, esAeropuerto: e.target.checked }))}
                            className="w-5 h-5 text-primary bg-background border-border rounded focus:ring-primary mr-3"
                          />
                          <div>
                            <span className="font-medium text-text flex items-center">
                              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
                              </svg>
                              Aeropuerto
                            </span>
                          </div>
                        </label>
                      </div>
                      
                      <div className="flex-1">
                        <label className="flex items-center p-3 bg-background/50 rounded-lg border border-border cursor-pointer hover:bg-background transition-colors">
                          <input
                            type="checkbox"
                            id="esEmisora"
                            name="esEmisora"
                            checked={carreraData.esEmisora}
                            onChange={(e) => setCarreraData(prev => ({ ...prev, esEmisora: e.target.checked }))}
                            className="w-5 h-5 text-primary bg-background border-border rounded focus:ring-primary mr-3"
                          />
                          <div>
                            <span className="font-medium text-text flex items-center">
                              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                              </svg>
                              Emisora
                            </span>
                          </div>
                        </label>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="notas" className="block text-sm font-medium text-text mb-1">
                        Notas (opcional)
                      </label>
                      <textarea
                        id="notas"
                        name="notas"
                        rows="3"
                        value={carreraData.notas}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary text-text text-lg"
                        placeholder="Añade notas sobre esta carrera..."
                      />
                    </div>

                    <div>
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary hover:bg-primary-dark text-gray-900 font-medium py-3 rounded-lg transition-colors shadow-md text-lg"
                      >
                        {loading ? (
                          <span className="flex items-center justify-center">
                            <span className="animate-spin rounded-full h-5 w-5 mr-2 border-b-2 border-gray-900"></span>
                            Guardando...
                          </span>
                        ) : 'Guardar Carrera'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>

            {/* Estadísticas */}
            <div className="mt-4 sm:mt-6 bg-surface/70 backdrop-blur-sm rounded-xl border border-border shadow-lg overflow-hidden">
              <div className="px-4 sm:px-6 py-5 border-b border-border">
                <h2 className="text-xl font-bold text-primary">Estadísticas</h2>
              </div>
              
              <div className="p-4 sm:p-6">
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-background/50 p-4 rounded-lg border border-border text-center">
                    <p className="text-text-muted text-sm mb-1">Carreras</p>
                    <p className="text-2xl font-bold text-primary">{numCarreras}</p>
                  </div>
                  
                  <div className="bg-background/50 p-4 rounded-lg border border-border text-center">
                    <p className="text-text-muted text-sm mb-1">Total</p>
                    <p className="text-2xl font-bold text-primary">{totalImporte.toFixed(2)}€</p>
                  </div>
                  
                  <div className="bg-background/50 p-4 rounded-lg border border-border text-center">
                    <p className="text-text-muted text-sm mb-1">Promedio</p>
                    <p className="text-2xl font-bold text-primary">{promedioImporte.toFixed(2)}€</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Panel derecho: Lista de carreras */}
          <div className="lg:col-span-4 order-1 lg:order-2">
            <div className="bg-surface/70 backdrop-blur-sm rounded-xl border border-border shadow-lg overflow-hidden h-full">
              <div className="px-4 sm:px-6 py-5 border-b border-border flex justify-between items-center">
                <h2 className="text-xl font-bold text-primary">Carreras Registradas</h2>
                
                <div className="text-text-muted text-sm">
                  {carreras.length} {carreras.length === 1 ? 'carrera' : 'carreras'}
                </div>
              </div>
              
              <div className="p-4 sm:p-6">
                {loadingCarreras ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                  </div>
                ) : carreras.length > 0 ? (
                  <div className="space-y-4">
                    {carreras.map((carrera, index) => (
                      <div key={carrera.idCarrera} className="bg-background/50 p-4 rounded-lg border border-border">
                        <div className="flex justify-between mb-2">
                          <div className="font-medium flex items-center">
                            <span>Carrera #{index + 1}</span>
                            
                            {carrera.esAeropuerto && (
                              <span className="ml-2 text-primary" title="Aeropuerto">
                                <svg className="w-5 h-5 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
                                </svg>
                              </span>
                            )}
                            
                            {carrera.esEmisora && (
                              <span className="ml-1 text-primary" title="Emisora">
                                <svg className="w-5 h-5 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                                </svg>
                              </span>
                            )}
                          </div>
                          <div className="text-text-muted text-sm">
                            {new Date(carrera.fecha).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4 text-sm mb-2">
                          <div>
                            <p className="text-text-muted">Total</p>
                            <p className="font-bold text-primary text-lg">{parseFloat(carrera.importeTotal).toFixed(2)}€</p>
                          </div>
                          <div>
                            <p className="text-text-muted">Taxímetro</p>
                            <p className="font-medium">{parseFloat(carrera.importeTaximetro || 0).toFixed(2)}€</p>
                          </div>
                          <div>
                            <p className="text-text-muted">Propina</p>
                            <p className="font-medium text-green-500">{parseFloat(carrera.propina || 0).toFixed(2)}€</p>
                          </div>
                        </div>
                        
                        <div className="flex justify-between text-sm mt-3">
                          <div>
                            <span className="text-text-muted mr-1">Tipo de Pago:</span>
                            <span className="capitalize">{carrera.tipoPago}</span>
                          </div>
                        </div>
                        
                        {carrera.notas && carrera.notas.trim() !== '' && (
                          <div className="mt-2 pt-2 border-t border-border/50">
                            <p className="text-text-muted text-sm">Notas:</p>
                            <p className="text-sm whitespace-pre-wrap">{carrera.notas}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <svg className="w-16 h-16 text-text-muted mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <h3 className="text-xl font-semibold mb-2">No hay carreras registradas</h3>
                    <p className="text-text-muted mb-6">Registra tus carreras usando el formulario.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full py-4 bg-surface/60 backdrop-blur-sm border-t border-border mt-8">
        <div className="container mx-auto px-4 sm:px-6 text-center">
          <p className="text-text-muted text-sm">© {new Date().getFullYear()} TaxiDay | Todos los derechos reservados</p>
        </div>
      </footer>
      
      {/* Modales */}
      <KmModal />
      <ConfirmModal />
    </div>
  );
} 