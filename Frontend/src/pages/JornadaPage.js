// src/main/js/taxiday-app/src/pages/JornadaPage.js
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Página de detalle y ejecución de una jornada específica
export default function JornadaPage() {
  // Obtiene el parámetro de la URL (el ID de la jornada)
  const { jornadaId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Estados para la jornada actual, carga y errores
  const [jornada, setJornada] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Estado para el turno actualmente activo dentro de esta jornada
  const [activeTurnoId, setActiveTurnoId] = useState(null);

  // Estado para el input de Km Inicial del nuevo turno
  const [kmInicialInput, setKmInicialInput] = useState('');
  const [creatingTurno, setCreatingTurno] = useState(false); // Estado para indicar si se está creando un turno

  // Estado para el input de Km Final al cerrar turno
  const [kmFinalInput, setKmFinalInput] = useState('');
  const [closingTurno, setClosingTurno] = useState(false); // Estado para indicar si se está cerrando un turno

  // Nuevos estados para el formulario de carrera
  const [showCarreraForm, setShowCarreraForm] = useState(false);
  const [importeTotalInput, setImporteTotalInput] = useState('');
  const [tipoPagoInput, setTipoPagoInput] = useState('EFECTIVO'); // Valor por defecto

  // Efecto para cargar los detalles de la jornada cuando el componente se monta o el ID cambia
  useEffect(() => {
    const fetchJornadaDetails = async () => {
      if (!user) {
        setError('Usuario no autenticado.');
        setLoading(false);
        return;
      }

      try {
        // Llama al endpoint del backend para obtener una jornada por su ID
        const resp = await fetch(`/api/jornadas/${jornadaId}`);

        if (!resp.ok) {
          throw new Error(`Error al cargar detalles de la jornada: ${resp.statusText}`);
        }

        const data = await resp.json();

        // Verifica si la jornada pertenece al usuario autenticado (medida de seguridad básica en frontend)
        if (data.taxista.idTaxista !== user.idTaxista) {
            setError('No tienes permiso para ver esta jornada.');
            setLoading(false);
            return;
        }

        setJornada(data); // Almacena los datos de la jornada
        console.log('Detalles de la jornada cargados:', data);

        // TODO: Implementar lógica para encontrar turno activo dentro de la jornada cargada
        // Si la jornada cargada tiene una lista de turnos, buscar uno en estado CREADA/ABIERTA
        if (data.turnos && data.turnos.length > 0) {
          const openTurno = data.turnos.find(turno => turno.estado === 'CREADA' || turno.estado === 'ABIERTO'); // Ajustar estado según backend
          if (openTurno) {
            setActiveTurnoId(openTurno.idTurno);
            console.log('Turno activo encontrado:', openTurno.idTurno);
          }
        }

      } catch (err) {
        setError(err.message);
        console.error('Error fetching jornada details:', err);
      } finally {
        setLoading(false);
      }
    };

    if (jornadaId) {
        fetchJornadaDetails();
    } else {
        setError('ID de jornada no proporcionado.');
        setLoading(false);
    }

  }, [jornadaId, user, navigate]); // Dependencias del efecto

  // Maneja la acción de crear un nuevo turno
  const handleNewTurno = async () => {
    if (!user || !jornada || activeTurnoId) {
        // No permitir crear turno si no hay usuario, jornada cargada o ya hay un turno activo
        return;
    }

    if (kmInicialInput.trim() === '' || isNaN(kmInicialInput)) {
        setError('Por favor, introduce un valor numérico válido para el Km Inicial.');
        return;
    }

    setCreatingTurno(true);
    setError(null); // Limpiar errores previos

    try {
        const resp = await fetch(`/api/turnos/jornada/${jornadaId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                kmInicial: parseFloat(kmInicialInput),
            })
        });

        if (!resp.ok) {
            const errorData = await resp.json();
            throw new Error(`Error al crear turno: ${errorData.message || resp.statusText}`);
        }

        const newTurno = await resp.json();
        setActiveTurnoId(newTurno.idTurno); // Establecer el nuevo turno como activo
        console.log('Nuevo turno creado:', newTurno);
        // Opcional: Redirigir a una página de detalle de turno si existe
        // navigate(`/jornada/${jornadaId}/turno/${newTurno.idTurno}`);

    } catch (err) {
        setError(err.message);
        console.error('Error creating turno:', err);
    } finally {
        setCreatingTurno(false);
    }
  };

  // Maneja la acción de crear una nueva carrera
  const handleNewCarrera = async () => {
      if (!user || !activeTurnoId) {
          // No permitir crear carrera si no hay usuario o turno activo
          setError('No hay un turno activo para crear una carrera.');
          return;
      }

      if (importeTotalInput.trim() === '' || isNaN(importeTotalInput)) {
          setError('Por favor, introduce un valor numérico válido para el Importe Total.');
          return;
      }

      // TODO: Aquí podrías recopilar datos de la carrera (importe, tipo de pago, etc.) de un formulario
      // Por ahora, enviaremos datos básicos

      try {
          const resp = await fetch('/api/carreras', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                  // El backend debería asignar fechaInicio
                  importeTotal: parseFloat(importeTotalInput), // Usar valor del input
                  importeTaximetro: 0.0, // Placeholder - si no se usa, eliminar del backend
                  tipoPago: tipoPagoInput, // Usar valor del select
                  turno: { idTurno: activeTurnoId } // Enviar el ID del turno activo
              })
          });

          if (!resp.ok) {
              const errorData = await resp.json();
              throw new Error(`Error al crear carrera: ${errorData.message || resp.statusText}`);
          }

          const newCarrera = await resp.json();
          console.log('Nueva carrera creada:', newCarrera);
          // TODO: Actualizar la lista de carreras mostradas en la UI
          // Puede que necesitemos recargar los detalles de la jornada/turno o añadir la carrera al estado
          // Después de guardar, ocultar el formulario y limpiar los inputs
          setShowCarreraForm(false);
          setImporteTotalInput('');
          setTipoPagoInput('EFECTIVO');

      } catch (err) {
          setError(err.message);
          console.error('Error creating carrera:', err);
      }
  };

  // Maneja la acción de cerrar el turno actual
  const handleCloseTurno = async () => {
      if (!user || !activeTurnoId) {
          // No permitir cerrar turno si no hay usuario o no hay turno activo
          return;
      }

      if (kmFinalInput.trim() === '' || isNaN(kmFinalInput)) {
          setError('Por favor, introduce un valor numérico válido para el Km Final.');
          return;
      }

      setClosingTurno(true);
      setError(null); // Limpiar errores previos

      try {
          const resp = await fetch(`/api/turnos/${activeTurnoId}/cerrar`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                  fechaFinal: new Date().toISOString(), // Usar la fecha y hora actual
                  kmFinal: parseFloat(kmFinalInput),
              })
          });

          if (!resp.ok) {
               const errorData = await resp.json();
               throw new Error(`Error al cerrar turno: ${errorData.message || resp.statusText}`);
          }

          // El turno se cerró con éxito
          setActiveTurnoId(null); // Quitar el turno activo
          setKmInicialInput(''); // Limpiar input de Km Inicial (para prox. turno)
          setKmFinalInput(''); // Limpiar input de Km Final
          console.log('Turno cerrado exitosamente.', await resp.json()); // Leer la respuesta del backend

          // Opcional: Recargar los detalles de la jornada para actualizar la lista de turnos
          // fetchJornadaDetails(); // Si se implementa como función separada y accesible

      } catch (err) {
          setError(err.message);
          console.error('Error closing turno:', err);
      } finally {
          setClosingTurno(false);
      }
  };

  // Maneja la acción de cerrar la jornada actual
  const handleCloseJornada = async () => {
      if (!user || !jornada) {
          // No permitir cerrar jornada si no hay usuario o jornada cargada
          return;
      }

      if (activeTurnoId) {
          // No permitir cerrar la jornada si hay un turno activo
          setError('Cierra el turno activo antes de cerrar la jornada.');
          return;
      }

      // Verificar si la jornada ya está cerrada
      if (jornada.estado === 'CERRADA') { // Ajustar estado según backend
          setError('Esta jornada ya está cerrada.');
          return;
      }

      try {
          const resp = await fetch(`/api/jornadas/${jornadaId}/cerrar`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                  fechaFinal: new Date().toISOString(), // Usar la fecha y hora actual
                  // El backend debería actualizar el estado a CERRADA
              })
          });

          if (!resp.ok) {
              const errorData = await resp.json();
              throw new Error(`Error al cerrar jornada: ${errorData.message || resp.statusText}`);
          }

          // Jornada cerrada con éxito, navegar de vuelta a la página de inicio
          console.log('Jornada cerrada exitosamente.', await resp.json()); // Leer la respuesta del backend
          navigate('/home'); // Redirigir a la página de inicio

      } catch (err) {
          setError(err.message);
          console.error('Error closing jornada:', err);
      }
  };

  if (loading) {
    return <div className="container mx-auto p-4">Cargando jornada...</div>;
  }

  if (error) {
    return <div className="container mx-auto p-4 error-message">{error}</div>;
  }

  if (!jornada) {
      return <div className="container mx-auto p-4">Jornada no encontrada.</div>;
  }

  return (
    <div className="container mx-auto p-4 jornada-page-container">
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
        <div>
          <h2 className="text-2xl font-bold">Detalle de Jornada #{jornada.idJornada}</h2>
          <p className="text-gray-600">Fecha Inicio: {new Date(jornada.fechaInicio).toLocaleString()}</p>
          {jornada.fechaFinal && <p className="text-gray-600">Fecha Final: {new Date(jornada.fechaFinal).toLocaleString()}</p>}
          <p className="text-gray-600">Estado: {jornada.estado}</p>
        </div>
        {!activeTurnoId && jornada.estado !== 'CERRADA' && (
          <button onClick={handleCloseJornada}
                  disabled={closingTurno || activeTurnoId}
                  className="bg-red-500 text-white p-2 rounded-md hover:bg-red-600 focus:outline-none focus:ring focus:border-red-300 disabled:opacity-50"
          >
            {closingTurno ? 'Cerrando...' : 'Cerrar Jornada'}
          </button>
        )}
      </div>

      {/* Sección para gestionar turnos y carreras */}
      <div className="mt-6 p-4 bg-white rounded-lg shadow">
        {/* Título de la sección de turno (cambia si hay turno activo) */}
        <h2>
          {activeTurnoId ? 'Turno Actual' : 'Crear Nuevo Turno'}
        </h2>

        {/* Contenido condicional basado en si hay un turno activo */}
        {!activeTurnoId ? (
          <div className="flex flex-col gap-4">
            <h4 className="text-lg font-semibold">Iniciar Nuevo Turno</h4>
            <input
              type="number"
              placeholder="Km Inicial"
              value={kmInicialInput}
              onChange={(e) => setKmInicialInput(e.target.value)}
              required
              className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:border-blue-500"
            />
            <button onClick={handleNewTurno} disabled={creatingTurno || !jornada}
                    className="bg-green-500 text-white p-2 rounded-md hover:bg-green-600 focus:outline-none focus:ring focus:border-green-300 disabled:opacity-50"
            >
              {creatingTurno ? 'Creando Turno...' : 'Crear Turno'}
            </button>
            {error && <p className="error-message">{error}</p>}
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            <p className="text-lg font-semibold">Turno activo ID: {activeTurnoId}</p>
            {/* Botón para añadir nueva carrera */}
            {!showCarreraForm ? (
              <button onClick={() => setShowCarreraForm(true)}
                      className="bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring focus:border-blue-300"
              >
                Registrar Carrera
              </button>
            ) : (
              <div className="flex flex-col gap-4 p-4 border border-gray-200 rounded-md">
                <h4 className="text-lg font-semibold">Registrar Nueva Carrera</h4>
                <div>
                  <label htmlFor="importeTotal">Importe Total:</label>
                  <input
                    type="number"
                    id="importeTotal"
                    value={importeTotalInput}
                    onChange={(e) => setImporteTotalInput(e.target.value)}
                    className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:border-blue-500"
                    step="0.01"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="tipoPago">Tipo de Pago:</label>
                  <select
                    id="tipoPago"
                    value={tipoPagoInput}
                    onChange={(e) => setTipoPagoInput(e.target.value)}
                    className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:border-blue-500"
                    required
                  >
                    <option value="EFECTIVO">Efectivo</option>
                    <option value="TARJETA">Tarjeta</option>
                    <option value="BIZUM">Bizum</option>
                  </select>
                </div>
                <div className="flex justify-end gap-2 mt-2">
                  <button
                    onClick={handleNewCarrera}
                    className="bg-green-500 text-white p-2 rounded-md hover:bg-green-600 focus:outline-none focus:ring focus:border-green-300"
                  >
                    Guardar Carrera
                  </button>
                  <button
                    onClick={() => setShowCarreraForm(false)}
                    className="bg-gray-300 text-gray-800 p-2 rounded-md hover:bg-gray-400 focus:outline-none focus:ring focus:border-gray-300"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}
            {/* Formulario para cerrar turno */}
            <div className="flex flex-col gap-4 p-4 border border-gray-200 rounded-md">
              <h4 className="text-lg font-semibold">Cerrar Turno Actual</h4>
              <input
                type="number"
                placeholder="Km Final"
                value={kmFinalInput}
                onChange={(e) => setKmFinalInput(e.target.value)}
                required
                className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:border-blue-500"
              />
              <button onClick={handleCloseTurno} disabled={closingTurno}
                      className="bg-red-500 text-white p-2 rounded-md hover:bg-red-600 focus:outline-none focus:ring focus:border-red-300 disabled:opacity-50"
              >
                {closingTurno ? 'Cerrando...' : 'Cerrar Turno'}
              </button>
              {error && error.includes('Por favor, introduce un valor numérico') && <p className="text-red-500 text-center">{error}</p>}
            </div>
          </div>
        )}
      </div>

      {/* TODO: Sección para listar turnos anteriores de la jornada */}
      {/* TODO: Sección para listar carreras del turno activo */}

    </div>
  );
} 