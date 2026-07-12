import React, { useEffect, useRef, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Bell, LogOut, Menu } from "lucide-react";
import { authService } from "../features/auth/services/auth.service";
import SearchBar from "../components/common/SearchBar";
import Badge from "../components/ui/Badge";

const getInitials = (name = "") =>
  name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "AF";

const getRoleLabel = (role = "employee") =>
  role
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

export const TopBar = ({ onMenuClick }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, profile } = useSelector((state) => state.auth);

  // Global search is visual for now; it is wired to real results in a later part.
  const [search, setSearch] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const fullName = profile?.full_name || profile?.fullName || "Active user";
  const role = profile?.role || "employee";
  const email = user?.email || profile?.email || "";

  useEffect(() => {
    if (!menuOpen) return undefined;
    const onClick = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };
    const onKeyDown = (event) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen]);

  const handleLogout = async () => {
    try {
      await authService.logout(dispatch);
      navigate("/login");
    } catch (err) {
      console.error("Logout request failed:", err);
    }
  };

  return (
    <header className="h-14 sticky top-0 z-30 bg-surface-1/85 backdrop-blur border-b border-border px-4 lg:px-8 flex items-center gap-4 shrink-0">
      <button
        type="button"
        onClick={onMenuClick}
        aria-label="Open menu"
        className="lg:hidden p-2 rounded-default text-text-secondary hover:bg-surface-2 hover:text-text-primary cursor-pointer"
      >
        <Menu size={18} />
      </button>

      <SearchBar
        value={search}
        onChange={setSearch}
        placeholder="Search assets, people, bookings"
        className="max-w-md flex-1 hidden sm:block"
      />

      <div className="ml-auto flex items-center gap-1.5">
        <NavLink
          to="/notifications"
          aria-label="Notifications"
          className={({ isActive }) =>
            `p-2 rounded-default transition-colors duration-150 ${
              isActive
                ? "text-accent-600 bg-accent-50"
                : "text-text-secondary hover:bg-surface-2 hover:text-text-primary"
            }`
          }
        >
          <Bell size={18} />
        </NavLink>

        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((current) => !current)}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            className="flex items-center gap-2.5 pl-1.5 pr-2 py-1.5 rounded-default hover:bg-surface-2 cursor-pointer transition-colors"
          >
            <span className="w-8 h-8 rounded-full bg-accent-100 text-accent-800 flex items-center justify-center text-xs font-semibold">
              {getInitials(fullName)}
            </span>
            <span className="hidden md:flex flex-col items-start leading-tight">
              <span className="text-xs font-semibold text-text-primary max-w-[140px] truncate">
                {fullName}
              </span>
              <span className="text-[10px] text-text-muted">{getRoleLabel(role)}</span>
            </span>
          </button>

          {menuOpen && (
            <div
              role="menu"
              className="absolute right-0 mt-2 w-64 bg-surface-1 border border-border rounded-card shadow-pop overflow-hidden"
            >
              <div className="px-4 py-3 border-b border-border">
                <p className="text-sm font-semibold text-text-primary truncate">{fullName}</p>
                {email && <p className="text-xs text-text-secondary truncate mt-0.5">{email}</p>}
                <div className="mt-2">
                  <Badge variant={role}>{getRoleLabel(role)}</Badge>
                </div>
              </div>
              <button
                type="button"
                role="menuitem"
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-text-secondary hover:bg-danger-bg hover:text-danger transition-colors cursor-pointer"
              >
                <LogOut size={16} />
                Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default TopBar;
