import React, { useState, useMemo } from 'react';
import { Plus, Search, Calendar, AlertTriangle } from 'lucide-react';
import { Employee } from '../types';
import { EmployeeCard } from './EmployeeCard';
import { EmployeeModal } from './EmployeeModal';
import { supabase } from '../lib/supabase';

interface EmployeesPageProps {
  employees: Employee[];
  setEmployees?: React.Dispatch<React.SetStateAction<Employee[]>>;
  onRefresh: () => void;
}

export const EmployeesPage: React.FC<EmployeesPageProps> = ({ employees, onRefresh }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'todos' | 'ativo' | 'inativo' | 'ferias'>('todos');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filteredEmployees = useMemo(() => {
    return employees.filter(employee => {
      const matchesSearch = 
        employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.cpf.includes(searchTerm) ||
        employee.role.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = filterStatus === 'todos' || employee.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [employees, searchTerm, filterStatus]);

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
      const { error } = await supabase.from('employees').delete().eq('id', deleteId);
      if (error) alert('Erro ao excluir funcionário');
      else onRefresh();
      setDeleteId(null);
    }
  };

  const handleSubmit = async (data: Omit<Employee, 'id'>) => {
    try {
      const payload = {
        name: data.name,
        cpf: data.cpf,
        role: data.role,
        shift: data.shift,
        status: data.status,
        entry_time: data.entryTime,
        exit_time: data.exitTime,
        phone: data.phone,
        email: data.email,
        admission_date: data.admissionDate,
        photo_url: data.photoUrl,
        observations: data.observations
      };

      if (editingId) {
        const { error } = await supabase.from('employees').update(payload).eq('id', editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('employees').insert(payload);
        if (error) throw error;
      }
      onRefresh();
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
      alert('Erro ao salvar funcionário');
    }
  };

  const editingEmployee = editingId ? employees.find(e => e.id === editingId) : undefined;

  return (
    <div className="animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Funcionários</h1>
          <p className="text-slate-500 mt-1">Cadastro e gestão de funcionários</p>
        </div>
        <button 
          onClick={handleAddNew}
          className="bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-2.5 rounded-lg flex items-center gap-2 font-medium shadow-lg shadow-cyan-200 transition-colors"
        >
          <Plus size={18} />
          <span>Novo Funcionário</span>
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
              placeholder="Buscar por nome, CPF, cargo ou turno..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/20 transition-all text-sm placeholder:text-slate-400"
            />
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full xl:w-auto">
           <div className="flex bg-slate-100 p-1 rounded-lg w-full xl:w-auto overflow-x-auto">
            {(['todos', 'ativo', 'ferias', 'inativo'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`flex-1 xl:flex-none px-4 py-1.5 rounded-md text-sm font-medium capitalize transition-all whitespace-nowrap ${
                  filterStatus === status ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 px-3 py-2.5 border border-slate-200 rounded-lg text-slate-500 text-sm bg-white min-w-[140px] justify-between cursor-pointer hover:border-slate-300 w-full sm:w-auto">
            <span>dd/mm/aaaa</span>
            <Calendar size={16} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredEmployees.length > 0 ? (
          filteredEmployees.map((employee) => (
            <EmployeeCard 
              key={employee.id} 
              data={employee} 
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))
        ) : (
          <div className="col-span-full py-12 text-center text-slate-400 bg-white rounded-xl border border-slate-100 border-dashed">
            <p>Nenhum funcionário encontrado.</p>
          </div>
        )}
      </div>

      <EmployeeModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        initialData={editingEmployee}
      />

      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 transform transition-all scale-100">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-4">
                <AlertTriangle size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Excluir Funcionário</h3>
              <p className="text-slate-500 mb-6 text-sm">
                Tem certeza que deseja excluir este funcionário?
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