import { 
  LayoutDashboard, 
  Package, 
  Inbox, 
  Box, 
  Users, 
  AlertCircle, 
  UserSquare2, 
  Briefcase, 
  CalendarClock, 
  Building2, 
  Truck, 
  MapPin 
} from "lucide-react";
import { MenuItem, PackageItem, Resident, UserProfile, Company, Employee, Occurrence, ReceivedItem, BorrowedMaterial, Visitor, TimeRecord, DeliveryDriver, DeliveryVisit } from "./types";

export const MENU_ITEMS: MenuItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'encomendas', label: 'Encomendas', icon: Package },
  { id: 'recebidos', label: 'Itens Recebidos', icon: Inbox },
  { id: 'materiais', label: 'Materiais', icon: Box },
  { id: 'visitantes', label: 'Visitantes', icon: Users },
  { id: 'ocorrencias', label: 'Ocorrências', icon: AlertCircle },
  { id: 'moradores', label: 'Moradores', icon: UserSquare2 },
  { id: 'funcionarios', label: 'Funcionários', icon: Briefcase },
  { id: 'ponto', label: 'Folha de Ponto', icon: CalendarClock },
  { id: 'empresas', label: 'Empresas', icon: Building2 },
  { id: 'entregadores', label: 'Entregadores', icon: Truck },
  { id: 'visitas', label: 'Visitas Entregadores', icon: MapPin },
];

export const MOCK_PACKAGES: PackageItem[] = [
  { 
    id: '1', 
    unit: '07', 
    block: 'A', 
    recipientName: 'DAIVID CELSO DOS SANTOS',
    type: 'Encomenda',
    withdrawalCode: '263428',
    receivedAt: '30/11/25 16:59',
    status: 'Aguardando Retirada',
    sender: '-',
    trackingCode: '-',
    description: 'Pacote pequeno Amazon'
  },
  { 
    id: '4', 
    unit: '07', 
    block: 'A', 
    recipientName: 'DAIVID CELSO DOS SANTOS',
    type: 'Encomenda',
    withdrawalCode: 'U006YE',
    receivedAt: '30/11/25 17:01',
    status: 'Aguardando Retirada',
    sender: 'Shopee',
    trackingCode: 'BR234567890',
    description: 'Envelope médio'
  },
  { 
    id: '5', 
    unit: '07', 
    block: 'A', 
    recipientName: 'DAIVID CELSO DOS SANTOS',
    type: 'Encomenda',
    withdrawalCode: 'PEND02',
    receivedAt: '30/11/25 17:05',
    status: 'Aguardando Retirada',
    sender: 'Correios',
    trackingCode: 'PY123456789BR',
    description: 'Caixa grande'
  },
  { 
    id: '6', 
    unit: '07', 
    block: 'A', 
    recipientName: 'DAIVID CELSO DOS SANTOS',
    type: 'Encomenda',
    withdrawalCode: 'PEND03',
    receivedAt: '30/11/25 17:05',
    status: 'Aguardando Retirada',
    sender: 'Mercado Livre',
    trackingCode: 'MLB123456',
    description: 'Pacote pequeno'
  },
  { 
    id: '2', 
    unit: '33', 
    block: 'D', 
    recipientName: 'MARIA OLIVEIRA',
    type: 'Encomenda',
    withdrawalCode: '987123',
    receivedAt: '30/11/25 14:30',
    status: 'Aguardando Retirada',
    sender: 'Mercado Livre',
    trackingCode: 'MLB123456789'
  },
  { 
    id: '3', 
    unit: '12', 
    block: 'C', 
    recipientName: 'JOSÉ SILVA',
    type: 'Correspondência',
    withdrawalCode: '456789',
    receivedAt: '29/11/25 10:15',
    status: 'Retirada',
    pickedUpBy: 'José Silva',
    pickedUpAt: '30/11/25 09:00',
    sender: 'Banco Itaú'
  },
  { 
    id: '101', 
    unit: '101', 
    block: 'A', 
    recipientName: 'FERNANDO SOUZA',
    type: 'Encomenda',
    withdrawalCode: 'FS101A',
    receivedAt: '30/11/25 15:30',
    status: 'Aguardando Retirada',
    sender: 'Amazon',
    trackingCode: 'AMZ998877',
    description: 'Caixa média'
  },
  { 
    id: '102', 
    unit: '102', 
    block: 'B', 
    recipientName: 'ANA PAULA',
    type: 'Encomenda',
    withdrawalCode: 'AP102B',
    receivedAt: '30/11/25 16:00',
    status: 'Aguardando Retirada',
    sender: 'Shopee',
    trackingCode: 'BR554433',
    description: 'Envelope'
  },
  { 
    id: '103', 
    unit: '103', 
    block: 'C', 
    recipientName: 'ROBERTO CARLOS',
    type: 'Encomenda',
    withdrawalCode: 'RC103C',
    receivedAt: '30/11/25 16:15',
    status: 'Aguardando Retirada',
    sender: 'Magalu',
    trackingCode: 'MGL112233',
    description: 'Eletrodoméstico'
  }
];

