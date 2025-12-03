
import React, { useState, useEffect, useCallback } from 'react';
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

// Define keys for granular refreshing
type DataScope = 'all' | 'residents' | 'packages' | 'companies' | 'employees' | 'occurrences' | 'received_items' | 'materials' | 'visitors' | 'time_records' | 'delivery_drivers' | 'delivery_visits';

const App: React.FC = () => {
  // Auth State
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    try {
      const savedUser = localStorage.getItem('portaria_user');
      return savedUser ? JSON.parse(savedUser) : CURRENT_USER;
    } catch {
      return CURRENT_USER;
    }
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

  // --- OPTIMIZED SUPABASE DATA FETCHING ---
  const fetchData = useCallback(async (scopes: DataScope[] = ['all'], isBackground = false) => {
    if (!isBackground) setIsLoading(true);
    
    const shouldFetch = (scope: DataScope) => scopes.includes('all') || scopes.includes(scope);

    try {
      const promises: Promise<any>[] = [];
      const fetchMap: Record<string, number> = {}; 

      let pIndex = 0;

      if (shouldFetch('residents')) {
        promises.push(supabase.from('residents').select('*'));
        fetchMap['residents'] = pIndex++;
      }
      if (shouldFetch('packages')) {
        promises.push(supabase.from('packages').select('*').order('created_at', { ascending: false }));
        fetchMap['packages'] = pIndex++;
      }
      if (shouldFetch('companies')) {
        promises.push(supabase.from('companies').select('*'));
        fetchMap['companies'] = pIndex++;
      }
      if (shouldFetch('employees')) {
        promises.push(supabase.from('employees').select('*'));
        fetchMap['employees'] = pIndex++;
      }
      if (shouldFetch('occurrences')) {
        promises.push(supabase.from('occurrences').select('*').order('created_at', { ascending: false }));
        fetchMap['occurrences'] = pIndex++;
      }
      if (shouldFetch('received_items')) {
        promises.push(supabase.from('received_items').select('*').order('created_at', { ascending: false }));
        fetchMap['received_items'] = pIndex++;
      }
      if (shouldFetch('materials')) {
        promises.push(supabase.from('borrowed_materials').select('*').order('created_at', { ascending: false }));
        fetchMap['materials'] = pIndex++;
      }
      if (shouldFetch('visitors')) {
        promises.push(supabase.from('visitors').select('*').order('created_at', { ascending: false }));
        fetchMap['visitors'] = pIndex++;
      }
      if (shouldFetch('time_records')) {
        promises.push(supabase.from('time_records').select('*').order('created_at', { ascending: false }));
        fetchMap['time_records'] = pIndex++;
      }
      if (shouldFetch('delivery_drivers')) {
        promises.push(supabase.from('delivery_drivers').select('*'));
        fetchMap['delivery_drivers'] = pIndex++;
      }
      if (shouldFetch('delivery_visits')) {
        promises.push(supabase.from('delivery_visits').select('*').order('created_at', { ascending: false }));
        fetchMap['delivery_visits'] = pIndex++;
      }

      const results = await Promise.all(promises);

      if (fetchMap['residents'] !== undefined) {
        const res = results[fetchMap['residents']];
        if (res.data) setResidents(res.data);
      }

      if (fetchMap['packages'] !== undefined) {
        const res = results[fetchMap['packages']];
        if (res.data) {
          setPackages(res.data.map((p: any) => ({
            ...p,
            recipientName: p.recipient_name,
            trackingCode: p.tracking_code,
            withdrawalCode: p.withdrawal_code,
            receivedAt: p.received_at,
            pickedUpBy: p.picked_up_by,
            pickedUpAt: p.picked_up_at
          })));
        }
      }

      if (fetchMap['companies'] !== undefined) {
        const res = results[fetchMap['companies']];
        if (res.data) setCompanies(res.data);
      }

      if (fetchMap['employees'] !== undefined) {
        const res = results[fetchMap['employees']];
        if (res.data) {
          setEmployees(res.data.map((e: any) => ({
            ...e,
            entryTime: e.entry_time,
            exitTime: e.exit_time,
            admissionDate: e.admission_date,
            photoUrl: e.photo_url
          })));
        }
      }

      if (fetchMap['occurrences'] !== undefined) {
        const res = results[fetchMap['occurrences']];
        if (res.data) {
          setOccurrences(res.data.map((o: any) => ({
            ...o,
            outgoingEmployeeName: o.outgoing_employee_name,
            incomingEmployeeName: o.incoming_employee_name,
          })));
        }
      }

      if (fetchMap['received_items'] !== undefined) {
        const res = results[fetchMap['received_items']];
        if (res.data) {
          setReceivedItems(res.data.map((i: any) => ({
            ...i,
            operationType: i.operation_type,
            recipientName: i.recipient_name,
            residentId: i.resident_id,
            leftBy: i.left_by,
            receivedAt: i.received_at,
            pickedUpBy: i.picked_up_by,
            pickedUpAt: i.picked_up_at,
            receivedCode: i.received_code
          })));
        }
      }

      if (fetchMap['materials'] !== undefined) {
        const res = results[fetchMap['materials']];
        if (res.data) {
          setMaterials(res.data.map((m: any) => ({
            ...m,
            materialName: m.material_name,
            borrowerType: m.borrower_type,
            borrowerName: m.borrower_name,
            loanDate: m.loan_date,
            returnDate: m.return_date
          })));
        }
      }

      if (fetchMap['visitors'] !== undefined) {
        const res = results[fetchMap['visitors']];
        if (res.data) {
          setVisitors(res.data.map((v: any) => ({
            ...v,
            residentName: v.resident_name,
            residentId: v.resident_id,
            entryTime: v.entry_time,
            exitTime: v.exit_time
          })));
        }
      }

      if (fetchMap['time_records'] !== undefined) {
        const res = results[fetchMap['time_records']];
        if (res.data) {
          setTimeRecords(res.data.map((t: any) => ({
            ...t,
            employeeId: t.employee_id,
            employeeName: t.employee_name,
            entryTime: t.entry_time,
            exitTime: t.exit_time
          })));
        }
      }

      if (fetchMap['delivery_drivers'] !== undefined) {
        const res = results[fetchMap['delivery_drivers']];
        if (res.data) {
          setDeliveryDrivers(res.data.map((d: any) => ({
            ...d,
            companyId: d.company_id,
            companyName: d.company_name
          })));
        }
      }

      if (fetchMap['delivery_visits'] !== undefined) {
        const res = results[fetchMap['delivery_visits']];
        if (res.data) {
          setDeliveryVisits(res.data.map((v: any) => ({
            ...v,
            driverId: v.driver_id,
            driverName: v.driver_name,
            companyName: v.company_name,
            entryTime: v.entry_time,
            packageCount: v.package_count
          })));
        }
      }

    } catch (error: any) {
      console.error("Error fetching data:", error?.message || error);
    } finally {
      if (!isBackground) setIsLoading(false);
    }
  }, []);

  // Initial Fetch (Load Everything)
  useEffect(() => {
    fetchData(['all']);
  }, [fetchData]);

  // Auth Handlers
  const handleLogin = (employeeName: string) => {
    const user = {
      name: employeeName,
      role: employeeName === 'Administrador' ? 'ADMINISTRADOR' : 'OPERADOR'
    };
    
    setCurrentUser(user);
    setIsAuthenticated(true);
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
      fetchData(['occurrences'], true); // Granular Refresh
      setActivePage('ocorrencias');
    } catch (err: any) {
      console.error("Error saving occurrence:", err?.message || err);
      alert('Erro ao salvar ocorrência');
    }
  };

  // Dedicated handler for opening notepad
  const handleOpenNotepad = () => {
    setIsNotepadOpen(true);
    setIsNotepadMinimized(false);
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
            onRefresh={() => fetchData(['residents'], true)}
          />
        ) : activePage === 'encomendas' ? (
          <PackagesPage 
            residents={residents}
            packages={packages}
            companies={companies}
            onRefresh={(scope) => fetchData(scope ? [scope] : ['packages'], true)} // Granular refresh support
          />
        ) : activePage === 'recebidos' ? (
          <ReceivedItemsPage 
            items={receivedItems}
            residents={residents}
            onRefresh={() => fetchData(['received_items'], true)}
          />
        ) : activePage === 'materiais' ? (
          <MaterialsPage 
            materials={materials}
            residents={residents}
            onRefresh={() => fetchData(['materials'], true)}
          />
        ) : activePage === 'visitantes' ? (
          <VisitorsPage 
            visitors={visitors}
            residents={residents}
            onRefresh={() => fetchData(['visitors'], true)}
          />
        ) : activePage === 'ponto' ? (
          <TimeSheetPage 
            records={timeRecords}
            employees={employees}
            onRefresh={() => fetchData(['time_records'], true)}
          />
        ) : activePage === 'empresas' ? (
          <CompaniesPage 
            companies={companies}
            onRefresh={() => fetchData(['companies'], true)}
          />
        ) : activePage === 'entregadores' ? (
          <DeliveryDriversPage 
            drivers={deliveryDrivers}
            companies={companies}
            onRefresh={() => fetchData(['delivery_drivers'], true)}
          />
        ) : activePage === 'visitas' ? (
          <DeliveryVisitsPage
            visits={deliveryVisits}
            drivers={deliveryDrivers}
            companies={companies}
            onRefresh={() => fetchData(['delivery_visits', 'delivery_drivers'], true)}
          />
        ) : activePage === 'funcionarios' ? (
          <EmployeesPage 
            employees={employees}
            onRefresh={() => fetchData(['employees'], true)}
          />
        ) : activePage === 'ocorrencias' ? (
          <OccurrencesPage 
            occurrences={occurrences}
            employees={employees}
            onRefresh={() => fetchData(['occurrences'], true)}
            onOpenNotepad={handleOpenNotepad}
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
