import React from 'react';
import { Truck, Clock, Package, Trash2, Building2, Edit2 } from 'lucide-react';
import { DeliveryVisit } from '../types';

interface DeliveryVisitCardProps {
  data: DeliveryVisit;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export const DeliveryVisitCard: React.FC<DeliveryVisitCardProps> = ({ data, onEdit, onDelete }) => {
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 flex flex-col gap-4 hover:shadow-md transition-all duration-200">
      
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
          <Truck size={28} />
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-slate-900 text-lg truncate uppercase leading-tight" title={data.driverName}>
            {data.driverName}
          </h3>
          <div className="flex items-center gap-1.5 mt-1 text-sm text-slate-600">
            <Building2 size={14} className="text-slate-400" />
            <span className="font-medium uppercase">{data.companyName}</span>
          </div>
        </div>
      </div>

      {/* Info Grid */}
      <div className="bg-slate-50 rounded-lg p-3 border border-slate-100 grid grid-cols-2 gap-3 text-sm">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] uppercase font-bold text-slate-400">Entrada</span>
          <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
            <Clock size={14} className="text-blue-500" />
            {data.entryTime}
          </div>
        </div>
        
        <div className="flex flex-col gap-1">
          <span className="text-[10px] uppercase font-bold text-slate-400">Encomendas</span>
          <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
            <Package size={14} className="text-orange-500" />
            {data.packageCount}
          </div>
        </div>
      </div>

      {data.observations && (
        <p className="text-xs text-slate-500 italic px-1 line-clamp-2">
          "{data.observations}"
        </p>
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-2 border-t border-slate-50 mt-auto">
        <button 
          onClick={() => onEdit(data.id)}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors"
        >
          <Edit2 size={14} />
          Editar
        </button>
        <button 
          onClick={() => onDelete(data.id)}
          className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-red-50 text-red-600 text-sm font-medium hover:bg-red-100 transition-colors"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
};