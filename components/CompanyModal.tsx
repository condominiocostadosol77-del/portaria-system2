import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { Company, CompanyStatus, CompanyType } from '../types';

interface CompanyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Company, 'id'>) => void;
  initialData?: Company;
}

export const CompanyModal: React.FC<CompanyModalProps> = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  initialData 
}) => {
  const [formData, setFormData] = useState({
    name: '',
    type: 'transportadora' as CompanyType,
    status: 'ativa' as CompanyStatus,
    phone: '',
    observations: ''
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        type: initialData.type,
        status: initialData.status,
        phone: initialData.phone,
        observations: initialData.observations
      });
    } else {
      // Reset form when opening for new entry
      setFormData({
        name: '',
        type: 'transportadora',
        status: 'ativa',
        phone: '',
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
            {initialData ? 'Editar Empresa' : 'Nova Empresa'}
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
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Nome da Empresa *</label>
            <input
              required
              type="text"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              placeholder="Shopee, Mercado Livre, Correios, etc"
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-100 focus:border-purple-500 outline-none transition-all placeholder:text-gray-400"
            />
          </div>

          {/* Tipo & Telefone */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Tipo</label>
              <select
                value={formData.type}
                onChange={e => setFormData({...formData, type: e.target.value as CompanyType})}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-100 focus:border-purple-500 outline-none transition-all bg-white"
              >
                <option value="marketplace">marketplace</option>
                <option value="transportadora">transportadora</option>
                <option value="correios">correios</option>
                <option value="outros">outros</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Telefone</label>
              <input
                type="text"
                value={formData.phone}
                onChange={e => setFormData({...formData, phone: e.target.value})}
                placeholder="(11) 99999-9999"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-100 focus:border-purple-500 outline-none transition-all placeholder:text-gray-400"
              />
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Status</label>
            <select
              value={formData.status}
              onChange={e => setFormData({...formData, status: e.target.value as CompanyStatus})}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-100 focus:border-purple-500 outline-none transition-all bg-white"
            >
              <option value="ativa">ativa</option>
              <option value="inativa">inativa</option>
            </select>
          </div>

          {/* Observações */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Observações</label>
            <textarea
              rows={3}
              value={formData.observations}
              onChange={e => setFormData({...formData, observations: e.target.value})}
              placeholder="Informações adicionais..."
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-100 focus:border-purple-500 outline-none transition-all placeholder:text-gray-400 resize-none"
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
              {initialData ? 'Salvar' : 'Cadastrar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};