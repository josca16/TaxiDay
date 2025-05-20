import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Página de detalle y ejecución de un turno específico
export default function TurnoPage() {
  // Obtiene el parámetro de la URL (el ID del turno)
  const { turnoId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Estados para el turno actual, carga y errores
  const [turno, setTurno] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // TODO: Estados para gestionar la creación de carreras (importe, tipo pago, etc.) y el cierre del turno (km final)

  // Efecto para cargar los detalles del turno cuando el componente se monta o el ID cambia
  useEffect(() => {
    const fetchTurnoDetails = async () => {
      if (!user) {
        setError('Usuario no autenticado.');
        setLoading(false);
        return;
      }

      try {
        // Llama al endpoint del backend para obtener un turno por su ID
        const resp = await fetch(`/api/turnos/${turnoId}`);

        if (!resp.ok) {
          throw new Error(`Error al cargar detalles del turno: ${resp.statusText}`);
        }

        const data = await resp.json();

        // TODO: Verificar si el turno pertenece a una jornada del usuario autenticado (medida de seguridad más robusta)
        // Por ahora, asumimos que si el usuario está autenticado y puede acceder a este endpoint, está bien.

        setTurno(data); // Almacena los datos del turno
        console.log('Detalles del turno cargados:', data);

      } catch (err) {
        setError(err.message);
        console.error('Error fetching turno details:', err);
      } finally {
        setLoading(false);
      }
    };

    if (turnoId) {
        fetchTurnoDetails();
    } else {
        setError('ID de turno no proporcionado.');
        setLoading(false);
    }

  }, [turnoId, user, navigate]); // Dependencias del efecto

  // TODO: Implementar funciones para crear nueva carrera y cerrar turno

  if (loading) {
    return <div className="container">Cargando turno...</div>;
  }

  if (error) {
    return <div className="container error-message">{error}</div>;
  }

  if (!turno) {
      return <div className="container">Turno no encontrado.</div>;
  }

  return (
    <div className="turno-page-container">
      <h2>Detalle de Turno #{turno.idTurno}</h2>
      <p>Km Inicial: {turno.kmInicial}</p>
      <p>Estado: {turno.estado}</p>
      {/* Mostrar otros detalles del turno aquí */}
      {/* Por ejemplo: Fecha Inicio, Fecha Final, Km Final */}

      <div className="carrera-section">
        <h3>Gestión de Carreras</h3>
        {/* TODO: Botón y formulario para Nueva Carrera */}
        <button>Nueva Carrera</button> {/* TODO: Implementar handler */}
        {/* TODO: Lista de carreras asociadas a este turno */}
      </div>

      {/* Sección para cerrar turno */}
      {turno.estado !== 'CERRADO' && (
          <div className="close-turno-form">
               <h4>Cerrar Turno</h4>
               {/* TODO: Input para Km Final */}
               {/* TODO: Botón para Cerrar Turno */}
               <button>Cerrar Turno</button> {/* TODO: Implementar handler */}
          </div>
      )}

      {/* Botón para volver a la jornada */}
       <button onClick={() => navigate(`/jornada/${turno.idJornada}`)}>Volver a la Jornada</button> {/* Asumiendo que el TurnoDto incluye idJornada o se puede inferir */}

    </div>
  );
} 