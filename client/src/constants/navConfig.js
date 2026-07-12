import {
  LayoutDashboard,
  Settings,
  Package,
  ArrowLeftRight,
  Calendar,
  Wrench,
  ClipboardCheck,
  BarChart3,
  Bell,
} from "lucide-react";
import { ROLES } from "./roles";

const ALL_ROLES = [
  ROLES.ADMIN,
  ROLES.ASSET_MANAGER,
  ROLES.DEPARTMENT_HEAD,
  ROLES.EMPLOYEE,
];

// Keep these role arrays in sync with the RoleRoute guards in routes/AppRoutes.jsx.
export const NAV_ITEMS = [
  { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard, roles: ALL_ROLES },
  { label: "Organization setup", path: "/organization-setup", icon: Settings, roles: [ROLES.ADMIN] },
  { label: "Assets", path: "/assets", icon: Package, roles: ALL_ROLES },
  { label: "Allocation and transfer", path: "/allocation-transfer", icon: ArrowLeftRight, roles: ALL_ROLES },
  { label: "Resource booking", path: "/resource-booking", icon: Calendar, roles: ALL_ROLES },
  { label: "Maintenance", path: "/maintenance", icon: Wrench, roles: ALL_ROLES },
  { label: "Audit", path: "/audit", icon: ClipboardCheck, roles: [ROLES.ADMIN, ROLES.ASSET_MANAGER] },
  { label: "Reports", path: "/reports", icon: BarChart3, roles: [ROLES.ADMIN, ROLES.ASSET_MANAGER, ROLES.DEPARTMENT_HEAD] },
  { label: "Notifications", path: "/notifications", icon: Bell, roles: ALL_ROLES },
];

export default NAV_ITEMS;
