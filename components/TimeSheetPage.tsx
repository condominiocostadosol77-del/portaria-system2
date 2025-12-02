import React, { useState, useMemo } from 'react';
import { Plus, Search, Calendar, Trash2, Edit2, AlertTriangle, FilterX, FileDown, Download } from 'lucide-react';
import { TimeRecord, Employee } from '../types';
import { TimeSheetCard } from './TimeSheetCard';
import { TimeSheetModal } from './TimeSheetModal';
import { supabase } from '../lib/supabase';

interface TimeSheetPageProps {
  records: TimeRecord[];
  setRecords?: React.Dispatch<React.SetStateAction<TimeRecord[]>>;
  employees: Employee[];
  onRefresh: () => void;
}

export const TimeSheetPage: React.FC<TimeSheetPageProps> = ({ records, employees, onRefresh }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterShift, setFilterShift] = useState<'todos' | 'diurno' | 'noturno'>('todos');
  const [filterEmployeeId, setFilterEmployeeId] = useState<string>('todos');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isClearAllModalOpen, setIsClearAllModalOpen] = useState(false);

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
      const { error } = await supabase.from('time_records').delete().eq('id', deleteId);
      if (error) alert('Erro ao excluir');
      else onRefresh();
      setDeleteId(null);
    }
  };

  const handleClearFilters = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    setSearchTerm('');
    setFilterShift('todos');
    setFilterEmployeeId('todos');
  };

  const handleClearAllRecordsRequest = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    setIsClearAllModalOpen(true);
  };

  const confirmClearAllRecords = async () => {
    const { error } = await supabase.from('time_records').delete().neq('id', '00000000-0000-0000-0000-000000000000'); // Hack to delete all
    if (error) alert('Erro ao limpar tudo');
    else onRefresh();
    setIsClearAllModalOpen(false);
  };

  const handleExportPDF = () => {
    if (filteredRecords.length === 0) {
      alert("Não há registros para exportar.");
      return;
    }
    
    console.log("Iniciando impressão...");
    // Change document title temporarily for the PDF filename
    const originalTitle = document.title;
    document.title = `Folha_Ponto_${new Date().toISOString().slice(0, 10)}`;
    
    // Add small delay to ensure browser handles the print command correctly
    setTimeout(() => {
      window.print();
      document.title = originalTitle;
    }, 100);
  };

  const handleExportCSV = () => {
    if (filteredRecords.length === 0) {
      alert("Não há registros para exportar.");
      return;
    }

    // CSV Headers
    const headers = ["Data", "Funcionario", "Turno", "Entrada", "Saida", "Tipo", "Observacoes"];
    
    // CSV Rows
    const rows = filteredRecords.map(r => {
      // Format date
      const [y, m, d] = r.date.split('-');
      const formattedDate = `${d}/${m}/${y}`;
      
      // Escape quotes for CSV safety
      const obs = r.observations ? r.observations.replace(/"/g, '""') : "";
      
      return [
        formattedDate,
        `"${r.employeeName}"`,
        r.shift,
        r.entryTime,
        r.exitTime,
        r.type,
        `"${obs}"`
      ].join(",");
    });

    // Combine headers and rows
    const csvContent = [headers.join(","), ...rows].join("\n");

    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `folha_ponto_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSubmit = async (data: Omit<TimeRecord, 'id' | 'employeeName'>) => {
    const employee = employees.find(e => e.id === data.employeeId);
    if (!employee) return;

    try {
      const payload = {
        employee_id: data.employeeId,
        employee_name: employee.name,
        date: data.date,
        shift: data.shift,
        entry_time: data.entryTime,
        exit_time: data.exitTime,
        type: data.type,
        observations: data.observations
      };

      if (editingId) {
        const { error } = await supabase.from('time_records').update(payload).eq('id', editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('time_records').insert(payload);
        if (error) throw error;
      }
      onRefresh();
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
      alert('Erro ao salvar registro');
    }
  };

  const editingRecord = editingId ? records.find(r => r.id === editingId) : undefined;

  // Print view calculation helpers
  const calculateDuration = (entry: string, exit: string): number => {
    if (!entry || !exit || entry === '--:--' || exit === '--:--') return 0;
    const [h1, m1] = entry.split(':').map(Number);
    const [h2, m2] = exit.split(':').map(Number);
    
    if (isNaN(h1) || isNaN(m1) || isNaN(h2) || isNaN(m2)) return 0;

    let minutes = (h2 * 60 + m2) - (h1 * 60 + m1);
    if (minutes < 0) minutes += 24 * 60;
    return minutes;
  };

  const formatDuration = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h}h ${m}min`;
  };

  const totalMinutes = useMemo(() => {
    return filteredRecords.reduce((acc, rec) => acc + calculateDuration(rec.entryTime, rec.exitTime), 0);
  }, [filteredRecords]);

  // Context for print title
  const printSubtitle = filterEmployeeId !== 'todos' 
    ? employees.find(e => e.id === filterEmployeeId)?.name 
    : 'Todos os Funcionários';

  return (
    <div className="animate-in fade-in duration-300">
      
      {/* PRINT LAYOUT */}
      <div className="print-only font-sans text-black">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Relatório de Folha de Ponto</h1>
          <h2 className="text-xl text-gray-600 mb-2">{printSubtitle}</h2>
          <p className="text-sm text-gray-500">Gerado em: {new Date().toLocaleString('pt-BR')}</p>
        </div>

        <table className="w-full text-sm border border-gray-300 border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 px-3 py-2 text-left font-bold w-24">Data</th>
              <th className="border border-gray-300 px-3 py-2 text-left font-bold">Funcionário</th>
              <th className="border border-gray-300 px-3 py-2 text-left font-bold w-24">Turno</th>
              <th className="border border-gray-300 px-3 py-2 text-center font-bold w-20">Entrada</th>
              <th className="border border-gray-300 px-3 py-2 text-center font-bold w-20">Saída</th>
              <th className="border border-gray-300 px-3 py-2 text-center font-bold w-24">Horas</th>
              <th className="border border-gray-300 px-3 py-2 text-center font-bold w-24">Tipo</th>
            </tr>
          </thead>
          <tbody>
            {filteredRecords.map(rec => {
               const duration = calculateDuration(rec.entryTime, rec.exitTime);
               const [y, m, d] = rec.date.split('-');
               const dateStr = `${d}/${m}/${y}`;
               
               return (
                 <tr key={rec.id}>
                   <td className="border border-gray-300 px-3 py-2">{dateStr}</td>
                   <td className="border border-gray-300 px-3 py-2">{rec.employeeName}</td>
                   <td className="border border-gray-300 px-3 py-2 uppercase text-xs">{rec.shift}</td>
                   <td className="border border-gray-300 px-3 py-2 text-center">{rec.entryTime || '-'}</td>
                   <td className="border border-gray-300 px-3 py-2 text-center">{rec.exitTime || '-'}</td>
                   <td className="border border-gray-300 px-3 py-2 text-center">{duration > 0 ? formatDuration(duration) : '-'}</td>
                   <td className="border border-gray-300 px-3 py-2 text-center uppercase text-xs">{rec.type}</td>
                 </tr>
               );
            })}
          </tbody>
          <tfoot>
             <tr className="bg-gray-50 font-bold">
               <td colSpan={5} className="border border-gray-300 px-3 py-2 text-right">Total de Horas:</td>
               <td colSpan={2} className="border border-gray-300 px-3 py-2 pl-6">{formatDuration(totalMinutes)}</td>
             </tr>
          </tfoot>
        </table>
      </div>

      {/* Screen Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 no-print">
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
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 mb-6 space-y-4 no-print">
        <div className="flex flex-col xl:flex-row gap-4">
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
           <div className="flex bg-slate-100 p-1 rounded-lg w-full xl:w-auto">
            {(['todos', 'diurno', 'noturno'] as const).map((shift) => (
              <button
                key={shift}
                type="button"
                onClick={() => setFilterShift(shift)}
                className={`flex-1 xl:flex-none px-6 py-1.5 rounded-md text-sm font-medium capitalize transition-all ${
                  filterShift === shift ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {shift}
              </button>
            ))}
          </div>
        </div>

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
           <div className="flex gap-3 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
              {(searchTerm || filterShift !== 'todos' || filterEmployeeId !== 'todos') && (
                <button onClick={handleClearFilters} className="px-3 py-2 text-slate-400 hover:text-slate-600 transition-colors" title="Limpar Filtros">
                  <FilterX size={20} />
                </button>
              )}
              
              <button 
                type="button"
                onClick={handleClearAllRecordsRequest}
                className="whitespace-nowrap px-4 py-2 rounded-lg bg-red-100 hover:bg-red-200 text-red-600 text-sm font-medium transition-colors"
              >
                Limpar Tudo
              </button>

              <button 
                type="button"
                onClick={handleExportCSV}
                className="whitespace-nowrap px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-medium transition-colors flex items-center justify-center gap-2 bg-white"
              >
                <Download size={16} />
                Exportar CSV
              </button>

              <button 
                type="button"
                onClick={handleExportPDF}
                className="whitespace-nowrap px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-medium transition-colors flex items-center justify-center gap-2 bg-white"
              >
                <FileDown size={16} />
                Imprimir / PDF
              </button>
           </div>
        </div>
      </div>

      <div className="space-y-4 no-print">
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

      <TimeSheetModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        employees={employees}
        initialData={editingRecord}
      />

      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200 no-print">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 transform transition-all scale-100">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-4">
                <AlertTriangle size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Excluir Registro</h3>
              <div className="flex items-center gap-3 w-full">
                <button onClick={() => setDeleteId(null)} className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 text-slate-700 font-medium hover:bg-slate-50">Cancelar</button>
                <button onClick={confirmDelete} className="flex-1 px-4 py-2.5 rounded-lg bg-red-500 hover:bg-red-600 text-white font-medium shadow-lg shadow-red-200">Excluir</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isClearAllModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200 no-print">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 transform transition-all scale-100">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-4">
                <AlertTriangle size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Excluir Todos os Registros?</h3>
              <p className="text-slate-500 mb-6 text-sm">Esta ação é irreversível.</p>
              <div className="flex items-center gap-3 w-full">
                <button onClick={() => setIsClearAllModalOpen(false)} className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 text-slate-700 font-medium hover:bg-slate-50">Cancelar</button>
                <button onClick={confirmClearAllRecords} className="flex-1 px-4 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium shadow-lg shadow-red-200">Confirmar Exclusão</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
