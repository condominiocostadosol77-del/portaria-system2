import React from 'react';
import { Package, AlertCircle, Users, TrendingUp } from 'lucide-react';
import { PackageItem, Occurrence, Employee } from '../types';

interface DashboardProps {
  packages: PackageItem[];
  occurrences: Occurrence[];
  employees: Employee[];
}

export const Dashboard: React.FC<DashboardProps> = ({ packages, occurrences, employees }) => {
  // Calculate Stats
  const pendingPackages = packages.filter(p => p.status === 'Aguardando Retirada').length;
  const totalPackages = packages.length;

  const occurrencesToday = occurrences.length;
  // In a real app, you would filter occurrences by today's date here. 
  // For now, we assume the list represents current relevant occurrences.
  
  const activeEmployees = employees.filter(e => e.status === 'ativo').length;
  const totalEmployees = employees.length;

  // Dynamic Date
  const now = new Date();
  const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const currentDate = now.toLocaleDateString('pt-BR', options);

  return (
    <div className="animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Painel de Portaria</h1>
        <p className="text-slate-500 mt-1 capitalize">{currentDate}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Encomendas */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex justify-between items-start transition-transform hover:scale-[1.02] cursor-default">
           <div>
             <p className="text-slate-500 text-sm font-medium mb-2">Encomendas Pendentes</p>
             <h3 className="text-4xl font-bold text-slate-800 mb-4">{pendingPackages}</h3>
             <p className="text-slate-400 text-xs font-medium flex items-center gap-1">
               <TrendingUp size={14} className="text-slate-400" />
               {totalPackages} total
             </p>
           </div>
           <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-white shadow-lg shadow-purple-200">
             <Package size={24} />
           </div>
        </div>
        
        {/* Card 2: Ocorrências */}
         <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex justify-between items-start transition-transform hover:scale-[1.02] cursor-default">
           <div>
             <p className="text-slate-500 text-sm font-medium mb-2">Ocorrências Hoje</p>
             <h3 className="text-4xl font-bold text-slate-800 mb-4">{occurrencesToday}</h3>
             <p className="text-slate-400 text-xs font-medium flex items-center gap-1">
               <TrendingUp size={14} className="text-slate-400" />
               {occurrencesToday} total
             </p>
           </div>
           <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white shadow-lg shadow-orange-200">
             <AlertCircle size={24} />
           </div>
        </div>

        {/* Card 3: Funcionários */}
         <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex justify-between items-start transition-transform hover:scale-[1.02] cursor-default">
           <div>
             <p className="text-slate-500 text-sm font-medium mb-2">Funcionários Ativos</p>
             <h3 className="text-4xl font-bold text-slate-800 mb-4">{activeEmployees}</h3>
             <p className="text-slate-400 text-xs font-medium flex items-center gap-1">
               <TrendingUp size={14} className="text-slate-400" />
               {totalEmployees} cadastrados
             </p>
           </div>
           <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center text-white shadow-lg shadow-green-200">
             <Users size={24} />
           </div>
        </div>
      </div>
    </div>
  );
};