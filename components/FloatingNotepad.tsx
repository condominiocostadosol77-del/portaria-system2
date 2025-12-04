
import React, { useState } from 'react';
import { X, Minus, Save, FileEdit } from 'lucide-react';
import { Occurrence, Employee } from '../types';
import { ShiftHandoverModal } from './ShiftHandoverModal';

interface FloatingNotepadProps {
  isOpen: boolean;
  isMinimized: boolean;
  onClose: () => void;
  onMinimize: () => void;
  onMaximize: () => void;
  onSave: (data: Omit<Occurrence, 'id' | 'timestamp'>) => void;
  employees: Employee[];
}

export const FloatingNotepad: React.FC<FloatingNotepadProps> = ({ 
  isOpen, 
  isMinimized, 
  onClose, 
  onMinimize,
  onMaximize,
  onSave,
  employees
}) => {
  // Initialize from localStorage if available
  const [note, setNote] = useState(() => {
    return localStorage.getItem('portaria_notepad_content') || '';
  });
  
  const [isHandoverOpen, setIsHandoverOpen] = useState(false);

  if (!isOpen) return null;

  // Floating Icon View (Minimized)
  if (isMinimized) {
    return (
      <div 
        onClick={onMaximize}
        className="fixed bottom-6 right-6 z-[60] w-14 h-14 bg-[#EAB308] hover:bg-[#CA8A04] text-white rounded-full shadow-xl cursor-pointer flex items-center justify-center transition-transform hover:scale-110 animate-in zoom-in duration-300 border-4 border-white"
        title="Abrir Bloco de Notas"
      >
        <FileEdit size={24} />
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white"></span>
      </div>
    );
  }

  const handleSaveClick = () => {
    setIsHandoverOpen(true);
  };

  const handleHandoverConfirm = (data: Omit<Occurrence, 'id' | 'timestamp'>) => {
    onSave(data);
    setNote(''); // Clear note after saving
    localStorage.removeItem('portaria_notepad_content'); // Clear storage
    setIsHandoverOpen(false);
    onClose(); // Close notepad
  };

  const handleNoteChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setNote(newValue);
    localStorage.setItem('portaria_notepad_content', newValue);
  };

  return (
    <>
      <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/20 backdrop-blur-[2px] p-4 pointer-events-none">
        <div className="pointer-events-auto bg-[#FEF9C3] rounded-xl shadow-2xl w-full max-w-2xl h-[600px] flex flex-col animate-in fade-in zoom-in duration-200 border border-[#FDE047] relative">
          
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#FDE047] bg-[#FEF08A] rounded-t-xl">
            <div className="flex items-center gap-2 text-[#854D0E]">
              <FileEdit size={20} />
              <h2 className="text-sm font-bold uppercase tracking-wide">Bloco de Notas de Plantão</h2>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={onMinimize}
                className="p-1.5 hover:bg-[#FDE047] rounded-lg text-[#854D0E] transition-colors"
                title="Minimizar"
              >
                <Minus size={20} />
              </button>
              <button 
                onClick={onClose}
                className="p-1.5 hover:bg-[#FDE047] rounded-lg text-[#854D0E] transition-colors"
                title="Fechar"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Sub-header info */}
          <div className="px-6 py-2 bg-[#FEF9C3] text-xs text-[#A16207]">
            Escreva durante o turno. Minimize se precisar.
          </div>

          {/* Lined Paper Text Area */}
          <div className="flex-1 relative bg-white mx-1 overflow-hidden">
            <div 
              className="absolute inset-0 pointer-events-none opacity-20"
              style={{
                backgroundImage: 'linear-gradient(#E5E7EB 1px, transparent 1px)',
                backgroundSize: '100% 2rem',
                marginTop: '1.9rem'
              }}
            />
            <textarea 
              className="w-full h-full p-6 bg-transparent outline-none resize-none text-slate-700 text-lg leading-[2rem] font-medium"
              placeholder="Digite aqui as ocorrências do dia, observações ou pendências..."
              value={note}
              onChange={handleNoteChange}
              style={{ lineHeight: '2rem' }}
            />
          </div>
          
          {/* Footer Actions */}
          <div className="p-4 bg-[#FEF08A] border-t border-[#FDE047] rounded-b-xl flex items-center justify-between">
             <button
               onClick={onMinimize}
               className="text-[#854D0E] text-sm font-medium hover:underline px-2"
             >
               Minimizar
             </button>
             
             <button
               onClick={handleSaveClick}
               disabled={!note.trim()}
               className="bg-[#D97706] hover:bg-[#B45309] text-white px-6 py-2.5 rounded-lg flex items-center gap-2 font-bold shadow-lg shadow-orange-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
             >
               <Save size={18} />
               Salvar em Ocorrências
             </button>
          </div>
        </div>
      </div>

      <ShiftHandoverModal 
        isOpen={isHandoverOpen}
        onClose={() => setIsHandoverOpen(false)}
        onConfirm={handleHandoverConfirm}
        employees={employees}
        notepadContent={note}
      />
    </>
  );
};
