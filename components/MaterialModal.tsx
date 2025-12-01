import React, { useState, useRef, useEffect } from 'react';
import { X, Save, Search, User } from 'lucide-react';
import { BorrowedMaterial, BorrowerType, Resident } from '../types';

interface MaterialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<BorrowedMaterial, 'id' | 'status' | 'loanDate' | 'returnDate'>) => void;
  residents: Resident[];
}

export const MaterialModal: React.FC<MaterialModalProps> = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  residents 
}) => {
  const [formData, setFormData] = useState({
    materialName: '',
    borrowerType: 'morador' as BorrowerType,
    borrowerName: '',
    unit: '',
    block: '',
    document: '',
    phone: '',
    observations: ''
  });

  // Search State for Residents
  const [residentSearch, setResidentSearch] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Handle outside click to close dropdowns
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
    
    setFormData(prev => ({
      ...prev,
      borrowerName: resident.name,
      unit: resident.unit,
      block: resident.block,
      phone: resident.phone,
      document: resident.cpf // Assuming CPF as doc
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setFormData({
      materialName: '',
      borrowerType: 'morador',
      borrowerName: '',
      unit: '',
      block: '',
      document: '',
      phone: '',
      observations: ''
    });
    setResidentSearch('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-slate-800">Novo Empréstimo</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          
          {/* Material Name */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Material *</label>
            <input
              required
              type="text"
              value={formData.materialName}
              onChange={e => setFormData({...formData, materialName: e.target.value})}
              placeholder="Ex: Enxada, Martelo, Furadeira"
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-100 focus:border-orange-500 outline-none transition-all placeholder:text-gray-400"
            />
          </div>

          {/* Borrower Type */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Quem está retirando? *</label>
            <select
              value={formData.borrowerType}
              onChange={e => {
                const type = e.target.value as BorrowerType;
                setFormData({...formData, borrowerType: type});
                if (type === 'morador') {
                    setResidentSearch('');
                } else {
                    // Reset resident specific fields if switching away, but keep editable
                    setFormData(prev => ({...prev, borrowerType: type, unit: '', block: ''}));
                }
              }}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-100 focus:border-orange-500 outline-none bg-white"
            >
              <option value="morador">Morador</option>
              <option value="funcionario">Funcionário</option>
              <option value="terceiro">Terceiro</option>
            </select>
          </div>

          {/* Name Selection / Input */}
          {formData.borrowerType === 'morador' ? (
             <div className="space-y-1.5 relative" ref={dropdownRef}>
                <label className="block text-sm font-semibold text-slate-700">Nome do Morador *</label>
                <div className="relative">
                  <input 
                    type="text"
                    value={residentSearch}
                    onChange={(e) => {
                      setResidentSearch(e.target.value);
                      setShowDropdown(true);
                      setFormData({...formData, borrowerName: ''}); // Clear name if typing new search
                    }}
                    onFocus={() => setShowDropdown(true)}
                    placeholder="Buscar morador..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-100 focus:border-orange-500 outline-none"
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
                          className="px-4 py-3 hover:bg-orange-50 cursor-pointer border-b border-gray-50 last:border-0 flex items-center justify-between group"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center">
                              <User size={14} />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-slate-800 group-hover:text-orange-700">{res.name}</p>
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
          ) : (
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Nome *</label>
              <input
                required
                type="text"
                value={formData.borrowerName}
                onChange={e => setFormData({...formData, borrowerName: e.target.value})}
                placeholder="Nome da pessoa"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-100 focus:border-orange-500 outline-none"
              />
            </div>
          )}

          {/* Document & Unit info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
             <div className="md:col-span-1">
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Documento</label>
              <input
                type="text"
                value={formData.document}
                onChange={e => setFormData({...formData, document: e.target.value})}
                placeholder="RG ou CPF"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-100 focus:border-orange-500 outline-none"
              />
            </div>
             <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Unidade</label>
                <input
                  type="text"
                  value={formData.unit}
                  onChange={e => setFormData({...formData, unit: e.target.value})}
                  readOnly={formData.borrowerType === 'morador'}
                  placeholder="Ex: 101"
                  className={`w-full px-4 py-2.5 rounded-lg border border-gray-300 outline-none ${
                    formData.borrowerType === 'morador' 
                    ? 'bg-gray-50 text-slate-600' 
                    : 'focus:ring-2 focus:ring-orange-100 focus:border-orange-500'
                  }`}
                />
             </div>
             <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Bloco</label>
                <input
                  type="text"
                  value={formData.block}
                  onChange={e => setFormData({...formData, block: e.target.value})}
                  readOnly={formData.borrowerType === 'morador'}
                  placeholder="Ex: A"
                  className={`w-full px-4 py-2.5 rounded-lg border border-gray-300 outline-none ${
                    formData.borrowerType === 'morador' 
                    ? 'bg-gray-50 text-slate-600' 
                    : 'focus:ring-2 focus:ring-orange-100 focus:border-orange-500'
                  }`}
                />
             </div>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Telefone</label>
            <input
              type="text"
              value={formData.phone}
              onChange={e => setFormData({...formData, phone: e.target.value})}
              placeholder="(00) 00000-0000"
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-100 focus:border-orange-500 outline-none"
            />
          </div>

          {/* Observations */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Observações</label>
            <textarea
              rows={3}
              value={formData.observations}
              onChange={e => setFormData({...formData, observations: e.target.value})}
              placeholder="Informações adicionais..."
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-100 focus:border-orange-500 outline-none resize-none"
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
              className="px-6 py-2.5 rounded-lg bg-[#EA580C] hover:bg-orange-700 text-white font-medium shadow-lg shadow-orange-200 transition-colors flex items-center gap-2"
            >
              <Save size={18} />
              Registrar Empréstimo
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};