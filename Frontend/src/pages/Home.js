import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

// Página de inicio (requiere autenticación)
export default function Home() {
  // Usa el hook useAuth para obtener el usuario autenticado y la función de logout
  const { user, logout } = useAuth();
  // Hook para la navegación programática
  const navigate = useNavigate();

  // Estado para almacenar las jornadas del taxista
  const [jornadas, setJornadas] = useState([]);
  const [loading, setLoading] = useState(true); // Estado de carga
  const [error, setError] = useState(null); // Estado para errores

  // Estado para la jornada actualmente activa
  const [activeJornadaId, setActiveJornadaId] = useState(null);

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

        // Intentar encontrar una jornada activa (estado CREADA/ABIERTA)
        const openJornada = userJornadas.find(jornada => jornada.estado === 'CREADA' || jornada.estado === 'ABIERTA'); // Ajustar estado según backend
        if (openJornada) {
          setActiveJornadaId(openJornada.idJornada);
          console.log('Jornada activa encontrada:', openJornada.idJornada);
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

  // Maneja la acción de crear una nueva jornada
  const handleNewJornada = async () => {
    if (!user || !user.idTaxista) {
      setError('Usuario no autenticado para crear jornada.');
      return;
    }

    // Evitar crear una nueva jornada si ya hay una activa
    if (activeJornadaId) {
      setError('Ya tienes una jornada activa. Ciérrala antes de crear una nueva.');
      return;
    }

    try {
      const resp = await fetch('/api/jornadas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          // El backend debería asignar fechaInicio y estado (CREADA)
          // Solo necesitamos enviar el taxista
          taxista: { idTaxista: user.idTaxista }
        })
      });

      if (!resp.ok) {
        const errorData = await resp.json();
        throw new Error(`Error al crear jornada: ${errorData.message || resp.statusText}`);
      }

      const newJornada = await resp.json();
      setJornadas([...jornadas, newJornada]); // Añadir la nueva jornada a la lista
      setActiveJornadaId(newJornada.idJornada); // Establecer la nueva jornada como activa
      console.log('Nueva jornada creada:', newJornada);
      // Aquí podrías navegar a la vista de turno/carrera si es necesario
      // navigate('/jornada/' + newJornada.idJornada);

    } catch (err) {
      setError(err.message);
      console.error('Error creating jornada:', err);
    }
  };

  // Maneja la acción de cerrar sesión
  const handleLogout = () => {
    logout(); // Llama a la función logout del contexto
    navigate('/'); // Redirige a la página de login
  };

  return (
    // Estructura Jsx de la página de inicio
    <div className="container mx-auto p-4">
      {/* Encabezado de la página de inicio */}
      <header className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
        <h1>Bienvenido a TaxiDay</h1>
        {/* Información del usuario autenticado y botón de cerrar sesión */}
        <div className="flex items-center gap-4">
          <p>Conductor: {user?.licencia}</p> {/* Muestra la licencia del usuario */}
          <button onClick={handleLogout} className="bg-red-500 text-white p-2 rounded-md hover:bg-red-600 focus:outline-none focus:ring focus:border-red-300">Cerrar sesión</button>
        </div>
      </header>
      
      {/* Contenido principal del panel de control */}
      <main className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <section className="dashboard">
          <h2>Panel de Control</h2>

          {/* Botones de acción: Nueva Jornada / Continuar Jornada */}
          <div className="flex flex-col gap-4 mb-6">
            {!activeJornadaId && (
               <button onClick={handleNewJornada} disabled={loading}
               className="bg-green-500 text-white p-2 rounded-md hover:bg-green-600 focus:outline-none focus:ring focus:border-green-300 disabled:opacity-50"
               >
                 Nueva Jornada
               </button>
            )}
             {activeJornadaId && (
               <button onClick={() => navigate('/jornada/' + activeJornadaId)}
               className="bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring focus:border-blue-300"
               >
                 Continuar Jornada
               </button>
            )}
             {/* Mostrar mensaje si ya hay una jornada activa y no se muestra Continuar */}
             {error && error.includes('Ya tienes una jornada activa') && !activeJornadaId && (
                <p className="text-red-500 text-center">{error}</p>
             )}
          </div>

          {/* Grid para mostrar información resumida */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Tarjeta de estado actual */}
            <div className="bg-white p-4 rounded-lg shadow">
              <h3>Estado Actual</h3>
              <p>Disponible</p> {/* Placeholder: Aquí iría el estado real del taxista */}
            </div>
            {/* Tarjeta de viajes del día */}
            <div className="bg-white p-4 rounded-lg shadow">
              <h3>Viajes del Día</h3>
              <p>0</p> {/* Placeholder: Aquí iría el conteo real de viajes */}
            </div>
            {/* Tarjeta de ganancias */}
            <div className="bg-white p-4 rounded-lg shadow">
              <h3>Ganancias</h3>
              <p>€0.00</p> {/* Placeholder: Aquí irían las ganancias reales */}
            </div>
          </div>
        </section>

        {/* Sección para mostrar las jornadas del taxista */}
        <section className="md:col-span-2 bg-white p-4 rounded-lg shadow">
          <h2>Mis Jornadas</h2>
          {loading && <p className="text-center text-gray-500">Cargando jornadas...</p>}
          {error && <p className="text-red-500 text-center">Error: {error}</p>}
          {!loading && !error && jornadas.length === 0 && <p className="text-center text-gray-500">No hay jornadas registradas.</p>}
          
          {/* Lista de jornadas */}
          {!loading && !error && jornadas.length > 0 && (
            <div className="mt-4 space-y-4">
              <h3>Historial de Jornadas</h3> {/* Título para la lista */}
              {jornadas.map(jornada => (
                // Aquí puedes mostrar la información relevante de cada jornada
                // Por ahora, solo un placeholder básico
                <div key={jornada.idJornada} className="p-4 border border-gray-200 rounded-md">
                  <p>Jornada ID: {jornada.idJornada}</p>
                  <p>Estado: {jornada.estado}</p>
                  {/* Añadir más detalles de la jornada aquí */}
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}