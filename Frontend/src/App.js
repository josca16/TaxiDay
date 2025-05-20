import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Home from './pages/Home';
import JornadaPage from './pages/JornadaPage';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';

function App() {
  return (
    // AuthProvider envuelve toda la aplicación para proporcionar el contexto de autenticación
    <AuthProvider>
      {/* BrowserRouter habilita la navegación basada en URL */}
      <BrowserRouter>
        {/* Routes define las rutas de la aplicación */}
        <Routes>
          {/* Ruta para la página de Login (ruta raíz) */}
          <Route path="/" element={<LoginPage />} />
          {/* Ruta para la página de Registro */}
          <Route path="/register" element={<RegisterPage />} />
          {/* Ruta protegida para la página de Inicio */}
          <Route 
            path="/home" 
            element={
              // ProtectedRoute asegura que solo los usuarios autenticados puedan acceder a /home
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            } 
          />
          {/* Ruta protegida para la página de Jornada */}
          <Route 
            path="/jornada/:jornadaId"
            element={
              <ProtectedRoute>
                <JornadaPage />
              </ProtectedRoute>
            }
          />
          {/* Aquí puedes añadir más rutas protegidas si es necesario */}
          {/* <Route path="/otra-pagina" element={<ProtectedRoute><OtraPagina /></ProtectedRoute>} /> */}
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
