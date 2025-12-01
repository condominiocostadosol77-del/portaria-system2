import React, { useState } from 'react';
import { ArrowRightLeft } from 'lucide-react';
import { Employee, Occurrence } from '../types';

interface ShiftHandoverModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: Omit<Occurrence, 'id' | 'timestamp'>) => void;
  employees: Employee[];
  notepadContent: string;
}

export const ShiftHandoverModal: React.FC<ShiftHandoverModalProps> = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  employees,
  notepadContent
}) => {
  const [outgoing, setOutgoing] = useState('');
  const [incoming, setIncoming] = useState('');

  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm({
      outgoingEmployeeName: outgoing,
      incomingEmployeeName: incoming,
      description: notepadContent
    });
    setOutgoing('');
    setIncoming('');
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
        
        {/* Header */}
        <div className="p-4 border-b border-gray-100 flex items-center gap-3 bg-slate-50">
          <div className="text-primary">
            <ArrowRightLeft size={20} />
          </div>
          <h2 className="text-lg font-bold text-slate-800">Passagem de Posto</h2>
        </div>

        <div className="p-6">
          <p className="text-slate-600 text-sm mb-6">
            Para salvar as notas do turno, confirme os funcionários responsáveis pela passagem.
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Funcionário Saindo (Entregando)</label>
              <select
                value={outgoing}
                onChange={(e) => setOutgoing(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-white text-sm"
              >
                <option value="">Selecione...</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.name}>{emp.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Funcionário Entrando (Recebendo)</label>
              <select
                value={incoming}
                onChange={(e) => setIncoming(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-white text-sm"
              >
                <option value="">Selecione...</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.name}>{emp.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="p-4 bg-gray-50 flex items-center justify-end gap-3 border-t border-gray-100">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-gray-300 text-slate-700 font-medium hover:bg-white transition-colors text-sm"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={!outgoing || !incoming}
            className="px-4 py-2 rounded-lg bg-primary hover:bg-blue-600 text-white font-medium transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Confirmar e Salvar
          </button>
        </div>
      </div>
    </div>
  );
};