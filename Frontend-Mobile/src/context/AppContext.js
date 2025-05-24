import React, { createContext, useState, useContext } from 'react';
import axios from 'axios';
import { API_URL } from '../config/api';

const AppContext = createContext();

export const useApp = () => {
  return useContext(AppContext);
};

export const AppProvider = ({ children }) => {
  const [currentJornada, setCurrentJornada] = useState(null);
  const [carreras, setCarreras] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const iniciarJornada = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.post(`${API_URL}/jornadas/iniciar`);
      setCurrentJornada(response.data);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Error al iniciar jornada');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const finalizarJornada = async () => {
    try {
      setLoading(true);
      setError(null);
      await axios.post(`${API_URL}/jornadas/${currentJornada.id}/finalizar`);
      setCurrentJornada(null);
      setCarreras([]);
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'Error al finalizar jornada');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const agregarCarrera = async (carreraData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.post(`${API_URL}/carreras`, {
        ...carreraData,
        jornadaId: currentJornada.id
      });
      setCarreras([...carreras, response.data]);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Error al agregar carrera');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const cargarCarreras = async (jornadaId) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${API_URL}/carreras/jornada/${jornadaId}`);
      setCarreras(response.data);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar carreras');
      return [];
    } finally {
      setLoading(false);
    }
  };

  const value = {
    currentJornada,
    carreras,
    loading,
    error,
    iniciarJornada,
    finalizarJornada,
    agregarCarrera,
    cargarCarreras
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}; 