import React from 'react';
import { ArrowRightLeft, Trash2 } from 'lucide-react';
import { Occurrence } from '../types';

interface OccurrenceCardProps {
  data: Occurrence;
  onViewDetails: (data: Occurrence) => void;
  onDelete: (id: string) => void;
}

export const OccurrenceCard: React.FC<OccurrenceCardProps> = ({ data, onViewDetails, onDelete }) => {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 flex items-start gap-4 hover:shadow-md transition-all">
      {/* Icon Area */}
      <div className="w-20 h-20 rounded-xl bg-orange-100 flex items-center justify-center shrink-0">
         <ArrowRightLeft size={32} className="text-orange-600" />
      </div>

      {/* Content Area */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-500 mb-1">{data.timestamp}</p>
        
        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-3">
          <span className="font-bold text-slate-800 text-sm">{data.outgoingEmployeeName}</span>
          <ArrowRightLeft size={14} className="text-slate-400 hidden sm:block" />
          <span className="text-xs text-slate-400 sm:hidden">para</span>
          <span className="font-bold text-slate-800 text-sm">{data.incomingEmployeeName}</span>
        </div>

        {/* Description Box */}
        <div className="bg-slate-50 rounded-lg p-3 border border-slate-100 mb-4">
          <p className="text-sm text-slate-600 line-clamp-2">{data.description}</p>
          <button 
            onClick={() => onViewDetails(data)}
            className="text-primary text-xs font-medium mt-1 hover:underline"
          >
            Clique para ver completo
          </button>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => onViewDetails(data)}
            className="px-4 py-1.5 rounded-lg border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors"
          >
            Ver Detalhes
          </button>
          <button 
            onClick={() => onDelete(data.id)}
            className="px-4 py-1.5 rounded-lg bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors flex items-center gap-2"
          >
             <Trash2 size={14} />
             Excluir
          </button>
        </div>
      </div>
    </div>
  );
};