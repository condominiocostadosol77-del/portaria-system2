
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
  // Initialize with today's date in YYYY-MM-DD format
  const [selectedDate, setSelectedDate] = useState(() => {
    const now = new Date();
    return now.toISOString().split('T')[0];
  });
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // State for Driver Modal (used for both Add and Edit)
  const [isDriverModalOpen, setIsDriverModalOpen] = useState(false);
  const [driverToEdit, setDriverToEdit] = useState<DeliveryDriver | undefined>(undefined);
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Helper to compare visit string date (DD/MM/YYYY HH:mm) with selected date (YYYY-MM-DD)
  const checkDateMatch = (visitEntryTime: string, targetDate: string) => {
    if (!visitEntryTime) return false;
    
    // Extract DD/MM/YYYY from "DD/MM/YYYY HH:mm"
    const [datePart] = visitEntryTime.split(' ');
    if (!datePart) return false;
    
    const [vDay, vMonth, vYear] = datePart.split('/');

    // Extract YYYY-MM-DD from targetDate
    const [tYear, tMonth, tDay] = targetDate.split('-');

    // Normalize year (e.g. 25 -> 2025)
    let fullVYear = parseInt(vYear);
    if (fullVYear < 100) fullVYear += 2000;

    return parseInt(vDay) === parseInt(tDay) &&
           parseInt(vMonth) === parseInt(tMonth) &&
           fullVYear === parseInt(tYear);
  };
  
  // Calculate stats based on selected Date (ignores search term for the cards)
  const visitsOnSelectedDate = visits.filter(v => checkDateMatch(v.entryTime, selectedDate));
  const visitsCount = visitsOnSelectedDate.length;
  const packagesCount = visitsOnSelectedDate.reduce((acc, curr) => acc + curr.packageCount, 0);

  const filteredVisits = useMemo(() => {
    return visits.filter(v => {
      // 1. Check Date
      const matchesDate = checkDateMatch(v.entryTime, selectedDate);
      
      // 2. Check Search
      const matchesSearch = 
        v.driverName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.observations.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesDate && matchesSearch;
    });
  }, [visits, searchTerm, selectedDate]);

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

  return (
    <div className="animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Visitas de Entregadores</h1>
          <p className="text-slate-500 mt-1">Registro de visitas e entregas</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleAddNew}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg flex items-center gap-2 font-medium shadow-lg shadow-blue-100 transition-colors"
          >
            <Plus size={18} />
            <span>Registrar Visita</span>
          </button>
        </div>
      </div>

      {/* Date Filter & Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Date Picker Card */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-center">
            <p className="text-xs text-slate-500 font-medium uppercase mb-2 flex items-center gap-1">
              <Calendar size={14} />
              Filtrar por Data
            </p>
            <input 
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20"
            />
        </div>

        {/* Stats Cards */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
           <div>
             <p className="text-xs text-slate-500 font-medium uppercase mb-1">Visitas na Data</p>
             <h3 className="text-2xl font-bold text-slate-800">{visitsCount}</h3>
           </div>
           <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center">
             <Truck size={20} />
           </div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
           <div>
             <p className="text-xs text-slate-500 font-medium uppercase mb-1">Total de Encomendas</p>
             <h3 className="text-2xl font-bold text-slate-800">{packagesCount}</h3>
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
            placeholder="Buscar por entregador, empresa ou observações..." 
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
             <p className="text-slate-500 font-medium">Nenhuma visita encontrada para esta data</p>
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
