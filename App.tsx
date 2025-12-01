import React, { useState, useEffect } from 'react';
import { Plus, Menu, Loader2 } from 'lucide-react';
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
import { MENU_ITEMS, CURRENT_USER } from './constants';
import { Resident, PackageItem, Company, Employee, Occurrence, ReceivedItem, BorrowedMaterial, Visitor, TimeRecord, DeliveryDriver, DeliveryVisit, UserProfile } from './types';
import { supabase } from './lib/supabase';

const App: React.FC = () => {
  // Auth State - Initializing from localStorage to persist login
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    const savedUser = localStorage.getItem('portaria_user');
    return savedUser ? JSON.parse(savedUser) : CURRENT_USER;
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return !!localStorage.getItem('portaria_user');
  });

  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // App State
  const [activePage, setActivePage] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Centralized Data State
  const [residents, setResidents] = useState<Resident[]>([]);
  const [packages, setPackages] = useState<PackageItem[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [occurrences, setOccurrences] = useState<Occurrence[]>([]);
  const [receivedItems, setReceivedItems] = useState<ReceivedItem[]>([]);
  const [materials, setMaterials] = useState<BorrowedMaterial[]>([]);
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [timeRecords, setTimeRecords] = useState<TimeRecord[]>([]);
  const [deliveryDrivers, setDeliveryDrivers] = useState<DeliveryDriver[]>([]);
  const [deliveryVisits, setDeliveryVisits] = useState<DeliveryVisit[]>([]);

  // Global Notepad State
  const [isNotepadOpen, setIsNotepadOpen] = useState(false);
  const [isNotepadMinimized, setIsNotepadMinimized] = useState(false);

  // --- SUPABASE DATA FETCHING ---
  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Residents
      const { data: resData } = await supabase.from('residents').select('*');
      if (resData) setResidents(resData);

      // Packages
      const { data: pkgData } = await supabase.from('packages').select('*').order('created_at', { ascending: false });
      if (pkgData) {
        setPackages(pkgData.map(p => ({
          ...p,
          recipientName: p.recipient_name,
          trackingCode: p.tracking_code,
          withdrawalCode: p.withdrawal_code,
          receivedAt: p.received_at,
          pickedUpBy: p.picked_up_by,
          pickedUpAt: p.picked_up_at
        })));
      }

      // Companies
      const { data: compData } = await supabase.from('companies').select('*');
      if (compData) setCompanies(compData);

      // Employees
      const { data: empData } = await supabase.from('employees').select('*');
      if (empData) {
        setEmployees(empData.map(e => ({
          ...e,
          entryTime: e.entry_time,
          exitTime: e.exit_time,
          admissionDate: e.admission_date,
          photoUrl: e.photo_url
        })));
      }

      // Occurrences
      const { data: occData } = await supabase.from('occurrences').select('*').order('created_at', { ascending: false });
      if (occData) {
        setOccurrences(occData.map(o => ({
          ...o,
          outgoingEmployeeName: o.outgoing_employee_name,
          incomingEmployeeName: o.incoming_employee_name,
        })));
      }

      // Received Items
      const { data: riData } = await supabase.from('received_items').select('*').order('created_at', { ascending: false });
      if (riData) {
        setReceivedItems(riData.map(i => ({
          ...i,
          operationType: i.operation_type,
          recipientName: i.recipient_name,
          residentId: i.resident_id,
          leftBy: i.left_by,
          receivedAt: i.received_at,
          pickedUpBy: i.picked_up_by,
          pickedUpAt: i.picked_up_at
        })));
      }

      // Materials
      const { data: matData } = await supabase.from('borrowed_materials').select('*').order('created_at', { ascending: false });
      if (matData) {
        setMaterials(matData.map(m => ({
          ...m,
          materialName: m.material_name,
          borrowerType: m.borrower_type,
          borrowerName: m.borrower_name,
          loanDate: m.loan_date,
          returnDate: m.return_date
        })));
      }

      // Visitors
      const { data: visData } = await supabase.from('visitors').select('*').order('created_at', { ascending: false });
      if (visData) {
        setVisitors(visData.map(v => ({
          ...v,
          residentName: v.resident_name,
          residentId: v.resident_id,
          entryTime: v.entry_time,
          exitTime: v.exit_time
        })));
      }

      // Time Records
      const { data: timeData } = await supabase.from('time_records').select('*').order('created_at', { ascending: false });
      if (timeData) {
        setTimeRecords(timeData.map(t => ({
          ...t,
          employeeId: t.employee_id,
          employeeName: t.employee_name,
          entryTime: t.entry_time,
          exitTime: t.exit_time
        })));
      }

      // Delivery Drivers
      const { data: drvData } = await supabase.from('delivery_drivers').select('*');
      if (drvData) {
        setDeliveryDrivers(drvData.map(d => ({
          ...d,
          companyId: d.company_id,
          companyName: d.company_name
        })));
      }

      // Delivery Visits
      const { data: drvVisData } = await supabase.from('delivery_visits').select('*').order('created_at', { ascending: false });
      if (drvVisData) {
        setDeliveryVisits(drvVisData.map(v => ({
          ...v,
          driverId: v.driver_id,
          driverName: v.driver_name,
          companyName: v.company_name,
          entryTime: v.entry_time,
          packageCount: v.package_count
        })));
      }

    } catch (error) {
      console.error("Error fetching data:", error);
      // alert("Erro ao carregar dados do sistema. Verifique a conexão."); 
      // Commented out alert to avoid spam on initial load if network is slow, handled by UI state mostly
    } finally {
      setIsLoading(false);
    }
  };

  // Initial Fetch
  useEffect(() => {
    fetchData();
  }, []);

  // Auth Handlers
  const handleLogin = (employeeName: string) => {
    const user = {
      name: employeeName,
      role: employeeName === 'Administrador' ? 'ADMINISTRADOR' : 'OPERADOR'
    };
    
    setCurrentUser(user);
    setIsAuthenticated(true);
    // Persist to localStorage
    localStorage.setItem('portaria_user', JSON.stringify(user));
  };

  const handleLogoutRequest = () => {
    setIsLogoutModalOpen(true);
  };

  const confirmLogout = () => {
    setIsAuthenticated(false);
    setIsLogoutModalOpen(false);
    setIsSidebarOpen(false);
    setActivePage('dashboard');
    // Clear persistence
    localStorage.removeItem('portaria_user');
  };

  const handleNotepadSave = async (data: Omit<Occurrence, 'id' | 'timestamp'>) => {
    const now = new Date();
    const months = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
    const timestamp = `${now.getDate()} de ${months[now.getMonth()]} de ${now.getFullYear()} às ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    try {
      const { error } = await supabase.from('occurrences').insert({
        outgoing_employee_name: data.outgoingEmployeeName,
        incoming_employee_name: data.incomingEmployeeName,
        description: data.description,
        timestamp
      });

      if (error) throw error;
      fetchData(); // Refresh data
      setActivePage('ocorrencias');
    } catch (err) {
      console.error(err);
      alert('Erro ao salvar ocorrência');
    }
  };

  if (!isAuthenticated && !isLoading) {
    return (
      <LoginScreen 
        employees={employees} 
        onLogin={handleLogin} 
      />
    );
  }

  if (isLoading && !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-app">
        <div className="flex flex-col items-center gap-2">
          <Loader2 size={40} className="animate-spin text-primary" />
          <p className="text-slate-500 font-medium">Conectando ao sistema...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-app font-sans text-slate-800">
      
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
            onRefresh={fetchData}
          />
        ) : activePage === 'encomendas' ? (
          <PackagesPage 
            residents={residents}
            packages={packages}
            companies={companies}
            onRefresh={fetchData}
          />
        ) : activePage === 'recebidos' ? (
          <ReceivedItemsPage 
            items={receivedItems}
            residents={residents}
            onRefresh={fetchData}
          />
        ) : activePage === 'materiais' ? (
          <MaterialsPage 
            materials={materials}
            residents={residents}
            onRefresh={fetchData}
          />
        ) : activePage === 'visitantes' ? (
          <VisitorsPage 
            visitors={visitors}
            residents={residents}
            onRefresh={fetchData}
          />
        ) : activePage === 'ponto' ? (
          <TimeSheetPage 
            records={timeRecords}
            employees={employees}
            onRefresh={fetchData}
          />
        ) : activePage === 'empresas' ? (
          <CompaniesPage 
            companies={companies}
            onRefresh={fetchData}
          />
        ) : activePage === 'entregadores' ? (
          <DeliveryDriversPage 
            drivers={deliveryDrivers}
            companies={companies}
            onRefresh={fetchData}
          />
        ) : activePage === 'visitas' ? (
          <DeliveryVisitsPage
            visits={deliveryVisits}
            drivers={deliveryDrivers}
            onRefresh={fetchData}
          />
        ) : activePage === 'funcionarios' ? (
          <EmployeesPage 
            employees={employees}
            onRefresh={fetchData}
          />
        ) : activePage === 'ocorrencias' ? (
          <OccurrencesPage 
            occurrences={occurrences}
            employees={employees}
            onRefresh={fetchData}
            onOpenNotepad={() => {
              setIsNotepadOpen(true);
              setIsNotepadMinimized(false);
            }}
          />
        ) : null}
      </main>

      <FloatingNotepad 
        isOpen={isNotepadOpen}
        isMinimized={isNotepadMinimized}
        onClose={() => setIsNotepadOpen(false)}
        onMinimize={() => setIsNotepadMinimized(true)}
        onMaximize={() => setIsNotepadMinimized(false)}
        onSave={handleNotepadSave}
        employees={employees}
      />

      <ConfirmLogoutModal 
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={confirmLogout}
      />
    </div>
  );
};

export default App;
