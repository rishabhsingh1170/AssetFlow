import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";
import ProtectedRoute from "./ProtectedRoute";
import RoleRoute from "./RoleRoute";
import OrganizationSetupPage from "../features/organization/pages/OrganizationSetupPage";
import LoginPage from "../features/auth/pages/LoginPage";
import DashboardPage from "../features/dashboard/pages/DashboardPage";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import RoleGate from "../components/common/RoleGate";
import { useRole } from "../hooks/useRole";
import { ROLES } from "../constants/roles";
import { NAV_CONFIG } from "../constants/navConfig";

// Extract allowed roles dynamically from the single source of truth configuration
const getRouteRoles = (path) => {
  const item = NAV_CONFIG.find((navItem) => navItem.path === path);
  return item ? item.roles : [];
};

// Dynamic placeholder page that gates buttons and action items based on user roles
const PagePlaceholder = ({ title, path }) => {
  const { role, isAdmin, isAssetManager, isDepartmentHead, isEmployee } = useRole();

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] p-6">
      <Card className="max-w-2xl w-full p-8 space-y-6">
        <div>
          <h2 className="text-xl font-bold text-text-primary uppercase tracking-wide">
            {title} Screen
          </h2>
          <p className="text-xs text-text-muted mt-1">
            Active Role: <span className="font-semibold text-accent-400 uppercase">{role}</span>
          </p>
        </div>

        {/* Dynamic Action-Level Gating Display */}
        <div className="p-5 border border-border rounded-default bg-surface-0 space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-text-secondary">
            Authorized Actions (RBAC Active)
          </h4>

          {path === "/assets" && (
            <div className="space-y-3">
              <RoleGate allowedRoles={[ROLES.ADMIN, ROLES.ASSET_MANAGER]}>
                <div className="flex gap-2">
                  <Button variant="primary" size="sm">+ Register Asset</Button>
                  <Button variant="secondary" size="sm">Edit Asset</Button>
                </div>
              </RoleGate>

              <RoleGate allowedRoles={[ROLES.DEPARTMENT_HEAD, ROLES.EMPLOYEE]}>
                <div className="space-y-2">
                  <span className="text-[11px] text-danger font-semibold uppercase block">[Read-only Search Mode]</span>
                  <input type="text" placeholder="Search assets..." disabled className="p-2 border border-border bg-surface-2 rounded-default text-xs w-full" />
                </div>
              </RoleGate>

              {/* TODO(rbac): filter assets list by department_id of the Department Head by default */}
            </div>
          )}

          {path === "/allocation" && (
            <div className="space-y-3">
              {isAdmin && <span className="text-[11px] text-danger font-semibold uppercase block">[Read-only View]</span>}

              <RoleGate allowedRoles={[ROLES.ADMIN, ROLES.ASSET_MANAGER]}>
                <Button variant="primary" size="sm">Allocate Asset</Button>
              </RoleGate>

              <RoleGate allowedRoles={[ROLES.ASSET_MANAGER, ROLES.DEPARTMENT_HEAD]}>
                <div className="space-y-2">
                  <Button variant="secondary" size="sm">Approve Transfer</Button>
                  {/* TODO(rbac): check department match to ensure Department Head only approves transfers within their own department */}
                </div>
              </RoleGate>

              <RoleGate allowedRoles={[ROLES.EMPLOYEE, ROLES.DEPARTMENT_HEAD]}>
                <div className="space-y-2">
                  <Button variant="secondary" size="sm">Initiate Return/Transfer Request</Button>
                  {/* TODO(rbac): restrict to assets allocated to the employee */}
                  {/* TODO(rbac): restrict to assets allocated within their department */}
                </div>
              </RoleGate>
            </div>
          )}

          {path === "/booking" && (
            <div className="space-y-3">
              {isAdmin && <span className="text-[11px] text-danger font-semibold uppercase block">[Read-only View]</span>}

              <RoleGate allowedRoles={[ROLES.ASSET_MANAGER, ROLES.DEPARTMENT_HEAD, ROLES.EMPLOYEE]}>
                <div className="space-y-2">
                  <Button variant="primary" size="sm">Book Resource</Button>
                  {/* TODO(rbac): default booking form to booking on behalf of the Department Head's department */}
                </div>
              </RoleGate>
            </div>
          )}

          {path === "/maintenance" && (
            <div className="space-y-3">
              {isAdmin && <span className="text-[11px] text-danger font-semibold uppercase block">[Read-only View]</span>}

              <RoleGate allowedRoles={[ROLES.EMPLOYEE, ROLES.DEPARTMENT_HEAD, ROLES.ASSET_MANAGER]}>
                <Button variant="primary" size="sm">Raise Request</Button>
              </RoleGate>

              <RoleGate allowedRoles={[ROLES.ASSET_MANAGER]}>
                <div className="flex gap-2">
                  <Button variant="secondary" size="sm">Approve/Reject Request</Button>
                  <Button variant="secondary" size="sm">Assign Technician</Button>
                </div>
              </RoleGate>
            </div>
          )}

          {path === "/audit" && (
            <div className="space-y-3">
              <RoleGate allowedRoles={[ROLES.ADMIN]}>
                <div className="flex gap-2">
                  <Button variant="primary" size="sm">Create Audit Cycle</Button>
                  <Button variant="secondary" size="sm">Assign Auditors</Button>
                </div>
              </RoleGate>

              <RoleGate allowedRoles={[ROLES.ASSET_MANAGER]}>
                <Button variant="secondary" size="sm">Resolve Discrepancy</Button>
              </RoleGate>

              <RoleGate allowedRoles={[ROLES.DEPARTMENT_HEAD]}>
                <div className="space-y-2">
                  <Button variant="secondary" size="sm">Verify Asset (as Auditor)</Button>
                  {/* TODO(rbac): check cycle-level auditor assignment to verify if user is assigned as an auditor for this cycle */}
                </div>
              </RoleGate>
            </div>
          )}

          {path === "/reports" && (
            <div className="space-y-3 text-xs text-text-secondary leading-relaxed">
              {isAdmin && <p className="font-semibold text-text-primary">Rendering: Org-wide Analytics and Reports Panel</p>}
              {isAssetManager && <p className="font-semibold text-text-primary">Rendering: Operational Auditing & Inventory Reports</p>}
              {isDepartmentHead && (
                <div className="space-y-2">
                  <p className="font-semibold text-text-primary">Rendering: Department-Scoped Reports Panel</p>
                  {/* TODO(rbac): filter reports data by department_id of the Department Head */}
                </div>
              )}
            </div>
          )}

          {path === "/notifications" && (
            <div className="space-y-3 text-xs text-text-secondary">
              {isAdmin ? (
                <p className="font-semibold text-text-primary">Displaying: Comprehensive System logs (All Roles)</p>
              ) : (
                <div className="space-y-2">
                  <p className="font-semibold text-text-primary">Displaying: Scoped User Notifications</p>
                  {/* TODO(rbac): filter notifications log to show only user-relevant alerts */}
                </div>
              )}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Auth Pathway */}
      <Route path="/login" element={<LoginPage />} />

      {/* Protected Dashboard Pathway */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          {/* Default route redirects to dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          
          <Route path="/dashboard" element={<DashboardPage />} />
          
          {/* Organization setup page, admin restricted */}
          <Route element={<RoleRoute allowedRoles={getRouteRoles("/organization-setup")} />}>
            <Route path="/organization-setup" element={<OrganizationSetupPage />} />
          </Route>

          {/* Placeholders for sidebar links, secured with RoleRoute when restricted */}
          <Route path="/assets" element={<PagePlaceholder title="Assets" path="/assets" />} />
          <Route path="/allocation" element={<PagePlaceholder title="Allocation & Transfer" path="/allocation" />} />
          <Route path="/booking" element={<PagePlaceholder title="Resource Booking" path="/booking" />} />
          <Route path="/maintenance" element={<PagePlaceholder title="Maintenance" path="/maintenance" />} />
          
          {/* Audit: Admin and Asset Manager only */}
          <Route element={<RoleRoute allowedRoles={getRouteRoles("/audit")} />}>
            <Route path="/audit" element={<PagePlaceholder title="Audit" path="/audit" />} />
          </Route>

          {/* Reports: Admin, Asset Manager, Department Head only */}
          <Route element={<RoleRoute allowedRoles={getRouteRoles("/reports")} />}>
            <Route path="/reports" element={<PagePlaceholder title="Reports" path="/reports" />} />
          </Route>

          <Route path="/notifications" element={<PagePlaceholder title="Notifications" path="/notifications" />} />
        </Route>
      </Route>

      {/* Fallback route */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default AppRoutes;
