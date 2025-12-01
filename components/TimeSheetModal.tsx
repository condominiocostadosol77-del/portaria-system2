import React, { useState, useEffect } from 'react';
import { X, Save, Calendar, Clock } from 'lucide-react';
import { TimeRecord, Employee, TimeRecordType } from '../types';

interface TimeSheetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<TimeRecord, 'id' | 'employeeName'>) => void;
  employees: Employee[];
  initialData?: TimeRecord;
}

export const TimeSheetModal: React.FC<TimeSheetModalProps> = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  employees,
  initialData 
}) => {
  const [formData, setFormData] = useState({
    employeeId: '',
    date: '',
    shift: 'diurno',
    entryTime: '',
    exitTime: '',
    type: 'normal' as TimeRecordType,
    observations: ''
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        employeeId: initialData.employeeId,
        date: initialData.date,
        shift: initialData.shift,
        entryTime: initialData.entryTime,
        exitTime: initialData.exitTime,
        type: initialData.type,
        observations: initialData.observations
      });
    } else {
      // Set default date to today, ensuring YYYY-MM-DD format
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const today = `${year}-${month}-${day}`;
      
      setFormData({
        employeeId: '',
        date: today,
        shift: 'diurno',
        entryTime: '',
        exitTime: '',
        type: 'normal',
        observations: ''
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // The date from input type="date" is already in YYYY-MM-DD format.
    // We pass it directly to avoid timezone/month index issues associated with creating new Date() objects.
    onSubmit(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-slate-800">
            {initialData ? 'Editar Registro de Ponto' : 'Novo Registro de Ponto'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          
          {/* Employee */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Funcionário *</label>
            <select
              required
              value={formData.employeeId}
              onChange={(e) => setFormData({...formData, employeeId: e.target.value})}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-100 focus:border-purple-500 outline-none bg-white"
            >
              <option value="" disabled>Selecione o funcionário</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>{emp.name}</option>
              ))}
            </select>
          </div>

          {/* Date & Shift */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Data *</label>
              <input
                required
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-100 focus:border-purple-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Turno *</label>
              <select
                value={formData.shift}
                onChange={(e) => setFormData({...formData, shift: e.target.value})}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-100 focus:border-purple-500 outline-none bg-white"
              >
                <option value="diurno">Diurno</option>
                <option value="noturno">Noturno</option>
              </select>
            </div>
          </div>

          {/* Times */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Hora Entrada</label>
              <input
                type="time"
                value={formData.entryTime}
                onChange={(e) => setFormData({...formData, entryTime: e.target.value})}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-100 focus:border-purple-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Hora Saída</label>
              <input
                type="time"
                value={formData.exitTime}
                onChange={(e) => setFormData({...formData, exitTime: e.target.value})}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-100 focus:border-purple-500 outline-none"
              />
            </div>
          </div>

          {/* Type */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Tipo *</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({...formData, type: e.target.value as TimeRecordType})}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-100 focus:border-purple-500 outline-none bg-white capitalize"
            >
              <option value="normal">Normal</option>
              <option value="extra">Hora Extra</option>
              <option value="falta">Falta</option>
              <option value="folga">Folga</option>
            </select>
          </div>

          {/* Observations */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Observações</label>
            <textarea
              rows={3}
              value={formData.observations}
              onChange={e => setFormData({...formData, observations: e.target.value})}
              placeholder="Informações adicionais sobre o registro..."
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-100 focus:border-purple-500 outline-none resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-lg border border-gray-300 text-slate-700 font-medium hover:bg-slate-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-lg bg-secondary hover:bg-purple-600 text-white font-medium shadow-lg shadow-purple-200 transition-colors flex items-center gap-2"
            >
              <Save size={18} />
              {initialData ? 'Salvar' : 'Registrar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};