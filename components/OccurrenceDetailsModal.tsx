import React from 'react';
import { X, Trash2, Clock } from 'lucide-react';
import { Occurrence } from '../types';

interface OccurrenceDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: Occurrence | null;
  onDelete: (id: string) => void;
}

export const OccurrenceDetailsModal: React.FC<OccurrenceDetailsModalProps> = ({ 
  isOpen, 
  onClose, 
  data,
  onDelete
}) => {
  if (!isOpen || !data) return null;

  const handleDelete = () => {
    onDelete(data.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-slate-800">Detalhes da Ocorrência</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          {/* Shift Info */}
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase">Funcionário Saindo</span>
                <p className="text-lg font-bold text-slate-800">{data.outgoingEmployeeName || '-'}</p>
              </div>
              <div>
                 <span className="text-xs font-semibold text-slate-400 uppercase">Funcionário Entrando</span>
                 <p className="text-lg font-bold text-slate-800">{data.incomingEmployeeName || '-'}</p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-200">
              <span className="text-xs font-semibold text-slate-400 uppercase">Data do Registro</span>
              <div className="flex items-center gap-2 mt-1 text-slate-700 font-medium">
                <Clock size={16} />
                {data.timestamp}
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="mb-6">
             <span className="text-xs font-semibold text-slate-400 uppercase block mb-2">Relato / Ocorrências</span>
             <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100 text-slate-700 whitespace-pre-wrap">
               {data.description}
             </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <button
              onClick={handleDelete}
              className="px-4 py-2 rounded-lg bg-red-500 text-white font-medium hover:bg-red-600 transition-colors flex items-center gap-2 shadow-sm"
            >
              <Trash2 size={16} />
              Excluir
            </button>
            <button
              onClick={onClose}
              className="px-6 py-2 rounded-lg bg-slate-100 text-slate-700 font-medium hover:bg-slate-200 transition-colors"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};