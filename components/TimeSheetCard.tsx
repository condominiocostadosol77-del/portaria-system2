import React from 'react';
import { Clock, Calendar, Trash2, Edit2 } from 'lucide-react';
import { TimeRecord } from '../types';

interface TimeSheetCardProps {
  data: TimeRecord;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export const TimeSheetCard: React.FC<TimeSheetCardProps> = ({ data, onEdit, onDelete }) => {
  // Parse date manually to avoid timezone issues with new Date("YYYY-MM-DD")
  const [year, month, day] = data.date.split('-');
  const dateObj = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  
  const getStatusColor = (type: string) => {
    switch (type) {
      case 'extra': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'falta': return 'bg-red-100 text-red-700 border-red-200';
      case 'folga': return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'atestado': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'ferias': return 'bg-teal-100 text-teal-700 border-teal-200';
      default: return 'bg-blue-100 text-blue-700 border-blue-200';
    }
  };

  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 mb-4 hover:shadow-md transition-all break-inside-avoid">
      <div className="flex flex-col md:flex-row gap-6 items-start">
        
        {/* Date Box */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-center min-w-[80px]">
          <span className="block text-2xl font-bold text-slate-800">
            {day}
          </span>
          <span className="block text-xs uppercase font-semibold text-slate-500">
            {dateObj.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '')}
          </span>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="text-lg font-bold text-slate-900">{data.employeeName}</h3>
              <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-600 mt-1">
                {data.shift}
              </span>
            </div>
            
            <span className={`px-3 py-1 rounded-full text-xs font-bold border uppercase ${getStatusColor(data.type)}`}>
              {data.type}
            </span>
          </div>

          <div className="flex items-center gap-6 mt-3 text-sm text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100 w-fit">
            <div className="flex items-center gap-2">
              <Clock size={14} className="text-green-600" />
              <span>Entrada: <strong>{data.entryTime || '--:--'}</strong></span>
            </div>
            <div className="w-px h-3 bg-slate-300"></div>
            <div className="flex items-center gap-2">
              <Clock size={14} className="text-red-500" />
              <span>Saída: <strong>{data.exitTime || '--:--'}</strong></span>
            </div>
          </div>
          
          {data.observations && (
            <p className="text-xs text-slate-500 italic mt-2 px-1">
              "{data.observations}"
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 self-end md:self-center no-print">
          <button 
            onClick={() => onEdit(data.id)}
            className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors"
            title="Editar"
          >
            <Edit2 size={18} />
          </button>
          <button 
            onClick={() => onDelete(data.id)}
            className="p-2 rounded-lg hover:bg-red-50 text-red-400 hover:text-red-600 transition-colors"
            title="Excluir"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};