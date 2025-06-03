import React from 'react';

export default function MonthlyStats({ currentMonth, currentYear, monthlyStats }) {
  return (
    <div className="bg-surface/70 backdrop-blur-sm rounded-xl border border-border shadow-lg overflow-hidden">
      <div className="px-6 py-5 border-b border-border">
        <h2 className="text-xl font-bold text-primary">Estadísticas Mensuales</h2>
      </div>
      
      <div className="p-6">
        <h3 className="text-lg font-medium mb-4">
          {new Date(currentYear, currentMonth).toLocaleString('es', { month: 'long', year: 'numeric' })}
        </h3>
        
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-text-muted">Jornadas:</span>
            <span className="font-semibold">{monthlyStats.totalJornadas}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-text-muted">Carreras:</span>
            <span className="font-semibold">{monthlyStats.totalCarreras}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-text-muted">Recaudación:</span>
            <span className="font-semibold text-primary">{monthlyStats.totalRecaudado.toFixed(2)}€</span>
          </div>
        </div>
      </div>
    </div>
  );
} 