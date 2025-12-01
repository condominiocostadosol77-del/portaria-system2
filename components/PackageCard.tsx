import React from 'react';
import { Package, Truck, Barcode, CheckCircle2, Trash2, User, Clock } from 'lucide-react';
import { PackageItem } from '../types';

interface PackageCardProps {
  data: PackageItem;
  onPickup: (id: string) => void;
  onDelete: (id: string) => void;
}

export const PackageCard: React.FC<PackageCardProps> = ({ data, onPickup, onDelete }) => {
  const isPending = data.status === 'Aguardando Retirada';

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 mb-4 transition-all hover:shadow-md">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-xl bg-purple-50 text-secondary flex items-center justify-center shrink-0">
            <Package size={32} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              Unidade {data.unit} - Bloco {data.block}
            </h3>
            <div className="flex items-center gap-2 mt-1 text-slate-600">
              <User size={14} className="text-slate-400" />
              <span className="text-sm font-medium">Destinatário: <span className="uppercase">{data.recipientName}</span></span>
            </div>
          </div>
        </div>
        
        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${
          isPending 
            ? 'bg-orange-50 text-orange-600 border-orange-200'
            : 'bg-green-50 text-green-600 border-green-200'
        }`}>
          {isPending ? '🕒 Aguardando Retirada' : '✓ Retirada'}
        </span>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-4 bg-slate-50 rounded-lg border border-slate-100 mb-6">
        <div>
          <span className="text-xs font-semibold text-slate-400 uppercase block mb-1">Tipo</span>
          <span className="text-sm font-medium text-slate-700">{data.type}</span>
        </div>
        <div>
          <span className="text-xs font-semibold text-slate-400 uppercase block mb-1 flex items-center gap-1">
            <Truck size={12} /> Remetente
          </span>
          <span className="text-sm font-medium text-slate-700">{data.sender || '-'}</span>
        </div>
        <div>
          <span className="text-xs font-semibold text-slate-400 uppercase block mb-1 flex items-center gap-1">
            <Barcode size={12} /> Rastreio
          </span>
          <span className="text-sm font-medium text-slate-700">{data.trackingCode || '-'}</span>
        </div>
        <div>
          {isPending ? (
            <>
              <span className="text-xs font-semibold text-slate-400 uppercase block mb-1">Cód. Retirada</span>
              <span className="text-sm font-bold text-blue-600">{data.withdrawalCode}</span>
            </>
          ) : (
            <>
               <span className="text-xs font-semibold text-slate-400 uppercase block mb-1 flex items-center gap-1">
                 <User size={12} /> Retirado Por
               </span>
               <span className="text-sm font-medium text-slate-700">{data.pickedUpBy}</span>
            </>
          )}
        </div>
        <div>
          <span className="text-xs font-semibold text-slate-400 uppercase block mb-1">Recebido em</span>
          <span className="text-sm font-medium text-slate-700">{data.receivedAt}</span>
        </div>
        {!isPending && (
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase block mb-1 flex items-center gap-1">
              <Clock size={12} /> Retirado em
            </span>
            <span className="text-sm font-medium text-slate-700">{data.pickedUpAt}</span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        {isPending && (
          <button 
            onClick={() => onPickup(data.id)}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors shadow-sm"
          >
            <CheckCircle2 size={16} />
            Registrar Retirada
          </button>
        )}
        <button 
          onClick={() => onDelete(data.id)}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors shadow-sm"
        >
          <Trash2 size={16} />
          Excluir
        </button>
      </div>
    </div>
  );
};