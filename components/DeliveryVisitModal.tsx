import React, { useState, useRef, useEffect } from 'react';
import { X, Save, Search, User, Truck } from 'lucide-react';
import { DeliveryVisit, DeliveryDriver } from '../types';

interface DeliveryVisitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<DeliveryVisit, 'id' | 'entryTime'>) => void;
  drivers: DeliveryDriver[];
  initialData?: DeliveryVisit;
}

export const DeliveryVisitModal: React.FC<DeliveryVisitModalProps> = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  drivers,
  initialData
}) => {
  // Intelligent Search State
  const [driverSearch, setDriverSearch] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedDriverId, setSelectedDriverId] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({
    driverName: '',
    companyName: '',
    packageCount: 1,
    shift: 'diurno',
    observations: ''
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        driverName: initialData.driverName,
        companyName: initialData.companyName,
        packageCount: initialData.packageCount,
        shift: initialData.shift,
        observations: initialData.observations
      });
      setSelectedDriverId(initialData.driverId);
      setDriverSearch(initialData.driverName);
    } else {
      setFormData({
        driverName: '',
        companyName: '',
        packageCount: 1,
        shift: 'diurno',
        observations: ''
      });
      setDriverSearch('');
      setSelectedDriverId('');
    }
  }, [initialData, isOpen]);

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

  const filteredDrivers = drivers.filter(d => 
    d.name.toLowerCase().includes(driverSearch.toLowerCase()) ||
    d.cpf.includes(driverSearch) ||
    d.rg.includes(driverSearch) ||
    d.companyName.toLowerCase().includes(driverSearch.toLowerCase())
  );

  const handleDriverSelect = (driver: DeliveryDriver) => {
    setDriverSearch(driver.name);
    setShowDropdown(false);
    setSelectedDriverId(driver.id);
    
    setFormData(prev => ({
      ...prev,
      driverName: driver.name,
      companyName: driver.companyName
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      driverId: selectedDriverId || 'manual', // Fallback if manual entry allowed, though we prefer linking
      ...formData
    });
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setFormData({
      driverName: '',
      companyName: '',
      packageCount: 1,
      shift: 'diurno',
      observations: ''
    });
    setDriverSearch('');
    setSelectedDriverId('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-slate-800">
            {initialData ? 'Editar Visita de Entregador' : 'Registrar Visita de Entregador'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          
          {/* Driver Search */}
          <div className="space-y-1.5 relative" ref={dropdownRef}>
            <label className="block text-sm font-semibold text-slate-700">Entregador *</label>
            <div className="relative">
              <input 
                type="text"
                value={driverSearch}
                onChange={(e) => {
                  setDriverSearch(e.target.value);
                  setShowDropdown(true);
                  if(e.target.value === '') {
                    setSelectedDriverId('');
                    setFormData(prev => ({...prev, driverName: '', companyName: ''}));
                  } else {
                    setFormData(prev => ({...prev, driverName: e.target.value}));
                  }
                }}
                onFocus={() => setShowDropdown(true)}
                placeholder="Buscar por Nome, CPF ou RG..."
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none"
              />
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <Search size={18} />
              </div>
            </div>

            {/* Dropdown */}
            {showDropdown && filteredDrivers.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                {filteredDrivers.map(driver => (
                  <div 
                    key={driver.id}
                    onClick={() => handleDriverSelect(driver)}
                    className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-gray-50 last:border-0 flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center">
                        <User size={14} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-800 group-hover:text-blue-700 uppercase">{driver.name}</p>
                        <div className="flex flex-col text-xs text-slate-500">
                          <span className="uppercase">{driver.companyName}</span>
                          <span>CPF: {driver.cpf} • RG: {driver.rg}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Company (Auto-filled or Manual) */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Empresa</label>
            <input
              type="text"
              value={formData.companyName}
              onChange={(e) => setFormData({...formData, companyName: e.target.value})}
              placeholder="Selecione (opcional)"
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none bg-gray-50"
            />
          </div>

          {/* Package Count & Shift */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Quantidade de Encomendas *</label>
              <input
                type="number"
                min="1"
                value={formData.packageCount}
                onChange={(e) => setFormData({...formData, packageCount: parseInt(e.target.value) || 0})}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Turno</label>
              <select
                value={formData.shift}
                onChange={(e) => setFormData({...formData, shift: e.target.value})}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none bg-white"
              >
                <option value="diurno">diurno</option>
                <option value="noturno">noturno</option>
              </select>
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
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none resize-none"
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
              className="px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-lg shadow-blue-100 transition-colors flex items-center gap-2"
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