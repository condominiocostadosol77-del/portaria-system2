import React, { useState, useMemo } from 'react';
import { Plus, Search, Calendar, AlertTriangle } from 'lucide-react';
import { Resident } from '../types';
import { ResidentCard } from './ResidentCard';
import { ResidentModal } from './ResidentModal';

interface ResidentsPageProps {
  residents: Resident[];
  setResidents: React.Dispatch<React.SetStateAction<Resident[]>>;
}

export const ResidentsPage: React.FC<ResidentsPageProps> = ({ residents, setResidents }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'todos' | 'ativo' | 'inativo'>('todos');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Delete Confirmation State
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Filter Logic
  const filteredResidents = useMemo(() => {
    return residents.filter(resident => {
      const matchesSearch = 
        resident.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resident.unit.includes(searchTerm) ||
        resident.block.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resident.cpf.includes(searchTerm);
      
      const matchesStatus = filterStatus === 'todos' || resident.status === filterStatus;

      return matchesSearch && matchesStatus;
    });
  }, [residents, searchTerm, filterStatus]);

  // Handlers
  const handleAddNew = () => {
    setEditingId(null);
    setIsModalOpen(true);
  };

  const handleEdit = (id: string) => {
    setEditingId(id);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    setDeleteId(id);
  };

  const confirmDelete = () => {
    if (deleteId) {
      setResidents(prev => prev.filter(r => r.id !== deleteId));
      setDeleteId(null);
    }
  };

  const handleSubmit = (data: Omit<Resident, 'id'>) => {
    if (editingId) {
      // Edit existing
      setResidents(prev => prev.map(r => r.id === editingId ? { ...data, id: editingId } : r));
    } else {
      // Create new
      const newId = Math.random().toString(36).substr(2, 9);
      setResidents(prev => [{ ...data, id: newId }, ...prev]);
    }
    setIsModalOpen(false);
  };

  const editingResident = editingId ? residents.find(r => r.id === editingId) : undefined;

  return (
    <div className="animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Moradores</h1>
          <p className="text-slate-500 mt-1">Cadastro de moradores e unidades</p>
        </div>
        
        <button 
          onClick={handleAddNew}
          className="bg-primary hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg flex items-center gap-2 font-medium shadow-lg shadow-blue-200 transition-colors"
        >
          <Plus size={18} />
          <span>Novo Morador</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-2 rounded-xl shadow-sm border border-slate-100 mb-6 flex flex-col xl:flex-row items-center justify-between gap-4">
        
        {/* Search & Date */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full xl:w-auto">
          <div className="relative w-full sm:w-96">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              <Search size={18} />
            </div>
            <input 
              type="text" 
              placeholder="Buscar por nome, unidade, bloco ou CPF..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all text-sm placeholder:text-slate-400"
            />
          </div>
          
          <div className="flex items-center gap-2 px-3 py-2.5 border border-slate-200 rounded-lg text-slate-500 text-sm bg-white min-w-[140px] justify-between cursor-pointer hover:border-slate-300">
            <span>dd/mm/aaaa</span>
            <Calendar size={16} />
          </div>
        </div>

        {/* Status Tabs */}
        <div className="flex bg-slate-100 p-1 rounded-lg w-full xl:w-auto">
          {(['todos', 'ativo', 'inativo'] as const).map((status) => (
             <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`flex-1 xl:flex-none px-6 py-1.5 rounded-md text-sm font-medium capitalize transition-all ${
                filterStatus === status
                  ? 'bg-white text-slate-800 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {status === 'todos' ? 'Todos' : status === 'ativo' ? 'Ativos' : 'Inativos'}
            </button>
          ))}
        </div>
      </div>

      {/* Grid List */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredResidents.length > 0 ? (
          filteredResidents.map((resident) => (
            <ResidentCard 
              key={resident.id} 
              data={resident} 
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))
        ) : (
          <div className="col-span-full py-12 text-center text-slate-400 bg-white rounded-xl border border-slate-100 border-dashed">
            <p>Nenhum morador encontrado.</p>
          </div>
        )}
      </div>

      {/* Form Modal */}
      <ResidentModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        initialData={editingResident}
      />

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 transform transition-all scale-100">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-4">
                <AlertTriangle size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Excluir Morador</h3>
              <p className="text-slate-500 mb-6 text-sm">
                Tem certeza que deseja excluir este morador? Esta ação não pode ser desfeita e removerá o cadastro permanentemente.
              </p>
              <div className="flex items-center gap-3 w-full">
                <button 
                  onClick={() => setDeleteId(null)}
                  className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 text-slate-700 font-medium hover:bg-slate-50 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  onClick={confirmDelete}
                  className="flex-1 px-4 py-2.5 rounded-lg bg-red-500 hover:bg-red-600 text-white font-medium transition-colors shadow-lg shadow-red-200"
                >
                  Excluir
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};