
import { 
  LayoutDashboard, 
  Package, 
  Inbox, 
  Box, 
  Users, // Used for Visitantes
  AlertCircle, 
  UserSquare2, // For Moradores
  Briefcase, // For Funcionários
  CalendarClock, 
  Building2, // For Empresas
  Truck, // For Entregadores
  MapPin,
  FolderKanban, // New icon for Cadastro
  ClipboardList // New icon for Operacional
} from "lucide-react";
import { MenuItem, UserProfile } from "./types";

// Submenu items for "Cadastro"
export const SUBMENU_CADASTRO_ITEMS: MenuItem[] = [
  { id: 'moradores', label: 'Moradores', icon: UserSquare2 },
  { id: 'funcionarios', label: 'Funcionários', icon: Briefcase },
  { id: 'empresas', label: 'Empresas', icon: Building2 },
  { id: 'entregadores', label: 'Entregadores', icon: Truck },
];

// Submenu items for "Operacional"
export const SUBMENU_OPERACIONAL_ITEMS: MenuItem[] = [
  { id: 'ocorrencias', label: 'Ocorrências', icon: AlertCircle },
  { id: 'ponto', label: 'Folha de Ponto', icon: CalendarClock },
];

export const MENU_ITEMS: MenuItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'operacional', label: 'Operacional', icon: ClipboardList, children: SUBMENU_OPERACIONAL_ITEMS },
  { id: 'cadastro', label: 'Cadastro', icon: FolderKanban, children: SUBMENU_CADASTRO_ITEMS },
  { id: 'encomendas', label: 'Encomendas', icon: Package },
  { id: 'recebidos', label: 'Itens Recebidos', icon: Inbox },
  { id: 'materiais', label: 'Materiais', icon: Box },
  { id: 'visitantes', label: 'Visitantes', icon: Users },
  { id: 'visitas', label: 'Visitas Entregadores', icon: MapPin },
];

export const CURRENT_USER: UserProfile = {
  name: 'Visitante',
  role: 'VISITANTE'
};
