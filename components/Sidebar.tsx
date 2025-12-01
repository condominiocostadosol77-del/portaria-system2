import React from 'react';
import { LogOut, Building, User, X } from 'lucide-react';
import { MenuItem, UserProfile } from '../types';

interface SidebarProps {
  items: MenuItem[];
  user: UserProfile;
  activePage: string;
  onNavigate: (pageId: string) => void;
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  items, 
  user, 
  activePage, 
  onNavigate,
  isOpen,
  onClose,
  onLogout
}) => {
  return (
    <>
      {/* Backdrop Overlay (closes sidebar on click) */}
      {isOpen && (
        <div 
          onClick={onClose}
          className="fixed inset-0 bg-black/50 z-30 backdrop-blur-sm transition-opacity no-print"
        />
      )}

      {/* Sidebar Panel */}
      <aside 
        className={`fixed top-0 left-0 z-40 h-screen w-64 bg-white border-r border-gray-200 flex flex-col transition-transform duration-300 ease-in-out shadow-2xl ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } no-print`}
      >
        {/* Logo Area */}
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-primary">
              <Building size={32} />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-800 leading-tight">Portaria</h1>
              <p className="text-xs text-slate-500">Sistema de Gestão</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto">
          {items.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                onNavigate(item.id);
                onClose(); // Auto close on selection
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 ${
                activePage === item.id
                  ? 'bg-primary text-white shadow-md shadow-blue-200'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <item.icon size={20} strokeWidth={activePage === item.id ? 2.5 : 2} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Footer / User Profile */}
        <div className="p-4 border-t border-gray-100 bg-white">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center">
               <User size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-slate-500 font-medium uppercase">{user.role}</p>
              <p className="text-sm font-bold text-slate-800 truncate">{user.name}</p>
            </div>
          </div>
          
          <button 
            onClick={onLogout}
            className="w-full bg-red-500 hover:bg-red-600 text-white py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 text-sm font-medium transition-colors"
          >
            <LogOut size={16} />
            <span>Passar Plantão</span>
          </button>
        </div>
      </aside>
    </>
  );
};