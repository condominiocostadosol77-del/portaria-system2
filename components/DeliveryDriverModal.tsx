import React, { useState, useEffect, useRef } from 'react';
import { X, Save, Search, Building2 } from 'lucide-react';
import { DeliveryDriver, Company, DeliveryDriverStatus } from '../types';

interface DeliveryDriverModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<DeliveryDriver, 'id' | 'companyName'>) => void;
  initialData?: DeliveryDriver;
  companies: Company[];
}

export const DeliveryDriverModal: React.FC<DeliveryDriverModalProps> = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  initialData,
  companies
}) => {
  const [formData, setFormData] = useState({
    name: '',
    companyId: '',
    phone: '',
    cpf: '',
    rg: '',
    status: 'ativo' as DeliveryDriverStatus,
    observations: ''
  });

  // Search State for Company
  const [companySearch, setCompanySearch] = useState('');
  const [showCompanyDropdown, setShowCompanyDropdown] = useState(false);
  const companyDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        companyId: initialData.companyId,
        phone: initialData.phone,
        cpf: initialData.cpf,
        rg: initialData.rg,
        status: initialData.status,
        observations: initialData.observations
      });
      // Pre-fill search with company name
      setCompanySearch(initialData.companyName || '');
    } else {
      setFormData({
        name: '',
        companyId: '',
        phone: '',
        cpf: '',
        rg: '',
        status: 'ativo',
        observations: ''
      });
      setCompanySearch('');
    }
  }, [initialData, isOpen]);

  // Handle outside click for dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (companyDropdownRef.current && !companyDropdownRef.current.contains(event.target as Node)) {
        setShowCompanyDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  if (!isOpen) return null;

  const filteredCompanies = companies.filter(c => 
    c.name.toLowerCase().includes(companySearch.toLowerCase())
  );

  const handleCompanySelect = (company: Company) => {
    setCompanySearch(company.name);
    setFormData(prev => ({ ...prev, companyId: company.id }));
    setShowCompanyDropdown(false);
  };

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
            {initialData ? 'Editar Entregador' : 'Novo Entregador'}
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
              placeholder="Nome do entregador"
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-100 focus:border-emerald-500 outline-none transition-all placeholder:text-gray-400"
            />
          </div>

          {/* Empresa & Telefone */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Intelligent Company Search */}
            <div className="relative" ref={companyDropdownRef}>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Empresa *</label>
              <div className="relative">
                <input 
                  required
                  type="text"
                  value={companySearch}
                  onChange={(e) => {
                    setCompanySearch(e.target.value);
                    setShowCompanyDropdown(true);
                    // Reset ID if user clears input, enforcing selection for validity in strict mode, 
                    // or allows free text if we wanted to support new companies on the fly (but logic here expects existing ID).
                    if (e.target.value === '') setFormData(prev => ({...prev, companyId: ''}));
                  }}
                  onFocus={() => setShowCompanyDropdown(true)}
                  placeholder="Buscar empresa..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-100 focus:border-emerald-500 outline-none"
                />
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <Search size={18} />
                </div>
              </div>

              {/* Dropdown */}
              {showCompanyDropdown && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-48 overflow-y-auto">
                  {filteredCompanies.length > 0 ? (
                    filteredCompanies.map(comp => (
                      <div 
                        key={comp.id}
                        onClick={() => handleCompanySelect(comp)}
                        className="px-4 py-2.5 hover:bg-emerald-50 cursor-pointer border-b border-gray-50 last:border-0 flex items-center gap-3 group"
                      >
                        <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center">
                          <Building2 size={14} />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-800 group-hover:text-emerald-700 uppercase">{comp.name}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-3 text-sm text-slate-500 text-center">
                      Nenhuma empresa encontrada.
                    </div>
                  )}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Telefone</label>
              <input
                type="text"
                value={formData.phone}
                onChange={e => setFormData({...formData, phone: e.target.value})}
                placeholder="(11) 99999-9999"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-100 focus:border-emerald-500 outline-none transition-all placeholder:text-gray-400"
              />
            </div>
          </div>

          {/* CPF & RG */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">CPF</label>
              <input
                type="text"
                value={formData.cpf}
                onChange={e => setFormData({...formData, cpf: e.target.value})}
                placeholder="000.000.000-00"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-100 focus:border-emerald-500 outline-none transition-all placeholder:text-gray-400"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">RG</label>
              <input
                type="text"
                value={formData.rg}
                onChange={e => setFormData({...formData, rg: e.target.value})}
                placeholder="00.000.000-0"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-100 focus:border-emerald-500 outline-none transition-all placeholder:text-gray-400"
              />
            </div>
          </div>

          {/* Status */}
          <div className="w-full md:w-1/2 pr-0 md:pr-2.5">
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Status</label>
            <select
              value={formData.status}
              onChange={e => setFormData({...formData, status: e.target.value as DeliveryDriverStatus})}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-100 focus:border-emerald-500 outline-none transition-all bg-white"
            >
              <option value="ativo">ativo</option>
              <option value="inativo">inativo</option>
              <option value="bloqueado">bloqueado</option>
            </select>
          </div>

          {/* Observações */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Observações</label>
            <textarea
              rows={3}
              value={formData.observations}
              onChange={e => setFormData({...formData, observations: e.target.value})}
              placeholder="Informações adicionais sobre o entregador..."
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-100 focus:border-emerald-500 outline-none transition-all placeholder:text-gray-400 resize-none"
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
              disabled={!formData.companyId} // Ensure company is selected
              className="px-6 py-2.5 rounded-lg bg-[#0f766e] hover:bg-[#0d9488] text-white font-medium shadow-lg shadow-teal-100 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
