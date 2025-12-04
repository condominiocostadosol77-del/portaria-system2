
import React, { useState, useMemo } from 'react';
import { Plus, Search, Calendar, Users, AlertTriangle, X } from 'lucide-react';
import { Visitor, Resident } from '../types';
import { VisitorCard } from './VisitorCard';
import { VisitorModal } from './VisitorModal';
import { supabase } from '../lib/supabase';

interface VisitorsPageProps {
  visitors: Visitor[];
  setVisitors?: React.Dispatch<React.SetStateAction<Visitor[]>>;
  residents: Resident[];
  onRefresh: () => void;
}

export const VisitorsPage: React.FC<VisitorsPageProps> = ({ visitors, residents, onRefresh }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'todos' | 'no_condominio' | 'saiu'>('todos');
  const [selectedDate, setSelectedDate] = useState(''); // New state for date filter
  
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Helper function to check if item date matches selected filter date
  const checkDateMatch = (dateStr: string, filterDate: string) => {
    if (!filterDate) return true;
    if (!dateStr) return false;

    // dateStr format is DD/MM/YY HH:MM
    const [datePart] = dateStr.split(' ');
    if (!datePart) return false;

    const [day, month, shortYear] = datePart.split('/');
    const fullYear = parseInt(shortYear) + 2000;
    
    // Create YYYY-MM-DD string
    const formattedDate = `${fullYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    
    return formattedDate === filterDate;
  };

  const filteredVisitors = useMemo(() => {
    return visitors.filter(v => {
      // 1. Check Date
      const matchesDate = checkDateMatch(v.entryTime, selectedDate);

      // 2. Check Search
      const matchesSearch = 
        v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (v.document && v.document.includes(searchTerm)) ||
        v.unit.includes(searchTerm) ||
        (v.residentName && v.residentName.toLowerCase().includes(searchTerm.toLowerCase()));
      
      // 3. Check Status
      if (filterStatus === 'no_condominio') return matchesDate && matchesSearch && v.status === 'no_condominio';
      if (filterStatus === 'saiu') return matchesDate && matchesSearch && v.status === 'saiu';
      
      return matchesDate && matchesSearch;
    });
  }, [visitors, searchTerm, filterStatus, selectedDate]);

  const handleCreate = async (data: Omit<Visitor, 'id' | 'status' | 'entryTime' | 'exitTime'>) => {
    const now = new Date();
    const entryTime = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth()+1).toString().padStart(2, '0')}/${now.getFullYear().toString().slice(-2)} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    try {
      const { error } = await supabase.from('visitors').insert({
        name: data.name,
        document: data.document,
        phone: data.phone,
        unit: data.unit,
        block: data.block,
        resident_name: data.residentName,
        resident_id: data.residentId,
        entry_time: entryTime,
        status: 'no_condominio',
        observations: data.observations
      });
      if (error) throw error;
      onRefresh();
      setIsNewModalOpen(false);
    } catch (err) {
      console.error(err);
      alert('Erro ao registrar visitante');
    }
  };

  const handleExit = async (id: string) => {
    const now = new Date();
    const exitTime = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth()+1).toString().padStart(2, '0')}/${now.getFullYear().toString().slice(-2)} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    try {
      const { error } = await supabase.from('visitors').update({
        status: 'saiu',
        exit_time: exitTime
      }).eq('id', id);
      if (error) throw error;
      onRefresh();
    } catch (err) {
      console.error(err);
      alert('Erro ao registrar saída');
    }
  };

  const handleDelete = (id: string) => {
    setDeleteId(id);
  };

  const confirmDelete = async () => {
    if (deleteId) {
      const { error } = await supabase.from('visitors').delete().eq('id', deleteId);
      if (error) alert('Erro ao excluir');
      else onRefresh();
      setDeleteId(null);
    }
  };

  return (
    <div className="animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Visitantes</h1>
          <p className="text-slate-500 mt-1">Controle de entrada e saída de visitantes</p>
        </div>
        <button 
          onClick={() => setIsNewModalOpen(true)}
          className="bg-[#0f766e] hover:bg-[#0d9488] text-white px-6 py-2.5 rounded-lg flex items-center gap-2 font-medium shadow-lg shadow-teal-100 transition-colors"
        >
          <Plus size={18} />
          <span>Registrar Visitante</span>
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 mb-6 space-y-4">
        <div className="w-full relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            <Search size={18} />
          </div>
          <input 
            type="text" 
            placeholder="Buscar por nome, documento, unidade ou morador..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#0f766e] focus:ring-1 focus:ring-teal-500/20 transition-all text-sm placeholder:text-slate-400"
          />
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
           {/* Date Filter Input */}
           <div className="flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-lg bg-white w-full md:w-auto relative hover:border-slate-300 transition-colors">
              <Calendar size={16} className="text-slate-400" />
              <input 
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="outline-none bg-transparent text-slate-600 text-sm font-medium focus:ring-0 w-full"
                title="Filtrar por data de entrada"
              />
              {selectedDate && (
                <button 
                  onClick={() => setSelectedDate('')} 
                  className="text-slate-400 hover:text-red-500 p-1 rounded-full hover:bg-slate-100 transition-colors"
                  title="Limpar data"
                >
                  <X size={14} />
                </button>
              )}
           </div>

          <div className="flex bg-slate-100 p-1 rounded-lg w-full md:w-auto overflow-x-auto">
            <button onClick={() => setFilterStatus('todos')} className={`flex-1 md:flex-none px-6 py-1.5 rounded-md text-sm font-medium transition-all ${filterStatus === 'todos' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Todos</button>
            <button onClick={() => setFilterStatus('no_condominio')} className={`flex-1 md:flex-none px-6 py-1.5 rounded-md text-sm font-medium transition-all ${filterStatus === 'no_condominio' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>No Condomínio</button>
            <button onClick={() => setFilterStatus('saiu')} className={`flex-1 md:flex-none px-6 py-1.5 rounded-md text-sm font-medium transition-all ${filterStatus === 'saiu' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Saíram</button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredVisitors.length > 0 ? (
          filteredVisitors.map((visitor) => (
            <VisitorCard 
              key={visitor.id} 
              data={visitor} 
              onExit={handleExit}
              onDelete={handleDelete}
            />
          ))
        ) : (
          <div className="col-span-full py-16 text-center bg-white rounded-xl border border-slate-100 flex flex-col items-center justify-center">
             <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-3 text-slate-300">
               <Users size={32} />
             </div>
             <p className="text-slate-500 font-medium">Nenhum visitante encontrado {selectedDate ? 'nesta data' : ''}.</p>
          </div>
        )}
      </div>

      <VisitorModal 
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        onSubmit={handleCreate}
        residents={residents}
        visitorsHistory={visitors} // Passando todo o histórico
      />

      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 transform transition-all scale-100">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-4">
                <AlertTriangle size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Excluir Visitante</h3>
              <p className="text-slate-500 mb-6 text-sm">Tem certeza que deseja excluir?</p>
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
