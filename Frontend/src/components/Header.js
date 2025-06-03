import React from 'react';

export default function Header({ user, onLogout }) {
  return (
    <header className="w-full bg-surface/60 backdrop-blur-sm border-b border-border shadow-md">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div className="bg-primary p-2 rounded-lg shadow">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-primary">TaxiDay</h1>
        </div>
        
        <div className="flex items-center space-x-4">
          {user && (
            <div className="text-right">
              <p className="text-text font-medium">{user.nombre} {user.apellidos}</p>
              <p className="text-text-muted text-sm">Licencia: {user.licencia}</p>
            </div>
          )}
          <button 
            onClick={onLogout}
            className="bg-primary/10 hover:bg-primary/20 text-primary px-4 py-2 rounded-lg transition-colors"
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    </header>
  );
} 