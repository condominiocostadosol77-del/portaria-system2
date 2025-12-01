import React, { useState } from 'react';
import { Plus, Menu } from 'lucide-react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { ResidentsPage } from './components/ResidentsPage';
import { PackagesPage } from './components/PackagesPage';
import { CompaniesPage } from './components/CompaniesPage';
import { EmployeesPage } from './components/EmployeesPage';
import { OccurrencesPage } from './components/OccurrencesPage';
import { ReceivedItemsPage } from './components/ReceivedItemsPage';
import { MaterialsPage } from './components/MaterialsPage';
import { VisitorsPage } from './components/VisitorsPage';
import { TimeSheetPage } from './components/TimeSheetPage';
import { DeliveryDriversPage } from './components/DeliveryDriversPage';
import { DeliveryVisitsPage } from './components/DeliveryVisitsPage';
import { FloatingNotepad } from './components/FloatingNotepad';
import { LoginScreen } from './components/LoginScreen';
import { ConfirmLogoutModal } from './components/ConfirmLogoutModal';
import { MENU_ITEMS, CURRENT_USER, MOCK_RESIDENTS, MOCK_PACKAGES, MOCK_COMPANIES, MOCK_EMPLOYEES, MOCK_OCCURRENCES, MOCK_RECEIVED_ITEMS, MOCK_BORROWED_MATERIALS, MOCK_VISITORS, MOCK_TIME_RECORDS, MOCK_DELIVERY_DRIVERS, MOCK_DELIVERY_VISITS } from './constants';
import { Resident, PackageItem, Company, Employee, Occurrence, ReceivedItem, BorrowedMaterial, Visitor, TimeRecord, DeliveryDriver, DeliveryVisit, UserProfile } from './types';

