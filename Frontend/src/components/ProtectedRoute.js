import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Componente para proteger rutas que requieren autenticación
export const ProtectedRoute = ({ children }) => {
  // Usa el hook useAuth para obtener el estado del usuario
  const { user, isAuthenticated } = useAuth();

  // Si no hay usuario autenticado o no tiene idTaxista, redirige a la página de login
  if (!isAuthenticated || !user || !user.idTaxista) {
    return <Navigate to="/" replace />;
  }

  // Si hay usuario autenticado y válido, renderiza los componentes hijos (la ruta protegida)
  return children;
}; 