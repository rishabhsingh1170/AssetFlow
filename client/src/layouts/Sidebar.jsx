import React from "react";
import { NavLink } from "react-router-dom";
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

export const Sidebar = () => {
  const navItems = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Organization setup", path: "/organization-setup", icon: Settings },
    { name: "Assets", path: "/assets", icon: Package },
    { name: "Allocation & Transfer", path: "/allocation-transfer", icon: ArrowLeftRight },
    { name: "Resource Booking", path: "/resource-booking", icon: Calendar },
    { name: "Maintenance", path: "/maintenance", icon: Wrench },
    { name: "Audit", path: "/audit", icon: ClipboardCheck },
    { name: "Reports", path: "/reports", icon: BarChart3 },
    { name: "Notifications", path: "/notifications", icon: Bell },
  ];

  return (
    <aside className="w-64 bg-surface-1 border-r border-border flex flex-col h-screen select-none">
      {/* Brand Logo Header */}
      <div className="px-6 py-5 border-b border-border flex items-center gap-3">
        <div className="w-8 h-8 rounded-default bg-accent-400 flex items-center justify-center text-surface-0 font-bold text-base tracking-wider shadow-sm">
          AF
        </div>
        <span className="text-lg font-bold text-text-primary tracking-wide">
          AssetFlow
        </span>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-default text-xs font-semibold uppercase tracking-wider transition-all duration-200 ${
                  isActive
                    ? "bg-[rgba(232,163,61,0.1)] text-accent-400 border border-accent-400/40"
                    : "text-text-secondary hover:text-text-primary hover:bg-surface-2 border border-transparent"
                }`
              }
            >
              <Icon size={16} />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div className="p-4 border-t border-border bg-surface-0/30">
        <div className="flex items-center gap-3 px-2">
          <div className="w-8 h-8 rounded-full bg-surface-3 border border-border-strong flex items-center justify-center text-xs font-semibold text-text-primary">
            AD
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-text-primary truncate max-w-[140px]">
              Admin User
            </span>
            <span className="text-[10px] text-text-muted">
              Administrator
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
