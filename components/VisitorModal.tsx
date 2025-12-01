import React, { useState, useRef, useEffect } from 'react';
import { X, Save, Search, User, LogIn } from 'lucide-react';
import { Visitor, Resident } from '../types';

interface VisitorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Visitor, 'id' | 'status' | 'entryTime' | 'exitTime'>) => void;
  residents: Resident[];
}

export const VisitorModal: React.FC<VisitorModalProps> = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  residents 
}) => {
  const [mode, setMode] = useState<'resident' | 'manual'>('resident');
  
  // Search State
  const [residentSearch, setResidentSearch] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedResidentId, setSelectedResidentId] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({
    name: '',
    document: '',
    phone: '',
    unit: '',
    block: '',
    residentName: '',
    observations: ''
  });

  // Handle outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const filteredResidents = residents.filter(r => 
    r.name.toLowerCase().includes(residentSearch.toLowerCase()) ||
    r.unit.includes(residentSearch) ||
    r.block.toLowerCase().includes(residentSearch)
  );

  const handleResidentSelect = (resident: Resident) => {
    setResidentSearch(`${resident.name} - Unidade ${resident.unit}`);
    setShowDropdown(false);
    setSelectedResidentId(resident.id);
    
    setFormData(prev => ({
      ...prev,
      residentName: resident.name,
      unit: resident.unit,
      block: resident.block
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      residentId: selectedResidentId || undefined
    });
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      document: '',
      phone: '',
      unit: '',
      block: '',
      residentName: '',
      observations: ''
    });
    setResidentSearch('');
    setSelectedResidentId('');
    setMode('resident');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-slate-800">Novo Visitante</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          
          {/* Nome */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Nome do Visitante *</label>
            <input
              required
              type="text"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              placeholder="Nome completo"
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#0f766e] focus:border-[#0f766e] outline-none"
            />
          </div>

          {/* Doc & Phone */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Documento (RG/CPF)</label>
              <input
                type="text"
                value={formData.document}
                onChange={e => setFormData({...formData, document: e.target.value})}
                placeholder="Opcional"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#0f766e] focus:border-[#0f766e] outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Telefone</label>
              <input
                type="text"
                value={formData.phone}
                onChange={e => setFormData({...formData, phone: e.target.value})}
                placeholder="(00) 00000-0000"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#0f766e] focus:border-[#0f766e] outline-none"
              />
            </div>
          </div>

          {/* Mode Selection */}
          <div className="flex items-center gap-6 pt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="radio" 
                name="visitorMode" 
                checked={mode === 'resident'} 
                onChange={() => setMode('resident')}
                className="w-4 h-4 text-[#0f766e] focus:ring-[#0f766e]"
              />
              <span className="text-sm font-medium text-slate-700">Selecionar morador cadastrado</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="radio" 
                name="visitorMode" 
                checked={mode === 'manual'} 
                onChange={() => setMode('manual')}
                className="w-4 h-4 text-[#0f766e] focus:ring-[#0f766e]"
              />
              <span className="text-sm font-medium text-slate-700">Digitar unidade manualmente</span>
            </label>
          </div>

          {/* Resident Search */}
          <div>
             {mode === 'resident' ? (
              <div className="space-y-1.5 relative" ref={dropdownRef}>
                <label className="block text-sm font-semibold text-slate-700">Morador Visitado</label>
                <div className="relative">
                  <input 
                    type="text"
                    value={residentSearch}
                    onChange={(e) => {
                      setResidentSearch(e.target.value);
                      setShowDropdown(true);
                      if(e.target.value === '') setSelectedResidentId('');
                    }}
                    onFocus={() => setShowDropdown(true)}
                    placeholder="Buscar morador..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#0f766e] focus:border-[#0f766e] outline-none"
                  />
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <Search size={18} />
                  </div>
                </div>

                {/* Dropdown */}
                {showDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                    {filteredResidents.length > 0 ? (
                      filteredResidents.map(res => (
                        <div 
                          key={res.id}
                          onClick={() => handleResidentSelect(res)}
                          className="px-4 py-3 hover:bg-teal-50 cursor-pointer border-b border-gray-50 last:border-0 flex items-center justify-between group"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center">
                              <User size={14} />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-slate-800 group-hover:text-teal-700">{res.name}</p>
                              <p className="text-xs text-slate-500">Unidade {res.unit} - Bloco {res.block}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="px-4 py-3 text-sm text-slate-500 text-center">
                        Nenhum morador encontrado.
                      </div>
                    )}
                  </div>
                )}
              </div>
             ) : null}
          </div>

          {/* Unit & Block */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Unidade *</label>
              <input
                required
                type="text"
                value={formData.unit}
                onChange={e => setFormData({...formData, unit: e.target.value})}
                disabled={mode === 'resident'}
                placeholder="Ex: 101"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#0f766e] focus:border-[#0f766e] outline-none disabled:bg-gray-50 disabled:text-gray-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Bloco</label>
              <input
                type="text"
                value={formData.block}
                onChange={e => setFormData({...formData, block: e.target.value})}
                disabled={mode === 'resident'}
                placeholder="Ex: A"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#0f766e] focus:border-[#0f766e] outline-none disabled:bg-gray-50 disabled:text-gray-500"
              />
            </div>
          </div>

          {/* Observations */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Observações</label>
            <textarea
              rows={3}
              value={formData.observations}
              onChange={e => setFormData({...formData, observations: e.target.value})}
              placeholder="Informações adicionais sobre a visita..."
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#0f766e] focus:border-[#0f766e] outline-none resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-lg border border-gray-300 text-slate-700 font-medium hover:bg-slate-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-lg bg-[#0f766e] hover:bg-[#0d9488] text-white font-medium shadow-lg shadow-teal-100 transition-colors flex items-center gap-2"
            >
              <LogIn size={18} />
              Registrar Entrada
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};