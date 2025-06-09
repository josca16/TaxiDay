import React from 'react';
import { useNavigate } from 'react-router-dom';
import { formatTime } from '../utils/dateUtils';

// Este archivo define el componente ActiveJornada, que se encarga de mostrar y gestionar el estado de una jornada activa en la aplicación.
// Dependiendo de si hay una jornada activa o no, el componente muestra diferentes interfaces y funcionalidades:

// - Si no hay una jornada activa:
//   - Muestra un mensaje indicando que no hay jornada activa.
//   - Permite al usuario crear una nueva jornada mediante un botón.

// - Si hay una jornada activa:
//   - Muestra información sobre la jornada activa, como su ID.
//   - Si hay un turno activo dentro de la jornada:
//     - Muestra detalles del turno, como los kilómetros iniciales y finales.
//     - Permite registrar carreras dentro del turno.
//     - Permite cerrar el turno actual.
//   - Si no hay un turno activo:
//     - Permite al usuario crear un nuevo turno ingresando los kilómetros iniciales.

// Además, el componente incluye botones para cerrar la jornada activa y navegar a otras partes de la aplicación.
// También maneja estados como `loading` para deshabilitar botones mientras se realizan acciones asincrónicas.

export default function ActiveJornada({
  activeJornadaId,
  turno,
  formData,
  setFormData,
  onNewJornada,
  onCerrarTurno,
  onCerrarJornada,
  onCrearTurno,
  loading
}) {
  const navigate = useNavigate();

  if (!activeJornadaId) {
    return (
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
          onClick={onNewJornada}
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
    );
  }

  return (
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
                <span className="text-sm text-text-muted">Inicio: {formatTime(turno.fechaInicio)}</span>
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
                  onClick={onCerrarTurno}
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
            onClick={onCerrarJornada}
            className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-medium px-4 py-2 rounded-lg transition-colors shadow-md"
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
            <form onSubmit={onCrearTurno}>
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
            onClick={onCerrarJornada}
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
  );
}