import React from "react";

export default function ModalDetalles({ open, onClose, titulo, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-surface rounded-3xl shadow-2xl border border-border max-w-2xl w-full p-8 relative animate-fade-in flex flex-col gap-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-2xl text-primary hover:text-primary-dark focus:outline-none font-bold bg-background/80 rounded-full w-8 h-8 flex items-center justify-center shadow border border-primary/20"
          aria-label="Cerrar"
        >
          ×
        </button>
        {titulo && <h2 className="text-2xl font-extrabold text-primary mb-2 text-center tracking-tight drop-shadow">{titulo}</h2>}
        <div className="overflow-y-auto max-h-[75vh] pr-1 flex flex-col gap-8">
          {children}
        </div>
      </div>
    </div>
  );
} 