const App: React.FC = () => {
  // Auth State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserProfile>(CURRENT_USER);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  // App State
  const [activePage, setActivePage] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Centralized Data State
  const [residents, setResidents] = useState<Resident[]>(MOCK_RESIDENTS);
  const [packages, setPackages] = useState<PackageItem[]>(MOCK_PACKAGES);
  const [companies, setCompanies] = useState<Company[]>(MOCK_COMPANIES);
  const [employees, setEmployees] = useState<Employee[]>(MOCK_EMPLOYEES);
  const [occurrences, setOccurrences] = useState<Occurrence[]>(MOCK_OCCURRENCES);
  const [receivedItems, setReceivedItems] = useState<ReceivedItem[]>(MOCK_RECEIVED_ITEMS);
  const [materials, setMaterials] = useState<BorrowedMaterial[]>(MOCK_BORROWED_MATERIALS);
  const [visitors, setVisitors] = useState<Visitor[]>(MOCK_VISITORS);
  const [timeRecords, setTimeRecords] = useState<TimeRecord[]>(MOCK_TIME_RECORDS);
  const [deliveryDrivers, setDeliveryDrivers] = useState<DeliveryDriver[]>(MOCK_DELIVERY_DRIVERS);
  const [deliveryVisits, setDeliveryVisits] = useState<DeliveryVisit[]>(MOCK_DELIVERY_VISITS);

  // Global Notepad State
  const [isNotepadOpen, setIsNotepadOpen] = useState(false);
  const [isNotepadMinimized, setIsNotepadMinimized] = useState(false);

  // Auth Handlers
  const handleLogin = (employeeName: string) => {
    setCurrentUser({
      name: employeeName,
      role: 'OPERADOR' // Assuming everyone logging in is an Operator for now
    });
    setIsAuthenticated(true);
  };

  const handleLogoutRequest = () => {
    setIsLogoutModalOpen(true);
  };

  const confirmLogout = () => {
    setIsAuthenticated(false);
    setIsLogoutModalOpen(false);
    setIsSidebarOpen(false);
    setActivePage('dashboard');
  };

  // Handle saving occurrence from global notepad
  const handleNotepadSave = (data: Omit<Occurrence, 'id' | 'timestamp'>) => {
    const now = new Date();
    const months = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
    const timestamp = `${now.getDate()} de ${months[now.getMonth()]} de ${now.getFullYear()} às ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    const newOccurrence: Occurrence = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp,
      ...data
    };

    setOccurrences(prev => [newOccurrence, ...prev]);
    setActivePage('ocorrencias');
  };

  // If not authenticated, show login screen
  if (!isAuthenticated) {
    return (
      <LoginScreen 
        employees={employees} 
        onLogin={handleLogin} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-bg-app font-sans text-slate-800">
      
      {/* Menu Toggle Button - Always visible when sidebar is closed */}
      {!isSidebarOpen && (
        <button 
          onClick={() => setIsSidebarOpen(true)}
          className="fixed top-4 left-4 z-20 p-2 bg-white rounded-lg shadow-md border border-gray-200 text-slate-600 hover:text-primary hover:border-primary transition-all no-print"
          title="Abrir Menu"
        >
          <Menu size={24} />
        </button>
      )}

      <Sidebar 
        items={MENU_ITEMS} 
        user={currentUser} 
        activePage={activePage}
        onNavigate={setActivePage}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onLogout={handleLogoutRequest}
      />

      {/* Main Content */}
      <main className="w-full px-4 pb-4 md:px-8 md:pb-8 pt-32 min-h-screen transition-all duration-300">
        {activePage === 'dashboard' ? (
          <Dashboard 
            packages={packages}
            occurrences={occurrences}
            employees={employees}
          />
        ) : activePage === 'moradores' ? (
          <ResidentsPage 
            residents={residents}
            setResidents={setResidents}
          />
        ) : activePage === 'encomendas' ? (
          <PackagesPage 
            residents={residents}
            packages={packages}
            setPackages={setPackages}
            companies={companies}
          />
        ) : activePage === 'recebidos' ? (
          <ReceivedItemsPage 
            items={receivedItems}
            setItems={setReceivedItems}
            residents={residents}
          />
        ) : activePage === 'materiais' ? (
          <MaterialsPage 
            materials={materials}
            setMaterials={setMaterials}
            residents={residents}
          />
        ) : activePage === 'visitantes' ? (
          <VisitorsPage 
            visitors={visitors}
            setVisitors={setVisitors}
            residents={residents}
          />
        ) : activePage === 'ponto' ? (
          <TimeSheetPage 
            records={timeRecords}
            setRecords={setTimeRecords}
            employees={employees}
          />
        ) : activePage === 'empresas' ? (
          <CompaniesPage 
            companies={companies}
            setCompanies={setCompanies}
          />
        ) : activePage === 'entregadores' ? (
          <DeliveryDriversPage 
            drivers={deliveryDrivers}
            setDrivers={setDeliveryDrivers}
            companies={companies}
          />
        ) : activePage === 'visitas' ? (
          <DeliveryVisitsPage
            visits={deliveryVisits}
            setVisits={setDeliveryVisits}
            drivers={deliveryDrivers}
          />
        ) : activePage === 'funcionarios' ? (
          <EmployeesPage 
            employees={employees}
            setEmployees={setEmployees}
          />
        ) : activePage === 'ocorrencias' ? (
          <OccurrencesPage 
            occurrences={occurrences}
            setOccurrences={setOccurrences}
            employees={employees}
            onOpenNotepad={() => {
              setIsNotepadOpen(true);
              setIsNotepadMinimized(false);
            }}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-[50vh] text-slate-400 animate-in fade-in duration-300">
            <div className="w-16 h-16 mb-4 rounded-full bg-slate-100 flex items-center justify-center">
              <Plus size={24} />
            </div>
            <p className="text-lg font-medium">Página em construção</p>
            <p className="text-sm">Selecione uma opção no menu.</p>
          </div>
        )}
      </main>

      {/* Persistent Floating Notepad */}
      <FloatingNotepad 
        isOpen={isNotepadOpen}
        isMinimized={isNotepadMinimized}
        onClose={() => setIsNotepadOpen(false)}
        onMinimize={() => setIsNotepadMinimized(true)}
        onMaximize={() => setIsNotepadMinimized(false)}
        onSave={handleNotepadSave}
        employees={employees}
      />

      {/* Logout Confirmation Modal */}
      <ConfirmLogoutModal 
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={confirmLogout}
      />
    </div>
  );
};

export default App;