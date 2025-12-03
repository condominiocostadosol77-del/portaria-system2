
import React from 'react';
import { CheckCircle2, Trash2, User, Clock, ArrowRight, Barcode, Tag, FileText } from 'lucide-react';
import { ReceivedItem } from '../types';

interface ReceivedItemCardProps {
  data: ReceivedItem;
  onPickup: (id: string) => void;
  onDelete: (id: string) => void;
}

export const ReceivedItemCard: React.FC<ReceivedItemCardProps> = ({ data, onPickup, onDelete }) => {
  const isPending = data.status === 'Aguardando Retirada';
  const isExternalToResident = data.operationType === 'externo_para_morador';

  // Determine From/To based on operation type
  const fromLabel = isExternalToResident ? 'De (Externo)' : 'De (Morador)';
  const fromValue = isExternalToResident ? data.leftBy : (data.recipientName || 'Morador');
  
  const toLabel = isExternalToResident ? 'Para (Morador)' : 'Para (Externo)';
  const toValue = isExternalToResident ? (data.recipientName || 'Morador') : data.leftBy;

  // STRATEGY: Extract internal code from observations if present
  const internalCodeMatch = data.observations?.match(/Cód: (\d+)/);
  // Fallback to data.receivedCode if available (though likely undefined from DB)
  const displayCode = internalCodeMatch ? internalCodeMatch[1] : data.receivedCode;
  
  // Clean observations for display
  const cleanObservations = data.observations?.replace(/\|? ?Cód: \d+/, '').trim();

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 mb-4 transition-all hover:shadow-md relative overflow-hidden">
      
      {/* Visual Indicator for ID if present */}
      {displayCode && (
        <div className="absolute top-0 right-0 bg-teal-600 text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg shadow-sm z-10 print:hidden">
          ID #{displayCode}
        </div>
      )}

      {/* Header Row */}
      <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-8">
        <div className="flex items-start gap-5">
          {/* Big Icon */}
          <div className="w-16 h-16 rounded-2xl bg-blue-100 flex items-center justify-center shrink-0 text-blue-600">
            <ArrowRight size={32} />
          </div>
          
          <div>
            <h3 className="text-2xl font-bold text-slate-800 leading-tight mb-2">
              {data.description}
            </h3>
            <div className="flex flex-wrap gap-2 mb-2">
              <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide border border-slate-200 bg-slate-50 text-slate-500">
                {isExternalToResident ? 'Morador → Externo' : 'Externo → Morador'}
              </span>
              
              {displayCode && (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-teal-50 border border-teal-200 rounded-full">
                  <Tag size={12} className="text-teal-600" />
                  <span className="text-xs font-bold text-teal-800">CÓD: #{displayCode}</span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Status Badge */}
        {isPending ? (
           <span className="bg-orange-100 text-orange-700 px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 border border-orange-200">
             <Clock size={14} /> Aguardando Retirada
           </span>
        ) : (
           <span className="bg-green-100 text-green-700 px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 border border-green-200">
             <CheckCircle2 size={14} /> Retirada
           </span>
        )}
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12 mb-6 px-1">
        <div>
          <span className="text-slate-400 text-xs font-bold uppercase block mb-1">
            {fromLabel}:
          </span>
          <span className="text-slate-800 font-semibold text-base block">
            {fromValue}
          </span>
        </div>
        
        <div>
          <span className="text-slate-400 text-xs font-bold uppercase block mb-1">
            {toLabel}:
          </span>
          <span className="text-slate-800 font-semibold text-base block">
            {toValue}
          </span>
        </div>

        <div>
          <span className="text-slate-400 text-xs font-bold uppercase block mb-1">
            Recebido em:
          </span>
          <span className="text-slate-600 text-sm block">
            {data.receivedAt}
          </span>
        </div>

        <div>
           <span className="text-slate-400 text-xs font-bold uppercase block mb-1">
            Turno:
          </span>
          <span className="text-slate-600 text-sm block capitalize">
            {data.shift}
          </span>
        </div>
        
        {/* If Picked Up, show details */}
        {!isPending && (
          <div className="col-span-full pt-4 border-t border-slate-100 mt-2">
             <div className="flex flex-wrap gap-8">
                <div>
                   <span className="text-slate-400 text-xs font-bold uppercase block mb-1">Retirado Por:</span>
                   <span className="text-slate-800 font-medium text-sm flex items-center gap-1">
                      <User size={14} /> {data.pickedUpBy}
                   </span>
                </div>
                <div>
                   <span className="text-slate-400 text-xs font-bold uppercase block mb-1">Data Retirada:</span>
                   <span className="text-slate-600 font-medium text-sm">
                      {data.pickedUpAt}
                   </span>
                </div>
             </div>
          </div>
        )}
      </div>

      {/* Observations Display */}
      {cleanObservations && (
        <div className="mb-6 bg-yellow-50 p-3 rounded-lg border border-yellow-100 text-sm">
          <div className="flex items-start gap-2">
            <FileText size={16} className="text-yellow-600 mt-0.5" />
            <div>
              <span className="font-bold text-yellow-800 block text-xs uppercase mb-1">Observações:</span>
              <p className="text-slate-700 italic">{cleanObservations}</p>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        {isPending && (
          <button 
            onClick={() => onPickup(data.id)}
            className="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors shadow-sm"
          >
            <CheckCircle2 size={18} />
            Registrar Retirada
          </button>
        )}
        <button 
          onClick={() => onDelete(data.id)}
          className="bg-red-500 hover:bg-red-600 text-white px-5 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors shadow-sm"
        >
          <Trash2 size={18} />
          Excluir
        </button>
      </div>
    </div>
  );
};
