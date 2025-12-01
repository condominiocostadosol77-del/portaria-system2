import React from 'react';
import { User, LogOut, Trash2, Clock, MapPin, Phone, FileText } from 'lucide-react';
import { Visitor } from '../types';

interface VisitorCardProps {
  data: Visitor;
  onExit: (id: string) => void;
  onDelete: (id: string) => void;
}

export const VisitorCard: React.FC<VisitorCardProps> = ({ data, onExit, onDelete }) => {
  const isInside = data.status === 'no_condominio';

  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 flex flex-col gap-4 hover:shadow-md transition-all duration-200">
      
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className={`w-14 h-14 rounded-full flex items-center justify-center shrink-0 ${
          isInside ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-500'
        }`}>
          <User size={28} />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start gap-2">
            <h3 className="font-bold text-slate-900 text-lg truncate leading-tight">
              {data.name}
            </h3>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide shrink-0 border ${
              isInside 
                ? 'bg-green-50 text-green-700 border-green-200' 
                : 'bg-slate-100 text-slate-500 border-slate-200'
            }`}>
              {isInside ? 'No Condomínio' : 'Saiu'}
            </span>
          </div>
          
          {data.document && (
            <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
              <FileText size={12} />
              <span>{data.document}</span>
            </div>
          )}
        </div>
      </div>

      {/* Info Grid */}
      <div className="bg-slate-50 rounded-lg p-3 border border-slate-100 grid grid-cols-1 gap-2 text-sm">
        <div className="flex items-center gap-2 text-slate-700">
          <MapPin size={14} className="text-slate-400" />
          <span className="font-medium">Unidade {data.unit} - Bloco {data.block}</span>
        </div>
        
        {data.residentName && (
          <div className="flex items-center gap-2 text-slate-600 pl-6 text-xs">
             <span>Visitando: <span className="font-semibold uppercase">{data.residentName}</span></span>
          </div>
        )}

        {data.phone && (
          <div className="flex items-center gap-2 text-slate-600">
            <Phone size={14} className="text-slate-400" />
            <span>{data.phone}</span>
          </div>
        )}

        <div className="flex items-center gap-2 text-slate-600 mt-1 pt-2 border-t border-slate-200">
          <Clock size={14} className="text-slate-400" />
          <span className="text-xs">Entrada: <span className="font-semibold">{data.entryTime}</span></span>
        </div>
        
        {!isInside && data.exitTime && (
          <div className="flex items-center gap-2 text-slate-600 pl-6">
            <span className="text-xs">Saída: <span className="font-semibold">{data.exitTime}</span></span>
          </div>
        )}
      </div>

      {data.observations && (
        <p className="text-xs text-slate-500 italic px-1 line-clamp-2">
          "{data.observations}"
        </p>
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-2 border-t border-slate-50 mt-auto">
        {isInside && (
          <button 
            onClick={() => onExit(data.id)}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-slate-800 text-white text-sm font-medium hover:bg-slate-900 transition-colors shadow-sm"
          >
            <LogOut size={14} />
            Registrar Saída
          </button>
        )}
        <button 
          onClick={() => onDelete(data.id)}
          className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-red-100 text-red-600 text-sm font-medium hover:bg-red-50 transition-colors ${!isInside ? 'flex-1' : ''}`}
        >
          <Trash2 size={14} />
          {isInside ? '' : 'Excluir'}
        </button>
      </div>
    </div>
  );
};