// Configuración de la API
export const API_URL = 'http://backend:8085/api';

// Configuración de axios
import axios from 'axios';

axios.defaults.baseURL = API_URL;
axios.defaults.headers.post['Content-Type'] = 'application/json';

// Interceptor para manejar errores
axios.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Manejar error de autenticación
      // Por ejemplo, redirigir al login
    }
    return Promise.reject(error);
  }
); 