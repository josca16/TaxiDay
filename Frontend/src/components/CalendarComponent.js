import React, { useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import '../styles/CalendarComponent.css';

// Función auxiliar para obtener solo la fecha (sin hora)
function toDateString(date) {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export default function CalendarComponent({
  selectedDate,
  onDateChange,
  jornadas,
  currentMonth,
  currentYear,
  setCurrentMonth,
  setCurrentYear,
  setMonthlyStats
}) {
  // Calcular las fechas que tienen jornadas
  const jornadasPorFecha = {};
  jornadas.forEach(j => {
    if (j && j.fechaInicio) {
      const fecha = toDateString(j.fechaInicio);
      if (!jornadasPorFecha[fecha]) jornadasPorFecha[fecha] = [];
      jornadasPorFecha[fecha].push(j);
    }
  });
  const fechasConJornada = Object.keys(jornadasPorFecha);

  // Manejador del cambio de fecha en el calendario
  const handleCalendarChange = (date) => {
    onDateChange(date);
    // Actualizar mes y año actual cuando cambie la fecha
    if (date.getMonth() !== currentMonth || date.getFullYear() !== currentYear) {
      setCurrentMonth(date.getMonth());
      setCurrentYear(date.getFullYear());
    }
  };

  // Efecto para calcular estadísticas mensuales cuando cambie el mes o las jornadas
  useEffect(() => {
    // Filtrar jornadas por mes actual
    const jornadasDelMes = jornadas.filter(jornada => {
      if (!jornada || !jornada.fechaInicio) return false;
      const fecha = new Date(jornada.fechaInicio);
      return fecha.getMonth() === currentMonth && fecha.getFullYear() === currentYear;
    });

    // Calcular estadísticas para el mes
    const totalCarreras = jornadasDelMes.reduce((sum, j) => 
      sum + (j.turnos?.reduce((tSum, t) => 
        tSum + (t.carreras?.length || 0), 0) || 0), 0);
    
    const totalRecaudado = jornadasDelMes.reduce((sum, j) => 
      sum + (j.turnos?.reduce((tSum, t) => 
        tSum + (t.carreras?.reduce((cSum, c) => 
          cSum + (parseFloat(c.importeTotal) || 0), 0) || 0), 0) || 0), 0);

    setMonthlyStats({
      totalJornadas: jornadasDelMes.length,
      totalCarreras,
      totalRecaudado
    });
  }, [jornadas, currentMonth, currentYear, setMonthlyStats]);

  return (
    <div className="bg-surface/70 backdrop-blur-sm rounded-xl border border-border p-4 shadow-lg react-calendar-container">
      <Calendar
        onChange={handleCalendarChange}
        value={selectedDate || new Date()}
        onActiveStartDateChange={({ activeStartDate }) => {
          if (activeStartDate) {
            setCurrentMonth(activeStartDate.getMonth());
            setCurrentYear(activeStartDate.getFullYear());
          }
        }}
        tileClassName={({ date, view }) => {
          if (view === 'month') {
            const dateString = toDateString(date);
            // Comprobar si hay jornadas para este día
            const hasJornada = fechasConJornada.includes(dateString);
            return hasJornada ? 'has-jornada' : null;
          }
        }}
        className="border-none shadow-none"
      />
    </div>
  );
} 