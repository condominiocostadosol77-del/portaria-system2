import React, { useState, useMemo } from 'react';
import { Plus, Search, FileEdit, FileText, AlertTriangle } from 'lucide-react';
import { Occurrence, Employee } from '../types';
import { OccurrenceCard } from './OccurrenceCard';
import { OccurrenceModal } from './OccurrenceModal';
import { OccurrenceDetailsModal } from './OccurrenceDetailsModal';

interface OccurrencesPageProps {
  occurrences: Occurrence[];
  setOccurrences: React.Dispatch<React.SetStateAction<Occurrence[]>>;
  employees: Employee[];
  onOpenNotepad: () => void;
}

export const OccurrencesPage: React.FC<OccurrencesPageProps> = ({ 
  occurrences, 
  setOccurrences, 
  employees,
  onOpenNotepad
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modals
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedOccurrence, setSelectedOccurrence] = useState<Occurrence | null>(null);
  
  // Delete Confirmation State
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Filter
  const filteredOccurrences = useMemo(() => {
    return occurrences.filter(occ => 
      occ.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      occ.outgoingEmployeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      occ.incomingEmployeeName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [occurrences, searchTerm]);

  // Handlers
  const handleCreate = (data: Omit<Occurrence, 'id' | 'timestamp'>) => {
    const now = new Date();
    const months = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
    const timestamp = `${now.getDate()} de ${months[now.getMonth()]} de ${now.getFullYear()} às ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    const newOccurrence: Occurrence = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp,
      ...data
    };

    setOccurrences([newOccurrence, ...occurrences]);
  };

  const handleDelete = (id: string) => {
    setDeleteId(id);
  };

  const confirmDelete = () => {
    if (deleteId) {
      setOccurrences(prev => prev.filter(o => o.id !== deleteId));
      setDeleteId(null);
      if (isDetailsModalOpen) setIsDetailsModalOpen(false);
    }
  };

  const openDetails = (data: Occurrence) => {
    setSelectedOccurrence(data);
    setIsDetailsModalOpen(true);
  };

  return (
    <div className="animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Ocorrências e Passagem de Turno</h1>
          <p className="text-slate-500 mt-1">Registro de ocorrências e troca de turno</p>
        </div>
        
        <div className="flex gap-3">
          <button 
            onClick={onOpenNotepad}
            className="bg-[#EAB308] hover:bg-[#CA8A04] text-white px-4 py-2.5 rounded-lg flex items-center gap-2 font-medium shadow-lg shadow-yellow-100 transition-colors"
          >
            <FileEdit size={18} />
            <span>Bloco de Notas</span>
          </button>
          <button 
            onClick={() => setIsNewModalOpen(true)}
            className="bg-[#DC2626] hover:bg-[#B91C1C] text-white px-4 py-2.5 rounded-lg flex items-center gap-2 font-medium shadow-lg shadow-red-100 transition-colors"
          >
            <Plus size={18} />
            <span>Nova Ocorrência</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-2 rounded-xl shadow-sm border border-slate-100 mb-6">
        <div className="relative w-full">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              <Search size={18} />
            </div>
            <input 
              type="text" 
              placeholder="Buscar por funcionário ou texto do relato..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400/20 transition-all text-sm placeholder:text-slate-400"
            />
          </div>
      </div>

      {/* List */}
      <div className="space-y-4">
        {filteredOccurrences.length > 0 ? (
          filteredOccurrences.map(occ => (
            <OccurrenceCard 
              key={occ.id} 
              data={occ} 
              onViewDetails={openDetails}
              onDelete={handleDelete}
            />
          ))
        ) : (
          <div className="py-16 text-center bg-white rounded-xl border border-slate-100 flex flex-col items-center justify-center">
             <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-3 text-slate-300">
               <FileText size={32} />
             </div>
             <p className="text-slate-500 font-medium">Nenhuma ocorrência registrada</p>
          </div>
        )}
      </div>

      {/* Modals */}
      <OccurrenceModal 
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        onSubmit={handleCreate}
        employees={employees}
      />

      <OccurrenceDetailsModal 
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        data={selectedOccurrence}
        onDelete={handleDelete}
      />

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 transform transition-all scale-100">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-4">
                <AlertTriangle size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Excluir Ocorrência</h3>
              <p className="text-slate-500 mb-6 text-sm">
                Tem certeza que deseja excluir esta ocorrência? Esta ação não pode ser desfeita.
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