// Función para ajustar la hora (añadir 2 horas)
export const adjustDateTime = (dateString) => {
  if (!dateString) return null;
  const date = new Date(dateString);
  date.setHours(date.getHours() + 2);
  return date;
};

// Función para formatear la hora
export const formatTime = (dateString) => {
  if (!dateString) return '-';
  const date = adjustDateTime(dateString);
  return date.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
};

// Función para formatear la fecha completa
export const formatDateTime = (dateString, isFinalDate = false) => {
  if (!dateString) return '-';
  const date = isFinalDate ? new Date(dateString) : adjustDateTime(dateString);
  return date.toLocaleString('es-ES', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
};

// Función para obtener solo la fecha (sin hora)
export const toDateString = (dateString) => {
  if (!dateString) return null;
  const date = new Date(dateString);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

// Función para crear una fecha ISO con la hora ajustada
export const createAdjustedISOString = () => {
  const date = new Date();
  date.setHours(date.getHours() - 2); // Restamos 2 horas para que cuando el backend las sume, quede correcta
  return date.toISOString();
}; 