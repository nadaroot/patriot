import React from 'react';
import { CheckCircle2, X } from 'lucide-react';

export const Toast = ({ message, onClose }) => {
  if (!message) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm bg-neutral-900 border border-neutral-750 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-3 duration-200">
      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
      <span className="text-xs sm:text-sm font-medium font-sans leading-snug">{message}</span>
      <button
        onClick={onClose}
        className="text-neutral-400 hover:text-white p-1 -mr-1 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
