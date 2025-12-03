
import React, { useState, useEffect, useRef } from 'react';
import { X, Save, MessageCircle, Search, User, Building2, Plus } from 'lucide-react';
import { PackageItem, Resident, Company } from '../types';

interface PackageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<PackageItem>) => void;
  residents: Resident[];
  companies: Company[];
  onAddResident: () => void;
}

export const PackageModal: React.FC<PackageModalProps> = ({ isOpen, onClose, onSubmit, residents, companies, onAddResident }) => {
  const [mode, setMode] = useState<'resident' | 'manual'>('resident');
  
  // Search State for Residents
  const [residentSearch, setResidentSearch] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedResidentId, setSelectedResidentId] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Search State for Companies
  const [showCompanyDropdown, setShowCompanyDropdown] = useState(false);
  const companyDropdownRef = useRef<HTMLDivElement>(null);
  
  // Form State
  const [formData, setFormData] = useState({
    recipientName: '',
    unit: '',
    block: '',
    type: 'encomenda',
    sender: '',
    shift: 'diurno',
    trackingCode: '',
    description: '',
    observations: ''
  });

  // Handle outside click to close dropdowns
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
      if (companyDropdownRef.current && !companyDropdownRef.current.contains(event.target as Node)) {
        setShowCompanyDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Filter Residents
  const filteredResidents = residents.filter(r => 
    r.name.toLowerCase().includes(residentSearch.toLowerCase()) ||
    r.unit.includes(residentSearch) ||
    r.block.toLowerCase().includes(residentSearch)
  );

  // Filter Companies
  const filteredCompanies = companies.filter(c => 
    c.name.toLowerCase().includes(formData.sender.toLowerCase())
  );

  const handleResidentSelect = (resident: Resident) => {
    setSelectedResidentId(resident.id);
    setResidentSearch(`${resident.name} - Unidade ${resident.unit}`);
    setShowDropdown(false);
    
    setFormData(prev => ({
      ...prev,
      recipientName: resident.name,
      unit: resident.unit,
      block: resident.block
    }));
  };

  const handleCompanySelect = (companyName: string) => {
    setFormData(prev => ({ ...prev, sender: companyName }));
    setShowCompanyDropdown(false);
  };

  const handleSave = (notify: boolean) => {
    const withdrawalCode = Math.floor(100000 + Math.random() * 900000).toString();
    const internalCode = Math.floor(1000 + Math.random() * 9000).toString(); // Generate unique 4-digit code
    
    const now = new Date();
    // Format: DD/MM/YY HH:MM
    const receivedAt = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth()+1).toString().padStart(2, '0')}/${now.getFullYear().toString().slice(-2)} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    // Append code to observations
    const finalObservations = formData.observations 
      ? `${formData.observations} | Cód: ${internalCode}` 
      : `Cód: ${internalCode}`;

    const newPackage: Partial<PackageItem> = {
      ...formData,
      withdrawalCode,
      receivedAt,
      status: 'Aguardando Retirada',
      observations: finalObservations // Save with appended code
    };

    onSubmit(newPackage);

    if (notify) {
      // Find resident phone if linked
      let phone = '';
      if (mode === 'resident' && selectedResidentId) {
        const res = residents.find(r => r.id === selectedResidentId);
        if (res) phone = res.phone.replace(/\D/g, '');
      }

      if (phone) {
        // Extract time from receivedAt (HH:MM)
        const time = receivedAt.split(' ');
        
        // Formatted message
        const message = `🔔 NOTIFICAÇÃO DA PORTARIA\n\nOlá, ${formData.recipientName.toUpperCase()}! 👋\n\n📦 Você tem uma encomenda aguardando retirada na portaria.\n\nINFORMAÇÕES:\n🏢 Unidade: ${formData.unit} - Bloco ${formData.block}\n🚚 Empresa: ${formData.sender.toUpperCase() || 'NÃO INFORMADO'}\n\n🆔 ID Pacote: *#${internalCode}*\n🏷️ Rastreio: ${formData.trackingCode || 'N/A'}\n🔐 Código de Retirada: *${withdrawalCode}*\n\n📍 Por favor, compareça à portaria para realizar a retirada.\n\nAtenciosamente,\nEquipe da Portaria`;
        
        const url = `https://wa.me/55${phone}?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
      } else {
        alert("Não foi possível abrir o WhatsApp: Telefone não encontrado para o morador selecionado.");
      }
    }
    
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setFormData({
      recipientName: '',
      unit: '',
      block: '',
      type: 'encomenda',
      sender: '',
      shift: 'diurno',
      trackingCode: '',
      description: '',
      observations: ''
    });
    setSelectedResidentId('');
    setResidentSearch('');
    setShowDropdown(false);
    setShowCompanyDropdown(false);
    setMode('resident');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-slate-800">Nova Encomenda</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Mode Toggle */}
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="radio" 
                name="mode" 
                checked={mode === 'resident'} 
                onChange={() => setMode('resident')}
                className="w-4 h-4 text-purple-600 focus:ring-purple-500"
              />
              <span className="text-sm font-medium text-slate-700">Selecionar morador cadastrado</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="radio" 
                name="mode" 
                checked={mode === 'manual'} 
                onChange={() => setMode('manual')}
                className="w-4 h-4 text-purple-600 focus:ring-purple-500"
              />
              <span className="text-sm font-medium text-slate-700">Digitar manualmente</span>
            </label>
          </div>

          {/* Resident Selection / Name Input */}
          <div>
            {mode === 'resident' ? (
              <div className="space-y-1.5 relative" ref={dropdownRef}>
                <label className="block text-sm font-semibold text-slate-700">Morador</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input 
                      type="text"
                      value={residentSearch}
                      onChange={(e) => {
                        setResidentSearch(e.target.value);
                        setShowDropdown(true);
                        if(e.target.value === '') setSelectedResidentId('');
                      }}
                      onFocus={() => setShowDropdown(true)}
                      placeholder="Buscar por nome, unidade ou bloco..."
                      className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-100 focus:border-purple-500 outline-none"
                    />
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <Search size={18} />
                    </div>
                  </div>
                  
                  <button 
                    type="button"
                    onClick={onAddResident}
                    className="bg-primary hover:bg-blue-700 text-white px-3 rounded-lg flex items-center justify-center transition-colors shadow-sm min-w-[44px]"
                    title="Novo Morador"
                  >
                    <Plus size={20} />
                  </button>
                </div>

                {/* Intelligent Search Dropdown */}
                {showDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                    {filteredResidents.length > 0 ? (
                      filteredResidents.map(res => (
                        <div 
                          key={res.id}
                          onClick={() => handleResidentSelect(res)}
                          className="px-4 py-3 hover:bg-purple-50 cursor-pointer border-b border-gray-50 last:border-0 flex items-center justify-between group"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center">
                              <User size={14} />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-slate-800 group-hover:text-purple-700 uppercase">{res.name}</p>
                              <p className="text-xs text-slate-500">Unidade {res.unit} - Bloco {res.block}</p>
                            </div>
                          </div>
                          {res.id === selectedResidentId && (
                            <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">Selecionado</span>
                          )}
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
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-slate-700">Quem é o destinatário?</label>
                <input 
                  type="text"
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-100 focus:border-purple-500 outline-none"
                  value={formData.recipientName}
                  onChange={(e) => setFormData({...formData, recipientName: e.target.value})}
                  placeholder="Nome do destinatário"
                />
              </div>
            )}
          </div>

          {/* Type & Company */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Tipo *</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value})}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-100 focus:border-purple-500 outline-none bg-white"
              >
                <option value="encomenda">Encomenda</option>
                <option value="correspondencia">Correspondência</option>
                <option value="caixa">Caixa</option>
              </select>
            </div>
            
            {/* Company / Sender Input with Autocomplete */}
            <div className="relative" ref={companyDropdownRef}>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Empresa / Remetente</label>
              <input 
                type="text"
                value={formData.sender}
                onChange={(e) => {
                  setFormData({...formData, sender: e.target.value});
                  setShowCompanyDropdown(true);
                }}
                onFocus={() => setShowCompanyDropdown(true)}
                placeholder="Ex: Amazon, Mercado Livre"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-100 focus:border-purple-500 outline-none"
              />
              {/* Company Dropdown */}
              {showCompanyDropdown && filteredCompanies.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-48 overflow-y-auto">
                   {filteredCompanies.map(company => (
                     <div
                       key={company.id}
                       onClick={() => handleCompanySelect(company.name)}
                       className="px-4 py-2.5 hover:bg-purple-50 cursor-pointer border-b border-gray-50 last:border-0 flex items-center gap-3 group"
                     >
                       <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center">
                          <Building2 size={12} />
                       </div>
                       <div>
                         <p className="text-sm font-medium text-slate-800 group-hover:text-purple-700 uppercase">{company.name}</p>
                       </div>
                     </div>
                   ))}
                </div>
              )}
            </div>
          </div>

          {/* Unit & Block */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Unidade *</label>
              <input
                type="text"
                value={formData.unit}
                onChange={(e) => setFormData({...formData, unit: e.target.value})}
                disabled={mode === 'resident'}
                placeholder="Ex: 101"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-100 focus:border-purple-500 outline-none disabled:bg-gray-50 disabled:text-gray-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Bloco</label>
              <input
                type="text"
                value={formData.block}
                onChange={(e) => setFormData({...formData, block: e.target.value})}
                disabled={mode === 'resident'}
                placeholder="Ex: A"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-100 focus:border-purple-500 outline-none disabled:bg-gray-50 disabled:text-gray-500"
              />
            </div>
          </div>

          {/* Shift & Tracking */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Código de Rastreio</label>
              <input
                type="text"
                value={formData.trackingCode}
                onChange={(e) => setFormData({...formData, trackingCode: e.target.value})}
                placeholder="Código de rastreio (se houver)"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-100 focus:border-purple-500 outline-none"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Descrição</label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Descreva a encomenda..."
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-100 focus:border-purple-500 outline-none resize-none"
            />
          </div>

          {/* Observations */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Observações</label>
            <textarea
              rows={2}
              value={formData.observations}
              onChange={(e) => setFormData({...formData, observations: e.target.value})}
              placeholder="Informações adicionais..."
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-100 focus:border-purple-500 outline-none resize-none"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-100">
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-lg border border-gray-300 text-slate-700 font-medium hover:bg-slate-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={() => handleSave(false)}
              className="px-6 py-2.5 rounded-lg bg-secondary hover:bg-purple-600 text-white font-medium flex items-center gap-2 transition-colors"
            >
              <Save size={18} />
              Cadastrar
            </button>
            <button
              onClick={() => handleSave(true)}
              className="px-6 py-2.5 rounded-lg bg-green-600 hover:bg-green-700 text-white font-medium flex items-center gap-2 transition-colors shadow-lg shadow-green-200"
            >
              <MessageCircle size={18} />
              Cadastrar e Notificar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
