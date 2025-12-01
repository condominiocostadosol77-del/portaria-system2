import React from 'react';
import { Wrench, User, Calendar, CheckCircle2, Trash2, Clock, Phone, Building } from 'lucide-react';
import { BorrowedMaterial } from '../types';

interface MaterialCardProps {
  data: BorrowedMaterial;
  onReturn: (id: string) => void;
  onDelete: (id: string) => void;
}

export const MaterialCard: React.FC<MaterialCardProps> = ({ data, onReturn, onDelete }) => {
  const isBorrowed = data.status === 'Emprestado';

  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 mb-4 transition-all hover:shadow-md">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-5">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
            <Wrench size={28} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 leading-tight mb-1">
              {data.materialName}
            </h3>
            <div className="flex items-center gap-2 text-slate-500 text-sm">
               <User size={14} />
               <span>{data.borrowerName}</span>
               {data.borrowerType === 'morador' && (
                 <span className="bg-blue-50 text-blue-600 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                   Morador
                 </span>
               )}
            </div>
          </div>
        </div>

        {/* Status Badge */}
        <span className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${
          isBorrowed 
            ? 'bg-orange-50 text-orange-600 border-orange-200'
            : 'bg-green-50 text-green-600 border-green-200'
        }`}>
          {isBorrowed ? <Clock size={12} /> : <CheckCircle2 size={12} />}
          {isBorrowed ? 'Emprestado' : 'Devolvido'}
        </span>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-lg border border-slate-100 mb-5 text-sm">
        <div>
          <span className="text-slate-400 text-xs font-bold uppercase block mb-1">Retirado em</span>
          <span className="font-medium text-slate-700">{data.loanDate}</span>
        </div>
        
        {(data.unit || data.block) && (
           <div>
            <span className="text-slate-400 text-xs font-bold uppercase block mb-1 flex items-center gap-1">
              <Building size={12} /> Unidade
            </span>
            <span className="font-medium text-slate-700">
              {data.unit} {data.block && `- Bloco ${data.block}`}
            </span>
          </div>
        )}

        {(data.phone) && (
          <div>
            <span className="text-slate-400 text-xs font-bold uppercase block mb-1 flex items-center gap-1">
              <Phone size={12} /> Telefone
            </span>
            <span className="font-medium text-slate-700">{data.phone}</span>
          </div>
        )}

        {!isBorrowed && data.returnDate && (
          <div>
            <span className="text-slate-400 text-xs font-bold uppercase block mb-1">Devolvido em</span>
            <span className="font-medium text-slate-700">{data.returnDate}</span>
          </div>
        )}
      </div>
      
      {/* Observations if any */}
      {data.observations && (
        <p className="text-sm text-slate-600 italic mb-4 px-1">
          "{data.observations}"
        </p>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        {isBorrowed && (
          <button 
            onClick={() => onReturn(data.id)}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors shadow-sm"
          >
            <CheckCircle2 size={16} />
            Registrar Devolução
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