import React, { useState, useMemo } from 'react';
import { Plus, Search, Calendar, AlertTriangle, ArrowRight, ChevronLeft, Layers, Box } from 'lucide-react';
import { PackageItem, Resident, Company } from '../types';
import { PackageCard } from './PackageCard';
import { PackageModal } from './PackageModal';
import { PickupModal } from './PickupModal';

interface PackagesPageProps {
  residents: Resident[];
  packages: PackageItem[];
  setPackages: React.Dispatch<React.SetStateAction<PackageItem[]>>;
  companies: Company[];
}

export const PackagesPage: React.FC<PackagesPageProps> = ({ residents, packages, setPackages, companies }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'todos' | 'pendentes' | 'retiradas'>('pendentes');
  const [selectedGroup, setSelectedGroup] = useState<{unit: string, block: string} | null>(null);
  
  // Modals
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [pickupId, setPickupId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isBulkPickupOpen, setIsBulkPickupOpen] = useState(false);

  // Stats
  const stats = {
    total: packages.length,
    pending: packages.filter(p => p.status === 'Aguardando Retirada').length,
    pickedUp: packages.filter(p => p.status === 'Retirada').length
  };

  // Base filtering (Search + Tab)
  const filteredPackages = useMemo(() => {
    return packages.filter(pkg => {
      const matchesSearch = 
        pkg.recipientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pkg.unit.includes(searchTerm) ||
        pkg.block.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pkg.withdrawalCode.includes(searchTerm);
      
      if (filterStatus === 'pendentes') return matchesSearch && pkg.status === 'Aguardando Retirada';
      if (filterStatus === 'retiradas') return matchesSearch && pkg.status === 'Retirada';
      return matchesSearch;
    });
  }, [packages, searchTerm, filterStatus]);

  // Grouping Logic for "Pendentes" view - BY BLOCK then BY UNIT
  const groupedPendingPackages = useMemo(() => {
    if (filterStatus !== 'pendentes' || selectedGroup) return [];

    // 1. Group items by Block
    const blocks: Record<string, PackageItem[]> = {};
    
    filteredPackages.forEach(pkg => {
      // Normalize block name (handle empty/undefined)
      const blockName = pkg.block ? pkg.block.toUpperCase() : 'OUTROS';
      if (!blocks[blockName]) blocks[blockName] = [];
      blocks[blockName].push(pkg);
    });

    // 2. Process each block
    const processedBlocks = Object.entries(blocks).map(([blockName, blockItems]) => {
      
      // Group items by Unit within this block
      const units: Record<string, PackageItem[]> = {};
      blockItems.forEach(pkg => {
        if (!units[pkg.unit]) units[pkg.unit] = [];
        units[pkg.unit].push(pkg);
      });

      // Create Unit Groups and Sort them Numerically
      const unitGroups = Object.entries(units).map(([unitName, unitItems]) => ({
        unit: unitName,
        block: blockName, // Keep original block name for reference
        count: unitItems.length,
        items: unitItems
      })).sort((a, b) => {
        // Natural/Numeric sorting (e.g., 2 comes before 10)
        return a.unit.localeCompare(b.unit, undefined, { numeric: true, sensitivity: 'base' });
      });

      return {
        blockName,
        totalInBlock: blockItems.length,
        unitGroups
      };
    });

    // Sort Blocks Alphabetically
    return processedBlocks.sort((a, b) => a.blockName.localeCompare(b.blockName));

  }, [filteredPackages, filterStatus, selectedGroup]);

  // Items to display in the main list or detail view
  const displayedPackages = useMemo(() => {
    if (selectedGroup) {
      return filteredPackages.filter(p => 
        p.unit === selectedGroup.unit && 
        (p.block ? p.block.toUpperCase() : 'OUTROS') === selectedGroup.block
      );
    }
    return filteredPackages;
  }, [filteredPackages, selectedGroup]);

  // Actions
  const handleCreate = (data: Partial<PackageItem>) => {
    const newPackage = {
      ...data,
      id: Math.random().toString(36).substr(2, 9),
    } as PackageItem;
    setPackages([newPackage, ...packages]);
  };

  const handlePickupConfirm = (name: string) => {
    const now = new Date();
    const timestamp = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth()+1).toString().padStart(2, '0')}/${now.getFullYear().toString().slice(-2)} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    if (pickupId) {
      // Single Pickup
      setPackages(prev => prev.map(p => 
        p.id === pickupId 
          ? { ...p, status: 'Retirada', pickedUpBy: name, pickedUpAt: timestamp } 
          : p
      ));
      setPickupId(null);
    } else if (isBulkPickupOpen && selectedGroup) {
      // Bulk Pickup
      setPackages(prev => prev.map(p => 
        (p.unit === selectedGroup.unit && (p.block ? p.block.toUpperCase() : 'OUTROS') === selectedGroup.block && p.status === 'Aguardando Retirada')
          ? { ...p, status: 'Retirada', pickedUpBy: name, pickedUpAt: timestamp }
          : p
      ));
      setIsBulkPickupOpen(false);
      setSelectedGroup(null); // Return to list as items are no longer pending
    }
  };

  const handleDeleteConfirm = () => {
    if (deleteId) {
      setPackages(prev => prev.filter(p => p.id !== deleteId));
      setDeleteId(null);
    }
  };

  const handleGroupClick = (unit: string, block: string) => {
    setSelectedGroup({ unit, block });
  };

  const handleBackToList = () => {
    setSelectedGroup(null);
  };

  return (
    <div className="animate-in fade-in duration-300">
      {/* Header */}
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

      {/* Filters Section */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 mb-6 space-y-4">
        
        {/* Row 1: Search Bar (Full Width) */}
        <div className="w-full relative">
           <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              <Search size={20} />
            </div>
            <input 
              type="text" 
              placeholder="Buscar por morador, unidade ou código..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary/20 transition-all text-base placeholder:text-slate-400"
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
               onClick={() => { setFilterStatus('todos'); setSelectedGroup(null); }}
               className={`flex-1 md:flex-none whitespace-nowrap px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                 filterStatus === 'todos' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
               }`}
             >
               Todos <span className="ml-1 px-1.5 py-0.5 bg-slate-200 text-slate-600 rounded-full text-xs">{stats.total}</span>
             </button>
             <button
               onClick={() => { setFilterStatus('pendentes'); setSelectedGroup(null); }}
               className={`flex-1 md:flex-none whitespace-nowrap px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                 filterStatus === 'pendentes' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
               }`}
             >
               Pendentes <span className="ml-1 px-1.5 py-0.5 bg-orange-100 text-orange-600 rounded-full text-xs">{stats.pending}</span>
             </button>
             <button
               onClick={() => { setFilterStatus('retiradas'); setSelectedGroup(null); }}
               className={`flex-1 md:flex-none whitespace-nowrap px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                 filterStatus === 'retiradas' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
               }`}
             >
               Retiradas <span className="ml-1 px-1.5 py-0.5 bg-green-100 text-green-600 rounded-full text-xs">{stats.pickedUp}</span>
             </button>
           </div>
        </div>
      </div>

      {/* Content Area */}
      {selectedGroup ? (
        // Detailed Group View
        <div className="animate-in slide-in-from-right-4 duration-300">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
             <div className="flex items-center gap-4">
               <button 
                 onClick={handleBackToList}
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
        // Standard View (List or Groups)
        <div className="space-y-6">
          {filterStatus === 'pendentes' && groupedPendingPackages.length > 0 ? (
            // Grouped View By Block
            groupedPendingPackages.map((blockGroup) => (
              <div key={blockGroup.blockName} className="animate-in fade-in duration-300">
                
                {/* Block Header */}
                <div className="flex items-center gap-3 mb-3 ml-1">
                   <div className="p-1.5 bg-slate-200 rounded text-slate-600">
                      <Box size={16} />
                   </div>
                   <h3 className="text-lg font-bold text-slate-700">
                     BLOCO {blockGroup.blockName} 
                     <span className="text-sm font-normal text-slate-500 ml-2">
                       ({blockGroup.totalInBlock} encomendas)
                     </span>
                   </h3>
                </div>
                
                {/* Unit Grid for this Block */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                   {blockGroup.unitGroups.map((group) => (
                      <div 
                        key={`${group.block}-${group.unit}`}
                        onClick={() => handleGroupClick(group.unit, group.block)}
                        className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 border-l-4 border-l-orange-500 flex justify-between items-center cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all group"
                      >
                        <div>
                          <h3 className="text-lg font-bold text-slate-900">
                            Unidade {group.unit}
                            {group.block !== 'OUTROS' && <span className="ml-1">- Bloco {group.block}</span>}
                          </h3>
                          <p className="text-slate-500 text-sm font-medium">
                            {group.count} {group.count === 1 ? 'pendente' : 'pendentes'}
                          </p>
                        </div>
                        <div className="w-9 h-9 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center group-hover:bg-orange-100 transition-colors">
                          <ArrowRight size={18} />
                        </div>
                      </div>
                   ))}
                </div>
              </div>
            ))
          ) : displayedPackages.length > 0 ? (
             // Standard List View (Todos/Retiradas)
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
            // Empty State
            <div className="py-12 text-center text-slate-400 bg-white rounded-xl border border-slate-100 border-dashed">
              <p>Nenhuma encomenda encontrada.</p>
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      <PackageModal 
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        onSubmit={handleCreate}
        residents={residents}
        companies={companies}
      />

      {/* Single Pickup Modal */}
      <PickupModal
        isOpen={!!pickupId}
        onClose={() => setPickupId(null)}
        onConfirm={handlePickupConfirm}
        packageData={packages.find(p => p.id === pickupId)}
        itemCount={1}
      />

      {/* Bulk Pickup Modal */}
      <PickupModal
        isOpen={isBulkPickupOpen}
        onClose={() => setIsBulkPickupOpen(false)}
        onConfirm={handlePickupConfirm}
        itemCount={displayedPackages.length}
      />

      {/* Delete Confirmation */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 transform transition-all scale-100">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-4">
                <AlertTriangle size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Excluir Encomenda</h3>
              <p className="text-slate-500 mb-6 text-sm">
                Tem certeza que deseja excluir esta encomenda? Esta ação não pode ser desfeita.
              </p>
              <div className="flex items-center gap-3 w-full">
                <button 
                  onClick={() => setDeleteId(null)}
                  className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 text-slate-700 font-medium hover:bg-slate-50 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleDeleteConfirm}
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