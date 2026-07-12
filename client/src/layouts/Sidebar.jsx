import React from "react";
import { NavLink, Link } from "react-router-dom";
import { NAV_ITEMS } from "../constants/navConfig";
import { useRole, hasRole } from "../hooks/useRole";
import Logo from "../components/brand/Logo";

export const Sidebar = ({ open = false, onClose }) => {
  const { role, isLoading } = useRole();

  // While the role is unknown, only show items every role can access to
  // avoid a flash of admin-only links.
  const visibleItems = NAV_ITEMS.filter((item) =>
    isLoading || !role ? item.roles.length === 4 : hasRole(role, item.roles)
  );

  const content = (
    <aside className="w-64 h-full bg-surface-1 border-r border-border flex flex-col select-none">
      <div className="px-5 py-5 border-b border-border">
        <Link
          to="/dashboard"
          className="inline-flex rounded-default focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
        >
          <Logo size={28} withWordmark />
        </Link>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) =>
                `relative flex items-center gap-3 px-3.5 py-2.5 rounded-default text-sm font-medium transition-colors duration-150 ${
                  isActive
                    ? "bg-accent-100 text-accent-800"
                    : "text-text-secondary hover:bg-surface-2 hover:text-text-primary"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span
                      className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px] rounded-full bg-accent-500"
                      aria-hidden="true"
                    />
                  )}
                  <Icon size={18} />
                  <span>{item.label}</span>
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      <div className="px-5 py-3 border-t border-border">
        <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-text-muted">
          AssetFlow ERP
        </span>
      </div>
    </aside>
  );

  return (
    <>
      {/* Static sidebar on large screens */}
      <div className="hidden lg:block shrink-0 h-full">{content}</div>

      {/* Off-canvas sidebar below lg */}
      <div
        className={`lg:hidden fixed inset-0 z-40 ${open ? "" : "pointer-events-none"}`}
        aria-hidden={!open}
      >
        <button
          type="button"
          aria-label="Close menu"
          onClick={onClose}
          className={`absolute inset-0 bg-surface-ink/40 transition-opacity duration-200 ${
            open ? "opacity-100" : "opacity-0"
          }`}
        />
        <div
          className={`absolute inset-y-0 left-0 transition-transform duration-200 ${
            open ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {content}
        </div>
      </div>
    </>
  );
};

export default Sidebar;
