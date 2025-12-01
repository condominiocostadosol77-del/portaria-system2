import React from 'react';
import { Building2, Edit2, Trash2 } from 'lucide-react';
import { Company } from '../types';

interface CompanyCardProps {
  data: Company;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export const CompanyCard: React.FC<CompanyCardProps> = ({ data, onEdit, onDelete }) => {
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 flex flex-col gap-4 hover:shadow-md transition-all duration-200">
      
      {/* Header: Avatar, Name, Status */}
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
          <Building2 size={24} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start gap-2">
            <h3 className="font-bold text-slate-800 truncate uppercase" title={data.name}>
              {data.name}
            </h3>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide shrink-0 ${
              data.status === 'ativa' 
                ? 'bg-green-100 text-green-700' 
                : 'bg-red-100 text-red-700'
            }`}>
              {data.status}
            </span>
          </div>
          
          <div className="mt-1">
             <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-600 border border-blue-100">
              {data.type}
            </span>
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
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors"
        >
          <Trash2 size={14} />
          Excluir
        </button>
      </div>
    </div>
  );
};