export const MOCK_RECEIVED_ITEMS: ReceivedItem[] = [
  {
    id: '1',
    operationType: 'externo_para_morador',
    unit: '07',
    block: 'A',
    recipientName: 'DAIVID CELSO DOS SANTOS',
    leftBy: 'Mãe do Daivid',
    description: 'Sacola com roupas e mantimentos',
    shift: 'diurno',
    observations: 'Deixou na portaria pois ele não estava.',
    receivedAt: '30/11/25 10:00',
    status: 'Aguardando Retirada'
  },
  {
    id: '2',
    operationType: 'morador_para_externo',
    unit: '33',
    block: 'D',
    leftBy: 'Maria Oliveira',
    description: 'Chaves do apartamento',
    shift: 'diurno',
    observations: 'Entregar para a faxineira Ana.',
    receivedAt: '30/11/25 08:00',
    status: 'Retirada',
    pickedUpBy: 'Ana (Faxineira)',
    pickedUpAt: '30/11/25 08:15'
  }
];

export const MOCK_RESIDENTS: Resident[] = [
  {
    id: '1',
    name: 'AUGUSTO TAKEUCHI',
    unit: '06',
    block: 'PORTARIA',
    type: 'Proprietário',
    status: 'ativo',
    phone: '12992251294',
    cpf: '000.000.000-00',
    email: 'augusto@example.com',
    observations: ''
  },
  {
    id: '2',
    name: 'JAQUELINE DOS SANTOS',
    unit: '05',
    block: 'PORTARIA',
    type: 'Proprietário',
    status: 'ativo',
    phone: '12992423279',
    cpf: '000.000.000-00',
    email: 'jaqueline@example.com',
    observations: ''
  },
  {
    id: '3',
    name: 'GILVAN DA SILVA',
    unit: '04',
    block: 'PORTARIA',
    type: 'Proprietário',
    status: 'ativo',
    phone: '12992406284',
    cpf: '000.000.000-00',
    email: 'gilvan@example.com',
    observations: ''
  },
  {
    id: '4',
    name: 'CAMILA TAKEUCHI',
    unit: '03',
    block: 'PORTARIA',
    type: 'Proprietário',
    status: 'ativo',
    phone: '12992142998',
    cpf: '000.000.000-00',
    email: 'camila@example.com',
    observations: ''
  },
  {
    id: '5',
    name: 'JOÃO APARECIDO FILHO',
    unit: '02',
    block: 'PORTARIA',
    type: 'Proprietário',
    status: 'ativo',
    phone: '12996314188',
    cpf: '000.000.000-00',
    email: 'joao@example.com',
    observations: ''
  },
  {
    id: '6',
    name: 'ROSEMEIRE CARVALHO',
    unit: '01',
    block: 'PORTARIA',
    type: 'Proprietário',
    status: 'ativo',
    phone: '12991187028',
    cpf: '000.000.000-00',
    email: 'rosemeire@example.com',
    observations: ''
  },
  {
    id: '7',
    name: 'RENATO SKIPKA',
    unit: '15',
    block: 'E',
    type: 'Proprietário',
    status: 'ativo',
    phone: '12996101984',
    cpf: '000.000.000-00',
    email: 'renato@example.com',
    observations: ''
  },
  {
    id: '8',
    name: 'NATHALIA RODRIGUES',
    unit: '15',
    block: 'E',
    type: 'Proprietário',
    status: 'ativo',
    phone: '12991813953',
    cpf: '000.000.000-00',
    email: 'nathalia@example.com',
    observations: ''
  },
  {
    id: '9',
    name: 'LUCIANO RODRIGUES',
    unit: '13',
    block: 'E',
    type: 'Proprietário',
    status: 'ativo',
    phone: '11999009046',
    cpf: '000.000.000-00',
    email: 'luciano@example.com',
    observations: ''
  },
  {
    id: '10',
    name: 'DAIVID CELSO DOS SANTOS',
    unit: '07',
    block: 'A',
    type: 'Proprietário',
    status: 'ativo',
    phone: '11999999999',
    cpf: '000.000.000-00',
    email: 'daivid@example.com',
    observations: ''
  }
];

export const MOCK_COMPANIES: Company[] = [
  {
    id: '1',
    name: 'MERCADO LIVRE',
    type: 'transportadora',
    phone: '(11) 99999-9999',
    status: 'ativa',
    observations: ''
  },
  {
    id: '2',
    name: 'AMAZON',
    type: 'transportadora',
    phone: '(11) 99999-9999',
    status: 'ativa',
    observations: ''
  },
  {
    id: '3',
    name: 'SHOPEE',
    type: 'marketplace',
    phone: '(11) 99999-9999',
    status: 'ativa',
    observations: ''
  },
  {
    id: '4',
    name: 'CORREIOS',
    type: 'correios',
    phone: '(11) 99999-9999',
    status: 'ativa',
    observations: ''
  }
];

