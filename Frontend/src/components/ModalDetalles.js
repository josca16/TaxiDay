import React, { useState, useEffect } from 'react';
import { formatTime, formatDateTime } from '../utils/dateUtils';

const ModalDetalles = ({ isOpen, onClose, jornadaId }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [jornadaInfo, setJornadaInfo] = useState(null);
  const [activeTab, setActiveTab] = useState('info');
  const [estadisticasTurnos, setEstadisticasTurnos] = useState({});

  useEffect(() => {
    if (isOpen && jornadaId) {
      cargarDatos();
    }
  }, [isOpen, jornadaId]);

  const cargarDatos = async () => {
    try {
      const resp = await fetch(`/api/jornadas/${jornadaId}`);
      if (!resp.ok) throw new Error('Error al cargar datos de la jornada');
      const data = await resp.json();
      console.log('Datos completos de la jornada:', data);
      
      // Verificar específicamente las notas de los turnos
      if (data.turnos) {
        data.turnos.forEach(turno => {
          console.log(`Turno #${turno.idTurno} - Notas:`, turno.notas);
        });
      }
      
      setJornadaInfo(data);

      // Cargar estadísticas para cada turno
      if (data.turnos && data.turnos.length > 0) {
        const estadisticas = {};
        for (const turno of data.turnos) {
          try {
            const respEst = await fetch(`/api/turnos/${turno.idTurno}/estadisticas`);
            if (respEst.ok) {
              const dataEst = await respEst.json();
              estadisticas[turno.idTurno] = dataEst;
            }
          } catch (err) {
            console.error(`Error al cargar estadísticas del turno ${turno.idTurno}:`, err);
          }
        }
        setEstadisticasTurnos(estadisticas);
      }

      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const formatearFecha = (fecha, esFechaFinal = false) => {
    return formatDateTime(fecha, esFechaFinal);
  };

  const calcularTotalCarreras = (turnos) => {
    return turnos.reduce((total, turno) => {
      return total + (turno.carreras ? turno.carreras.reduce((sum, carrera) => sum + parseFloat(carrera.importeTotal), 0) : 0);
    }, 0);
  };

  const calcularTotalTiempo = (turnos) => {
    let tiempoTotal = 0;
    let tiempoTrabajado = 0;
    let tiempoPausado = 0;

    turnos.forEach(turno => {
      const stats = estadisticasTurnos[turno.idTurno];
      if (stats) {
        const convertirASegundos = (tiempo) => {
          const [horas, minutos, segundos] = tiempo.split(':').map(Number);
          return horas * 3600 + minutos * 60 + segundos;
        };

        tiempoTotal += convertirASegundos(stats.tiempoTotal || '00:00:00');
        tiempoTrabajado += convertirASegundos(stats.tiempoTrabajado || '00:00:00');
        tiempoPausado += convertirASegundos(stats.tiempoPausado || '00:00:00');
      }
    });

    const formatearTiempo = (segundos) => {
      const horas = Math.floor(segundos / 3600);
      const minutos = Math.floor((segundos % 3600) / 60);
      const segs = segundos % 60;
      return `${String(horas).padStart(2, '0')}:${String(minutos).padStart(2, '0')}:${String(segs).padStart(2, '0')}`;
    };

    return {
      total: formatearTiempo(tiempoTotal),
      trabajado: formatearTiempo(tiempoTrabajado),
      pausado: formatearTiempo(tiempoPausado)
    };
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-start justify-center overflow-y-auto">
      <div className="w-full flex items-start justify-center p-4">
        <div className="bg-surface rounded-xl shadow-2xl w-full max-w-4xl my-8 overflow-hidden border border-border">
          {/* Header - Sticky */}
          <div className="sticky top-0 px-6 py-4 border-b border-border bg-surface flex justify-between items-center z-10">
            <div className="flex items-center space-x-3">
              <div className="bg-primary p-2 rounded-lg">
                <svg className="w-6 h-6 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-white">
                Detalles de la Jornada #{jornadaInfo?.idJornada}
              </h2>
            </div>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-surface-darker rounded-lg"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              <p className="mt-4 text-gray-400">Cargando detalles...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="bg-red-900/30 text-red-400 p-4 rounded-lg border border-red-800/40 inline-block">
                <p>{error}</p>
              </div>
            </div>
          ) : jornadaInfo ? (
            <>
              {/* Tabs */}
              <div className="sticky top-[73px] flex space-x-2 px-6 py-4 border-b border-border bg-surface z-[5]">
                <button
                  className={`px-4 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2
                    ${activeTab === 'info'
                      ? 'bg-primary text-gray-900 shadow-lg'
                      : 'bg-surface hover:bg-surface-darker text-gray-300 hover:text-white'}`}
                  onClick={() => setActiveTab('info')}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Información General</span>
                </button>
                <button
                  className={`px-4 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2
                    ${activeTab === 'turnos'
                      ? 'bg-primary text-gray-900 shadow-lg'
                      : 'bg-surface hover:bg-surface-darker text-gray-300 hover:text-white'}`}
                  onClick={() => setActiveTab('turnos')}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Turnos</span>
                </button>
              </div>

              {/* Content */}
              <div className="p-6">
                {activeTab === 'info' ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                      <div className="bg-surface/30 backdrop-blur-sm p-6 rounded-xl border border-border/50 shadow-lg">
                        <div className="flex items-center space-x-3 mb-4">
                          <div className="bg-primary/20 p-2 rounded-lg">
                            <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <h3 className="text-lg font-semibold text-primary">Información Básica</h3>
                        </div>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-text-muted">Estado:</span>
                            <span className={`px-3 py-1 rounded-full text-sm ${
                              jornadaInfo.estado?.toLowerCase() === 'cerrada'
                                ? 'bg-red-900/30 text-red-400 border border-red-800/40'
                                : 'bg-green-900/30 text-green-400 border border-green-800/40'
                            }`}>
                              {jornadaInfo.estado}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-text-muted">Inicio:</span>
                            <span className="font-medium">{formatearFecha(jornadaInfo.fechaInicio)}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-text-muted">Fin:</span>
                            <span className="font-medium">{jornadaInfo.fechaFinal ? formatearFecha(jornadaInfo.fechaFinal, true) : 'En curso'}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-surface/30 backdrop-blur-sm p-6 rounded-xl border border-border/50 shadow-lg">
                        <div className="flex items-center space-x-3 mb-4">
                          <div className="bg-primary/20 p-2 rounded-lg">
                            <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                          </div>
                          <h3 className="text-lg font-semibold text-primary">Estadísticas</h3>
                        </div>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-text-muted">Total Turnos:</span>
                            <span className="font-medium text-lg">{jornadaInfo.turnos?.length || 0}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-text-muted">Total Carreras:</span>
                            <span className="font-medium text-lg">{jornadaInfo.turnos?.reduce((sum, t) => sum + (t.carreras?.length || 0), 0) || 0}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-text-muted">Recaudación Total:</span>
                            <span className="font-bold text-xl text-primary">{calcularTotalCarreras(jornadaInfo.turnos || []).toFixed(2)}€</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {jornadaInfo.turnos && jornadaInfo.turnos.length > 0 && (
                      <div className="bg-surface/30 backdrop-blur-sm p-6 rounded-xl border border-border/50 shadow-lg">
                        <div className="flex items-center space-x-3 mb-6">
                          <div className="bg-primary/20 p-2 rounded-lg">
                            <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <h3 className="text-lg font-semibold text-primary">Tiempo Total de la Jornada</h3>
                        </div>
                        <div className="grid grid-cols-3 gap-6">
                          <div className="bg-background/30 p-4 rounded-lg border border-border/50">
                            <p className="text-text-muted mb-2">Tiempo Total</p>
                            <p className="text-2xl font-bold text-primary">{calcularTotalTiempo(jornadaInfo.turnos).total}</p>
                          </div>
                          <div className="bg-background/30 p-4 rounded-lg border border-border/50">
                            <p className="text-text-muted mb-2">Tiempo Trabajado</p>
                            <p className="text-2xl font-bold text-green-400">{calcularTotalTiempo(jornadaInfo.turnos).trabajado}</p>
                          </div>
                          <div className="bg-background/30 p-4 rounded-lg border border-border/50">
                            <p className="text-text-muted mb-2">Tiempo Pausado</p>
                            <p className="text-2xl font-bold text-yellow-400">{calcularTotalTiempo(jornadaInfo.turnos).pausado}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-6">
                    {jornadaInfo.turnos?.map((turno, index) => (
                      <div key={turno.idTurno} className="bg-surface-dark rounded-xl border border-border shadow-lg overflow-hidden">
                        <div className="p-6">
                          <div className="flex justify-between items-center mb-6">
                            <div className="flex items-center space-x-3">
                              <div className="bg-primary p-2 rounded-lg">
                                <svg className="w-5 h-5 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              </div>
                              <h3 className="text-lg font-semibold text-white">Turno #{turno.idTurno}</h3>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-sm ${
                              turno.estado?.toLowerCase() === 'cerrado'
                                ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                                : 'bg-green-500/20 text-green-400 border border-green-500/40'
                            }`}>
                              {turno.estado}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="bg-surface p-4 rounded-lg border border-border">
                              <p className="text-gray-400 text-sm mb-1">Inicio</p>
                              <p className="text-white">{formatearFecha(turno.fechaInicio)}</p>
                            </div>
                            <div className="bg-surface p-4 rounded-lg border border-border">
                              <p className="text-gray-400 text-sm mb-1">Fin</p>
                              <p className="text-white">{formatearFecha(turno.fechaFinal)}</p>
                            </div>
                            <div className="bg-surface p-4 rounded-lg border border-border">
                              <p className="text-gray-400 text-sm mb-1">KM Inicial</p>
                              <p className="text-white">{turno.kmInicial}</p>
                            </div>
                            <div className="bg-surface p-4 rounded-lg border border-border">
                              <p className="text-gray-400 text-sm mb-1">KM Final</p>
                              <p className="text-white">{turno.kmFinal || '-'}</p>
                            </div>
                            <div className="bg-surface p-4 rounded-lg border border-border col-span-2">
                              <p className="text-gray-400 text-sm mb-1">KM Recorridos</p>
                              <p className="text-white">{turno.kmFinal ? (turno.kmFinal - turno.kmInicial).toFixed(1) : '-'} km</p>
                            </div>
                          </div>

                          {/* Sección de Notas */}
                          <div className="bg-surface p-4 rounded-lg border border-border mb-6">
                            <h4 className="font-medium mb-4 flex items-center space-x-2 text-white">
                              <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                              <span>Notas del Turno</span>
                            </h4>
                            <div className="bg-surface-dark p-4 rounded-lg border border-border">
                              {turno.notas ? (
                                <p className="text-gray-300 whitespace-pre-wrap">{turno.notas}</p>
                              ) : (
                                <p className="text-gray-500 italic">Sin notas</p>
                              )}
                            </div>
                          </div>

                          {/* Carreras */}
                          <div>
                            <h4 className="font-medium mb-4 flex items-center space-x-2 text-white">
                              <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                              </svg>
                              <span>Carreras</span>
                            </h4>
                            {turno.carreras && turno.carreras.length > 0 ? (
                              <div className="space-y-3">
                                {turno.carreras.map((carrera, carreraIndex) => (
                                  <div key={carrera.idCarrera} className="bg-surface p-4 rounded-lg border border-border hover:bg-surface-darker transition-colors">
                                    <div className="flex justify-between items-center mb-3">
                                      <div className="flex items-center space-x-2">
                                        <span className="bg-primary/20 px-2 py-1 rounded text-sm font-medium text-primary">
                                          Carrera #{carreraIndex + 1}
                                        </span>
                                        {carrera.esAeropuerto && (
                                          <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded text-sm border border-blue-500/40">
                                            Aeropuerto
                                          </span>
                                        )}
                                        {carrera.esEmisora && (
                                          <span className="bg-purple-500/20 text-purple-400 px-2 py-1 rounded text-sm border border-purple-500/40">
                                            Emisora
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 mb-4">
                                      <div className="bg-surface-dark p-3 rounded border border-border">
                                        <span className="text-gray-400 text-sm">Hora</span>
                                        <p className="text-white font-medium">
                                          {formatTime(carrera.fechaInicio)}
                                        </p>
                                      </div>
                                      <div className="bg-surface-dark p-3 rounded border border-border">
                                        <span className="text-gray-400 text-sm">Tipo Pago</span>
                                        <p className="text-white font-medium capitalize">{carrera.tipoPago}</p>
                                      </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                      <div className="bg-surface-dark p-3 rounded border border-border">
                                        <span className="text-gray-400 text-sm">Total</span>
                                        <p className="text-lg font-semibold text-primary">
                                          {parseFloat(carrera.importeTotal).toFixed(2)}€
                                        </p>
                                      </div>
                                      {carrera.importeTaximetro && (
                                        <div className="bg-surface-dark p-3 rounded border border-border">
                                          <span className="text-gray-400 text-sm">Taxímetro</span>
                                          <p className="text-white font-medium">
                                            {parseFloat(carrera.importeTaximetro).toFixed(2)}€
                                          </p>
                                        </div>
                                      )}
                                    </div>
                                    {carrera.notas && (
                                      <div className="mt-3 pt-3 border-t border-border">
                                        <span className="text-gray-400 text-sm">Notas:</span>
                                        <p className="text-gray-300 text-sm mt-1 bg-surface-dark p-2 rounded">
                                          {carrera.notas}
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-center py-6 bg-surface-dark rounded-lg border border-border">
                                <svg className="w-12 h-12 text-gray-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                                <p className="text-gray-500">No hay carreras registradas</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default ModalDetalles; 