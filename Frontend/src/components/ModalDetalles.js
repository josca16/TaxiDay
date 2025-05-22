import React, { useState, useEffect } from 'react';

const ModalDetalles = ({ isOpen, onClose, turnoId, jornadaId }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [turnoInfo, setTurnoInfo] = useState(null);
  const [carreras, setCarreras] = useState([]);
  const [estadisticas, setEstadisticas] = useState({
    tiempoTotal: '00:00:00',
    tiempoTrabajado: '00:00:00',
    tiempoPausado: '00:00:00'
  });
  const [activeTab, setActiveTab] = useState('info');

  useEffect(() => {
    if (isOpen && turnoId) {
      cargarDatos();
    }
  }, [isOpen, turnoId]);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      // Cargar información del turno
      const respTurno = await fetch(`/api/turnos/${turnoId}`);
      if (!respTurno.ok) throw new Error('Error al cargar datos del turno');
      const dataTurno = await respTurno.json();
      setTurnoInfo(dataTurno);

      // Cargar carreras del turno
      const respCarreras = await fetch(`/api/turnos/${turnoId}/carreras`);
      if (respCarreras.ok) {
        const dataCarreras = await respCarreras.json();
        setCarreras(Array.isArray(dataCarreras) ? dataCarreras : []);
      } else {
        setCarreras([]);
      }

      // Cargar estadísticas de tiempo
      const respStats = await fetch(`/api/turnos/${turnoId}/estadisticas`);
      if (respStats.ok) {
        const statsData = await respStats.json();
        setEstadisticas(statsData);
      }
    } catch (err) {
      console.error('Error cargando datos:', err);
      setError('Error al cargar la información. Por favor, inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const calcularTotalRecaudacion = () => {
    return carreras.reduce((total, carrera) => total + (parseFloat(carrera.importeTotal) || 0), 0);
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return 'No registrada';
    return new Date(fecha).toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calcularDistancia = () => {
    if (!turnoInfo || !turnoInfo.kmInicial || !turnoInfo.kmFinal) return 'N/A';
    const distancia = turnoInfo.kmFinal - turnoInfo.kmInicial;
    return distancia.toFixed(1) + ' km';
  };

  // Contenido del modal
  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-red-800/40 border border-red-700/50 text-red-200 px-6 py-4 rounded-lg text-sm">
          {error}
        </div>
      );
    }

    if (!turnoInfo) {
      return (
        <div className="text-center py-8">
          <p className="text-text-muted">No se encontró información del turno</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Pestañas de navegación */}
        <div className="flex border-b border-border">
          <button
            className={`px-4 py-2 border-b-2 ${activeTab === 'info' 
              ? 'border-primary text-primary font-medium' 
              : 'border-transparent text-text-muted hover:text-text'}`}
            onClick={() => setActiveTab('info')}
          >
            Información General
          </button>
          <button
            className={`px-4 py-2 border-b-2 ${activeTab === 'estadisticas' 
              ? 'border-primary text-primary font-medium' 
              : 'border-transparent text-text-muted hover:text-text'}`}
            onClick={() => setActiveTab('estadisticas')}
          >
            Estadísticas
          </button>
          <button
            className={`px-4 py-2 border-b-2 ${activeTab === 'carreras' 
              ? 'border-primary text-primary font-medium' 
              : 'border-transparent text-text-muted hover:text-text'}`}
            onClick={() => setActiveTab('carreras')}
          >
            Carreras ({carreras.length})
          </button>
        </div>

        {/* Contenido de la pestaña seleccionada */}
        {activeTab === 'info' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div className="bg-background/40 p-4 rounded-lg border border-border/50">
                <p className="text-text-muted text-sm mb-1">ID del Turno</p>
                <p className="font-medium">{turnoInfo.idTurno}</p>
              </div>

              <div className="bg-background/40 p-4 rounded-lg border border-border/50">
                <p className="text-text-muted text-sm mb-1">Estado</p>
                <p className="font-medium">
                  <span className={`inline-block px-2 py-0.5 rounded-full text-sm ${
                    turnoInfo.estado === 'cerrado' 
                      ? 'bg-gray-700/30 text-gray-400 border border-gray-700/40' 
                      : 'bg-green-900/30 text-green-400 border border-green-800/40'
                  }`}>
                    {turnoInfo.estado || 'Sin datos'}
                  </span>
                </p>
              </div>

              <div className="bg-background/40 p-4 rounded-lg border border-border/50">
                <p className="text-text-muted text-sm mb-1">Estado Pausa</p>
                <p className="font-medium">
                  <span className={`inline-block px-2 py-0.5 rounded-full text-sm ${
                    turnoInfo.estadoPausa === 'pausado' 
                      ? 'bg-yellow-900/30 text-yellow-400 border border-yellow-800/40' 
                      : 'bg-green-900/30 text-green-400 border border-green-800/40'
                  }`}>
                    {turnoInfo.estadoPausa || 'activo'}
                  </span>
                </p>
              </div>

              <div className="bg-background/40 p-4 rounded-lg border border-border/50">
                <p className="text-text-muted text-sm mb-1">Fecha Inicio</p>
                <p className="font-medium">{formatearFecha(turnoInfo.fechaInicio)}</p>
              </div>

              <div className="bg-background/40 p-4 rounded-lg border border-border/50">
                <p className="text-text-muted text-sm mb-1">Fecha Fin</p>
                <p className="font-medium">{formatearFecha(turnoInfo.fechaFinal)}</p>
              </div>

              <div className="bg-background/40 p-4 rounded-lg border border-border/50">
                <p className="text-text-muted text-sm mb-1">Recaudación Total</p>
                <p className="font-bold text-primary text-lg">{calcularTotalRecaudacion().toFixed(2)}€</p>
              </div>

              <div className="bg-background/40 p-4 rounded-lg border border-border/50">
                <p className="text-text-muted text-sm mb-1">KM Iniciales</p>
                <p className="font-medium">{turnoInfo.kmInicial || 'No registrado'}</p>
              </div>

              <div className="bg-background/40 p-4 rounded-lg border border-border/50">
                <p className="text-text-muted text-sm mb-1">KM Finales</p>
                <p className="font-medium">{turnoInfo.kmFinal || 'No registrado'}</p>
              </div>

              <div className="bg-background/40 p-4 rounded-lg border border-border/50">
                <p className="text-text-muted text-sm mb-1">Distancia</p>
                <p className="font-medium">{calcularDistancia()}</p>
              </div>
            </div>

            {/* Notas del turno */}
            <div className="bg-background/40 p-4 rounded-lg border border-border/50">
              <h3 className="text-lg font-semibold mb-2">Notas</h3>
              {turnoInfo.notas ? (
                <p className="whitespace-pre-wrap">{turnoInfo.notas}</p>
              ) : (
                <p className="text-text-muted text-sm italic">Sin notas</p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'estadisticas' && (
          <div className="space-y-6">
            {/* Estadísticas de tiempo */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-background/40 p-4 rounded-lg border border-border/50 text-center">
                <p className="text-text-muted text-sm mb-1">Tiempo Total</p>
                <p className="text-xl font-mono">{estadisticas.tiempoTotal}</p>
              </div>
              
              <div className="bg-background/40 p-4 rounded-lg border border-border/50 text-center">
                <p className="text-text-muted text-sm mb-1">Tiempo Trabajado</p>
                <p className="text-xl font-mono text-green-400">{estadisticas.tiempoTrabajado}</p>
              </div>
              
              <div className="bg-background/40 p-4 rounded-lg border border-border/50 text-center">
                <p className="text-text-muted text-sm mb-1">Tiempo Pausado</p>
                <p className="text-xl font-mono text-yellow-400">{estadisticas.tiempoPausado}</p>
              </div>
            </div>

            {/* Información adicional */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-background/40 p-4 rounded-lg border border-border/50 text-center">
                <p className="text-text-muted text-sm mb-1">Total Carreras</p>
                <p className="text-xl font-bold">{carreras.length}</p>
              </div>
              
              <div className="bg-background/40 p-4 rounded-lg border border-border/50 text-center">
                <p className="text-text-muted text-sm mb-1">Recaudación</p>
                <p className="text-xl font-bold text-primary">{calcularTotalRecaudacion().toFixed(2)}€</p>
              </div>

              <div className="bg-background/40 p-4 rounded-lg border border-border/50 text-center">
                <p className="text-text-muted text-sm mb-1">Promedio por Carrera</p>
                <p className="text-xl font-bold">
                  {carreras.length > 0 
                    ? (calcularTotalRecaudacion() / carreras.length).toFixed(2) 
                    : '0.00'}€
                </p>
              </div>

              <div className="bg-background/40 p-4 rounded-lg border border-border/50 text-center">
                <p className="text-text-muted text-sm mb-1">Promedio por Hora</p>
                <p className="text-xl font-bold">
                  {estadisticas.segundosTrabajados > 0
                    ? ((calcularTotalRecaudacion() / estadisticas.segundosTrabajados) * 3600).toFixed(2)
                    : '0.00'}€
                </p>
              </div>
            </div>

            {/* Gráfico o visualización */}
            <div className="bg-background/40 p-4 rounded-lg border border-border/50">
              <h3 className="text-lg font-semibold mb-2">Distribución de Tiempo</h3>
              <div className="h-8 w-full bg-background/50 rounded-full overflow-hidden">
                {estadisticas.segundosTotales > 0 && (
                  <>
                    <div 
                      className="h-full bg-green-500" 
                      style={{ 
                        width: `${(estadisticas.segundosTrabajados / estadisticas.segundosTotales) * 100}%`,
                        float: 'left'
                      }} 
                      title={`Tiempo trabajado: ${estadisticas.tiempoTrabajado}`}
                    />
                    <div 
                      className="h-full bg-yellow-500" 
                      style={{ 
                        width: `${(estadisticas.segundosPausados / estadisticas.segundosTotales) * 100}%`,
                        float: 'left'
                      }}
                      title={`Tiempo pausado: ${estadisticas.tiempoPausado}`}
                    />
                  </>
                )}
              </div>
              <div className="flex justify-between mt-2 text-sm text-text-muted">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-1"></div>
                  <span>Trabajado</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full mr-1"></div>
                  <span>Pausado</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'carreras' && (
          <div className="space-y-4">
            {carreras.length > 0 ? (
              carreras.map((carrera, index) => (
                <div key={carrera.idCarrera || index} className="bg-background/40 p-4 rounded-lg border border-border/50">
                  <div className="flex justify-between mb-2">
                    <div className="font-medium flex items-center">
                      <span>Carrera #{index + 1}</span>
                      
                      {/* Iconos para aeropuerto y emisora */}
                      {carrera.esAeropuerto && (
                        <span className="ml-2 text-primary" title="Aeropuerto">
                          <svg className="w-4 h-4 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
                          </svg>
                        </span>
                      )}
                      
                      {carrera.esEmisora && (
                        <span className="ml-1 text-primary" title="Emisora">
                          <svg className="w-4 h-4 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                          </svg>
                        </span>
                      )}
                    </div>
                    <div className="text-text-muted text-sm">
                      {new Date(carrera.fechaInicio).toLocaleTimeString()}
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
                      <p className="font-medium text-green-500">{parseFloat(carrera.propina || (carrera.importeTotal - (carrera.importeTaximetro || 0))).toFixed(2)}€</p>
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
              ))
            ) : (
              <div className="text-center py-8">
                <svg className="w-16 h-16 text-text-muted mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <h3 className="text-xl font-semibold mb-2">No hay carreras registradas</h3>
                <p className="text-text-muted">Este turno no tiene carreras registradas.</p>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-surface rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden animate-fade-in">
        <div className="px-6 py-4 border-b border-border flex justify-between items-center sticky top-0 bg-surface z-10">
          <h2 className="text-xl font-bold text-primary">
            Detalles del Turno {turnoInfo?.idTurno || ''}
          </h2>
          <button 
            onClick={onClose}
            className="text-text-muted hover:text-text p-2 rounded-full"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-70px)]">
          {renderContent()}
        </div>
        
        <div className="px-6 py-4 border-t border-border flex justify-end sticky bottom-0 bg-surface">
        <button
          onClick={onClose}
            className="bg-gray-700 hover:bg-gray-600 text-white font-medium px-4 py-2 rounded-lg transition-colors shadow-sm"
        >
            Cerrar
        </button>
        </div>
      </div>
    </div>
  );
};

export default ModalDetalles; 