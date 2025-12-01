import React, { useState, useMemo } from 'react';
import { Plus, Search, Calendar, Trash2, Edit2, AlertTriangle, FilterX } from 'lucide-react';
import { TimeRecord, Employee } from '../types';
import { TimeSheetCard } from './TimeSheetCard';
import { TimeSheetModal } from './TimeSheetModal';

interface TimeSheetPageProps {
  records: TimeRecord[];
  setRecords: React.Dispatch<React.SetStateAction<TimeRecord[]>>;
  employees: Employee[];
}

export const TimeSheetPage: React.FC<TimeSheetPageProps> = ({ records, setRecords, employees }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterShift, setFilterShift] = useState<'todos' | 'diurno' | 'noturno'>('todos');
  const [filterEmployeeId, setFilterEmployeeId] = useState<string>('todos');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isClearAllModalOpen, setIsClearAllModalOpen] = useState(false);

  // Filter Logic
  const filteredRecords = useMemo(() => {
    return records.filter(record => {
      const matchesSearch = 
        record.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.observations.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesShift = filterShift === 'todos' || record.shift === filterShift;
      const matchesEmployee = filterEmployeeId === 'todos' || record.employeeId === filterEmployeeId;

      return matchesSearch && matchesShift && matchesEmployee;
    });
  }, [records, searchTerm, filterShift, filterEmployeeId]);

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
      setRecords(prev => prev.filter(r => r.id !== deleteId));
      setDeleteId(null);
    }
  };

  const handleClearFilters = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    setSearchTerm('');
    setFilterShift('todos');
    setFilterEmployeeId('todos');
  };

  // Triggered by the "Limpar Tudo" button (Delete All)
  const handleClearAllRecordsRequest = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    setIsClearAllModalOpen(true);
  };

  const confirmClearAllRecords = () => {
    setRecords([]); 
    setIsClearAllModalOpen(false);
  };

  const handleSubmit = (data: Omit<TimeRecord, 'id' | 'employeeName'>) => {
    const employee = employees.find(e => e.id === data.employeeId);
    if (!employee) return;

    if (editingId) {
      // Edit existing
      setRecords(prev => prev.map(r => 
        r.id === editingId 
          ? { ...data, id: editingId, employeeName: employee.name } 
          : r
      ));
    } else {
      // Create new
      const newId = Math.random().toString(36).substr(2, 9);
      setRecords(prev => [{ ...data, id: newId, employeeName: employee.name }, ...prev]);
    }
    setIsModalOpen(false);
  };

  const editingRecord = editingId ? records.find(r => r.id === editingId) : undefined;

  return (
    <div className="animate-in fade-in duration-300">
      
      {/* Screen Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Folha de Ponto</h1>
          <p className="text-slate-500 mt-1">Registro de ponto dos funcionários</p>
        </div>
        
        <button 
          onClick={handleAddNew}
          type="button"
          className="bg-secondary hover:bg-purple-600 text-white px-6 py-2.5 rounded-lg flex items-center gap-2 font-medium shadow-lg shadow-purple-200 transition-colors"
        >
          <Plus size={18} />
          <span>Novo Registro</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 mb-6 space-y-4">
        
        {/* Search & Tabs Row */}
        <div className="flex flex-col xl:flex-row gap-4">
           {/* Search */}
           <div className="flex-1 relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                <Search size={18} />
              </div>
              <input 
                type="text" 
                placeholder="Buscar por funcionário ou observação..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/20 transition-all text-sm placeholder:text-slate-400"
              />
           </div>

           {/* Shift Tabs */}
           <div className="flex bg-slate-100 p-1 rounded-lg w-full xl:w-auto">
            {(['todos', 'diurno', 'noturno'] as const).map((shift) => (
              <button
                key={shift}
                type="button"
                onClick={() => setFilterShift(shift)}
                className={`flex-1 xl:flex-none px-6 py-1.5 rounded-md text-sm font-medium capitalize transition-all ${
                  filterShift === shift
                    ? 'bg-white text-slate-800 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {shift}
              </button>
            ))}
          </div>
        </div>

        {/* Employee Dropdown & Actions Row */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-2 border-t border-slate-50">
           
           <div className="w-full md:w-64">
             <select
                value={filterEmployeeId}
                onChange={(e) => setFilterEmployeeId(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-purple-500 bg-white"
             >
                <option value="todos">Todos os funcionários</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.name}</option>
                ))}
             </select>
           </div>

           <div className="flex gap-3 w-full md:w-auto">
              {/* Reset Filters Icon Button */}
              {(searchTerm || filterShift !== 'todos' || filterEmployeeId !== 'todos') && (
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="px-3 py-2 text-slate-400 hover:text-slate-600 transition-colors"
                  title="Resetar Filtros"
                >
                  <FilterX size={20} />
                </button>
              )}

              <button 
                type="button"
                onClick={handleClearAllRecordsRequest}
                className="flex-1 md:flex-none px-4 py-2 rounded-lg bg-red-300 hover:bg-red-400 text-white text-sm font-medium transition-colors"
              >
                Limpar Tudo
              </button>
           </div>
        </div>
      </div>

      {/* List */}
      <div className="space-y-4">
        {filteredRecords.length > 0 ? (
          filteredRecords.map((record) => (
            <TimeSheetCard 
              key={record.id} 
              data={record} 
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))
        ) : (
          <div className="py-16 text-center bg-white rounded-xl border border-slate-100 flex flex-col items-center justify-center">
             <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-3 text-slate-300">
               <Calendar size={32} />
             </div>
             <p className="text-slate-500 font-medium">Nenhum registro encontrado</p>
          </div>
        )}
      </div>

      {/* Form Modal */}
      <TimeSheetModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        employees={employees}
        initialData={editingRecord}
      />

      {/* Delete Single Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 transform transition-all scale-100">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-4">
                <AlertTriangle size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Excluir Registro</h3>
              <p className="text-slate-500 mb-6 text-sm">
                Tem certeza que deseja excluir este registro de ponto? Esta ação não pode ser desfeita.
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

      {/* Clear ALL Confirmation Modal */}
      {isClearAllModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 transform transition-all scale-100">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-4">
                <AlertTriangle size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Excluir Todos os Registros?</h3>
              <p className="text-slate-500 mb-6 text-sm">
                Atenção! Esta ação irá apagar <strong>todos</strong> os registros de ponto cadastrados no sistema. Esta ação é irreversível.
              </p>
              <div className="flex items-center gap-3 w-full">
                <button 
                  onClick={() => setIsClearAllModalOpen(false)}
                  className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 text-slate-700 font-medium hover:bg-slate-50 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  onClick={confirmClearAllRecords}
                  className="flex-1 px-4 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium transition-colors shadow-lg shadow-red-200"
                >
                  Confirmar Exclusão
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
