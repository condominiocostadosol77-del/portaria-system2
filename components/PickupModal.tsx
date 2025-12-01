import React, { useState, useEffect } from 'react';
import { PackageItem } from '../types';
import { Clock } from 'lucide-react';

interface PickupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (name: string) => void;
  packageData?: PackageItem;
  itemCount?: number;
}

export const PickupModal: React.FC<PickupModalProps> = ({ isOpen, onClose, onConfirm, packageData, itemCount = 1 }) => {
  const [name, setName] = useState('');

  // Reset name when modal opens
  useEffect(() => {
    if (isOpen) {
      setName('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 animate-in fade-in zoom-in duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-2">
           <h3 className="text-lg font-bold text-slate-800">
             {itemCount > 1 ? `Confirmar Retirada (${itemCount})` : 'Confirmar Retirada'}
           </h3>
           {packageData && itemCount === 1 && (
             <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full font-medium flex items-center gap-1">
               <Clock size={10} /> Aguardando Retirada
             </span>
           )}
        </div>
        
        <p className="text-slate-500 text-sm mb-4">
          {itemCount > 1 
            ? `Informe quem está retirando as ${itemCount} encomendas.` 
            : 'Informe quem está retirando a encomenda.'}
        </p>

        <div className="mb-6">
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">Nome</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-100 focus:border-green-500 outline-none"
            autoFocus
          />
        </div>

        <div className="w-full">
          <button 
            onClick={() => onConfirm(name)}
            disabled={!name.trim()}
            className="w-full bg-slate-900 text-white py-3 rounded-lg font-bold hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
};