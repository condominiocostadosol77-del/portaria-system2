import React from 'react';
import { LogOut } from 'lucide-react';

interface ConfirmLogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const ConfirmLogoutModal: React.FC<ConfirmLogoutModalProps> = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-xs p-6 transform transition-all scale-100 border border-slate-100">
        <div className="flex flex-col items-start">
          <div className="flex items-center gap-2 mb-2 text-red-600">
             <LogOut size={20} />
             <h3 className="text-lg font-bold">Confirmar Passagem</h3>
          </div>
          
          <p className="text-slate-600 mb-6 text-sm leading-relaxed">
            Deseja encerrar seu turno? O sistema retornará para a tela de login.
          </p>
          
          <div className="flex flex-col gap-3 w-full">
            <button 
              onClick={onConfirm}
              className="w-full px-4 py-2.5 rounded-lg bg-red-500 hover:bg-red-600 text-white font-medium transition-colors shadow-md shadow-red-100"
            >
              Confirmar e Sair
            </button>
            <button 
              onClick={onClose}
              className="w-full px-4 py-2.5 rounded-lg text-slate-500 font-medium hover:bg-slate-50 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};