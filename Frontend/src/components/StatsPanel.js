import React from 'react';

export default function StatsPanel({ stats, icons }) {
  return (
    <div className="grid grid-cols-3 gap-4 mb-6">
      <div className="bg-surface/70 backdrop-blur-sm p-4 rounded-xl border border-border shadow-lg flex items-center space-x-3">
        <div className="bg-primary/20 p-2 rounded-lg">
          {icons[0]}
        </div>
        <div>
          <p className="text-2xl font-bold text-primary">{stats.totalJornadas}</p>
          <p className="text-text-muted text-xs">Jornadas</p>
        </div>
      </div>
      
      <div className="bg-surface/70 backdrop-blur-sm p-4 rounded-xl border border-border shadow-lg flex items-center space-x-3">
        <div className="bg-primary/20 p-2 rounded-lg">
          {icons[1]}
        </div>
        <div>
          <p className="text-2xl font-bold text-primary">{stats.totalCarreras}</p>
          <p className="text-text-muted text-xs">Carreras</p>
        </div>
      </div>

      <div className="bg-surface/70 backdrop-blur-sm p-4 rounded-xl border border-border shadow-lg flex items-center space-x-3">
        <div className="bg-primary/20 p-2 rounded-lg">
          {icons[2]}
        </div>
        <div>
          <p className="text-2xl font-bold text-primary">{stats.totalRecaudado.toFixed(2)}€</p>
          <p className="text-text-muted text-xs">Recaudación</p>
        </div>
      </div>
    </div>
  );
} 