import React, { useState } from 'react';
import { X, Save } from 'lucide-react';
import { Occurrence, Employee } from '../types';

interface OccurrenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Occurrence, 'id' | 'timestamp'>) => void;
  employees: Employee[];
}

export const OccurrenceModal: React.FC<OccurrenceModalProps> = ({ 
  isOpen, 
  onClose, 
  onSubmit,
  employees
}) => {
  const [outgoing, setOutgoing] = useState('');
  const [incoming, setIncoming] = useState('');
  const [description, setDescription] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      outgoingEmployeeName: outgoing,
      incomingEmployeeName: incoming,
      description
    });
    // Reset
    setOutgoing('');
    setIncoming('');
    setDescription('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-slate-800">Nova Ocorrência / Passagem de Turno</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Funcionário Saindo</label>
              <select
                value={outgoing}
                onChange={(e) => setOutgoing(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-100 focus:border-orange-500 outline-none bg-white"
              >
                <option value="">Selecione</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.name}>{emp.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Funcionário Entrando</label>
              <select
                value={incoming}
                onChange={(e) => setIncoming(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-100 focus:border-orange-500 outline-none bg-white"
              >
                <option value="">Selecione</option>
                 {employees.map(emp => (
                  <option key={emp.id} value={emp.name}>{emp.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
             <label className="block text-sm font-semibold text-slate-700 mb-1.5">Relato / Ocorrências *</label>
             <textarea
               required
               rows={6}
               value={description}
               onChange={(e) => setDescription(e.target.value)}
               placeholder="Descreva as ocorrências..."
               className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-100 focus:border-orange-500 outline-none resize-none"
             />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-lg border border-gray-300 text-slate-700 font-medium hover:bg-slate-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-medium flex items-center gap-2 transition-colors shadow-lg shadow-orange-200"
            >
              <Save size={18} />
              Registrar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};