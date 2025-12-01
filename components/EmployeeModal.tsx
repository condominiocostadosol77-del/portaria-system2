import React, { useState, useEffect } from 'react';
import { X, Save, Upload, Clock, Calendar } from 'lucide-react';
import { Employee, EmployeeStatus, EmployeeShift } from '../types';

interface EmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Employee, 'id'>) => void;
  initialData?: Employee;
}

export const EmployeeModal: React.FC<EmployeeModalProps> = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  initialData 
}) => {
  const [formData, setFormData] = useState({
    name: '',
    cpf: '',
    role: '',
    shift: 'diurno' as EmployeeShift,
    status: 'ativo' as EmployeeStatus,
    entryTime: '',
    exitTime: '',
    phone: '',
    email: '',
    admissionDate: '',
    photoUrl: '',
    observations: ''
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        cpf: initialData.cpf,
        role: initialData.role,
        shift: initialData.shift,
        status: initialData.status,
        entryTime: initialData.entryTime,
        exitTime: initialData.exitTime,
        phone: initialData.phone,
        email: initialData.email,
        admissionDate: initialData.admissionDate,
        photoUrl: initialData.photoUrl || '',
        observations: initialData.observations
      });
    } else {
      setFormData({
        name: '',
        cpf: '',
        role: '',
        shift: 'diurno',
        status: 'ativo',
        entryTime: '--:--',
        exitTime: '--:--',
        phone: '',
        email: '',
        admissionDate: '',
        photoUrl: '',
        observations: ''
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-slate-800">
            {initialData ? 'Editar Funcionário' : 'Novo Funcionário'}
          </h2>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors p-1"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          
          {/* Photo Upload Placeholder */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Foto do Funcionário</label>
            <div className="border border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center text-slate-500 cursor-pointer hover:bg-slate-50 transition-colors w-fit min-w-[150px]">
              <Upload size={20} className="mb-2" />
              <span className="text-sm">Escolher foto</span>
            </div>
          </div>

          {/* Nome */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Nome Completo *</label>
            <input
              required
              type="text"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              placeholder="Nome completo"
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-cyan-100 focus:border-cyan-500 outline-none transition-all placeholder:text-gray-400"
            />
          </div>

          {/* CPF & Cargo */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">CPF</label>
              <input
                type="text"
                value={formData.cpf}
                onChange={e => setFormData({...formData, cpf: e.target.value})}
                placeholder="000.000.000-00"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-cyan-100 focus:border-cyan-500 outline-none transition-all placeholder:text-gray-400"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Cargo *</label>
              <select
                 required
                 value={formData.role}
                 onChange={e => setFormData({...formData, role: e.target.value})}
                 className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-cyan-100 focus:border-cyan-500 outline-none transition-all bg-white"
              >
                <option value="" disabled>Selecione um cargo</option>
                <option value="Porteiro">Porteiro</option>
                <option value="Zelador">Zelador</option>
                <option value="Faxineiro">Faxineiro</option>
                <option value="Gerente">Gerente</option>
              </select>
            </div>
          </div>

          {/* Turno & Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Turno *</label>
              <select
                value={formData.shift}
                onChange={e => setFormData({...formData, shift: e.target.value as EmployeeShift})}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-cyan-100 focus:border-cyan-500 outline-none transition-all bg-white"
              >
                <option value="diurno">Diurno</option>
                <option value="noturno">Noturno</option>
                <option value="administrativo">Administrativo</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Status *</label>
              <select
                value={formData.status}
                onChange={e => setFormData({...formData, status: e.target.value as EmployeeStatus})}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-cyan-100 focus:border-cyan-500 outline-none transition-all bg-white"
              >
                <option value="ativo">Ativo</option>
                <option value="inativo">Inativo</option>
                <option value="ferias">Férias</option>
              </select>
            </div>
          </div>

          {/* Horários */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Horário Entrada</label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.entryTime}
                  onChange={e => setFormData({...formData, entryTime: e.target.value})}
                  placeholder="--:--"
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-cyan-100 focus:border-cyan-500 outline-none transition-all placeholder:text-gray-400"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <Clock size={16} />
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Horário Saída</label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.exitTime}
                  onChange={e => setFormData({...formData, exitTime: e.target.value})}
                  placeholder="--:--"
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-cyan-100 focus:border-cyan-500 outline-none transition-all placeholder:text-gray-400"
                />
                 <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <Clock size={16} />
                </div>
              </div>
            </div>
          </div>

           {/* Telefone & Email */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Telefone</label>
              <input
                type="text"
                value={formData.phone}
                onChange={e => setFormData({...formData, phone: e.target.value})}
                placeholder="(00) 00000-0000"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-cyan-100 focus:border-cyan-500 outline-none transition-all placeholder:text-gray-400"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
                placeholder="email@exemplo.com"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-cyan-100 focus:border-cyan-500 outline-none transition-all placeholder:text-gray-400"
              />
            </div>
          </div>

           {/* Data de Admissão */}
           <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Data de Admissão</label>
            <div className="relative max-w-sm">
              <input
                type="text"
                value={formData.admissionDate}
                onChange={e => setFormData({...formData, admissionDate: e.target.value})}
                placeholder="dd/mm/aaaa"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-cyan-100 focus:border-cyan-500 outline-none transition-all placeholder:text-gray-400"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <Calendar size={16} />
              </div>
            </div>
          </div>

          {/* Observações */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Observações</label>
            <textarea
              rows={3}
              value={formData.observations}
              onChange={e => setFormData({...formData, observations: e.target.value})}
              placeholder="Informações adicionais..."
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-cyan-100 focus:border-cyan-500 outline-none transition-all placeholder:text-gray-400 resize-none"
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
              className="px-6 py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white font-medium shadow-lg shadow-cyan-200 transition-colors flex items-center gap-2"
            >
              <Save size={18} />
              {initialData ? 'Salvar' : 'Cadastrar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};