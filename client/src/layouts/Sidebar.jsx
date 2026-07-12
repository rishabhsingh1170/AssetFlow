import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
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
  LogOut,
} from "lucide-react";
import { authService } from "../features/auth/services/auth.service";
import { NAV_CONFIG } from "../constants/navConfig";
import { hasRole } from "../hooks/useRole";

const iconMap = {
  "layout-dashboard": LayoutDashboard,
  "settings": Settings,
  "box": Package,
  "arrows-left-right": ArrowLeftRight,
  "calendar": Calendar,
  "tool": Wrench,
  "clipboard-check": ClipboardCheck,
  "chart-bar": BarChart3,
  "bell": Bell,
};

export const Sidebar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { profile } = useSelector((state) => state.auth);
  const fullName = profile?.full_name || profile?.fullName || "Active User";
  const userRole = profile?.role || "employee";

  const visibleNavItems = NAV_CONFIG.filter((item) =>
    hasRole(userRole, item.roles)
  );

  const handleLogout = async () => {
    try {
      await authService.logout(dispatch);
      navigate("/login");
    } catch (err) {
      console.error("Logout request failed:", err);
    }
  };

  const getRoleLabel = (role) => {
    return role.split("_").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
  };

  const getInitials = (name) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

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
        {visibleNavItems.map((item) => {
          const Icon = iconMap[item.icon];
          return (
            <NavLink
              key={item.label}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-default text-xs font-semibold uppercase tracking-wider transition-all duration-200 ${
                  isActive
                    ? "bg-[rgba(232,163,61,0.1)] text-accent-400 border border-accent-400/40"
                    : "text-text-secondary hover:text-text-primary hover:bg-surface-2 border border-transparent"
                }`
              }
            >
              {Icon && <Icon size={16} />}
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Visually Separated Logout Option */}
      <div className="px-4 py-2 border-t border-border">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-default text-xs font-semibold uppercase tracking-wider text-text-secondary hover:text-danger hover:bg-surface-2 border border-transparent transition-all duration-200 cursor-pointer"
        >
          <LogOut size={16} />
          <span>Logout</span>
        </button>
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-border bg-surface-0/30">
        <div className="flex items-center gap-3 px-2">
          <div className="w-8 h-8 rounded-full bg-surface-3 border border-border-strong flex items-center justify-center text-xs font-semibold text-text-primary uppercase">
            {getInitials(fullName)}
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-text-primary truncate max-w-[140px]">
              {fullName}
            </span>
            <span className="text-[10px] text-text-muted">
              {getRoleLabel(userRole)}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
