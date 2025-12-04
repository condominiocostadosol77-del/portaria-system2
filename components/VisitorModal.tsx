
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { X, Save, Search, User, LogIn, History } from 'lucide-react';
import { Visitor, Resident } from '../types';

interface VisitorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Visitor, 'id' | 'status' | 'entryTime' | 'exitTime'>) => void;
  residents: Resident[];
  visitorsHistory: Visitor[]; // New prop for history
}

export const VisitorModal: React.FC<VisitorModalProps> = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  residents,
  visitorsHistory = []
}) => {
  const [mode, setMode] = useState<'resident' | 'manual'>('resident');
  
  // Search State for Residents
  const [residentSearch, setResidentSearch] = useState('');
  const [showResidentDropdown, setShowResidentDropdown] = useState(false);
  const [selectedResidentId, setSelectedResidentId] = useState('');
  const residentDropdownRef = useRef<HTMLDivElement>(null);

  // Search State for Visitors History
  const [showVisitorDropdown, setShowVisitorDropdown] = useState(false);
  const visitorDropdownRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({
    name: '',
    document: '',
    phone: '',
    unit: '',
    block: '',
    residentName: '',
    observations: ''
  });

  // Extract unique visitors from history for autocomplete
  const uniqueVisitors = useMemo(() => {
    const unique = new Map();
    // Reverse to prioritize most recent entries if duplicates exist, 
    // but prefer entries that have documents filled in.
    [...visitorsHistory].reverse().forEach(v => {
      const key = v.name.toLowerCase().trim();
      const existing = unique.get(key);
      
      // If new, or if existing doesn't have doc but this one does, update/set it
      if (!existing || (!existing.document && v.document)) {
        unique.set(key, v);
      }
    });
    return Array.from(unique.values());
  }, [visitorsHistory]);

  // Filter historical visitors based on name input
  const filteredHistoricalVisitors = uniqueVisitors.filter(v => 
    v.name.toLowerCase().includes(formData.name.toLowerCase()) && 
    formData.name.length > 1 // Only show results after 2 chars
  );

  // Handle outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (residentDropdownRef.current && !residentDropdownRef.current.contains(event.target as Node)) {
        setShowResidentDropdown(false);
      }
      if (visitorDropdownRef.current && !visitorDropdownRef.current.contains(event.target as Node)) {
        setShowVisitorDropdown(false);
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
    setShowResidentDropdown(false);
    setSelectedResidentId(resident.id);
    
    setFormData(prev => ({
      ...prev,
      residentName: resident.name,
      unit: resident.unit,
      block: resident.block
    }));
  };

  const handleHistoricalVisitorSelect = (visitor: Visitor) => {
    setFormData(prev => ({
      ...prev,
      name: visitor.name,
      document: visitor.document || '',
      phone: visitor.phone || ''
    }));
    setShowVisitorDropdown(false);
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
          
          {/* Nome com Autocomplete do Histórico */}
          <div className="relative" ref={visitorDropdownRef}>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Nome do Visitante *</label>
            <div className="relative">
              <input
                required
                type="text"
                value={formData.name}
                onChange={e => {
                  setFormData({...formData, name: e.target.value});
                  setShowVisitorDropdown(true);
                }}
                onFocus={() => setShowVisitorDropdown(true)}
                placeholder="Nome completo (busque no histórico digitando)"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#0f766e] focus:border-[#0f766e] outline-none"
                autoComplete="off"
              />
              {formData.name.length > 0 && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                  {showVisitorDropdown && filteredHistoricalVisitors.length > 0 ? (
                    <History size={16} className="text-[#0f766e]" />
                  ) : null}
                </div>
              )}
            </div>

            {/* Dropdown de Histórico de Visitantes */}
            {showVisitorDropdown && filteredHistoricalVisitors.length > 0 && (
              <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-48 overflow-y-auto">
                <div className="px-4 py-2 bg-slate-50 border-b border-gray-100 text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                  <History size={12} />
                  Visitantes Recorrentes
                </div>
                {filteredHistoricalVisitors.map((v, idx) => (
                  <div 
                    key={`${v.id}-${idx}`}
                    onClick={() => handleHistoricalVisitorSelect(v)}
                    className="px-4 py-2.5 hover:bg-teal-50 cursor-pointer border-b border-gray-50 last:border-0 flex items-center justify-between group"
                  >
                    <div>
                      <p className="text-sm font-medium text-slate-800 group-hover:text-teal-700">{v.name}</p>
                      {(v.document || v.phone) && (
                        <p className="text-xs text-slate-500">
                          {v.document ? `Doc: ${v.document}` : ''} 
                          {v.document && v.phone ? ' • ' : ''} 
                          {v.phone ? `Tel: ${v.phone}` : ''}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
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
              <div className="space-y-1.5 relative" ref={residentDropdownRef}>
                <label className="block text-sm font-semibold text-slate-700">Morador Visitado</label>
                <div className="relative">
                  <input 
                    type="text"
                    value={residentSearch}
                    onChange={(e) => {
                      setResidentSearch(e.target.value);
                      setShowResidentDropdown(true);
                      if(e.target.value === '') setSelectedResidentId('');
                    }}
                    onFocus={() => setShowResidentDropdown(true)}
                    placeholder="Buscar morador..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#0f766e] focus:border-[#0f766e] outline-none"
                  />
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <Search size={18} />
                  </div>
                </div>

                {/* Dropdown */}
                {showResidentDropdown && (
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
