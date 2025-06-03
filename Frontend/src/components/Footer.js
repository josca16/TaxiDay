import React from 'react';

export default function Footer() {
  return (
    <footer className="w-full py-4 bg-surface/60 backdrop-blur-sm border-t border-border">
      <div className="container mx-auto px-6 text-center">
        <p className="text-text-muted text-sm">© {new Date().getFullYear()} TaxiDay | Todos los derechos reservados</p>
      </div>
    </footer>
  );
} 