import React, { createContext, useState, useContext, useEffect } from 'react';

// Crea un contexto de React para la autenticación
const AuthContext = createContext(null);

// Componente proveedor del contexto de autenticación
export const AuthProvider = ({ children }) => {
  // Estado para almacenar la información del usuario autenticado
  const [user, setUser] = useState(null);
  // Estado derivado para indicar si el usuario está autenticado
  const isAuthenticated = user !== null;

  // Efecto para cargar la información del usuario desde localStorage al iniciar la aplicación
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const userObj = JSON.parse(storedUser);
      // Si el usuario guardado no es válido, límpialo
      if (!userObj || !userObj.idTaxista) {
        localStorage.removeItem('user');
        setUser(null);
      } else {
        setUser(userObj);
      }
    }
  }, []); // El array vacío asegura que este efecto solo se ejecute una vez al montar el componente

  // Función para iniciar sesión
  const login = (userData) => {
    setUser(userData);
    // Guarda la información del usuario en localStorage para persistencia entre sesiones
    localStorage.setItem('user', JSON.stringify(userData));
  };

  // Función para cerrar sesión
  const logout = () => {
    setUser(null);
    // Elimina la información del usuario de localStorage
    localStorage.removeItem('user');
  };

  // Proporciona el estado del usuario, isAuthenticated y las funciones de login/logout a los componentes hijos
  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook personalizado para acceder fácilmente al contexto de autenticación
export const useAuth = () => {
  const context = useContext(AuthContext);
  // Lanza un error si useAuth se usa fuera de un AuthProvider
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
}; 