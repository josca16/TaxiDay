import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Componente para proteger rutas que requieren autenticación
export const ProtectedRoute = ({ children }) => {
  // Usa el hook useAuth para obtener el estado del usuario
  const { user } = useAuth();

  // Si no hay usuario autenticado, redirige a la página de login (reemplazando la entrada en el historial)
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // Si hay usuario autenticado, renderiza los componentes hijos (la ruta protegida)
  return children;
}; 