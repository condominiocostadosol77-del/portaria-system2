import React from 'react';
import { User, Edit2, Trash2, Clock } from 'lucide-react';
import { Employee } from '../types';

interface EmployeeCardProps {
  data: Employee;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export const EmployeeCard: React.FC<EmployeeCardProps> = ({ data, onEdit, onDelete }) => {
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 flex flex-col gap-4 hover:shadow-md transition-all duration-200">
      
      {/* Header: Avatar, Name, Status */}
      <div className="flex items-start gap-4">
        <div className="w-16 h-16 rounded-full bg-cyan-100 text-cyan-600 flex items-center justify-center shrink-0 text-xl font-bold overflow-hidden">
           {data.photoUrl ? (
             <img src={data.photoUrl} alt={data.name} className="w-full h-full object-cover" />
           ) : (
             <User size={32} />
           )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start gap-2">
            <h3 className="font-bold text-slate-900 text-lg truncate" title={data.name}>
              {data.name}
            </h3>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide shrink-0 ${
              data.status === 'ativo' 
                ? 'bg-green-100 text-green-700' 
                : data.status === 'ferias' 
                  ? 'bg-orange-100 text-orange-700'
                  : 'bg-red-100 text-red-700'
            }`}>
              {data.status}
            </span>
          </div>
          
          <p className="text-slate-600 font-medium text-sm">{data.role}</p>
          
          <div className="mt-2 flex flex-wrap gap-2 items-center">
             <span className="inline-flex items-center px-2.5 py-1 rounded text-xs font-bold bg-cyan-50 text-cyan-700 uppercase">
              Turno: {data.shift}
            </span>
          </div>
        </div>
      </div>

      {/* Work Hours Display - Moved outside header for full width/better alignment */}
      <div className="flex items-center justify-center gap-6 text-xs text-slate-500 bg-slate-50 p-3 rounded-lg border border-slate-100">
         <div className="flex items-center gap-2">
           <Clock size={14} className="text-slate-400" />
           <span className="uppercase text-[10px] font-bold text-slate-400">Entrada</span>
           <span className="font-bold text-slate-700 text-sm">{data.entryTime || '--:--'}</span>
         </div>
         <div className="w-px h-4 bg-slate-300"></div>
         <div className="flex items-center gap-2">
           <span className="uppercase text-[10px] font-bold text-slate-400">Saída</span>
           <span className="font-bold text-slate-700 text-sm">{data.exitTime || '--:--'}</span>
         </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-2 border-t border-slate-50">
        <button 
          onClick={() => onEdit(data.id)}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors"
        >
          <Edit2 size={14} />
          Editar
        </button>
        <button 
          onClick={() => onDelete(data.id)}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors shadow-sm"
        >
          <Trash2 size={14} />
          Excluir
        </button>
      </div>
    </div>
  );
};