export const MOCK_EMPLOYEES: Employee[] = [
  {
    id: '1',
    name: 'João Aparecido Filho',
    cpf: '000.000.000-00',
    role: 'Porteiro',
    shift: 'diurno',
    status: 'ativo',
    entryTime: '06:00',
    exitTime: '18:00',
    phone: '(11) 99999-9999',
    email: 'joao@portaria.com',
    admissionDate: '01/01/2023',
    observations: ''
  },
  {
    id: '2',
    name: 'Carlos da Silva',
    cpf: '111.111.111-11',
    role: 'Porteiro',
    shift: 'noturno',
    status: 'ativo',
    entryTime: '18:00',
    exitTime: '06:00',
    phone: '(11) 88888-8888',
    email: 'carlos@portaria.com',
    admissionDate: '15/03/2024',
    observations: ''
  }
];

export const MOCK_OCCURRENCES: Occurrence[] = [
  {
    id: '1',
    outgoingEmployeeName: 'João Aparecido Filho',
    incomingEmployeeName: 'Carlos da Silva',
    description: 'Tudo tranquilo no turno, apenas uma correspondência recebida fora do horário comercial que foi devidamente registrada.',
    timestamp: '30/11/2025 às 18:20'
  }
];

export const MOCK_BORROWED_MATERIALS: BorrowedMaterial[] = [
  {
    id: '1',
    materialName: 'Furadeira Bosch',
    borrowerType: 'morador',
    borrowerName: 'DAIVID CELSO DOS SANTOS',
    unit: '07',
    block: 'A',
    phone: '11999999999',
    loanDate: '01/12/2025 09:30',
    status: 'Emprestado',
    observations: 'Disse que devolve até o final do dia.'
  },
  {
    id: '2',
    materialName: 'Escada de Alumínio',
    borrowerType: 'funcionario',
    borrowerName: 'Carlos da Silva',
    phone: '',
    loanDate: '30/11/2025 14:00',
    returnDate: '30/11/2025 16:00',
    status: 'Devolvido',
    observations: 'Usada para trocar lâmpada do corredor.'
  }
];

export const MOCK_VISITORS: Visitor[] = [
  {
    id: '1',
    name: 'Rafael Mendes',
    document: '44.555.666-X',
    phone: '(11) 98888-7777',
    unit: '07',
    block: 'A',
    residentName: 'DAIVID CELSO DOS SANTOS',
    residentId: '10',
    entryTime: '01/12/2025 10:30',
    status: 'no_condominio',
    observations: 'Técnico da Internet'
  },
  {
    id: '2',
    name: 'Juliana Costa',
    document: '123.456.789-00',
    phone: '',
    unit: '33',
    block: 'D',
    residentName: 'MARIA OLIVEIRA',
    residentId: '2',
    entryTime: '01/12/2025 08:00',
    exitTime: '01/12/2025 12:00',
    status: 'saiu',
    observations: 'Visita familiar'
  }
];

export const MOCK_TIME_RECORDS: TimeRecord[] = [
  {
    id: '1',
    employeeId: '1',
    employeeName: 'João Aparecido Filho',
    date: '2025-12-01',
    shift: 'diurno',
    entryTime: '06:00',
    exitTime: '18:00',
    type: 'normal',
    observations: ''
  }
];

export const MOCK_DELIVERY_DRIVERS: DeliveryDriver[] = [
  {
    id: '1',
    name: 'DANIEL DE CASTRO MEDEIROS',
    companyId: '1',
    companyName: 'MERCADO LIVRE',
    phone: '12 98153-7342',
    cpf: '000.000.000-00',
    rg: '00.000.000-0',
    status: 'ativo',
    observations: ''
  },
  {
    id: '2',
    name: 'ANTONIO MARCOS',
    companyId: '1',
    companyName: 'MERCADO LIVRE',
    phone: '12 99118-2587',
    cpf: '111.111.111-11',
    rg: '11.111.111-1',
    status: 'ativo',
    observations: ''
  }
];

export const MOCK_DELIVERY_VISITS: DeliveryVisit[] = [
  {
    id: '1',
    driverId: '1',
    driverName: 'DANIEL DE CASTRO MEDEIROS',
    companyName: 'MERCADO LIVRE',
    entryTime: '01/12/2025 14:30',
    packageCount: 15,
    shift: 'diurno',
    observations: 'Entregou no bloco A e B'
  }
];

export const CURRENT_USER: UserProfile = {
  name: "JOÃO APARECIDO FILHO",
  role: "OPERADOR",
};