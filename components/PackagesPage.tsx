
import React, { useState, useMemo } from 'react';
import { Plus, Search, Calendar, AlertTriangle, ArrowRight, ChevronLeft, Layers, Box } from 'lucide-react';
import { PackageItem, Resident, Company } from '../types';
import { PackageCard } from './PackageCard';
import { PackageModal } from './PackageModal';
import { PickupModal } from './PickupModal';
import { ResidentModal } from './ResidentModal'; // Import ResidentModal
import { supabase } from '../lib/supabase';

interface PackagesPageProps {
  residents: Resident[];
  packages: PackageItem[];
  setPackages?: React.Dispatch<React.SetStateAction<PackageItem[]>>;
  companies: Company[];
  onRefresh: (scope?: 'residents' | 'packages') => void; // Update onRefresh signature
}

export const PackagesPage: React.FC<PackagesPageProps> = ({ residents, packages, companies, onRefresh }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'todos' | 'pendentes' | 'retiradas'>('pendentes');
  const [selectedGroup, setSelectedGroup] = useState<{unit: string, block: string} | null>(null);
  
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [pickupId, setPickupId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isBulkPickupOpen, setIsBulkPickupOpen] = useState(false);

  // State for adding new resident from within PackageModal
  const [isResidentModalOpen, setIsResidentModalOpen] = useState(false);

  const stats = {
    total: packages.length,
    pending: packages.filter(p => p.status === 'Aguardando Retirada').length,
    pickedUp: packages.filter(p => p.status === 'Retirada').length
  };

  const filteredPackages = useMemo(() => {
    return packages.filter(pkg => {
      const matchesSearch = 
        pkg.recipientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pkg.unit.includes(searchTerm) ||
        pkg.block.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pkg.withdrawalCode.includes(searchTerm) ||
        (pkg.trackingCode && pkg.trackingCode.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (pkg.observations && pkg.observations.toLowerCase().includes(searchTerm.toLowerCase())) || // Search in observations for ID
        (pkg.sender && pkg.sender.toLowerCase().includes(searchTerm.toLowerCase()));
      
      if (filterStatus === 'pendentes') return matchesSearch && pkg.status === 'Aguardando Retirada';
      if (filterStatus === 'retiradas') return matchesSearch && pkg.status === 'Retirada';
      return matchesSearch;
    });
  }, [packages, searchTerm, filterStatus]);

  const groupedPendingPackages = useMemo(() => {
    if (filterStatus !== 'pendentes' || selectedGroup) return [];
    const blocks: Record<string, PackageItem[]> = {};
    
    filteredPackages.forEach(pkg => {
      const blockName = pkg.block ? pkg.block.toUpperCase() : 'OUTROS';
      if (!blocks[blockName]) blocks[blockName] = [];
      blocks[blockName].push(pkg);
    });

    const processedBlocks = Object.entries(blocks).map(([blockName, blockItems]) => {
      const units: Record<string, PackageItem[]> = {};
      blockItems.forEach(pkg => {
        if (!units[pkg.unit]) units[pkg.unit] = [];
        units[pkg.unit].push(pkg);
      });

      const unitGroups = Object.entries(units).map(([unitName, unitItems]) => ({
        unit: unitName,
        block: blockName,
        count: unitItems.length,
        items: unitItems
      })).sort((a, b) => a.unit.localeCompare(b.unit, undefined, { numeric: true, sensitivity: 'base' }));

      return { blockName, totalInBlock: blockItems.length, unitGroups };
    });

    return processedBlocks.sort((a, b) => a.blockName.localeCompare(b.blockName));
  }, [filteredPackages, filterStatus, selectedGroup]);

  const displayedPackages = useMemo(() => {
    if (selectedGroup) {
      return filteredPackages.filter(p => 
        p.unit === selectedGroup.unit && 
        (p.block ? p.block.toUpperCase() : 'OUTROS') === selectedGroup.block
      );
    }
    return filteredPackages;
  }, [filteredPackages, selectedGroup]);

  const handleCreate = async (data: Partial<PackageItem>) => {
    try {
      const { error } = await supabase.from('packages').insert({
        unit: data.unit,
        block: data.block,
        recipient_name: data.recipientName,
        type: data.type,
        sender: data.sender,
        tracking_code: data.trackingCode,
        withdrawal_code: data.withdrawalCode,
        received_at: data.receivedAt,
        status: data.status,
        description: data.description,
        observations: data.observations
      });
      if (error) throw error;
      onRefresh('packages'); // Specify scope
    } catch (err) {
      console.error(err);
      alert('Erro ao salvar encomenda');
    }
  };

  const handlePickupConfirm = async (name: string) => {
    const now = new Date();
    const timestamp = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth()+1).toString().padStart(2, '0')}/${now.getFullYear().toString().slice(-2)} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    try {
      if (pickupId) {
        const { error } = await supabase.from('packages').update({
          status: 'Retirada',
          picked_up_by: name,
          picked_up_at: timestamp
        }).eq('id', pickupId);
        if (error) throw error;
        setPickupId(null);
      } else if (isBulkPickupOpen && selectedGroup) {
        const packagesToUpdate = packages.filter(p => 
          p.unit === selectedGroup.unit && 
          (p.block ? p.block.toUpperCase() : 'OUTROS') === selectedGroup.block && 
          p.status === 'Aguardando Retirada'
        );
        const ids = packagesToUpdate.map(p => p.id);
        
        const { error } = await supabase.from('packages').update({
          status: 'Retirada',
          picked_up_by: name,
          picked_up_at: timestamp
        }).in('id', ids);
        
        if (error) throw error;
        setIsBulkPickupOpen(false);
        setSelectedGroup(null);
      }
      onRefresh('packages');
    } catch (err) {
      console.error(err);
      alert('Erro ao registrar retirada');
    }
  };

  const handleDeleteConfirm = async () => {
    if (deleteId) {
      const { error } = await supabase.from('packages').delete().eq('id', deleteId);
      if (error) alert('Erro ao excluir');
      else onRefresh('packages');
      setDeleteId(null);
    }
  };

  const handleGroupClick = (unit: string, block: string) => {
    setSelectedGroup({ unit, block });
  };

  // Logic to add new resident
  const handleAddResident = () => {
    setIsResidentModalOpen(true);
  };

  const handleResidentSubmit = async (data: Omit<Resident, 'id'>) => {
    try {
      const { error } = await supabase.from('residents').insert(data);
      if (error) throw error;
      onRefresh('residents'); // Refresh residents list so PackageModal sees the new resident
      setIsResidentModalOpen(false);
    } catch (error) {
      console.error(error);
      alert('Erro ao salvar morador');
    }
  };

  // Helper to determine block colors
  const getBlockColorStyles = (blockName: string) => {
    const char = blockName.replace('BLOCO ', '').trim().charAt(0).toUpperCase();
    switch (char) {
      case 'A': return { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', iconBg: 'bg-blue-50', iconText: 'text-blue-600', hoverIconBg: 'group-hover:bg-blue-100', cardBorder: 'border-l-blue-500' };
      case 'B': return { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', iconBg: 'bg-emerald-50', iconText: 'text-emerald-600', hoverIconBg: 'group-hover:bg-emerald-100', cardBorder: 'border-l-emerald-500' };
      case 'C': return { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', iconBg: 'bg-purple-50', iconText: 'text-purple-600', hoverIconBg: 'group-hover:bg-purple-100', cardBorder: 'border-l-purple-500' };
      case 'D': return { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', iconBg: 'bg-orange-50', iconText: 'text-orange-600', hoverIconBg: 'group-hover:bg-orange-100', cardBorder: 'border-l-orange-500' };
      case 'E': return { bg: 'bg-pink-50', text: 'text-pink-700', border: 'border-pink-200', iconBg: 'bg-pink-50', iconText: 'text-pink-600', hoverIconBg: 'group-hover:bg-pink-100', cardBorder: 'border-l-pink-500' };
      case 'F': return { bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-200', iconBg: 'bg-cyan-50', iconText: 'text-cyan-600', hoverIconBg: 'group-hover:bg-cyan-100', cardBorder: 'border-l-cyan-500' };
      default: return { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200', iconBg: 'bg-slate-100', iconText: 'text-slate-500', hoverIconBg: 'group-hover:bg-slate-200', cardBorder: 'border-l-slate-500' };
    }
  };

  return (
    <div className="animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Encomendas</h1>
          <p className="text-slate-500 mt-1">Gestão de encomendas e correspondências</p>
        </div>
        <button 
          onClick={() => setIsNewModalOpen(true)}
          className="bg-secondary hover:bg-purple-600 text-white px-6 py-2.5 rounded-lg flex items-center gap-2 font-medium shadow-lg shadow-purple-200 transition-colors"
        >
          <Plus size={18} />
          <span>Nova Encomenda</span>
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 mb-6 space-y-4">
        <div className="w-full relative">
           <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              <Search size={20} />
            </div>
            <input 
              type="text" 
              placeholder="Buscar por morador, unidade, rastreio ou ID (ex: 1234)..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary/20 transition-all text-base placeholder:text-slate-400"
            />
        </div>
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
           <div className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-slate-500 text-sm hover:border-slate-300 cursor-pointer bg-white w-full md:w-auto">
              <span>dd/mm/aaaa</span>
              <Calendar size={16} />
           </div>
           <div className="flex bg-slate-100 p-1 rounded-lg w-full md:w-auto overflow-x-auto">
             {(['todos', 'pendentes', 'retiradas'] as const).map(status => (
                <button
                 key={status}
                 onClick={() => { setFilterStatus(status); setSelectedGroup(null); }}
                 className={`flex-1 md:flex-none whitespace-nowrap px-4 py-1.5 rounded-md text-sm font-medium transition-all capitalize ${
                   filterStatus === status ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                 }`}
               >
                 {status} <span className={`ml-1 px-1.5 py-0.5 rounded-full text-xs ${status === 'pendentes' ? 'bg-orange-100 text-orange-600' : 'bg-slate-200 text-slate-600'}`}>
                   {status === 'todos' ? stats.total : status === 'pendentes' ? stats.pending : stats.pickedUp}
                 </span>
               </button>
             ))}
           </div>
        </div>
      </div>

      {selectedGroup ? (
        <div className="animate-in slide-in-from-right-4 duration-300">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
             <div className="flex items-center gap-4">
               <button 
                 onClick={() => setSelectedGroup(null)}
                 className="flex items-center gap-1 text-slate-500 hover:text-primary transition-colors pr-4 border-r border-slate-200"
               >
                 <ChevronLeft size={20} />
                 <span className="text-sm font-medium">Voltar para lista</span>
               </button>
               <h2 className="text-xl font-bold text-slate-900">
                 Unidade {selectedGroup.unit} - Bloco {selectedGroup.block}
               </h2>
             </div>
             
             {filterStatus === 'pendentes' && (
               <button 
                 onClick={() => setIsBulkPickupOpen(true)}
                 className="bg-primary hover:bg-blue-700 text-white px-5 py-2 rounded-lg flex items-center gap-2 text-sm font-medium shadow-md shadow-blue-100 transition-colors"
               >
                 <Layers size={16} />
                 Retirar Todas ({displayedPackages.length})
               </button>
             )}
          </div>
          <div className="space-y-4">
             {displayedPackages.map((pkg) => (
                <PackageCard 
                  key={pkg.id} 
                  data={pkg} 
                  onPickup={() => setPickupId(pkg.id)}
                  onDelete={() => setDeleteId(pkg.id)}
                />
             ))}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {filterStatus === 'pendentes' && groupedPendingPackages.length > 0 ? (
            groupedPendingPackages.map((blockGroup) => {
              const styles = getBlockColorStyles(blockGroup.blockName);
              return (
                <div key={blockGroup.blockName} className="animate-in fade-in duration-300">
                  <div className="flex items-center gap-3 mb-3 ml-1">
                     <div className={`p-1.5 rounded ${styles.bg} ${styles.text}`}>
                        <Box size={16} />
                     </div>
                     <h3 className={`text-lg font-bold ${styles.text}`}>
                       BLOCO {blockGroup.blockName} 
                       <span className="text-sm font-normal text-slate-500 ml-2">({blockGroup.totalInBlock} encomendas)</span>
                     </h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                     {blockGroup.unitGroups.map((group) => (
                        <div 
                          key={`${group.block}-${group.unit}`}
                          onClick={() => handleGroupClick(group.unit, group.block)}
                          className={`bg-white rounded-xl p-4 shadow-sm border border-slate-100 border-l-4 ${styles.cardBorder} flex justify-between items-center cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all group gap-3`}
                        >
                          <div className="min-w-0">
                            <h3 className="text-base font-bold text-slate-900 truncate">
                              Unidade {group.unit}
                              {group.block !== 'OUTROS' && <span className="ml-1">- Bloco {group.block}</span>}
                            </h3>
                            <p className="text-slate-500 text-xs font-medium mt-0.5">
                              {group.count} {group.count === 1 ? 'pendente' : 'pendentes'}
                            </p>
                          </div>
                          <div className={`w-8 h-8 rounded-full ${styles.iconBg} ${styles.iconText} flex items-center justify-center ${styles.hoverIconBg} transition-colors shrink-0`}>
                            <ArrowRight size={16} />
                          </div>
                        </div>
                     ))}
                  </div>
                </div>
              );
            })
          ) : displayedPackages.length > 0 ? (
             <div className="space-y-4">
               {displayedPackages.map((pkg) => (
                <PackageCard 
                  key={pkg.id} 
                  data={pkg} 
                  onPickup={() => setPickupId(pkg.id)}
                  onDelete={() => setDeleteId(pkg.id)}
                />
              ))}
             </div>
          ) : (
            <div className="py-12 text-center text-slate-400 bg-white rounded-xl border border-slate-100 border-dashed">
              <p>Nenhuma encomenda encontrada.</p>
            </div>
          )}
        </div>
      )}

      <PackageModal 
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        onSubmit={handleCreate}
        residents={residents}
        companies={companies}
        onAddResident={handleAddResident} // Pass handler
      />

      {/* Render Resident Modal inside PackagesPage */}
      <ResidentModal
        isOpen={isResidentModalOpen}
        onClose={() => setIsResidentModalOpen(false)}
        onSubmit={handleResidentSubmit}
      />

      <PickupModal
        isOpen={!!pickupId}
        onClose={() => setPickupId(null)}
        onConfirm={handlePickupConfirm}
        packageData={packages.find(p => p.id === pickupId)}
        itemCount={1}
      />

      <PickupModal
        isOpen={isBulkPickupOpen}
        onClose={() => setIsBulkPickupOpen(false)}
        onConfirm={handlePickupConfirm}
        itemCount={displayedPackages.length}
      />

      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 transform transition-all scale-100">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-4">
                <AlertTriangle size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Excluir Encomenda</h3>
              <p className="text-slate-500 mb-6 text-sm">
                Tem certeza que deseja excluir esta encomenda?
              </p>
              <div className="flex items-center gap-3 w-full">
                <button onClick={() => setDeleteId(null)} className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 text-slate-700 font-medium hover:bg-slate-50">Cancelar</button>
                <button onClick={handleDeleteConfirm} className="flex-1 px-4 py-2.5 rounded-lg bg-red-500 hover:bg-red-600 text-white font-medium shadow-lg shadow-red-200">Excluir</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
