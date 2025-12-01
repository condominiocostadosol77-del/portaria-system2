import React, { useState, useRef, useEffect } from 'react';
import { X, Save, MessageCircle, Search, User, ArrowRightLeft } from 'lucide-react';
import { ReceivedItem, ReceivedItemOperation, Resident } from '../types';

interface ReceivedItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<ReceivedItem, 'id' | 'status' | 'receivedAt'>) => void;
  residents: Resident[];
}

export const ReceivedItemModal: React.FC<ReceivedItemModalProps> = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  residents 
}) => {
  // Logic Control
  const [operationType, setOperationType] = useState<ReceivedItemOperation>('externo_para_morador');
  const [mode, setMode] = useState<'resident' | 'manual'>('resident');
  
  // Intelligent Search State
  const [residentSearch, setResidentSearch] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedResidentId, setSelectedResidentId] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Form Data
  const [formData, setFormData] = useState({
    unit: '',
    block: '',
    leftBy: '',
    document: '',
    description: '',
    shift: 'diurno',
    observations: ''
  });

  // Handle outside click for dropdown
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

  // Filter Residents logic
  const filteredResidents = residents.filter(r => 
    r.name.toLowerCase().includes(residentSearch.toLowerCase()) ||
    r.unit.includes(residentSearch) ||
    r.block.toLowerCase().includes(residentSearch)
  );

  const handleResidentSelect = (resident: Resident) => {
    setSelectedResidentId(resident.id);
    setResidentSearch(`${resident.name} - Unidade ${resident.unit}`);
    setShowDropdown(false);
    
    setFormData(prev => ({
      ...prev,
      unit: resident.unit,
      block: resident.block
    }));
  };

  const handleSave = (notify: boolean) => {
    // Determine semantic meaning of 'leftBy' based on operation
    // If externo_para_morador: leftBy is the external person.
    // If morador_para_externo: leftBy is the external person (recipient). 
    // The Resident Name is always stored in recipientName for display consistency, but we handle the label in the Card.
    
    const data: Omit<ReceivedItem, 'id' | 'status' | 'receivedAt'> = {
      operationType,
      ...formData,
      residentId: selectedResidentId || undefined,
      recipientName: mode === 'manual' ? undefined : (residents.find(r => r.id === selectedResidentId)?.name)
    };

    onSubmit(data);

    if (notify) {
      let phone = '';
      let residentName = '';
      
      if (selectedResidentId) {
        const res = residents.find(r => r.id === selectedResidentId);
        if (res) {
          phone = res.phone.replace(/\D/g, '');
          residentName = res.name;
        }
      }

      if (phone) {
         let message = '';
         if (operationType === 'externo_para_morador') {
           message = `🔔 NOTIFICAÇÃO DA PORTARIA\n\nOlá, ${residentName.toUpperCase()}! 👋\n\n📦 Deixaram um item para você na portaria.\n\nINFORMAÇÕES:\n🏢 Unidade: ${formData.unit} - Bloco ${formData.block}\n👤 Deixado por: ${formData.leftBy}\n📝 Item: ${formData.description}\n\n📍 Por favor, compareça à portaria para realizar a retirada.\n\nAtenciosamente,\nEquipe da Portaria`;
         } else {
           message = `🔔 NOTIFICAÇÃO DA PORTARIA\n\nOlá, ${residentName.toUpperCase()}! 👋\n\n📦 O item que você deixou na portaria foi registrado.\n\nINFORMAÇÕES:\n📝 Item: ${formData.description}\n👤 Para: ${formData.leftBy}\n\nAtenciosamente,\nEquipe da Portaria`;
         }
         
         const url = `https://wa.me/55${phone}?text=${encodeURIComponent(message)}`;
         window.open(url, '_blank');
      } else {
         alert("Não foi possível notificar: Telefone não encontrado para o morador selecionado.");
      }
    }

    resetForm();
    onClose();
  };

  const resetForm = () => {
    setOperationType('externo_para_morador');
    setMode('resident');
    setResidentSearch('');
    setSelectedResidentId('');
    setFormData({
      unit: '',
      block: '',
      leftBy: '',
      document: '',
      description: '',
      shift: 'diurno',
      observations: ''
    });
  };

  if (!isOpen) return null;

  const isExternalToResident = operationType === 'externo_para_morador';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-slate-800">Novo Item Recebido</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          
          {/* Operation Type */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Tipo de Operação *</label>
            <div className="relative">
              <select
                value={operationType}
                onChange={(e) => setOperationType(e.target.value as ReceivedItemOperation)}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none bg-white appearance-none"
              >
                <option value="externo_para_morador">Externo deixando para Morador</option>
                <option value="morador_para_externo">Morador deixando para Externo</option>
              </select>
               <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                 <ArrowRightLeft size={16} />
               </div>
            </div>
            <p className="text-xs text-slate-500 mt-1 ml-1">
              {isExternalToResident 
                ? 'Ex: Uma visita deixa uma chave ou sacola para um morador.' 
                : 'Ex: Morador deixa a chave para faxineira ou um item para alguém buscar.'}
            </p>
          </div>

          {/* Mode Selection */}
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="radio" 
                name="receivedMode" 
                checked={mode === 'resident'} 
                onChange={() => setMode('resident')}
                className="w-4 h-4 text-green-600 focus:ring-green-500"
              />
              <span className="text-sm font-medium text-slate-700">Selecionar morador cadastrado</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="radio" 
                name="receivedMode" 
                checked={mode === 'manual'} 
                onChange={() => setMode('manual')}
                className="w-4 h-4 text-green-600 focus:ring-green-500"
              />
              <span className="text-sm font-medium text-slate-700">Digitar unidade manualmente</span>
            </label>
          </div>

          {/* Resident Search / Unit Input */}
          <div>
             {mode === 'resident' ? (
              <div className="space-y-1.5 relative" ref={dropdownRef}>
                <label className="block text-sm font-semibold text-slate-700">
                  {isExternalToResident ? 'Morador (Destinatário)' : 'Morador (Quem deixou)'}
                </label>
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
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none"
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
                          className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-gray-50 last:border-0 flex items-center justify-between group"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center">
                              <User size={14} />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-slate-800 group-hover:text-blue-700">{res.name}</p>
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
               <p className="text-sm text-slate-500 italic">Preencha os dados da unidade abaixo manualmente.</p>
             )}
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
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none disabled:bg-gray-50"
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
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none disabled:bg-gray-50"
              />
            </div>
          </div>

          {/* Left By & Document */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                {isExternalToResident ? 'Nome de quem deixou *' : 'Nome do Destinatário (Externo) *'}
              </label>
              <input
                type="text"
                value={formData.leftBy}
                onChange={(e) => setFormData({...formData, leftBy: e.target.value})}
                placeholder="Nome da pessoa"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Documento (RG/CPF)</label>
              <input
                type="text"
                value={formData.document}
                onChange={(e) => setFormData({...formData, document: e.target.value})}
                placeholder="RG ou CPF"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Descrição do Item *</label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Ex: Sacola com roupas, Alicate, Perfume, etc"
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none"
            />
          </div>

          {/* Shift */}
          <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Turno *</label>
              <select
                value={formData.shift}
                onChange={(e) => setFormData({...formData, shift: e.target.value})}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none bg-white"
              >
                <option value="diurno">Diurno</option>
                <option value="noturno">Noturno</option>
              </select>
            </div>

          {/* Observations */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Observações</label>
            <textarea
              rows={3}
              value={formData.observations}
              onChange={(e) => setFormData({...formData, observations: e.target.value})}
              placeholder="Informações adicionais..."
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-100">
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-lg border border-gray-300 text-slate-700 font-medium hover:bg-slate-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={() => handleSave(false)}
              className="px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium flex items-center gap-2 transition-colors"
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