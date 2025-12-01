import React, { useState, useMemo } from 'react';
import { Plus, Search, Calendar, Inbox, AlertTriangle } from 'lucide-react';
import { ReceivedItem, Resident } from '../types';
import { ReceivedItemCard } from './ReceivedItemCard';
import { ReceivedItemModal } from './ReceivedItemModal';
import { PickupModal } from './PickupModal';

interface ReceivedItemsPageProps {
  items: ReceivedItem[];
  setItems: React.Dispatch<React.SetStateAction<ReceivedItem[]>>;
  residents: Resident[];
}

export const ReceivedItemsPage: React.FC<ReceivedItemsPageProps> = ({ items, setItems, residents }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'todos' | 'pendentes' | 'retiradas'>('todos');
  
  // Modals
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [pickupId, setPickupId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Stats
  const stats = {
    total: items.length,
    pending: items.filter(i => i.status === 'Aguardando Retirada').length,
    pickedUp: items.filter(i => i.status === 'Retirada').length
  };

  // Filter Logic
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchesSearch = 
        item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.unit.includes(searchTerm) ||
        item.block.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.leftBy.toLowerCase().includes(searchTerm.toLowerCase());
      
      if (filterStatus === 'pendentes') return matchesSearch && item.status === 'Aguardando Retirada';
      if (filterStatus === 'retiradas') return matchesSearch && item.status === 'Retirada';
      return matchesSearch;
    });
  }, [items, searchTerm, filterStatus]);

  // Handlers
  const handleCreate = (data: Omit<ReceivedItem, 'id' | 'status' | 'receivedAt'>) => {
    const now = new Date();
    const receivedAt = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth()+1).toString().padStart(2, '0')}/${now.getFullYear().toString().slice(-2)} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    const newItem: ReceivedItem = {
      id: Math.random().toString(36).substr(2, 9),
      status: 'Aguardando Retirada',
      receivedAt,
      ...data
    };

    setItems([newItem, ...items]);
  };

  const handleDelete = (id: string) => {
    setDeleteId(id);
  };

  const confirmDelete = () => {
    if (deleteId) {
      setItems(prev => prev.filter(i => i.id !== deleteId));
      setDeleteId(null);
    }
  };

  const handlePickupConfirm = (name: string) => {
    if (pickupId) {
      const now = new Date();
      const pickedUpAt = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth()+1).toString().padStart(2, '0')}/${now.getFullYear().toString().slice(-2)} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      
      setItems(prev => prev.map(i => 
        i.id === pickupId 
          ? { ...i, status: 'Retirada', pickedUpBy: name, pickedUpAt } 
          : i
      ));
      setPickupId(null);
    }
  };

  return (
    <div className="animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Itens Recebidos</h1>
          <p className="text-slate-500 mt-1">Gestão de itens deixados e recebidos</p>
        </div>
        
        <button 
          onClick={() => setIsNewModalOpen(true)}
          className="bg-[#0f766e] hover:bg-[#0d9488] text-white px-6 py-2.5 rounded-lg flex items-center gap-2 font-medium shadow-lg shadow-teal-100 transition-colors"
        >
          <Plus size={18} />
          <span>Novo Item</span>
        </button>
      </div>

      {/* Filters Section */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 mb-6 space-y-4">
        
        {/* Row 1: Search Bar (Full Width) */}
        <div className="w-full relative">
           <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              <Search size={20} />
            </div>
            <input 
              type="text" 
              placeholder="Buscar por item, pessoa, unidade ou bloco..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500/20 transition-all text-base placeholder:text-slate-400"
            />
        </div>

        {/* Row 2: Date & Tabs */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
           {/* Date Picker */}
           <div className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-slate-500 text-sm hover:border-slate-300 cursor-pointer bg-white w-full md:w-auto">
              <span>dd/mm/aaaa</span>
              <Calendar size={16} />
           </div>

           {/* Status Tabs */}
           <div className="flex bg-slate-100 p-1 rounded-lg w-full md:w-auto overflow-x-auto">
             <button
               onClick={() => setFilterStatus('todos')}
               className={`flex-1 md:flex-none whitespace-nowrap px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                 filterStatus === 'todos' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
               }`}
             >
               Todos <span className="ml-1 px-1.5 py-0.5 bg-slate-200 text-slate-600 rounded-full text-xs">{stats.total}</span>
             </button>
             <button
               onClick={() => setFilterStatus('pendentes')}
               className={`flex-1 md:flex-none whitespace-nowrap px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                 filterStatus === 'pendentes' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
               }`}
             >
               Pendentes <span className="ml-1 px-1.5 py-0.5 bg-orange-100 text-orange-600 rounded-full text-xs">{stats.pending}</span>
             </button>
             <button
               onClick={() => setFilterStatus('retiradas')}
               className={`flex-1 md:flex-none whitespace-nowrap px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                 filterStatus === 'retiradas' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
               }`}
             >
               Retirados <span className="ml-1 px-1.5 py-0.5 bg-green-100 text-green-600 rounded-full text-xs">{stats.pickedUp}</span>
             </button>
           </div>
        </div>
      </div>

      {/* List */}
      <div className="space-y-4">
        {filteredItems.length > 0 ? (
          filteredItems.map((item) => (
            <ReceivedItemCard 
              key={item.id} 
              data={item} 
              onPickup={() => setPickupId(item.id)}
              onDelete={() => handleDelete(item.id)}
            />
          ))
        ) : (
          <div className="py-16 text-center bg-white rounded-xl border border-slate-100 flex flex-col items-center justify-center">
             <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-3 text-slate-300">
               <Inbox size={32} />
             </div>
             <p className="text-slate-500 font-medium">Nenhum item encontrado</p>
          </div>
        )}
      </div>

      {/* Modals */}
      <ReceivedItemModal 
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        onSubmit={handleCreate}
        residents={residents}
      />

      <PickupModal
        isOpen={!!pickupId}
        onClose={() => setPickupId(null)}
        onConfirm={handlePickupConfirm}
        itemCount={1}
      />

      {/* Delete Confirmation */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 transform transition-all scale-100">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-4">
                <AlertTriangle size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Excluir Item</h3>
              <p className="text-slate-500 mb-6 text-sm">
                Tem certeza que deseja excluir este item? Esta ação não pode ser desfeita.
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