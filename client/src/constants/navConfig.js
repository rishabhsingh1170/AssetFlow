import { ROLES } from "./roles";

// TODO(rbac): department_head should conditionally see Audit if assigned as auditor on an 
// open cycle — requires audit.slice.js to expose this lookup. Currently hidden by default.

export const NAV_CONFIG = [
  {
    label: "Dashboard",
    path: "/dashboard",
    icon: "layout-dashboard",
    roles: [ROLES.ADMIN, ROLES.ASSET_MANAGER, ROLES.DEPARTMENT_HEAD, ROLES.EMPLOYEE],
  },
  {
    label: "Organization Setup",
    path: "/organization-setup",
    icon: "settings",
    roles: [ROLES.ADMIN],
  },
  {
    label: "Assets",
    path: "/assets",
    icon: "box",
    roles: [ROLES.ADMIN, ROLES.ASSET_MANAGER, ROLES.DEPARTMENT_HEAD, ROLES.EMPLOYEE],
  },
  {
    label: "Allocation & Transfer",
    path: "/allocation",
    icon: "arrows-left-right",
    roles: [ROLES.ADMIN, ROLES.ASSET_MANAGER, ROLES.DEPARTMENT_HEAD, ROLES.EMPLOYEE],
  },
  {
    label: "Resource Booking",
    path: "/booking",
    icon: "calendar",
    roles: [ROLES.ADMIN, ROLES.ASSET_MANAGER, ROLES.DEPARTMENT_HEAD, ROLES.EMPLOYEE],
  },
  {
    label: "Maintenance",
    path: "/maintenance",
    icon: "tool",
    roles: [ROLES.ADMIN, ROLES.ASSET_MANAGER, ROLES.DEPARTMENT_HEAD, ROLES.EMPLOYEE],
  },
  {
    // TODO(rbac): department_head should conditionally see Audit if assigned as auditor on an 
    // open cycle — requires audit.slice.js to expose this lookup. Currently hidden by default.
    label: "Audit",
    path: "/audit",
    icon: "clipboard-check",
    roles: [ROLES.ADMIN, ROLES.ASSET_MANAGER],
  },
  {
    label: "Reports",
    path: "/reports",
    icon: "chart-bar",
    roles: [ROLES.ADMIN, ROLES.ASSET_MANAGER, ROLES.DEPARTMENT_HEAD],
  },
  {
    label: "Notifications",
    path: "/notifications",
    icon: "bell",
    roles: [ROLES.ADMIN, ROLES.ASSET_MANAGER, ROLES.DEPARTMENT_HEAD, ROLES.EMPLOYEE],
  },
];

export default NAV_CONFIG;
