import React from 'react';
import { formatTime, toDateString, formatDateTime } from '../utils/dateUtils';

return (
    <div className="bg-surface/70 backdrop-blur-sm rounded-xl border border-border shadow-lg overflow-hidden">
      <div className="px-6 py-5 border-b border-border flex justify-between items-center">
        <h2 className="text-xl font-bold text-primary">
          {selectedDate 
            ? `Jornadas del ${formatDateTime(selectedDate)}` 
            : 'Jornadas Recientes'}
        </h2>

// ... existing code ... 