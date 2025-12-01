import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { Resident, ResidentStatus, ResidentType } from '../types';

interface ResidentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Resident, 'id'>) => void;
  initialData?: Resident;
}

export const ResidentModal: React.FC<ResidentModalProps> = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  initialData 
}) => {
  const [formData, setFormData] = useState({
    name: '',
    unit: '',
    block: '',
    type: 'Proprietário' as ResidentType,
    status: 'ativo' as ResidentStatus,
    phone: '',
    cpf: '',
    email: '',
    observations: ''
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        unit: initialData.unit,
        block: initialData.block,
        type: initialData.type,
        status: initialData.status,
        phone: initialData.phone,
        cpf: initialData.cpf,
        email: initialData.email,
        observations: initialData.observations
      });
    } else {
      // Reset form when opening for new entry
      setFormData({
        name: '',
        unit: '',
        block: '',
        type: 'Proprietário',
        status: 'ativo',
        phone: '',
        cpf: '',
        email: '',
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
            {initialData ? 'Editar Morador' : 'Novo Morador'}
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
          {/* Nome */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Nome Completo *</label>
            <input
              required
              type="text"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              placeholder="Nome completo do morador"
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all placeholder:text-gray-400"
            />
          </div>

          {/* Unidade & Bloco */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Unidade *</label>
              <input
                required
                type="text"
                value={formData.unit}
                onChange={e => setFormData({...formData, unit: e.target.value})}
                placeholder="Ex: 101"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all placeholder:text-gray-400"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Bloco</label>
              <input
                type="text"
                value={formData.block}
                onChange={e => setFormData({...formData, block: e.target.value})}
                placeholder="Ex: A"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all placeholder:text-gray-400"
              />
            </div>
          </div>

          {/* Tipo & Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Tipo *</label>
              <select
                value={formData.type}
                onChange={e => setFormData({...formData, type: e.target.value as ResidentType})}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all bg-white"
              >
                <option value="Proprietário">Proprietário</option>
                <option value="Inquilino">Inquilino</option>
                <option value="Outro">Outro</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Status *</label>
              <select
                value={formData.status}
                onChange={e => setFormData({...formData, status: e.target.value as ResidentStatus})}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all bg-white"
              >
                <option value="ativo">Ativo</option>
                <option value="inativo">Inativo</option>
              </select>
            </div>
          </div>

          {/* CPF & Telefone */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">CPF</label>
              <input
                type="text"
                value={formData.cpf}
                onChange={e => setFormData({...formData, cpf: e.target.value})}
                placeholder="000.000.000-00"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all placeholder:text-gray-400"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Telefone</label>
              <input
                type="text"
                value={formData.phone}
                onChange={e => setFormData({...formData, phone: e.target.value})}
                placeholder="(00) 00000-0000"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all placeholder:text-gray-400"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
              placeholder="email@exemplo.com"
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all placeholder:text-gray-400"
            />
          </div>

          {/* Observações */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Observações</label>
            <textarea
              rows={3}
              value={formData.observations}
              onChange={e => setFormData({...formData, observations: e.target.value})}
              placeholder="Informações adicionais..."
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all placeholder:text-gray-400 resize-none"
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
              className="px-6 py-2.5 rounded-lg bg-primary hover:bg-blue-700 text-white font-medium shadow-lg shadow-blue-200 transition-colors flex items-center gap-2"
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