import React from 'react';
import { formatTime, toDateString, formatDateTime } from '../utils/dateUtils';

export default function JornadasRecientes({
  selectedDate,
  jornadas,
  onNewJornada,
  onContinueJornada,
  onVerDetalles,
  setSelectedDate,
  setCurrentMonth,
  setCurrentYear
}) {
  // Función para renderizar las jornadas del día seleccionado
  const renderJornadasDelDia = () => {
    if (!selectedDate) return null;
    
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
            onClick={onNewJornada}
            className="mt-4 text-primary hover:text-primary-light transition-colors text-sm underline"
          >
            Crear nueva jornada
          </button>
        </div>
      );
    }

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
                  {jornada.fechaInicio && formatTime(jornada.fechaInicio)}
                </div>
              </div>
              
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
              
              <div className="flex space-x-2">
                {jornada.estado?.toLowerCase() === 'activa' && (
                  <button
                    onClick={() => onContinueJornada(jornada.idJornada)}
                    className="flex-1 bg-primary hover:bg-primary-dark text-gray-900 font-medium px-4 py-2 rounded-lg transition-colors shadow-sm text-sm"
                  >
                    Continuar Jornada
                  </button>
                )}
                <button
                  onClick={() => onVerDetalles(jornada.idJornada)}
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
  };

  // Renderizar jornadas recientes si no hay fecha seleccionada
  const renderJornadasRecientes = () => {
    return (
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
                  {jornada.fechaInicio && formatTime(jornada.fechaInicio)}
                </div>
              </div>
              
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
              
              <button
                onClick={() => jornada.estado?.toLowerCase() === 'activa' 
                  ? onContinueJornada(jornada.idJornada) 
                  : onVerDetalles(jornada.idJornada)}
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
              onClick={onNewJornada}
              className="mt-4 text-primary hover:text-primary-light transition-colors text-sm underline"
            >
              Crear nueva jornada
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-surface/70 backdrop-blur-sm rounded-xl border border-border shadow-lg overflow-hidden">
      <div className="px-6 py-5 border-b border-border flex justify-between items-center">
        <h2 className="text-xl font-bold text-primary">
          {selectedDate 
            ? `Jornadas del ${formatDateTime(selectedDate)}` 
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
        {selectedDate ? renderJornadasDelDia() : renderJornadasRecientes()}
      </div>
    </div>
  );
} 