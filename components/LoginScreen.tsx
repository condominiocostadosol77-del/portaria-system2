import React, { useState } from 'react';
import { Building2, Lock, User, ShieldAlert } from 'lucide-react';
import { Employee } from '../types';

interface LoginScreenProps {
  employees: Employee[];
  onLogin: (employeeName: string) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ employees, onLogin }) => {
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const isFirstAccess = employees.length === 0;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== 'cond@30') {
      setError('Senha incorreta.');
      return;
    }

    if (isFirstAccess) {
      onLogin('Administrador');
      return;
    }

    if (!selectedEmployeeId) {
      setError('Selecione um funcionário.');
      return;
    }

    const employee = employees.find(emp => emp.id === selectedEmployeeId);
    if (employee) {
      onLogin(employee.name);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 animate-in fade-in zoom-in duration-300">
        
        <div className="flex flex-col items-center text-center mb-8">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 shadow-lg ${isFirstAccess ? 'bg-purple-600 shadow-purple-500/30' : 'bg-blue-600 shadow-blue-500/30'}`}>
            {isFirstAccess ? (
              <ShieldAlert size={32} className="text-white" />
            ) : (
              <Building2 size={32} className="text-white" />
            )}
          </div>
          <h1 className="text-2xl font-bold text-slate-800">
            {isFirstAccess ? 'Configuração Inicial' : 'Portaria Inteligente'}
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            {isFirstAccess ? 'Nenhum funcionário detectado. Entre como Admin.' : 'Identifique-se para iniciar o turno'}
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          
          {!isFirstAccess && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase ml-1">Quem está assumindo o posto?</label>
              <div className="relative">
                <select
                  value={selectedEmployeeId}
                  onChange={(e) => setSelectedEmployeeId(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-slate-50 appearance-none text-slate-700 font-medium transition-all"
                >
                  <option value="">Selecione seu nome</option>
                  {employees.filter(e => e.status === 'ativo').map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.name}</option>
                  ))}
                </select>
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <User size={18} />
                </div>
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase ml-1">Senha de Acesso</label>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Digite a senha padrão"
                className={`w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 outline-none bg-slate-50 text-slate-700 font-medium transition-all placeholder:text-slate-400 ${
                  isFirstAccess ? 'focus:ring-purple-500 focus:border-purple-500' : 'focus:ring-blue-500 focus:border-blue-500'
                }`}
              />
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                <Lock size={18} />
              </div>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg font-medium text-center border border-red-100">
              {error}
            </div>
          )}

          <button
            type="submit"
            className={`w-full text-white py-3.5 rounded-xl font-bold shadow-lg transition-all active:scale-[0.98] mt-2 ${
              isFirstAccess ? 'bg-purple-600 hover:bg-purple-700 shadow-purple-200' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200'
            }`}
          >
            {isFirstAccess ? 'Entrar como Administrador' : 'Iniciar Plantão'}
          </button>
        </form>

        <p className="text-center text-xs text-slate-400 mt-8">
          Sistema de Gestão de Portaria v1.0
        </p>
      </div>
    </div>
  );
};