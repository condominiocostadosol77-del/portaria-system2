import React from 'react';
import { User, Building2, Phone, Edit2, Trash2 } from 'lucide-react';
import { DeliveryDriver } from '../types';

interface DeliveryDriverCardProps {
  data: DeliveryDriver;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export const DeliveryDriverCard: React.FC<DeliveryDriverCardProps> = ({ data, onEdit, onDelete }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ativo': return 'bg-green-100 text-green-700';
      case 'inativo': return 'bg-gray-100 text-gray-700';
      case 'bloqueado': return 'bg-red-100 text-red-700';
      default: return 'bg-blue-100 text-blue-700';
    }
  };

  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 flex flex-col gap-4 hover:shadow-md transition-all duration-200">
      
      {/* Header: Avatar, Name, Status */}
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
          <User size={28} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start gap-2">
            <h3 className="font-bold text-slate-800 text-lg truncate uppercase" title={data.name}>
              {data.name}
            </h3>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide shrink-0 ${getStatusColor(data.status)}`}>
              {data.status}
            </span>
          </div>
          
          <div className="mt-1 flex flex-col gap-1 text-sm text-slate-600">
            <div className="flex items-center gap-1.5">
               <span className="text-slate-400">Empresa:</span>
               <span className="font-medium uppercase">{data.companyName}</span>
            </div>
            <div className="flex items-center gap-1.5">
               <Phone size={14} className="text-slate-400" />
               <span>{data.phone}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 mt-2 pt-4 border-t border-slate-50">
        <button 
          onClick={() => onEdit(data.id)}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors"
        >
          <Edit2 size={14} />
          Editar
        </button>
        <button 
          onClick={() => onDelete(data.id)}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors shadow-sm"
        >
          <Trash2 size={14} />
          Excluir
        </button>
      </div>
    </div>
  );
};