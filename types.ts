import { LucideIcon } from "lucide-react";

export interface MenuItem {
  id: string;
  label: string;
  icon: LucideIcon;
  active?: boolean;
  children?: MenuItem[]; // Added for submenus
}

export type PackageStatus = 'Aguardando Retirada' | 'Retirada';

export interface PackageItem {
  id: string;
  unit: string;
  block: string;
  recipientName: string;
  type: string;
  sender?: string;
  trackingCode?: string;
  withdrawalCode: string;
  receivedAt: string;
  status: PackageStatus;
  description?: string;
  observations?: string;
  pickedUpBy?: string;
  pickedUpAt?: string;
}

export type ReceivedItemStatus = 'Aguardando Retirada' | 'Retirada';
export type ReceivedItemOperation = 'externo_para_morador' | 'morador_para_externo';

export interface ReceivedItem {
  id: string;
  operationType: ReceivedItemOperation;
  unit: string;
  block: string;
  recipientName?: string; // For searching/display
  residentId?: string; // Linked resident
  leftBy: string; // "Nome de quem deixou"
  document?: string; // RG/CPF
  description: string;
  shift: string;
  observations: string;
  receivedAt: string;
  status: ReceivedItemStatus;
  pickedUpBy?: string;
  pickedUpAt?: string;
  receivedCode?: string; // New: Unique code for received item
}

export interface UserProfile {
  name: string;
  role: string;
  avatarUrl?: string;
}

export type ResidentStatus = 'ativo' | 'inativo';
export type ResidentType = 'Proprietário' | 'Inquilino' | 'Outro';

export interface Resident {
  id: string;
  name: string;
  unit: string;
  block: string;
  type: ResidentType;
  status: ResidentStatus;
  phone: string;
  cpf: string;
  email: string;
  observations: string;
}

export type CompanyStatus = 'ativa' | 'inativa';
export type CompanyType = 'marketplace' | 'transportadora' | 'correios' | 'outros';

export interface Company {
  id: string;
  name: string;
  type: CompanyType;
  phone: string;
  status: CompanyStatus;
  observations: string;
}

export type EmployeeStatus = 'ativo' | 'inativo' | 'ferias';
export type EmployeeShift = 'diurno' | 'noturno' | 'administrativo';

export interface Employee {
  id: string;
  name: string;
  cpf: string;
  role: string;
  shift: EmployeeShift;
  status: EmployeeStatus;
  entryTime: string;
  exitTime: string;
  phone: string;
  email: string;
  admissionDate: string;
  photoUrl?: string;
  observations: string;
}

export interface Occurrence {
  id: string;
  outgoingEmployeeName: string; // Name of employee leaving
  incomingEmployeeName: string; // Name of employee entering
  description: string;
  timestamp: string; // Date and time of record
}

export type MaterialStatus = 'Emprestado' | 'Devolvido';
export type BorrowerType = 'morador' | 'funcionario' | 'terceiro';

export interface BorrowedMaterial {
  id: string;
  materialName: string;
  borrowerType: BorrowerType;
  borrowerName: string;
  unit?: string;
  block?: string;
  document?: string;
  phone: string;
  loanDate: string;
  returnDate?: string;
  status: MaterialStatus;
  observations: string;
}

export type VisitorStatus = 'no_condominio' | 'saiu';

export interface Visitor {
  id: string;
  name: string;
  document?: string;
  phone?: string;
  unit: string;
  block: string;
  residentName?: string; // If linked to a resident
  residentId?: string;
  entryTime: string;
  exitTime?: string;
  status: VisitorStatus;
  observations: string;
}

export type TimeRecordType = 'normal' | 'extra' | 'falta' | 'folga';

export interface TimeRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string; // YYYY-MM-DD
  shift: string;
  entryTime: string;
  exitTime: string;
  type: TimeRecordType;
  observations: string;
}

export type DeliveryDriverStatus = 'ativo' | 'inativo' | 'bloqueado';

export interface DeliveryDriver {
  id: string;
  name: string;
  companyId: string;
  companyName: string; // Denormalized for easier search
  phone: string;
  cpf: string;
  rg: string;
  status: DeliveryDriverStatus;
  observations: string;
}

export interface DeliveryVisit {
  id: string;
  driverId: string;
  driverName: string;
  companyName: string;
  entryTime: string; // DD/MM/YYYY HH:MM
  packageCount: number;
  shift: string;
  observations: string;
}