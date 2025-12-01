import React, { useState } from 'react';
import { X } from 'lucide-react';

interface NotepadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotepadModal: React.FC<NotepadModalProps> = ({ isOpen, onClose }) => {
  const [note, setNote] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-yellow-50 rounded-xl shadow-2xl w-full max-w-lg h-[500px] flex flex-col animate-in fade-in zoom-in duration-200 border-4 border-yellow-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-yellow-200 bg-yellow-100 rounded-t-lg">
          <h2 className="text-lg font-bold text-yellow-800">Bloco de Notas Rápido</h2>
          <button onClick={onClose} className="text-yellow-700 hover:text-yellow-900">
            <X size={24} />
          </button>
        </div>

        {/* Text Area */}
        <textarea 
          className="flex-1 p-6 bg-transparent outline-none resize-none text-slate-700 font-medium leading-relaxed placeholder:text-yellow-700/40"
          placeholder="Digite suas anotações rápidas aqui..."
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
        
        <div className="p-3 bg-yellow-100/50 text-right text-xs text-yellow-700 border-t border-yellow-200">
          As anotações não são salvas no banco de dados.
        </div>
      </div>
    </div>
  );
};