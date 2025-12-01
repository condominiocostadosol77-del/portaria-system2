import React, { useState, useMemo } from 'react';
import { Plus, Search, Calendar, AlertTriangle } from 'lucide-react';
import { Company } from '../types';
import { CompanyCard } from './CompanyCard';
import { CompanyModal } from './CompanyModal';
import { supabase } from '../lib/supabase';

interface CompaniesPageProps {
  companies: Company[];
  setCompanies?: React.Dispatch<React.SetStateAction<Company[]>>;
  onRefresh: () => void;
}

export const CompaniesPage: React.FC<CompaniesPageProps> = ({ companies, onRefresh }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'todos' | 'ativa' | 'inativa'>('todos');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filteredCompanies = useMemo(() => {
    return companies.filter(company => {
      const matchesSearch = company.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'todos' || company.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [companies, searchTerm, filterStatus]);

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

  const confirmDelete = async () => {
    if (deleteId) {
      const { error } = await supabase.from('companies').delete().eq('id', deleteId);
      if (error) alert('Erro ao excluir empresa');
      else onRefresh();
      setDeleteId(null);
    }
  };

  const handleSubmit = async (data: Omit<Company, 'id'>) => {
    try {
      if (editingId) {
        const { error } = await supabase.from('companies').update(data).eq('id', editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('companies').insert(data);
        if (error) throw error;
      }
      onRefresh();
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
      alert('Erro ao salvar empresa');
    }
  };

  const editingCompany = editingId ? companies.find(c => c.id === editingId) : undefined;

  return (
    <div className="animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Empresas</h1>
          <p className="text-slate-500 mt-1">Cadastro de empresas de entrega</p>
        </div>
        <button 
          onClick={handleAddNew}
          className="bg-secondary hover:bg-purple-600 text-white px-6 py-2.5 rounded-lg flex items-center gap-2 font-medium shadow-lg shadow-purple-200 transition-colors"
        >
          <Plus size={18} />
          <span>Nova Empresa</span>
        </button>
      </div>

      <div className="bg-white p-2 rounded-xl shadow-sm border border-slate-100 mb-6 flex flex-col xl:flex-row items-center justify-between gap-4">
        <div className="flex-1 w-full">
          <div className="relative w-full">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              <Search size={18} />
            </div>
            <input 
              type="text" 
              placeholder="Buscar por nome..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary/20 transition-all text-sm placeholder:text-slate-400"
            />
          </div>
        </div>
        <div className="flex items-center gap-4 w-full xl:w-auto">
           <div className="flex bg-slate-100 p-1 rounded-lg w-full xl:w-auto">
            {(['todos', 'ativa', 'inativa'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`flex-1 xl:flex-none px-6 py-1.5 rounded-md text-sm font-medium capitalize transition-all ${
                  filterStatus === status ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {status === 'todos' ? 'Todos' : status === 'ativa' ? 'Ativas' : 'Inativas'}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 px-3 py-2.5 border border-slate-200 rounded-lg text-slate-500 text-sm bg-white min-w-[140px] justify-between cursor-pointer hover:border-slate-300">
            <span>dd/mm/aaaa</span>
            <Calendar size={16} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredCompanies.length > 0 ? (
          filteredCompanies.map((company) => (
            <CompanyCard 
              key={company.id} 
              data={company} 
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))
        ) : (
          <div className="col-span-full py-12 text-center text-slate-400 bg-white rounded-xl border border-slate-100 border-dashed">
            <p>Nenhuma empresa encontrada.</p>
          </div>
        )}
      </div>

      <CompanyModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        initialData={editingCompany}
      />

      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 transform transition-all scale-100">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-4">
                <AlertTriangle size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Excluir Empresa</h3>
              <p className="text-slate-500 mb-6 text-sm">
                Tem certeza que deseja excluir esta empresa?
              </p>
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