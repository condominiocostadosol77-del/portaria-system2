
import React, { useState, useMemo } from 'react';
import { Plus, Search, Calendar, Truck, Package, AlertTriangle } from 'lucide-react';
import { DeliveryVisit, DeliveryDriver, Company } from '../types';
import { DeliveryVisitCard } from './DeliveryVisitCard';
import { DeliveryVisitModal } from './DeliveryVisitModal';
import { DeliveryDriverModal } from './DeliveryDriverModal';
import { supabase } from '../lib/supabase';

interface DeliveryVisitsPageProps {
  visits: DeliveryVisit[];
  setVisits?: React.Dispatch<React.SetStateAction<DeliveryVisit[]>>;
  drivers: DeliveryDriver[];
  companies: Company[];
  onRefresh: () => void;
}

export const DeliveryVisitsPage: React.FC<DeliveryVisitsPageProps> = ({ visits, drivers, companies, onRefresh }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // State for Driver Modal (used for both Add and Edit)
  const [isDriverModalOpen, setIsDriverModalOpen] = useState(false);
  const [driverToEdit, setDriverToEdit] = useState<DeliveryDriver | undefined>(undefined);
  
  // const [isDriversManagerOpen, setIsDriversManagerOpen] = useState(false); // Removed state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Helper to check if a date string matches today
  const checkIsToday = (dateStr: string) => {
    if (!dateStr) return false;
    const [datePart] = dateStr.split(' ');
    if (!datePart) return false;
    
    const parts = datePart.split('/');
    if (parts.length !== 3) return false;

    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    let year = parseInt(parts[2], 10);
    
    if (year < 100) year += 2000;
    
    const now = new Date();
    return day === now.getDate() && 
           month === (now.getMonth() + 1) && 
           year === now.getFullYear();
  };
  
  const visitsToday = visits.filter(v => checkIsToday(v.entryTime)).length;
  const packagesToday = visits.filter(v => checkIsToday(v.entryTime)).reduce((acc, curr) => acc + curr.packageCount, 0);

  const filteredVisits = useMemo(() => {
    return visits.filter(v => {
      return (
        v.driverName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.observations.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
  }, [visits, searchTerm]);

  const handleAddNew = () => {
    setEditingId(null);
    setIsModalOpen(true);
  };

  const handleEdit = (id: string) => {
    setEditingId(id);
    setIsModalOpen(true);
  };

  // Open modal to Add a NEW driver
  const handleAddDriver = () => {
    setDriverToEdit(undefined); // Ensure no data is passed
    setIsDriverModalOpen(true);
  };

  // Open modal to EDIT an existing driver
  const handleEditDriver = (driverId: string) => {
    const driver = drivers.find(d => d.id === driverId);
    if (driver) {
      setDriverToEdit(driver);
      setIsDriverModalOpen(true);
    } else {
      console.warn("Driver not found for ID:", driverId);
    }
  };

  const handleSubmit = async (data: Omit<DeliveryVisit, 'id' | 'entryTime'>) => {
    try {
      const now = new Date();
      const entryTime = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth()+1).toString().padStart(2, '0')}/${now.getFullYear()} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

      const payload = {
        driver_id: data.driverId,
        driver_name: data.driverName,
        company_name: data.companyName,
        package_count: data.packageCount,
        shift: data.shift,
        observations: data.observations
      };

      if (editingId) {
        const { error } = await supabase.from('delivery_visits').update(payload).eq('id', editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('delivery_visits').insert({
          ...payload,
          entry_time: entryTime
        });
        if (error) throw error;
      }
      onRefresh();
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
      alert('Erro ao salvar visita');
    }
  };

  const handleDriverSubmit = async (data: Omit<DeliveryDriver, 'id' | 'companyName'>) => {
    const company = companies.find(c => c.id === data.companyId);
    const companyName = company ? company.name : 'N/A';

    try {
      const payload = {
        name: data.name,
        company_id: data.companyId,
        company_name: companyName,
        phone: data.phone,
        cpf: data.cpf,
        rg: data.rg,
        status: data.status,
        observations: data.observations
      };

      if (driverToEdit) {
        // Update existing driver
        const { error } = await supabase.from('delivery_drivers').update(payload).eq('id', driverToEdit.id);
        if (error) throw error;
      } else {
        // Create new driver
        const { error } = await supabase.from('delivery_drivers').insert(payload);
        if (error) throw error;
      }
      
      onRefresh(); // Refresh list so the new/updated driver appears in the visit modal
      setIsDriverModalOpen(false);
      setDriverToEdit(undefined); // Reset state
    } catch (err) {
      console.error(err);
      alert('Erro ao salvar entregador');
    }
  };

  const handleDelete = (id: string) => {
    setDeleteId(id);
  };

  const confirmDelete = async () => {
    if (deleteId) {
      const { error } = await supabase.from('delivery_visits').delete().eq('id', deleteId);
      if (error) alert('Erro ao excluir');
      else onRefresh();
      setDeleteId(null);
    }
  };

  const editingVisit = editingId ? visits.find(v => v.id === editingId) : undefined;

  // Removed isDriversManagerOpen conditional rendering

  return (
    <div className="animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Visitas de Entregadores</h1>
          <p className="text-slate-500 mt-1">Registro de visitas e entregas</p>
        </div>
        <div className="flex gap-3">
          {/* Removed "Gerenciar Entregadores" button
          <button 
            onClick={() => setIsDriversManagerOpen(true)}
            className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-4 py-2.5 rounded-lg flex items-center gap-2 font-medium transition-colors shadow-sm"
          >
            <Users size={18} />
            <span className="hidden sm:inline">Gerenciar Entregadores</span>
            <span className="sm:hidden">Entregadores</span>
          </button>
          */}
          <button 
            onClick={handleAddNew}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg flex items-center gap-2 font-medium shadow-lg shadow-blue-100 transition-colors"
          >
            <Plus size={18} />
            <span>Registrar Visita</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
           <div>
             <p className="text-xs text-slate-500 font-medium uppercase mb-1">Visitas Hoje</p>
             <h3 className="text-2xl font-bold text-slate-800">{visitsToday}</h3>
           </div>
           <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center">
             <Calendar size={20} />
           </div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
           <div>
             <p className="text-xs text-slate-500 font-medium uppercase mb-1">Total de Encomendas</p>
             <h3 className="text-2xl font-bold text-slate-800">{packagesToday}</h3>
           </div>
           <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-500 flex items-center justify-center">
             <Package size={20} />
           </div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 mb-6">
        <div className="relative w-full">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            <Search size={18} />
          </div>
          <input 
            type="text" 
            placeholder="Buscar por entregador, empresa ou documento..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all text-sm placeholder:text-slate-400"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredVisits.length > 0 ? (
          filteredVisits.map((visit) => (
            <DeliveryVisitCard 
              key={visit.id} 
              data={visit} 
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))
        ) : (
          <div className="col-span-full py-16 text-center bg-white rounded-xl border border-slate-100 flex flex-col items-center justify-center">
             <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-3 text-slate-300">
               <Truck size={32} />
             </div>
             <p className="text-slate-500 font-medium">Nenhuma visita registrada</p>
          </div>
        )}
      </div>

      <DeliveryVisitModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        drivers={drivers}
        initialData={editingVisit}
        onAddDriver={handleAddDriver}
        onEditDriver={handleEditDriver}
      />

      {/* Nested Modal for creating/editing a driver on the fly */}
      <DeliveryDriverModal
        isOpen={isDriverModalOpen}
        onClose={() => setIsDriverModalOpen(false)}
        onSubmit={handleDriverSubmit}
        companies={companies}
        initialData={driverToEdit}
      />

      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 transform transition-all scale-100">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-4">
                <AlertTriangle size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Excluir Visita</h3>
              <div className="flex items-center gap-3 w-full">
                <button onClick={() => setDeleteId(null)} className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 text-slate-700 font-medium hover:bg-slate-50">Cancelar</button>
                <button onClick={confirmDelete} className="flex-1 px-4 py-2.5 rounded-lg bg-red-500 hover:bg-red-600 text-white font-medium shadow-lg shadow-red-200">Excluir</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
